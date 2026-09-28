import express from 'express';
import { db } from '../db/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { logAuditAction } from '../middleware/audit.js';

const router = express.Router();

// GET /api/organization/departments
router.get('/departments', requireAuth, (req, res) => {
  const depts = db.find('departments');
  return res.json({ success: true, data: depts });
});

// POST /api/organization/departments
router.post('/departments', requireAuth, requireRole(['admin', 'super_admin']), (req, res) => {
  const { name, code, description } = req.body;
  if (!name || !code) {
    return res.status(400).json({ success: false, message: 'Name and code are required.', code: 'VALIDATION_ERROR' });
  }

  const newDept = db.insert('departments', {
    id: `dept-${code.toLowerCase()}`,
    organizationId: req.user.organizationId || 'org-dayflow-global',
    name,
    code: code.toUpperCase(),
    description: description || ''
  });

  logAuditAction({ req, action: 'DEPARTMENT_CREATED', entity: 'Department', entityId: newDept.id, metadata: { name, code } });
  return res.status(201).json({ success: true, data: newDept });
});

// GET /api/organization/designations
router.get('/designations', requireAuth, (req, res) => {
  const list = db.find('designations');
  return res.json({ success: true, data: list });
});

// POST /api/organization/designations
router.post('/designations', requireAuth, requireRole(['admin', 'super_admin']), (req, res) => {
  const { title, departmentId, level } = req.body;
  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required.', code: 'VALIDATION_ERROR' });
  }

  const newDesig = db.insert('designations', {
    id: `desig-${Date.now()}`,
    organizationId: req.user.organizationId || 'org-dayflow-global',
    title,
    departmentId: departmentId || 'dept-eng',
    level: level || 'Specialist'
  });

  logAuditAction({ req, action: 'DESIGNATION_CREATED', entity: 'Designation', entityId: newDesig.id, metadata: { title } });
  return res.status(201).json({ success: true, data: newDesig });
});

// GET /api/organization/shifts
router.get('/shifts', requireAuth, (req, res) => {
  const list = db.find('shifts');
  return res.json({ success: true, data: list });
});

// POST /api/organization/shifts
router.post('/shifts', requireAuth, requireRole(['admin', 'super_admin']), (req, res) => {
  const { name, startTime, endTime, gracePeriodMins = 15, breakDurationMins = 60 } = req.body;
  if (!name || !startTime || !endTime) {
    return res.status(400).json({ success: false, message: 'Shift name, start time, and end time are required.', code: 'VALIDATION_ERROR' });
  }

  const newShift = db.insert('shifts', {
    id: `shift-${Date.now()}`,
    organizationId: req.user.organizationId || 'org-dayflow-global',
    name,
    startTime,
    endTime,
    gracePeriodMins: Number(gracePeriodMins),
    breakDurationMins: Number(breakDurationMins),
    isDefault: false
  });

  logAuditAction({ req, action: 'SHIFT_CREATED', entity: 'Shift', entityId: newShift.id, metadata: { name, startTime, endTime } });
  return res.status(201).json({ success: true, data: newShift });
});

// GET /api/organization/summary (Overview of org settings)
router.get('/summary', requireAuth, (req, res) => {
  const org = db.findOne('organizations') || { name: 'Dayflow Technologies Inc.', domain: 'dayflow.com' };
  const departments = db.find('departments');
  const designations = db.find('designations');
  const shifts = db.find('shifts');

  return res.json({
    success: true,
    data: {
      organization: org,
      departments,
      designations,
      shifts
    }
  });
});

export default router;
