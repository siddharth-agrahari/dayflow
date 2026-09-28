import { db } from '../db/database.js';

export function logAuditAction({ req, action, entity, entityId, metadata = {} }) {
  try {
    const actorId = req?.user?.employeeId || req?.user?.id || 'SYSTEM';
    const actorName = req?.user?.name || req?.user?.email || 'System Process';
    const actorRole = req?.user?.role || 'system';
    const organizationId = req?.user?.organizationId || 'org-dayflow-global';
    const ipAddress = req?.ip || req?.connection?.remoteAddress || '127.0.0.1';

    const logEntry = {
      id: `aud-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      organizationId,
      actorId,
      actorName,
      actorRole,
      action,
      entity,
      entityId: String(entityId || ''),
      metadata,
      ipAddress,
      timestamp: new Date().toISOString()
    };

    db.insert('audit_logs', logEntry);
    return logEntry;
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
    return null;
  }
}
