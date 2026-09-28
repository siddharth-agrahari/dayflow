import express from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';
import { requireAuth, requireRole, requireSelfOrAdmin } from '../middleware/auth.js';
import { logAuditAction } from '../middleware/audit.js';

const router = express.Router();

// Helper to compute profile completion percentage
function calculateProfileCompletion(emp) {
  let score = 40; // Base: name, email, employeeId, department
  if (emp.personalDetails?.phone && emp.personalDetails.phone !== '+1 (555) 000-0000') score += 15;
  if (emp.personalDetails?.address) score += 15;
  if (emp.personalDetails?.emergencyContact && !emp.personalDetails.emergencyContact.includes('000-0000')) score += 15;
  if (emp.avatar) score += 5;
  if (emp.documents && emp.documents.length > 0) score += 10;
  return Math.min(100, score);
}

// GET /api/employees
router.get('/', requireAuth, (req, res) => {
  try {
    const { search, department, status, role, page = 1, limit = 50 } = req.query;
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.role === 'manager';

    let list = db.find('employees');

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q) ||
        (e.designation && e.designation.toLowerCase().includes(q))
      );
    }

    if (department && department !== 'ALL') {
      list = list.filter(e => e.department === department);
    }

    if (status && status !== 'ALL') {
      list = list.filter(e => e.status === status);
    }

    if (role && role !== 'ALL') {
      list = list.filter(e => e.role === role);
    }

    // Role-based data masking: Non-privileged users cannot view colleagues' salary structures
    const sanitizedList = list.map(emp => {
      const canViewSalary = req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.employeeId === emp.employeeId;
      if (!canViewSalary) {
        const { salaryStructure, ...rest } = emp;
        return rest;
      }
      return emp;
    });

    const total = sanitizedList.length;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = sanitizedList.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      data: {
        employees: paginated,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// GET /api/employees/:id
router.get('/:id', requireAuth, (req, res) => {
  try {
    const id = req.params.id;
    const emp = db.findOne('employees', e => e.id === id || e.employeeId === id);

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.', code: 'NOT_FOUND' });
    }

    // Check if requester has rights to see salary
    const canViewSalary = req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.employeeId === emp.employeeId;
    if (!canViewSalary) {
      const { salaryStructure, ...sanitized } = emp;
      return res.json({ success: true, data: sanitized });
    }

    return res.json({ success: true, data: emp });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// POST /api/employees (Admin / HR only)
router.post('/', requireAuth, requireRole(['admin', 'super_admin']), (req, res) => {
  try {
    const {
      name,
      email,
      role = 'employee',
      department = 'Engineering',
      designation = 'Specialist',
      managerId,
      joiningDate = new Date().toISOString().split('T')[0],
      phone = '+1 (555) 000-0000',
      address = 'San Francisco, CA',
      baseSalary = 6500,
      hra = 2200,
      specialAllowance = 1200,
      transportAllowance = 350,
      pfDeduction = 780,
      taxDeduction = 1100,
      otherDeductions = 120,
      bankName = 'Silicon Valley Bank',
      accountNumber,
      password = 'password123'
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required to onboard an employee.',
        code: 'VALIDATION_ERROR'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.findOne('employees', { email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email address already exists.',
        code: 'DUPLICATE_EMAIL'
      });
    }

    const orgId = req.user.organizationId || 'org-dayflow-global';
    const newEmpId = req.body.employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newUserId = `usr-${newEmpId.toLowerCase()}`;

    const gross = Number(baseSalary) + Number(hra) + Number(specialAllowance) + Number(transportAllowance);
    const deductions = Number(pfDeduction) + Number(taxDeduction) + Number(otherDeductions);
    const net = gross - deductions;

    // Create User account
    db.insert('users', {
      id: newUserId,
      organizationId: orgId,
      employeeId: newEmpId,
      email: cleanEmail,
      passwordHash: bcrypt.hashSync(password, 10),
      role,
      status: 'Active'
    });

    const newEmployee = db.insert('employees', {
      id: newEmpId,
      organizationId: orgId,
      userId: newUserId,
      employeeId: newEmpId,
      name,
      email: cleanEmail,
      role,
      department,
      designation,
      managerId: managerId || 'EMP-1001',
      joiningDate,
      status: 'Active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      personalDetails: {
        phone,
        address,
        dob: '1995-01-01',
        gender: 'Not specified',
        maritalStatus: 'Single',
        emergencyContact: 'Family Contact (+1 555-000-0000)',
        bloodGroup: 'O+'
      },
      jobDetails: {
        department,
        designation,
        manager: managerId ? db.findOne('employees', { employeeId: managerId })?.name || 'Manager' : 'Eleanor Vance',
        workLocation: 'San Francisco HQ',
        employmentType: 'Full-time',
        workSchedule: '09:00 AM - 06:00 PM (Mon-Fri)',
        shiftId: 'shift-morning'
      },
      salaryStructure: {
        baseSalary: Number(baseSalary),
        hra: Number(hra),
        specialAllowance: Number(specialAllowance),
        transportAllowance: Number(transportAllowance),
        pfDeduction: Number(pfDeduction),
        taxDeduction: Number(taxDeduction),
        otherDeductions: Number(otherDeductions),
        grossSalary: gross,
        totalDeductions: deductions,
        netSalary: net,
        bankName,
        accountNumber: accountNumber || `**** **** ${Math.floor(1000 + Math.random() * 9000)}`,
        ifscCode: 'SVB00192',
        pan: `DAYFLOW${newEmpId.replace('EMP-', '')}X`
      },
      onboardingCompleted: false,
      profileCompletion: 75,
      documents: []
    });

    // Initialize leave balances
    db.insert('leave_balances', {
      id: `lb-${newEmpId}`,
      organizationId: orgId,
      employeeId: newEmpId,
      year: 2026,
      paid: { total: 18, used: 0, remaining: 18 },
      sick: { total: 12, used: 0, remaining: 12 },
      casual: { total: 8, used: 0, remaining: 8 },
      unpaid: { total: 5, used: 0, remaining: 5 }
    });

    // Notify HR
    db.insert('notifications', {
      id: `notif-${Date.now()}`,
      organizationId: orgId,
      userId: req.user.id,
      employeeId: req.user.employeeId,
      type: 'employee',
      title: 'New Employee Onboarded',
      message: `${name} (${designation}) has been registered with ID ${newEmpId}.`,
      link: '/employees',
      read: false
    });

    logAuditAction({
      req,
      action: 'EMPLOYEE_CREATED',
      entity: 'Employee',
      entityId: newEmpId,
      metadata: { name, email: cleanEmail, department, role }
    });

    return res.status(201).json({
      success: true,
      data: newEmployee,
      message: 'Employee successfully created and onboarded.'
    });
  } catch (err) {
    console.error('Error creating employee:', err);
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// PATCH /api/employees/:id
router.patch('/:id', requireAuth, requireSelfOrAdmin(req => req.params.id), (req, res) => {
  try {
    const id = req.params.id;
    const existing = db.findOne('employees', e => e.id === id || e.employeeId === id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Employee not found.', code: 'NOT_FOUND' });
    }

    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    const updates = { ...req.body };

    // Security: Non-admin users are strictly prohibited from altering sensitive organizational or salary fields
    if (!isAdmin) {
      const allowedFields = ['personalDetails', 'avatar'];
      const attemptedForbidden = Object.keys(updates).filter(k => !allowedFields.includes(k));

      if (attemptedForbidden.length > 0) {
        return res.status(403).json({
          success: false,
          message: `Access denied: employees may only update personal contact details. Forbidden fields: ${attemptedForbidden.join(', ')}`,
          code: 'PRIVILEGE_VIOLATION'
        });
      }
    }

    // Merge nested details
    const mergedPersonal = { ...existing.personalDetails, ...(updates.personalDetails || {}) };
    const mergedJob = isAdmin ? { ...existing.jobDetails, ...(updates.jobDetails || {}) } : existing.jobDetails;
    let mergedSalary = existing.salaryStructure;

    if (isAdmin && updates.salaryStructure) {
      const s = { ...existing.salaryStructure, ...updates.salaryStructure };
      const gross = Number(s.baseSalary || 0) + Number(s.hra || 0) + Number(s.specialAllowance || 0) + Number(s.transportAllowance || 0);
      const deductions = Number(s.pfDeduction || 0) + Number(s.taxDeduction || 0) + Number(s.otherDeductions || 0);
      mergedSalary = {
        ...s,
        grossSalary: gross,
        totalDeductions: deductions,
        netSalary: gross - deductions
      };
    }

    const updatedData = {
      ...updates,
      personalDetails: mergedPersonal,
      jobDetails: mergedJob,
      salaryStructure: mergedSalary
    };

    updatedData.profileCompletion = calculateProfileCompletion(updatedData);

    const result = db.update('employees', existing.id, updatedData);

    // If email or role was updated by admin, also sync to users table
    if (isAdmin && (updates.email || updates.role)) {
      const user = db.findOne('users', { employeeId: existing.employeeId });
      if (user) {
        db.update('users', user.id, {
          email: updates.email ? updates.email.toLowerCase() : user.email,
          role: updates.role || user.role
        });
      }
    }

    logAuditAction({
      req,
      action: 'EMPLOYEE_UPDATED',
      entity: 'Employee',
      entityId: existing.employeeId,
      metadata: { updatedBy: req.user.email, fields: Object.keys(updates) }
    });

    return res.json({
      success: true,
      data: result,
      message: 'Employee record updated successfully.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// POST /api/employees/:id/deactivate (Controlled Offboarding - Admin only)
router.post('/:id/deactivate', requireAuth, requireRole(['admin', 'super_admin']), (req, res) => {
  try {
    const id = req.params.id;
    const { exitDate, reason, handoverNotes } = req.body;

    const emp = db.findOne('employees', e => e.id === id || e.employeeId === id);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.', code: 'NOT_FOUND' });
    }

    // Soft-deactivate employee
    const updated = db.update('employees', emp.id, {
      status: 'Inactive',
      exitDate: exitDate || new Date().toISOString().split('T')[0],
      exitReason: reason || 'Voluntary resignation',
      handoverNotes: handoverNotes || ''
    });

    // Deactivate user credentials to prevent future logins
    const user = db.findOne('users', { employeeId: emp.employeeId });
    if (user) {
      db.update('users', user.id, { status: 'Inactive' });
    }

    logAuditAction({
      req,
      action: 'EMPLOYEE_DEACTIVATED',
      entity: 'Employee',
      entityId: emp.employeeId,
      metadata: { exitDate, reason }
    });

    return res.json({
      success: true,
      data: updated,
      message: `${emp.name} has been formally offboarded and deactivated.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// DELETE /api/employees/:id (Admin only)
router.delete('/:id', requireAuth, requireRole(['admin', 'super_admin']), (req, res) => {
  try {
    const id = req.params.id;
    const emp = db.findOne('employees', e => e.id === id || e.employeeId === id);

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.', code: 'NOT_FOUND' });
    }

    db.delete('employees', emp.id);
    const user = db.findOne('users', { employeeId: emp.employeeId });
    if (user) db.delete('users', user.id);

    logAuditAction({
      req,
      action: 'EMPLOYEE_DELETED',
      entity: 'Employee',
      entityId: emp.employeeId,
      metadata: { name: emp.name }
    });

    return res.json({
      success: true,
      message: `Employee ${emp.name} removed from directory.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

export default router;
