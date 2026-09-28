import express from 'express';
import { db } from '../db/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { logAuditAction } from '../middleware/audit.js';

const router = express.Router();

// GET /api/announcements
router.get('/', requireAuth, (req, res) => {
  let list = db.find('announcements');
  const today = new Date().toISOString().split('T')[0];

  // For regular employees, filter out expired notices
  const isPrivileged = req.user.role === 'admin' || req.user.role === 'super_admin';
  if (!isPrivileged) {
    list = list.filter(a => !a.expiryDate || a.expiryDate >= today);
  }

  list.sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  return res.json({ success: true, data: list });
});

// POST /api/announcements (Admin only)
router.post('/', requireAuth, requireRole(['admin', 'super_admin']), (req, res) => {
  const { title, content, category = 'General', priority = 'Normal', expiryDate } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required.', code: 'VALIDATION_ERROR' });
  }

  const today = new Date().toISOString().split('T')[0];
  const newAnn = db.insert('announcements', {
    id: `ann-${Date.now()}`,
    organizationId: req.user.organizationId || 'org-dayflow-global',
    title,
    content,
    category,
    priority,
    date: today,
    publishDate: today,
    expiryDate: expiryDate || null,
    author: req.user.name || 'HR Team'
  });

  logAuditAction({ req, action: 'ANNOUNCEMENT_POSTED', entity: 'Announcement', entityId: newAnn.id, metadata: { title, priority } });

  return res.status(201).json({
    success: true,
    data: newAnn,
    message: 'Announcement published successfully.'
  });
});

// DELETE /api/announcements/:id
router.delete('/:id', requireAuth, requireRole(['admin', 'super_admin']), (req, res) => {
  const id = req.params.id;
  const ann = db.get('announcements', id);
  if (!ann) {
    return res.status(404).json({ success: false, message: 'Announcement not found.', code: 'NOT_FOUND' });
  }

  db.delete('announcements', id);
  logAuditAction({ req, action: 'ANNOUNCEMENT_DELETED', entity: 'Announcement', entityId: id, metadata: { title: ann.title } });
  return res.json({ success: true, message: 'Announcement removed.' });
});

export default router;
