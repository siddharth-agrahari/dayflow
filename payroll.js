import express from 'express';
import { db } from '../db/database.js';
import { requireAuth, requireRole, requireSelfOrAdmin } from '../middleware/auth.js';
import { logAuditAction } from '../middleware/audit.js';

const router = express.Router();

// GET /api/payroll (Admin only: Company-wide compensation overview)
router.get('/', requireAuth, requireRole(['admin', 'super_admin']), (req, res) => {
  try {
    const { month = 'August 2026', search } = req.query;
    let employees = db.find('employees');

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      employees = employees.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q)
      );
    }

    const totalGross = employees.reduce((sum, emp) => sum + (emp.salaryStructure?.grossSalary || 0), 0);
    const totalDeductions = employees.reduce((sum, emp) => sum + (emp.salaryStructure?.totalDeductions || 0), 0);
    const totalNet = totalGross - totalDeductions;

    const runs = db.find('payroll_runs');

    return res.json({
      success: true,
      data: {
        month,
        summary: {
          totalEmployees: employees.length,
          totalGross,
          totalDeductions,
          totalNet
        },
        employees,
        payrollRuns: runs
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// GET /api/payroll/runs
router.get('/runs', requireAuth, requireRole(['admin', 'super_admin']), (req, res) => {
  try {
    const runs = db.find('payroll_runs');
    runs.sort((a, b) => b.year - a.year);
    return res.json({ success: true, data: runs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// POST /api/payroll/generate (Run monthly payroll batch)
router.post('/generate', requireAuth, requireRole(['admin', 'super_admin']), (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year are required.', code: 'VALIDATION_ERROR' });
    }

    const runId = `pr-${year}-${month.toLowerCase().slice(0, 3)}`;
    const existing = db.findOne('payroll_runs', { id: runId });
    if (existing && existing.status === 'Locked') {
      return res.status(400).json({
        success: false,
        message: 'This payroll run is locked and cannot be regenerated without unlocking.',
        code: 'PAYROLL_LOCKED'
      });
    }

    const activeEmployees = db.find('employees', { status: 'Active' });
    let totalGross = 0;
    let totalDeductions = 0;

    const payslipsToInsert = [];

    for (const emp of activeEmployees) {
      const s = emp.salaryStructure || {};
      const gross = Number(s.baseSalary || 0) + Number(s.hra || 0) + Number(s.specialAllowance || 0) + Number(s.transportAllowance || 0);
      const deductions = Number(s.pfDeduction || 0) + Number(s.taxDeduction || 0) + Number(s.otherDeductions || 0);
      const net = gross - deductions;

      totalGross += gross;
      totalDeductions += deductions;

      payslipsToInsert.push({
        id: `ps-${year}${month.slice(0, 3)}-${emp.employeeId}`,
        organizationId: emp.organizationId || 'org-dayflow-global',
        payrollRunId: runId,
        employeeId: emp.employeeId,
        employeeName: emp.name,
        department: emp.department,
        designation: emp.designation,
        month: `${month} ${year}`,
        year: parseInt(year, 10),
        baseSalary: Number(s.baseSalary || 0),
        hra: Number(s.hra || 0),
        specialAllowance: Number(s.specialAllowance || 0),
        transportAllowance: Number(s.transportAllowance || 0),
        bonus: 0,
        otherEarnings: 0,
        grossSalary: gross,
        pfDeduction: Number(s.pfDeduction || 0),
        taxDeduction: Number(s.taxDeduction || 0),
        otherDeductions: Number(s.otherDeductions || 0),
        lossOfPay: 0,
        netSalary: net,
        bankName: s.bankName || 'Direct Deposit',
        accountNumber: s.accountNumber || '**** 0000',
        ifscCode: s.ifscCode || 'SVB0001',
        pan: s.pan || 'DAYFLOW99X',
        status: 'Generated',
        generatedAt: new Date().toISOString()
      });
    }

    const totalNet = totalGross - totalDeductions;

    let runRecord;
    db.transaction(database => {
      // Upsert payroll run
      if (existing) {
        runRecord = database.update('payroll_runs', existing.id, {
          totalEmployees: activeEmployees.length,
          totalGross,
          totalDeductions,
          totalNet,
          status: 'Generated',
          generatedAt: new Date().toISOString()
        });
      } else {
        runRecord = database.insert('payroll_runs', {
          id: runId,
          organizationId: 'org-dayflow-global',
          month: `${month} ${year}`,
          year: parseInt(year, 10),
          totalEmployees: activeEmployees.length,
          totalGross,
          totalDeductions,
          totalNet,
          status: 'Generated',
          generatedAt: new Date().toISOString(),
          lockedAt: null,
          publishedAt: null
        });
      }

      // Upsert payslips
      for (const slip of payslipsToInsert) {
        const existSlip = database.findOne('payslips', { id: slip.id });
        if (existSlip) {
          database.update('payslips', existSlip.id, slip);
        } else {
          database.insert('payslips', slip);
        }
      }
    });

    logAuditAction({
      req,
      action: 'PAYROLL_GENERATED',
      entity: 'PayrollRun',
      entityId: runId,
      metadata: { month, year, totalEmployees: activeEmployees.length, totalNet }
    });

    return res.status(201).json({
      success: true,
      data: runRecord,
      message: `Payroll run for ${month} ${year} generated with ${activeEmployees.length} payslips.`
    });
  } catch (err) {
    console.error('Error generating payroll:', err);
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// PATCH /api/payroll/lock/:id
router.patch('/lock/:id', requireAuth, requireRole(['admin', 'super_admin']), (req, res) => {
  try {
    const id = req.params.id;
    const run = db.get('payroll_runs', id);

    if (!run) {
      return res.status(404).json({ success: false, message: 'Payroll run not found.', code: 'NOT_FOUND' });
    }

    const updated = db.update('payroll_runs', id, {
      status: 'Locked',
      lockedAt: new Date().toISOString()
    });

    logAuditAction({
      req,
      action: 'PAYROLL_LOCKED',
      entity: 'PayrollRun',
      entityId: id,
      metadata: { month: run.month }
    });

    return res.json({
      success: true,
      data: updated,
      message: `Payroll run ${run.month} is now locked. Adjustments are frozen.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// PATCH /api/payroll/publish/:id
router.patch('/publish/:id', requireAuth, requireRole(['admin', 'super_admin']), (req, res) => {
  try {
    const id = req.params.id;
    const run = db.get('payroll_runs', id);

    if (!run) {
      return res.status(404).json({ success: false, message: 'Payroll run not found.', code: 'NOT_FOUND' });
    }

    db.transaction(database => {
      database.update('payroll_runs', id, {
        status: 'Published',
        publishedAt: new Date().toISOString()
      });

      // Mark all associated payslips as Disbursed
      const slips = database.find('payslips', { payrollRunId: id });
      for (const slip of slips) {
        database.update('payslips', slip.id, { status: 'Disbursed' });

        // Notify each employee
        database.insert('notifications', {
          id: `notif-${Date.now()}-${slip.employeeId}`,
          organizationId: run.organizationId,
          userId: slip.employeeId,
          employeeId: slip.employeeId,
          type: 'payroll',
          title: `Payslip Published for ${run.month}`,
          message: `Your net salary of $${Number(slip.netSalary).toLocaleString()} has been processed and your official payslip is ready.`,
          link: '/payroll',
          read: false
        });
      }
    });

    logAuditAction({
      req,
      action: 'PAYROLL_PUBLISHED',
      entity: 'PayrollRun',
      entityId: id,
      metadata: { month: run.month, totalNet: run.totalNet }
    });

    return res.json({
      success: true,
      message: `Payroll for ${run.month} published successfully. All employees notified.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// PATCH /api/payroll/salary/:employeeId (Admin updates salary structure)
router.patch('/salary/:employeeId', requireAuth, requireRole(['admin', 'super_admin']), (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const emp = db.findOne('employees', e => e.id === employeeId || e.employeeId === employeeId);

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.', code: 'NOT_FOUND' });
    }

    const {
      baseSalary,
      hra,
      specialAllowance,
      transportAllowance,
      pfDeduction,
      taxDeduction,
      otherDeductions,
      bankName,
      accountNumber,
      ifscCode,
      pan
    } = req.body;

    const base = Number(baseSalary) || 0;
    const h = Number(hra) || 0;
    const special = Number(specialAllowance) || 0;
    const transport = Number(transportAllowance) || 0;
    const pf = Number(pfDeduction) || 0;
    const tax = Number(taxDeduction) || 0;
    const other = Number(otherDeductions) || 0;

    const gross = base + h + special + transport;
    const deductions = pf + tax + other;
    const net = gross - deductions;

    const updatedStructure = {
      baseSalary: base,
      hra: h,
      specialAllowance: special,
      transportAllowance: transport,
      pfDeduction: pf,
      taxDeduction: tax,
      otherDeductions: other,
      grossSalary: gross,
      totalDeductions: deductions,
      netSalary: net,
      bankName: bankName || emp.salaryStructure?.bankName || 'Silicon Valley Bank',
      accountNumber: accountNumber || emp.salaryStructure?.accountNumber || '**** 0000',
      ifscCode: ifscCode || emp.salaryStructure?.ifscCode || 'SVB00192',
      pan: pan || emp.salaryStructure?.pan || 'DAYFLOW99X'
    };

    const updated = db.update('employees', emp.id, { salaryStructure: updatedStructure });

    logAuditAction({
      req,
      action: 'SALARY_STRUCTURE_UPDATED',
      entity: 'Employee',
      entityId: emp.employeeId,
      metadata: { grossSalary: gross, netSalary: net }
    });

    return res.json({
      success: true,
      data: updated,
      message: `Salary structure updated for ${emp.name}.`
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// GET /api/payroll/payslips (Role secured: employees only view own; admin can view any)
router.get('/payslips', requireAuth, (req, res) => {
  try {
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'super_admin';
    const targetEmpId = isPrivileged && req.query.employeeId ? req.query.employeeId : req.user.employeeId;

    let slips = db.find('payslips', { employeeId: targetEmpId });
    slips.sort((a, b) => b.year - a.year);

    return res.json({
      success: true,
      data: slips
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// GET /api/payroll/payslip/:id
router.get('/payslip/:id', requireAuth, (req, res) => {
  try {
    const id = req.params.id;
    const slip = db.get('payslips', id);

    if (!slip) {
      return res.status(404).json({ success: false, message: 'Payslip record not found.', code: 'NOT_FOUND' });
    }

    // IDOR Protection: Employee can ONLY view their own payslip
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'super_admin';
    if (!isPrivileged && slip.employeeId !== req.user.employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: you may only access your own official payslips.',
        code: 'IDOR_VIOLATION'
      });
    }

    return res.json({
      success: true,
      data: slip
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

export default router;
