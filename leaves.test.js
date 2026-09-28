import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';

test('Leave Management & Transaction Integrity Tests', async (t) => {
  await seedDatabase(true);

  const testEmpId = 'EMP-1002';

  await t.test('Initial leave balances exist', () => {
    const bal = db.findOne('leave_balances', { employeeId: testEmpId });
    assert.ok(bal);
    assert.ok(bal.paid.remaining > 0);
    assert.ok(bal.sick.remaining > 0);
  });

  await t.test('Applying for leave creates a pending leave record', () => {
    const fromDate = '2026-11-10';
    const toDate = '2026-11-12';
    const days = 3;

    const newLeave = db.insert('leaves', {
      id: 'LR-TEST-1',
      organizationId: 'org-dayflow-global',
      employeeId: testEmpId,
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      leaveType: 'Paid',
      fromDate,
      toDate,
      days,
      reason: 'Tech conference travel',
      status: 'Pending',
      adminComment: ''
    });

    assert.ok(newLeave);
    assert.equal(newLeave.status, 'Pending');
    assert.equal(newLeave.days, 3);
  });

  await t.test('Overlapping leave detection', () => {
    const reqFrom = '2026-11-11';
    const reqTo = '2026-11-14';

    const overlaps = db.find('leaves', l => {
      if (l.employeeId !== testEmpId) return false;
      if (l.status === 'Rejected' || l.status === 'Cancelled') return false;
      return (reqFrom <= l.toDate && reqTo >= l.fromDate);
    });

    assert.ok(overlaps.length > 0, 'Should detect overlap with LR-TEST-1 (Nov 10-12)');
  });

  await t.test('Approving leave executes atomic multi-table transaction', () => {
    const leaveId = 'LR-TEST-1';
    const leave = db.get('leaves', leaveId);
    const initialBal = db.findOne('leave_balances', { employeeId: testEmpId });
    const initialRemaining = initialBal.paid.remaining;

    // Execute atomic transaction
    db.transaction(database => {
      database.update('leaves', leaveId, {
        status: 'Approved',
        adminComment: 'Approved by CHRO'
      });

      database.update('leave_balances', initialBal.id, {
        paid: {
          ...initialBal.paid,
          used: initialBal.paid.used + leave.days,
          remaining: initialBal.paid.remaining - leave.days
        }
      });

      // Populate attendance calendar for each day
      const start = new Date(leave.fromDate);
      const end = new Date(leave.toDate);
      const cur = new Date(start);

      while (cur <= end) {
        const dateStr = cur.toISOString().split('T')[0];
        database.insert('attendance', {
          id: `ATT-LEAVE-${dateStr.replace(/-/g, '')}-${testEmpId}`,
          organizationId: 'org-dayflow-global',
          employeeId: testEmpId,
          employeeName: 'Alex Rivera',
          department: 'Engineering',
          date: dateStr,
          checkIn: '-',
          checkOut: '-',
          workHours: '0h 0m',
          status: 'Leave',
          workMode: 'On Leave'
        });
        cur.setDate(cur.getDate() + 1);
      }
    });

    // Verification
    const updatedLeave = db.get('leaves', leaveId);
    assert.equal(updatedLeave.status, 'Approved');

    const updatedBal = db.findOne('leave_balances', { employeeId: testEmpId });
    assert.equal(updatedBal.paid.remaining, initialRemaining - 3);

    const attNov10 = db.findOne('attendance', { date: '2026-11-10', employeeId: testEmpId });
    const attNov11 = db.findOne('attendance', { date: '2026-11-11', employeeId: testEmpId });
    const attNov12 = db.findOne('attendance', { date: '2026-11-12', employeeId: testEmpId });

    assert.ok(attNov10, 'Nov 10 attendance should be synced to Leave');
    assert.equal(attNov10.status, 'Leave');
    assert.ok(attNov11, 'Nov 11 attendance should be synced to Leave');
    assert.equal(attNov11.status, 'Leave');
    assert.ok(attNov12, 'Nov 12 attendance should be synced to Leave');
    assert.equal(attNov12.status, 'Leave');
  });
});
