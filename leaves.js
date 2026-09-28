import express from 'express';
import { db } from '../db/database.js';
import { requireAuth, requireRole, requireManagerOrAdmin } from '../middleware/auth.js';
import { logAuditAction } from '../middleware/audit.js';

const router = express.Router();

function getDaysBetween(fromDate, toDate) {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

// GET /api/leaves
router.get('/', requireAuth, (req, res) => {
  try {
    const { status, employeeId, department } = req.query;
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.role === 'manager';

    let list = db.find('leaves');

    if (!isPrivileged) {
      list = list.filter(l => l.employeeId === req.user.employeeId);
    } else if (employeeId) {
      list = list.filter(l => l.employeeId === employeeId);
    }

    if (status && status !== 'ALL') {
      list = list.filter(l => l.status.toUpperCase() === status.toUpperCase());
    }

    if (department && department !== 'ALL') {
      list = list.filter(l => l.department === department);
    }

    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    // Also include employee balances if requested for self
    let balances = null;
    const targetEmpId = employeeId || req.user.employeeId;
    const balRecord = db.findOne('leave_balances', { employeeId: targetEmpId });
    if (balRecord) {
      balances = {
        paid: balRecord.paid,
        sick: balRecord.sick,
        casual: balRecord.casual,
        unpaid: balRecord.unpaid
      };
    }

    return res.json({
      success: true,
      data: {
        leaves: list,
        balances
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// POST /api/leaves (Apply for leave)
router.post('/', requireAuth, (req, res) => {
  try {
    const { leaveType = 'Paid', fromDate, toDate, reason, isHalfDay = false, halfDayType } = req.body;
    const employeeId = req.user.employeeId;

    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Start date, end date, and reason are required.',
        code: 'VALIDATION_ERROR'
      });
    }

    if (new Date(fromDate) > new Date(toDate)) {
      return res.status(400).json({
        success: false,
        message: 'Leave end date cannot be earlier than the start date.',
        code: 'INVALID_DATE_RANGE'
      });
    }

    const calculatedDays = isHalfDay ? 0.5 : getDaysBetween(fromDate, toDate);

    // Overlap validation: check for existing pending or approved leaves
    const existingOverlaps = db.find('leaves', l => {
      if (l.employeeId !== employeeId) return false;
      if (l.status === 'Rejected' || l.status === 'Cancelled') return false;
      // Overlap formula: StartA <= EndB and EndA >= StartB
      return (fromDate <= l.toDate && toDate >= l.fromDate);
    });

    if (existingOverlaps.length > 0) {
      return res.status(400).json({
        success: false,
        message: `You already have an existing ${existingOverlaps[0].status.toLowerCase()} leave request (#${existingOverlaps[0].id}) for overlapping dates.`,
        code: 'LEAVE_OVERLAP'
      });
    }

    // Leave Balance Validation
    const balRecord = db.findOne('leave_balances', { employeeId });
    const typeKey = leaveType.toLowerCase(); // 'paid', 'sick', 'casual', 'unpaid'

    if (balRecord && balRecord[typeKey]) {
      const remaining = balRecord[typeKey].remaining;
      if (calculatedDays > remaining) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${leaveType} leave balance. Requested ${calculatedDays} day(s), but only ${remaining} day(s) remain.`,
          code: 'INSUFFICIENT_LEAVE_BALANCE'
        });
      }
    }

    const emp = db.findOne('employees', { employeeId });
    const newLeave = db.insert('leaves', {
      id: `LR-${Math.floor(100 + Math.random() * 900)}`,
      organizationId: emp?.organizationId || 'org-dayflow-global',
      employeeId,
      employeeName: emp?.name || req.user.name,
      employeeAvatar: emp?.avatar || '',
      department: emp?.department || 'Engineering',
      leaveType,
      fromDate,
      toDate,
      days: calculatedDays,
      isHalfDay: !!isHalfDay,
      halfDayType: halfDayType || null,
      reason,
      attachmentUrl: null,
      status: 'Pending',
      adminComment: '',
      appliedOn: new Date().toISOString().split('T')[0]
    });

    // Notify HR / Admins
    db.insert('notifications', {
      id: `notif-${Date.now()}`,
      organizationId: emp?.organizationId,
      userId: 'admin',
      employeeId: 'EMP-1001',
      type: 'leave',
      title: 'New Leave Request Submitted',
      message: `${emp?.name} requested ${calculatedDays} day(s) of ${leaveType} Leave (${fromDate} to ${toDate}).`,
      link: '/leave-approvals',
      read: false
    });

    logAuditAction({
      req,
      action: 'LEAVE_APPLIED',
      entity: 'LeaveRequest',
      entityId: newLeave.id,
      metadata: { leaveType, fromDate, toDate, days: calculatedDays, reason }
    });

    return res.status(201).json({
      success: true,
      data: newLeave,
      message: 'Leave application submitted successfully for review.'
    });
  } catch (err) {
    console.error('Error applying for leave:', err);
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// PATCH /api/leaves/:id/approve (Admin / Manager approval with atomic multi-table transaction)
router.patch('/:id/approve', requireAuth, requireRole(['admin', 'super_admin', 'manager']), (req, res) => {
  try {
    const id = req.params.id;
    const { adminComment } = req.body;

    const leave = db.get('leaves', id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.', code: 'NOT_FOUND' });
    }

    if (leave.status === 'Approved') {
      return res.status(400).json({ success: false, message: 'This leave request has already been approved.', code: 'ALREADY_APPROVED' });
    }

    // Run atomic multi-table transaction
    db.transaction(database => {
      // 1. Update Leave Record
      database.update('leaves', id, {
        status: 'Approved',
        adminComment: adminComment || `Approved by ${req.user.name}`,
        reviewedBy: req.user.name,
        reviewedAt: new Date().toISOString()
      });

      // 2. Deduct from Leave Balance
      const typeKey = leave.leaveType.toLowerCase();
      const balRecord = database.findOne('leave_balances', { employeeId: leave.employeeId });

      if (balRecord && balRecord[typeKey]) {
        const newUsed = (balRecord[typeKey].used || 0) + leave.days;
        const newRemaining = Math.max(0, (balRecord[typeKey].total || 10) - newUsed);

        database.update('leave_balances', balRecord.id, {
          [typeKey]: {
            ...balRecord[typeKey],
            used: newUsed,
            remaining: newRemaining
          }
        });
      }

      // 3. Sync into Attendance Table for each date in leave period
      const start = new Date(leave.fromDate);
      const end = new Date(leave.toDate);
      const cur = new Date(start);

      while (cur <= end) {
        const dateStr = cur.toISOString().split('T')[0];
        const existingAtt = database.findOne('attendance', l => l.date === dateStr && l.employeeId === leave.employeeId);

        if (existingAtt) {
          database.update('attendance', existingAtt.id, {
            status: 'Leave',
            workMode: 'On Leave',
            workHours: '0h 0m'
          });
        } else {
          database.insert('attendance', {
            id: `ATT-LEAVE-${dateStr.replace(/-/g, '')}-${leave.employeeId}`,
            organizationId: leave.organizationId,
            employeeId: leave.employeeId,
            employeeName: leave.employeeName,
            department: leave.department,
            date: dateStr,
            checkIn: '-',
            checkOut: '-',
            workHours: '0h 0m',
            workedMinutes: 0,
            overtimeMinutes: 0,
            status: 'Leave',
            workMode: 'On Leave'
          });
        }
        cur.setDate(cur.getDate() + 1);
      }

      // 4. Create Notification for the employee
      database.insert('notifications', {
        id: `notif-${Date.now()}`,
        organizationId: leave.organizationId,
        userId: leave.employeeId,
        employeeId: leave.employeeId,
        type: 'leave',
        title: 'Leave Request Approved! 🎉',
        message: `Your ${leave.leaveType} Leave request (#${leave.id}) for ${leave.days} day(s) was approved by ${req.user.name}.`,
        link: '/leave',
        read: false
      });
    });

    logAuditAction({
      req,
      action: 'LEAVE_APPROVED',
      entity: 'LeaveRequest',
      entityId: id,
      metadata: { employeeId: leave.employeeId, days: leave.days, leaveType: leave.leaveType }
    });

    return res.json({
      success: true,
      message: `Leave request #${id} for ${leave.employeeName} has been approved.`
    });
  } catch (err) {
    console.error('Error approving leave:', err);
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// PATCH /api/leaves/:id/reject
router.patch('/:id/reject', requireAuth, requireRole(['admin', 'super_admin', 'manager']), (req, res) => {
  try {
    const id = req.params.id;
    const { adminComment } = req.body;

    if (!adminComment || !adminComment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason comment is required by HR policy.',
        code: 'VALIDATION_ERROR'
      });
    }

    const leave = db.get('leaves', id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.', code: 'NOT_FOUND' });
    }

    db.transaction(database => {
      database.update('leaves', id, {
        status: 'Rejected',
        adminComment: adminComment.trim(),
        reviewedBy: req.user.name,
        reviewedAt: new Date().toISOString()
      });

      database.insert('notifications', {
        id: `notif-${Date.now()}`,
        organizationId: leave.organizationId,
        userId: leave.employeeId,
        employeeId: leave.employeeId,
        type: 'leave',
        title: 'Leave Request Update',
        message: `Your leave request #${leave.id} was not approved. Reason: ${adminComment}`,
        link: '/leave',
        read: false
      });
    });

    logAuditAction({
      req,
      action: 'LEAVE_REJECTED',
      entity: 'LeaveRequest',
      entityId: id,
      metadata: { employeeId: leave.employeeId, reason: adminComment }
    });

    return res.json({
      success: true,
      message: `Leave request #${id} has been rejected.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// DELETE /api/leaves/:id/cancel (Employee cancels own pending leave)
router.delete('/:id/cancel', requireAuth, (req, res) => {
  try {
    const id = req.params.id;
    const leave = db.get('leaves', id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.', code: 'NOT_FOUND' });
    }

    if (leave.employeeId !== req.user.employeeId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Access denied.', code: 'FORBIDDEN' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leave requests can be cancelled.',
        code: 'CANNOT_CANCEL_NON_PENDING'
      });
    }

    db.update('leaves', id, { status: 'Cancelled' });

    logAuditAction({
      req,
      action: 'LEAVE_CANCELLED',
      entity: 'LeaveRequest',
      entityId: id,
      metadata: { employeeId: leave.employeeId }
    });

    return res.json({
      success: true,
      message: `Leave request #${id} has been cancelled.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

export default router;
