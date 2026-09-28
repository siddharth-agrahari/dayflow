import express from 'express';
import { db } from '../db/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

function toCSV(headers, rows) {
  const headLine = headers.map(h => `"${h.label}"`).join(',');
  const rowLines = rows.map(r => {
    return headers.map(h => {
      const val = r[h.key] !== undefined && r[h.key] !== null ? String(r[h.key]) : '';
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',');
  });
  return [headLine, ...rowLines].join('\n');
}

// GET /api/reports/summary (High-level dashboard KPIs)
router.get('/summary', requireAuth, (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const employees = db.find('employees');
    const todayLogs = db.find('attendance', { date: today });
    const pendingLeaves = db.find('leaves', { status: 'Pending' });
    const pendingCorrections = db.find('attendance_corrections', { status: 'Pending' });

    const totalHeadcount = employees.length;
    const presentToday = todayLogs.filter(l => l.status === 'Present').length;
    const onLeaveToday = todayLogs.filter(l => l.status === 'Leave').length;

    const totalPayroll = employees.reduce((sum, e) => sum + (e.salaryStructure?.netSalary || 0), 0);

    // Department breakdown
    const deptDistribution = {};
    employees.forEach(e => {
      deptDistribution[e.department] = (deptDistribution[e.department] || 0) + 1;
    });

    // Attendance rate
    const allAttendance = db.find('attendance');
    const presentTotal = allAttendance.filter(l => l.status === 'Present').length;
    const attendanceRate = allAttendance.length > 0 ? ((presentTotal / allAttendance.length) * 100).toFixed(1) : '96.2';

    return res.json({
      success: true,
      data: {
        totalHeadcount,
        presentToday,
        onLeaveToday,
        pendingApprovals: pendingLeaves.length + pendingCorrections.length,
        totalPayroll,
        attendanceRate,
        deptDistribution
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// GET /api/reports/employees (Headcount report with CSV support)
router.get('/employees', requireAuth, requireRole(['admin', 'super_admin', 'manager']), (req, res) => {
  try {
    const { department, status, format } = req.query;
    let list = db.find('employees');

    if (department && department !== 'ALL') list = list.filter(e => e.department === department);
    if (status && status !== 'ALL') list = list.filter(e => e.status === status);

    const rows = list.map(e => ({
      employeeId: e.employeeId,
      name: e.name,
      email: e.email,
      department: e.department,
      designation: e.designation,
      joiningDate: e.joiningDate,
      status: e.status,
      workLocation: e.jobDetails?.workLocation || 'HQ',
      employmentType: e.jobDetails?.employmentType || 'Full-time',
      netSalary: e.salaryStructure?.netSalary || 0
    }));

    if (format === 'csv') {
      const headers = [
        { key: 'employeeId', label: 'Employee ID' },
        { key: 'name', label: 'Full Name' },
        { key: 'email', label: 'Work Email' },
        { key: 'department', label: 'Department' },
        { key: 'designation', label: 'Designation' },
        { key: 'joiningDate', label: 'Joining Date' },
        { key: 'status', label: 'Status' },
        { key: 'workLocation', label: 'Location' },
        { key: 'employmentType', label: 'Employment Type' }
      ];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="dayflow-employees-report.csv"');
      return res.send(toCSV(headers, rows));
    }

    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// GET /api/reports/attendance (Attendance report with CSV)
router.get('/attendance', requireAuth, requireRole(['admin', 'super_admin', 'manager']), (req, res) => {
  try {
    const { startDate, endDate, department, format } = req.query;
    let list = db.find('attendance');

    if (startDate && endDate) {
      list = list.filter(l => l.date >= startDate && l.date <= endDate);
    }
    if (department && department !== 'ALL') {
      list = list.filter(l => l.department === department);
    }

    list.sort((a, b) => b.date.localeCompare(a.date));

    if (format === 'csv') {
      const headers = [
        { key: 'date', label: 'Date' },
        { key: 'employeeId', label: 'Employee ID' },
        { key: 'employeeName', label: 'Employee Name' },
        { key: 'department', label: 'Department' },
        { key: 'checkIn', label: 'Check In' },
        { key: 'checkOut', label: 'Check Out' },
        { key: 'workHours', label: 'Duration' },
        { key: 'workMode', label: 'Mode' },
        { key: 'status', label: 'Status' }
      ];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="dayflow-attendance-report.csv"');
      return res.send(toCSV(headers, list));
    }

    return res.json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// GET /api/reports/leaves (Leave report with CSV)
router.get('/leaves', requireAuth, requireRole(['admin', 'super_admin', 'manager']), (req, res) => {
  try {
    const { status, leaveType, format } = req.query;
    let list = db.find('leaves');

    if (status && status !== 'ALL') list = list.filter(l => l.status === status);
    if (leaveType && leaveType !== 'ALL') list = list.filter(l => l.leaveType === leaveType);

    list.sort((a, b) => b.fromDate.localeCompare(a.fromDate));

    if (format === 'csv') {
      const headers = [
        { key: 'id', label: 'Request ID' },
        { key: 'employeeId', label: 'Employee ID' },
        { key: 'employeeName', label: 'Employee Name' },
        { key: 'department', label: 'Department' },
        { key: 'leaveType', label: 'Leave Type' },
        { key: 'fromDate', label: 'From Date' },
        { key: 'toDate', label: 'To Date' },
        { key: 'days', label: 'Days' },
        { key: 'reason', label: 'Reason' },
        { key: 'status', label: 'Status' },
        { key: 'adminComment', label: 'Supervisor Comment' }
      ];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="dayflow-leaves-report.csv"');
      return res.send(toCSV(headers, list));
    }

    return res.json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// GET /api/reports/payroll (Payroll disbursement report with CSV)
router.get('/payroll', requireAuth, requireRole(['admin', 'super_admin']), (req, res) => {
  try {
    const { month = 'August 2026', format } = req.query;
    const slips = db.find('payslips', { month });

    if (format === 'csv') {
      const headers = [
        { key: 'employeeId', label: 'Employee ID' },
        { key: 'employeeName', label: 'Employee Name' },
        { key: 'department', label: 'Department' },
        { key: 'designation', label: 'Designation' },
        { key: 'month', label: 'Period' },
        { key: 'baseSalary', label: 'Base Salary ($)' },
        { key: 'hra', label: 'HRA ($)' },
        { key: 'specialAllowance', label: 'Special Allowance ($)' },
        { key: 'grossSalary', label: 'Gross Salary ($)' },
        { key: 'pfDeduction', label: 'PF ($)' },
        { key: 'taxDeduction', label: 'Tax ($)' },
        { key: 'totalDeductions', label: 'Total Deductions ($)' },
        { key: 'netSalary', label: 'Net Take-Home ($)' },
        { key: 'status', label: 'Status' }
      ];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="dayflow-payroll-${month.replace(/\s+/g, '-')}.csv"`);
      return res.send(toCSV(headers, slips));
    }

    return res.json({ success: true, data: slips });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

export default router;
