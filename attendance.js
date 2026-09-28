import express from 'express';
import { db } from '../db/database.js';
import { requireAuth, requireRole, requireManagerOrAdmin } from '../middleware/auth.js';
import { logAuditAction } from '../middleware/audit.js';

const router = express.Router();

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr || timeStr === '-') return null;
  try {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  } catch (err) {
    return null;
  }
}

function formatMinutesToHours(mins) {
  if (!mins || mins <= 0) return '0h 0m';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

// GET /api/attendance
router.get('/', requireAuth, (req, res) => {
  try {
    const { date, startDate, endDate, employeeId, department, status } = req.query;
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.role === 'manager';

    let logs = db.find('attendance');

    // If regular employee, only show their own records
    if (!isPrivileged) {
      logs = logs.filter(l => l.employeeId === req.user.employeeId);
    } else if (employeeId) {
      logs = logs.filter(l => l.employeeId === employeeId);
    }

    if (date) {
      logs = logs.filter(l => l.date === date);
    } else if (startDate && endDate) {
      logs = logs.filter(l => l.date >= startDate && l.date <= endDate);
    }

    if (department && department !== 'ALL') {
      logs = logs.filter(l => l.department === department);
    }

    if (status && status !== 'ALL') {
      logs = logs.filter(l => l.status === status);
    }

    // Sort latest date first
    logs.sort((a, b) => b.date.localeCompare(a.date));

    return res.json({
      success: true,
      data: logs
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// GET /api/attendance/calendar
// Returns month calendar breakdown for an employee with punch details and holiday overlays
router.get('/calendar', requireAuth, (req, res) => {
  try {
    const employeeId = req.query.employeeId || req.user.employeeId;

    // Security check: non-privileged users cannot view colleagues' calendars
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.role === 'manager';
    if (!isPrivileged && employeeId !== req.user.employeeId) {
      return res.status(403).json({ success: false, message: 'Access denied.', code: 'FORBIDDEN' });
    }

    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const month = parseInt(req.query.month, 10) || (new Date().getMonth() + 1); // 1-12

    const monthStr = String(month).padStart(2, '0');
    const prefix = `${year}-${monthStr}`;

    const logs = db.find('attendance', l => l.employeeId === employeeId && l.date.startsWith(prefix));
    const holidays = db.find('holidays', h => h.date.startsWith(prefix));

    return res.json({
      success: true,
      data: {
        year,
        month,
        attendanceLogs: logs,
        holidays
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// POST /api/attendance/check-in
router.post('/check-in', requireAuth, (req, res) => {
  try {
    const employeeId = req.body.employeeId || req.user.employeeId;

    // Security: Only admin can clock in on behalf of others
    if (employeeId !== req.user.employeeId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot clock in on behalf of another employee.',
        code: 'FORBIDDEN'
      });
    }

    const emp = db.findOne('employees', e => e.id === employeeId || e.employeeId === employeeId);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.', code: 'NOT_FOUND' });
    }

    const today = getTodayStr();
    const existing = db.findOne('attendance', l => l.date === today && l.employeeId === emp.employeeId);

    if (existing && existing.checkIn && existing.checkIn !== '-') {
      return res.status(400).json({
        success: false,
        message: `Already clocked in today at ${existing.checkIn}. Duplicate check-ins are not permitted.`,
        code: 'DUPLICATE_CHECK_IN'
      });
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const workMode = req.body.workMode || 'Office';

    // Check shift late rules
    const shift = db.findOne('shifts', { id: emp.jobDetails?.shiftId || 'shift-morning' });
    let status = 'Present';

    if (shift) {
      const shiftStartMins = parseTimeToMinutes(shift.startTime ? `${shift.startTime} AM` : '09:00 AM') || (9 * 60);
      const gracePeriod = shift.gracePeriodMins || 15;
      const currentMins = now.getHours() * 60 + now.getMinutes();

      if (currentMins > (shiftStartMins + gracePeriod)) {
        status = 'Late';
      }
    }

    let record;
    if (existing) {
      record = db.update('attendance', existing.id, {
        checkIn: timeString,
        status,
        workMode,
        workHours: 'In Progress'
      });
    } else {
      record = db.insert('attendance', {
        id: `ATT-${today.replace(/-/g, '')}-${emp.employeeId}`,
        organizationId: emp.organizationId || 'org-dayflow-global',
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.department,
        date: today,
        checkIn: timeString,
        checkOut: null,
        workHours: 'In Progress',
        workedMinutes: 0,
        overtimeMinutes: 0,
        status,
        workMode
      });
    }

    // Add in-app notification
    db.insert('notifications', {
      id: `notif-${Date.now()}`,
      organizationId: emp.organizationId,
      userId: req.user.id,
      employeeId: emp.employeeId,
      type: 'attendance',
      title: 'Clock In Recorded',
      message: `Clocked in at ${timeString} (${workMode}). Have a productive workday!`,
      link: '/attendance',
      read: false
    });

    return res.json({
      success: true,
      data: record,
      message: `Clocked in at ${timeString} (${workMode}). Status: ${status}`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// POST /api/attendance/check-out
router.post('/check-out', requireAuth, (req, res) => {
  try {
    const employeeId = req.body.employeeId || req.user.employeeId;

    if (employeeId !== req.user.employeeId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Access denied.', code: 'FORBIDDEN' });
    }

    const emp = db.findOne('employees', e => e.id === employeeId || e.employeeId === employeeId);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.', code: 'NOT_FOUND' });
    }

    const today = getTodayStr();
    const existing = db.findOne('attendance', l => l.date === today && l.employeeId === emp.employeeId);

    if (!existing || !existing.checkIn || existing.checkIn === '-') {
      return res.status(400).json({
        success: false,
        message: 'Cannot clock out before clocking in today.',
        code: 'CHECK_OUT_WITHOUT_CHECK_IN'
      });
    }

    if (existing.checkOut && existing.checkOut !== '-') {
      return res.status(400).json({
        success: false,
        message: `Already clocked out today at ${existing.checkOut}.`,
        code: 'DUPLICATE_CHECK_OUT'
      });
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Server-side precise duration calculation
    const inMinutes = parseTimeToMinutes(existing.checkIn);
    const outMinutes = now.getHours() * 60 + now.getMinutes();

    let workedMinutes = 480; // default 8 hrs fallback
    if (inMinutes !== null && outMinutes >= inMinutes) {
      workedMinutes = outMinutes - inMinutes;
    }

    let status = existing.status;
    if (workedMinutes < 240) {
      status = 'Half-day';
    }

    let overtimeMinutes = 0;
    if (workedMinutes > 540) {
      overtimeMinutes = workedMinutes - 480;
    }

    const formattedDuration = formatMinutesToHours(workedMinutes);

    const updated = db.update('attendance', existing.id, {
      checkOut: timeString,
      workHours: formattedDuration,
      workedMinutes,
      overtimeMinutes,
      status
    });

    db.insert('notifications', {
      id: `notif-${Date.now()}`,
      organizationId: emp.organizationId,
      userId: req.user.id,
      employeeId: emp.employeeId,
      type: 'attendance',
      title: 'Clock Out Completed',
      message: `Clocked out at ${timeString}. Total duration: ${formattedDuration}.`,
      link: '/attendance',
      read: false
    });

    return res.json({
      success: true,
      data: updated,
      message: `Clocked out at ${timeString}. Total workday duration: ${formattedDuration}.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// POST /api/attendance/correction-request (Employee submits regularization)
router.post('/correction-request', requireAuth, (req, res) => {
  try {
    const { date, requestedCheckIn, requestedCheckOut, reason } = req.body;
    const employeeId = req.user.employeeId;

    if (!date || !requestedCheckIn || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Date, requested check-in time, and reason are required.',
        code: 'VALIDATION_ERROR'
      });
    }

    const emp = db.findOne('employees', { employeeId });
    const attendanceRecord = db.findOne('attendance', l => l.date === date && l.employeeId === employeeId);

    const correction = db.insert('attendance_corrections', {
      id: `cor-${Date.now()}`,
      organizationId: emp?.organizationId || 'org-dayflow-global',
      employeeId,
      employeeName: emp?.name || 'Employee',
      attendanceId: attendanceRecord?.id || `ATT-${date.replace(/-/g, '')}-${employeeId}`,
      date,
      requestedCheckIn,
      requestedCheckOut: requestedCheckOut || '06:00 PM',
      reason,
      status: 'Pending',
      adminNotes: '',
      createdAt: new Date().toISOString()
    });

    // Notify HR
    db.insert('notifications', {
      id: `notif-${Date.now()}`,
      organizationId: emp?.organizationId || 'org-dayflow-global',
      userId: 'admin',
      employeeId: 'EMP-1001',
      type: 'attendance',
      title: 'Attendance Regularization Request',
      message: `${emp?.name} requested attendance correction for ${date}.`,
      link: '/attendance',
      read: false
    });

    logAuditAction({
      req,
      action: 'ATTENDANCE_CORRECTION_REQUESTED',
      entity: 'AttendanceCorrection',
      entityId: correction.id,
      metadata: { date, requestedCheckIn, reason }
    });

    return res.status(201).json({
      success: true,
      data: correction,
      message: 'Attendance correction request submitted for supervisor review.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// GET /api/attendance/corrections
router.get('/corrections', requireAuth, (req, res) => {
  try {
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.role === 'manager';
    let list = db.find('attendance_corrections');

    if (!isPrivileged) {
      list = list.filter(c => c.employeeId === req.user.employeeId);
    }

    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return res.json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// PATCH /api/attendance/corrections/:id (Admin/Manager approves or rejects)
router.patch('/corrections/:id', requireAuth, requireRole(['admin', 'super_admin', 'manager']), (req, res) => {
  try {
    const id = req.params.id;
    const { status, adminNotes } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Approved or Rejected.',
        code: 'VALIDATION_ERROR'
      });
    }

    const correction = db.get('attendance_corrections', id);
    if (!correction) {
      return res.status(404).json({ success: false, message: 'Correction request not found.', code: 'NOT_FOUND' });
    }

    db.transaction(database => {
      database.update('attendance_corrections', id, {
        status,
        adminNotes: adminNotes || '',
        reviewedBy: req.user.name,
        reviewedAt: new Date().toISOString()
      });

      // If approved, update or insert the real attendance log
      if (status === 'Approved') {
        const existingAtt = database.findOne('attendance', l => l.date === correction.date && l.employeeId === correction.employeeId);
        const inMins = parseTimeToMinutes(correction.requestedCheckIn) || 540;
        const outMins = parseTimeToMinutes(correction.requestedCheckOut) || 1080;
        const workedMins = Math.max(0, outMins - inMins);

        if (existingAtt) {
          database.update('attendance', existingAtt.id, {
            checkIn: correction.requestedCheckIn,
            checkOut: correction.requestedCheckOut,
            workHours: formatMinutesToHours(workedMins),
            workedMinutes: workedMins,
            status: workedMins >= 480 ? 'Present' : 'Half-day'
          });
        } else {
          const emp = database.findOne('employees', { employeeId: correction.employeeId });
          database.insert('attendance', {
            id: correction.attendanceId,
            organizationId: correction.organizationId,
            employeeId: correction.employeeId,
            employeeName: correction.employeeName,
            department: emp?.department || 'General',
            date: correction.date,
            checkIn: correction.requestedCheckIn,
            checkOut: correction.requestedCheckOut,
            workHours: formatMinutesToHours(workedMins),
            workedMinutes: workedMins,
            overtimeMinutes: 0,
            status: workedMins >= 480 ? 'Present' : 'Half-day',
            workMode: 'Office'
          });
        }
      }

      // Notify the employee
      database.insert('notifications', {
        id: `notif-${Date.now()}`,
        organizationId: correction.organizationId,
        userId: correction.employeeId,
        employeeId: correction.employeeId,
        type: 'attendance',
        title: `Attendance Correction ${status}`,
        message: `Your attendance correction for ${correction.date} was ${status.toLowerCase()} by ${req.user.name}.`,
        link: '/attendance',
        read: false
      });
    });

    logAuditAction({
      req,
      action: `ATTENDANCE_CORRECTION_${status.toUpperCase()}`,
      entity: 'AttendanceCorrection',
      entityId: id,
      metadata: { employeeId: correction.employeeId, date: correction.date, adminNotes }
    });

    return res.json({
      success: true,
      message: `Attendance correction request #${id} has been ${status.toLowerCase()}.`
    });
  } catch (err) {
    console.error('Error reviewing correction:', err);
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

export default router;
