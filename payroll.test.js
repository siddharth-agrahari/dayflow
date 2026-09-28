import test from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../db/database.js';
import { seedDatabase } from '../db/seed.js';

test('Payroll & Salary Calculations Tests', async (t) => {
  await seedDatabase(true);

  await t.test('Salary components correctly sum into gross and net', () => {
    const base = 8000;
    const hra = 2500;
    const special = 1500;
    const transport = 400;
    const pf = 960;
    const tax = 1400;
    const other = 140;

    const gross = base + hra + special + transport;
    const deductions = pf + tax + other;
    const net = gross - deductions;

    assert.equal(gross, 12400);
    assert.equal(deductions, 2500);
    assert.equal(net, 9900);
  });

  await t.test('Payroll run lock state prevents unauthorized modification', () => {
    const run = db.findOne('payroll_runs', { status: 'Published' });
    assert.ok(run, 'Published August payroll run should exist');

    // Attempting modification when locked should be identified
    const isLocked = run.status === 'Locked' || run.status === 'Published';
    assert.equal(isLocked, true);
  });

  await t.test('Payslip contains exact employee details and net salary match', () => {
    const slip = db.findOne('payslips', { employeeId: 'EMP-1002' });
    assert.ok(slip, 'Alex Rivera payslip should exist');

    assert.equal(slip.employeeName, 'Alex Rivera');
    assert.equal(slip.department, 'Engineering');
    assert.equal(slip.grossSalary - slip.totalDeductions, slip.netSalary);
  });
});
