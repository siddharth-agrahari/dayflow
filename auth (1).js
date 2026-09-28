import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';
import { JWT_SECRET, requireAuth } from '../middleware/auth.js';
import { logAuditAction } from '../middleware/audit.js';
import { seedDatabase } from '../db/seed.js';

const router = express.Router();

// Helper to generate JWT token
function generateToken(user, employee) {
  return jwt.sign(
    {
      id: user.id,
      userId: user.id,
      employeeId: user.employeeId,
      organizationId: user.organizationId,
      email: user.email,
      name: employee?.name || user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !identifier.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your Employee ID / Email and password.',
        code: 'VALIDATION_ERROR'
      });
    }

    const cleanId = identifier.trim().toLowerCase();

    // Find user by email or employeeId
    const user = db.findOne('users', u =>
      (u.email && u.email.toLowerCase() === cleanId) ||
      (u.employeeId && u.employeeId.toLowerCase() === cleanId) ||
      (u.id && u.id.toLowerCase() === cleanId)
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this Employee ID or Email address.',
        code: 'INVALID_CREDENTIALS'
      });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact HR.',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Verify password with bcrypt
    const passwordValid = bcrypt.compareSync(password, user.passwordHash);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password. Default demo password is "password123".',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Get associated employee profile
    const employee = db.findOne('employees', { employeeId: user.employeeId }) || null;

    const token = generateToken(user, employee);

    // Audit log
    logAuditAction({
      req: { user: { employeeId: user.employeeId, name: employee?.name, role: user.role, organizationId: user.organizationId }, ip: req.ip },
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
      metadata: { method: cleanId.includes('@') ? 'email' : 'employeeId' }
    });

    const sanitizedUser = {
      id: user.id,
      employeeId: user.employeeId,
      organizationId: user.organizationId,
      email: user.email,
      role: user.role,
      status: user.status
    };

    return res.json({
      success: true,
      data: {
        token,
        user: sanitizedUser,
        employee
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during authentication.',
      code: 'SERVER_ERROR'
    });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  try {
    const user = db.get('users', req.user.id) || db.findOne('users', { employeeId: req.user.employeeId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Authenticated user profile not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    const employee = db.findOne('employees', { employeeId: user.employeeId });

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          employeeId: user.employeeId,
          organizationId: user.organizationId,
          email: user.email,
          role: user.role,
          status: user.status
        },
        employee
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, department, designation, phone, address, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required.',
        code: 'VALIDATION_ERROR'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = db.findOne('users', { email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    const orgId = 'org-dayflow-global';
    const newEmpId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newUserId = `usr-${newEmpId.toLowerCase()}`;
    const passwordHash = bcrypt.hashSync(password, 10);

    const newUser = db.insert('users', {
      id: newUserId,
      organizationId: orgId,
      employeeId: newEmpId,
      email: cleanEmail,
      passwordHash,
      role: role || 'employee',
      status: 'Active'
    });

    const newEmployee = db.insert('employees', {
      id: newEmpId,
      organizationId: orgId,
      userId: newUserId,
      employeeId: newEmpId,
      name,
      email: cleanEmail,
      role: role || 'employee',
      department: department || 'Engineering',
      designation: designation || 'Associate Specialist',
      managerId: 'EMP-1001',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      personalDetails: {
        phone: phone || '+1 (555) 000-0000',
        address: address || 'San Francisco, CA',
        dob: '1995-01-01',
        gender: 'Not specified',
        maritalStatus: 'Single',
        emergencyContact: 'Family Contact (+1 555-111-2222)',
        bloodGroup: 'O+'
      },
      jobDetails: {
        department: department || 'Engineering',
        designation: designation || 'Associate Specialist',
        manager: 'Eleanor Vance',
        workLocation: 'San Francisco HQ',
        employmentType: 'Full-time',
        workSchedule: '09:00 AM - 06:00 PM',
        shiftId: 'shift-morning'
      },
      salaryStructure: {
        baseSalary: 6500,
        hra: 2200,
        specialAllowance: 1200,
        transportAllowance: 350,
        pfDeduction: 780,
        taxDeduction: 1100,
        otherDeductions: 120,
        grossSalary: 10250,
        totalDeductions: 2000,
        netSalary: 8250,
        bankName: 'Silicon Valley Bank',
        accountNumber: `**** **** ${Math.floor(1000 + Math.random() * 9000)}`,
        ifscCode: 'SVB001122',
        pan: `NEWEMP${Math.floor(100 + Math.random() * 900)}X`
      },
      onboardingCompleted: false,
      profileCompletion: 70,
      documents: []
    });

    // Seed default leave balances
    db.insert('leave_balances', {
      id: `lb-${newEmpId}`,
      organizationId: orgId,
      employeeId: newEmpId,
      year: 2026,
      paid: { total: 18, used: 0, remaining: 18 },
      sick: { total: 12, used: 0, remaining: 12 },
      casual: { total: 8, used: 0, remaining: 8 },
      unpaid: { total: 5, used: 0, remaining: 5 }
    });

    logAuditAction({
      req: { user: { employeeId: newEmpId, name, role: newUser.role, organizationId: orgId }, ip: req.ip },
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: newUser.id,
      metadata: { email: cleanEmail, employeeId: newEmpId }
    });

    const token = generateToken(newUser, newEmployee);

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          employeeId: newUser.employeeId,
          organizationId: newUser.organizationId,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status
        },
        employee: newEmployee
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', requireAuth, (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
        code: 'VALIDATION_ERROR'
      });
    }

    const user = db.findOne('users', { employeeId: req.user.employeeId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.', code: 'NOT_FOUND' });
    }

    if (currentPassword) {
      const valid = bcrypt.compareSync(currentPassword, user.passwordHash);
      if (!valid) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect current password.',
          code: 'INVALID_CREDENTIALS'
        });
      }
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.update('users', user.id, { passwordHash: newHash });

    // Mark onboarding step complete
    const emp = db.findOne('employees', { employeeId: req.user.employeeId });
    if (emp && !emp.onboardingCompleted) {
      db.update('employees', emp.id, { onboardingCompleted: true });
    }

    logAuditAction({
      req,
      action: 'PASSWORD_CHANGED',
      entity: 'User',
      entityId: user.id,
      metadata: { employeeId: req.user.employeeId }
    });

    return res.json({
      success: true,
      message: 'Password successfully updated.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

// POST /api/auth/logout
router.post('/logout', requireAuth, (req, res) => {
  logAuditAction({
    req,
    action: 'USER_LOGOUT',
    entity: 'User',
    entityId: req.user.id,
    metadata: { employeeId: req.user.employeeId }
  });

  return res.json({
    success: true,
    message: 'Signed out successfully.'
  });
});

// POST /api/auth/reset-demo
router.post('/reset-demo', async (req, res) => {
  try {
    await seedDatabase(true);
    return res.json({
      success: true,
      message: 'Dayflow database has been reset to default demo snapshot.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, code: 'SERVER_ERROR' });
  }
});

export default router;
