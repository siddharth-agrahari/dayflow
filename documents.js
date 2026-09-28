import express from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { db } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';
import { logAuditAction } from '../middleware/audit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${cleanName}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, PNG, JPG, DOCX, XLSX.'));
    }
  }
});

const router = express.Router();

// GET /api/documents
router.get('/', requireAuth, (req, res) => {
  const isPrivileged = req.user.role === 'admin' || req.user.role === 'super_admin';
  const targetEmpId = isPrivileged && req.query.employeeId ? req.query.employeeId : req.user.employeeId;

  const docs = db.find('documents', { employeeId: targetEmpId });
  docs.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  return res.json({ success: true, data: docs });
});

// POST /api/documents/upload
router.post('/upload', requireAuth, upload.single('file'), (req, res) => {
  try {
    const { title, category = 'Other', employeeId } = req.body;
    const targetEmpId = (req.user.role === 'admin' || req.user.role === 'super_admin') && employeeId
      ? employeeId
      : req.user.employeeId;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required.', code: 'NO_FILE' });
    }

    const fileSizeFormatted = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;

    const doc = db.insert('documents', {
      id: `doc-${Date.now()}`,
      organizationId: req.user.organizationId || 'org-dayflow-global',
      employeeId: targetEmpId,
      title: title || req.file.originalname,
      category,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileSize: fileSizeFormatted,
      mimeType: req.file.mimetype,
      uploadedBy: req.user.name,
      uploadedAt: new Date().toISOString().split('T')[0]
    });

    // Also push to employee record documents list
    const emp = db.findOne('employees', { employeeId: targetEmpId });
    if (emp) {
      const existingDocs = emp.documents || [];
      db.update('employees', emp.id, { documents: [...existingDocs, doc] });
    }

    logAuditAction({
      req,
      action: 'DOCUMENT_UPLOADED',
      entity: 'Document',
      entityId: doc.id,
      metadata: { title: doc.title, fileName: doc.fileName, employeeId: targetEmpId }
    });

    return res.status(201).json({
      success: true,
      data: doc,
      message: 'Document uploaded successfully.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const id = req.params.id;
    const doc = db.get('documents', id);

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.', code: 'NOT_FOUND' });
    }

    // Role check
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'super_admin';
    if (!isPrivileged && doc.employeeId !== req.user.employeeId) {
      return res.status(403).json({ success: false, message: 'Access denied.', code: 'FORBIDDEN' });
    }

    // Delete physical file if exists
    const filePath = path.join(UPLOADS_DIR, doc.fileName);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    }

    db.delete('documents', id);

    // Remove from employee profile
    const emp = db.findOne('employees', { employeeId: doc.employeeId });
    if (emp && emp.documents) {
      db.update('employees', emp.id, {
        documents: emp.documents.filter(d => d.id !== id)
      });
    }

    logAuditAction({
      req,
      action: 'DOCUMENT_DELETED',
      entity: 'Document',
      entityId: id,
      metadata: { title: doc.title, employeeId: doc.employeeId }
    });

    return res.json({ success: true, message: 'Document deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

export default router;
