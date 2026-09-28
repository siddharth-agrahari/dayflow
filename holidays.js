import express from 'express';
import { db } from '../db/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { logAuditAction } from '../middleware/audit.js';

const router = express.Router();

// GET /api/holidays
router.get('/', requireAuth, (req, res) => {
  const { year } = req.query;
  let list = db.find('holidays');
  if (year) {
    list = list.filter(h => h.year === parseInt(year, 10));
  }
  list.sort((a, b) => a.date.localeCompare(b.date));
  return res.json({ success: true, data: list });
});

// POST /api/holidays (Admin only)
router.post('/', requireAuth, requireRole(['admin', 'super_admin']), (req, res) => {
  const { name, date, description, isRestricted = false } = req.body;
  if (!name || !date) {
    return res.status(400).json({ success: false, message: 'Name and date are required.', code: 'VALIDATION_ERROR' });
  }

  const year = new Date(date).getFullYear();
  const newHol = db.insert('holidays', {
    id: `hol-${Date.now()}`,
    organizationId: req.user.organizationId || 'org-dayflow-global',
    name,
    date,
    description: description || '',
    isRestricted: !!isRestricted,
    year
  });

  logAuditAction({ req, action: 'HOLIDAY_CREATED', entity: 'Holiday', entityId: newHol.id, metadata: { name, date } });
  return res.status(201).json({ success: true, data: newHol, message: 'Holiday created.' });
});

// DELETE /api/holidays/:id (Admin only)
router.delete('/:id', requireAuth, requireRole(['admin', 'super_admin']), (req, res) => {
  const id = req.params.id;
  const hol = db.get('holidays', id);
  if (!hol) {
    return res.status(404).json({ success: false, message: 'Holiday not found.', code: 'NOT_FOUND' });
  }

  db.delete('holidays', id);
  logAuditAction({ req, action: 'HOLIDAY_DELETED', entity: 'Holiday', entityId: id, metadata: { name: hol.name, date: hol.date } });
  return res.json({ success: true, message: 'Holiday removed.' });
});

export default router;
