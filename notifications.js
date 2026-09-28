import express from 'express';
import { db } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications
router.get('/', requireAuth, (req, res) => {
  const employeeId = req.user.employeeId;
  const list = db.find('notifications', n =>
    n.employeeId === employeeId ||
    n.userId === req.user.id ||
    (req.user.role === 'admin' && n.userId === 'admin')
  );

  list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const unreadCount = list.filter(n => !n.read).length;

  return res.json({
    success: true,
    data: {
      notifications: list,
      unreadCount
    }
  });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAuth, (req, res) => {
  const id = req.params.id;
  const updated = db.update('notifications', id, { read: true });
  return res.json({ success: true, data: updated });
});

// POST /api/notifications/read-all
router.post('/read-all', requireAuth, (req, res) => {
  const employeeId = req.user.employeeId;
  const list = db.find('notifications', n =>
    n.employeeId === employeeId ||
    n.userId === req.user.id ||
    (req.user.role === 'admin' && n.userId === 'admin')
  );

  for (const item of list) {
    if (!item.read) {
      db.update('notifications', item.id, { read: true });
    }
  }

  return res.json({ success: true, message: 'All notifications marked as read.' });
});

export default router;
