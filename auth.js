import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'dayflow-secret-key-2026-secure-jwt-hrms';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      req.user = null;
      return next();
    }
    req.user = userPayload;
    next();
  });
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in.',
      code: 'UNAUTHORIZED'
    });
  }
  next();
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'UNAUTHORIZED'
      });
    }

    // super_admin always passes
    if (req.user.role === 'super_admin') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: insufficient administrative permissions.',
        code: 'FORBIDDEN'
      });
    }

    next();
  };
}

export function requireSelfOrAdmin(targetIdGetter) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.', code: 'UNAUTHORIZED' });
    }

    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      return next();
    }

    const targetId = typeof targetIdGetter === 'function' ? targetIdGetter(req) : req.params.id || req.params.employeeId;
    if (req.user.employeeId === targetId || req.user.id === targetId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: you can only view or modify your own records.',
      code: 'IDOR_PROTECTION_FORBIDDEN'
    });
  };
}

export function requireManagerOrAdmin(targetIdGetter) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.', code: 'UNAUTHORIZED' });
    }

    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      return next();
    }

    const targetId = typeof targetIdGetter === 'function' ? targetIdGetter(req) : req.params.id || req.params.employeeId;
    if (req.user.employeeId === targetId) {
      return next();
    }

    // Check if current user is manager of the target employee
    if (req.user.role === 'manager') {
      const targetEmp = db.findOne('employees', { employeeId: targetId });
      if (targetEmp && targetEmp.managerId === req.user.employeeId) {
        return next();
      }
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: requires manager or administrator privileges for this employee.',
      code: 'FORBIDDEN'
    });
  };
}
