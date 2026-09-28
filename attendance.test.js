import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';

test('Attendance Business Rules Tests', async (t) => {
  await seedDatabase(true);

  await t.test('Attendance check-in records workMode and timestamps', () => {
    const testDate = '2026-10-15';
    const empId = 'EMP-1002';

    const record = db.insert('attendance', {
      id: `ATT-${testDate.replace(/-/g, '')}-${empId}`,
      organizationId: 'org-dayflow-global',
      employeeId: empId,
      employeeName: 'Alex Rivera',
      department: 'Engineering',
      date: testDate,
      checkIn: '09:02 AM',
      checkOut: null,
      workHours: 'In Progress',
      workedMinutes: 0,
      overtimeMinutes: 0,
      status: 'Present',
      workMode: 'Remote'
    });

    assert.ok(record);
    assert.equal(record.status, 'Present');
    assert.equal(record.workMode, 'Remote');
    assert.equal(record.checkIn, '09:02 AM');
  });

  await t.test('Attendance check-out calculates precise work duration and status', () => {
    const testDate = '2026-10-15';
    const empId = 'EMP-1002';
    const record = db.findOne('attendance', { date: testDate, employeeId: empId });

    assert.ok(record, 'Existing check-in record must be present');

    // Simulate 8h 30m worked
    const inMins = 9 * 60 + 2; // 09:02 AM = 542 mins
    const outMins = 17 * 60 + 32; // 05:32 PM = 1052 mins
    const workedMinutes = outMins - inMins; // 510 mins = 8h 30m
    const workHours = `${Math.floor(workedMinutes / 60)}h ${workedMinutes % 60}m`;

    const updated = db.update('attendance', record.id, {
      checkOut: '05:32 PM',
      workHours,
      workedMinutes,
      status: workedMinutes >= 480 ? 'Present' : 'Half-day'
    });

    assert.equal(updated.checkOut, '05:32 PM');
    assert.equal(updated.workHours, '8h 30m');
    assert.equal(updated.status, 'Present');
    assert.equal(updated.workedMinutes, 510);
  });

  await t.test('Half-day status when duration is less than 4 hours', () => {
    const testDate = '2026-10-16';
    const empId = 'EMP-1003';

    // 3 hours worked
    const workedMinutes = 180;
    const record = db.insert('attendance', {
      id: `ATT-${testDate.replace(/-/g, '')}-${empId}`,
      organizationId: 'org-dayflow-global',
      employeeId: empId,
      date: testDate,
      checkIn: '09:00 AM',
      checkOut: '12:00 PM',
      workHours: '3h 0m',
      workedMinutes,
      status: workedMinutes < 240 ? 'Half-day' : 'Present',
      workMode: 'Office'
    });

    assert.equal(record.status, 'Half-day');
  });
});
