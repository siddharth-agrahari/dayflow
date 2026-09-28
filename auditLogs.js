import express from 'express';
import { db } from '../db/database.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

function toCSV(headers, rows) {
  const headLine = headers.map(h => `"${h.label}"`).join(',');
  const rowLines = rows.map(r => {
    return headers.map(h => {
      let val = r[h.key];
      if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      }
      const strVal = val !== undefined && val !== null ? String(val) : '';
      return `"${strVal.replace(/"/g, '""')}"`;
    }).join(',');
  });
  return [headLine, ...rowLines].join('\n');
}

// GET /api/audit-logs (Admin only)
router.get('/', requireAuth, requireRole(['admin', 'super_admin']), (req, res) => {
  try {
    const { action, actorId, entity, search, format, page = 1, limit = 50 } = req.query;
    let list = db.find('audit_logs');

    if (action && action !== 'ALL') {
      list = list.filter(a => a.action === action);
    }
    if (actorId && actorId !== 'ALL') {
      list = list.filter(a => a.actorId === actorId);
    }
    if (entity && entity !== 'ALL') {
      list = list.filter(a => a.entity === entity);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(a =>
        a.action.toLowerCase().includes(q) ||
        a.actorName.toLowerCase().includes(q) ||
        a.entity.toLowerCase().includes(q) ||
        a.entityId.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    if (format === 'csv') {
      const headers = [
        { key: 'timestamp', label: 'Timestamp (UTC)' },
        { key: 'actorName', label: 'Actor Name' },
        { key: 'actorRole', label: 'Role' },
        { key: 'action', label: 'Action Type' },
        { key: 'entity', label: 'Target Entity' },
        { key: 'entityId', label: 'Entity ID' },
        { key: 'ipAddress', label: 'IP Address' },
        { key: 'metadata', label: 'Details' }
      ];

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="dayflow-audit-trail.csv"');
      return res.send(toCSV(headers, list));
    }

    const total = list.length;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = list.slice(startIndex, startIndex + limitNum);

    return res.json({
      success: true,
      data: {
        logs: paginated,
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

export default router;
