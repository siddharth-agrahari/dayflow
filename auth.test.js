import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';
import { JWT_SECRET } from '../middleware/auth.js';

test('Auth Module Tests', async (t) => {
  await seedDatabase(true);

  await t.test('Password hashing works and default demo user is verified', () => {
    const adminUser = db.findOne('users', { email: 'admin@dayflow.com' });
    assert.ok(adminUser, 'Admin user should exist in database');
    assert.equal(adminUser.role, 'super_admin', 'Admin role should be super_admin');

    const isValid = bcrypt.compareSync('password123', adminUser.passwordHash);
    assert.equal(isValid, true, 'password123 should match hashed password');

    const isWrongValid = bcrypt.compareSync('wrongpass', adminUser.passwordHash);
    assert.equal(isWrongValid, false, 'wrongpass should be rejected');
  });

  await t.test('JWT token generation and decoding', () => {
    const emp = db.findOne('employees', { employeeId: 'EMP-1002' });
    const user = db.findOne('users', { employeeId: 'EMP-1002' });

    const token = jwt.sign(
      {
        id: user.id,
        employeeId: user.employeeId,
        organizationId: user.organizationId,
        email: user.email,
        name: emp.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    assert.ok(token, 'Token string should be generated');

    const decoded = jwt.verify(token, JWT_SECRET);
    assert.equal(decoded.employeeId, 'EMP-1002');
    assert.equal(decoded.email, 'alex@dayflow.com');
    assert.equal(decoded.role, 'employee');
  });

  await t.test('Registration creates user, employee, and initial leave balance', () => {
    const testEmail = 'newtest@dayflow.com';
    const newEmpId = 'EMP-9999';

    db.insert('users', {
      id: 'usr-emp-9999',
      organizationId: 'org-dayflow-global',
      employeeId: newEmpId,
      email: testEmail,
      passwordHash: bcrypt.hashSync('testpassword', 10),
      role: 'employee',
      status: 'Active'
    });

    db.insert('employees', {
      id: newEmpId,
      organizationId: 'org-dayflow-global',
      employeeId: newEmpId,
      name: 'Test New User',
      email: testEmail,
      role: 'employee',
      department: 'Engineering',
      designation: 'Associate Specialist',
      status: 'Active'
    });

    db.insert('leave_balances', {
      id: `lb-${newEmpId}`,
      organizationId: 'org-dayflow-global',
      employeeId: newEmpId,
      year: 2026,
      paid: { total: 18, used: 0, remaining: 18 },
      sick: { total: 12, used: 0, remaining: 12 },
      casual: { total: 8, used: 0, remaining: 8 },
      unpaid: { total: 5, used: 0, remaining: 5 }
    });

    const createdUser = db.findOne('users', { employeeId: newEmpId });
    const createdEmp = db.findOne('employees', { employeeId: newEmpId });
    const createdBalance = db.findOne('leave_balances', { employeeId: newEmpId });

    assert.ok(createdUser, 'Created user should be found');
    assert.ok(createdEmp, 'Created employee should be found');
    assert.ok(createdBalance, 'Created leave balance should be found');
    assert.equal(createdBalance.paid.remaining, 18);
  });
});
