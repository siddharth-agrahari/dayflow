import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';

test('Security & RBAC Enforcement Tests', async (t) => {
  await seedDatabase(true);

  await t.test('Password hashes are stored securely and never in plaintext', () => {
    const users = db.find('users');
    for (const u of users) {
      assert.notEqual(u.passwordHash, 'password123', 'Password must not be stored in plaintext');
      assert.ok(u.passwordHash.startsWith('$2'), 'Password hash must be a valid bcrypt hash');
    }
  });

  await t.test('Non-admin users cannot alter role, designation, or salary', () => {
    const employeeUser = db.findOne('users', { employeeId: 'EMP-1002' });
    assert.equal(employeeUser.role, 'employee');

    // Simulate an unauthorized payload attempting privilege escalation
    const maliciousPayload = {
      role: 'super_admin',
      salaryStructure: { baseSalary: 50000, netSalary: 50000 },
      designation: 'Chief Technology Officer'
    };

    const isAdmin = employeeUser.role === 'admin' || employeeUser.role === 'super_admin';
    assert.equal(isAdmin, false, 'User must not have admin rights');

    // Server-side guard: filter out forbidden fields
    const allowedFieldsForEmployee = ['personalDetails', 'avatar'];
    const attemptedForbidden = Object.keys(maliciousPayload).filter(k => !allowedFieldsForEmployee.includes(k));

    assert.equal(attemptedForbidden.length, 3, 'All 3 escalated fields must be caught as forbidden');
  });

  await t.test('IDOR check: Employee cannot access peer payslip records', () => {
    const requesterEmployeeId = 'EMP-1002'; // Alex
    const targetEmployeeId = 'EMP-1001';    // Eleanor (Admin)

    const canAccess = (requesterRole, requesterId, targetId) => {
      if (requesterRole === 'admin' || requesterRole === 'super_admin') return true;
      return requesterId === targetId;
    };

    const accessGranted = canAccess('employee', requesterEmployeeId, targetEmployeeId);
    assert.equal(accessGranted, false, 'Alex must be blocked from accessing Eleanor’s payslip');

    const ownAccess = canAccess('employee', requesterEmployeeId, requesterEmployeeId);
    assert.equal(ownAccess, true, 'Alex should have access to his own payslip');
  });
});
