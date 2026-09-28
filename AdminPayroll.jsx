import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { SalaryStructureModal } from '../../components/Modals/SalaryStructureModal';
import { PayslipModal } from '../../components/Modals/PayslipModal';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { useToast } from '../../context/ToastContext';
import {
  DollarSign,
  Printer,
  Edit,
  Download,
  CheckCircle,
  TrendingUp,
  ShieldAlert,
  Search,
  Filter,
  CreditCard,
  Lock,
  Send,
  Play,
  Calendar,
  Layers,
  FileSpreadsheet
} from 'lucide-react';

export const AdminPayroll = () => {
  const {
    employees,
    payrollRuns,
    generatePayroll,
    lockPayroll,
    publishPayroll
  } = useHRMS();
  const toast = useToast();

  const [activeSubTab, setActiveSubTab] = useState('structures'); // 'structures' | 'runs'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [payslipEmployee, setPayslipEmployee] = useState(null);

  // Run Batch Modal State
  const [showRunModal, setShowRunModal] = useState(false);
  const [runMonth, setRunMonth] = useState('August');
  const [runYear, setRunYear] = useState(2026);
  const [generating, setGenerating] = useState(false);

  // Confirmation dialogs
  const [confirmLockRun, setConfirmLockRun] = useState(null);
  const [confirmPublishRun, setConfirmPublishRun] = useState(null);

  const departments = ['All', ...new Set(employees.map(e => e.department).filter(Boolean))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Aggregate metrics
  const totalGrossDisbursement = employees.reduce((sum, emp) => {
    const s = emp.salaryStructure || {};
    return sum + (Number(s.baseSalary) || 0) + (Number(s.hra) || 0) + (Number(s.specialAllowance) || 0) + (Number(s.transportAllowance) || 0);
  }, 0);

  const totalDeductions = employees.reduce((sum, emp) => {
    const s = emp.salaryStructure || {};
    return sum + (Number(s.pfDeduction) || 0) + (Number(s.taxDeduction) || 0) + (Number(s.otherDeductions) || 0);
  }, 0);

  const totalNetDisbursement = totalGrossDisbursement - totalDeductions;

  const handleRunPayroll = async (e) => {
    e.preventDefault();
    try {
      setGenerating(true);
      await generatePayroll(runMonth, runYear);
      setShowRunModal(false);
      setActiveSubTab('runs');
    } catch (err) {
      // toast already shown in context
    } finally {
      setGenerating(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Designation', 'Base Salary', 'Allowances', 'Deductions', 'Net Salary', 'Bank Name', 'Account'];
    const rows = filteredEmployees.map(emp => {
      const s = emp.salaryStructure || {};
      const base = Number(s.baseSalary) || 0;
      const allowances = (Number(s.hra) || 0) + (Number(s.specialAllowance) || 0) + (Number(s.transportAllowance) || 0);
      const deductions = (Number(s.pfDeduction) || 0) + (Number(s.taxDeduction) || 0) + (Number(s.otherDeductions) || 0);
      const net = (Number(s.netSalary) || (base + allowances - deductions));
      return [
        emp.employeeId || emp.id,
        `"${emp.name}"`,
        `"${emp.department}"`,
        `"${emp.designation}"`,
        base,
        allowances,
        deductions,
        net,
        `"${s.bankName || 'Silicon Valley Bank'}"`,
        `"${s.accountNumber || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Dayflow_Payroll_Master_${selectedMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Payroll master CSV exported.');
  };

  return (
    <div className="page-body">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Company Payroll Master</h1>
          <p className="page-subtitle">Manage company-wide compensation structures, run batch payroll, and publish payslips</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download size={15} /> Export Payroll CSV
          </Button>
          <Button variant="primary" onClick={() => setShowRunModal(true)}>
            <Play size={15} /> Run Monthly Payroll
          </Button>
        </div>
      </div>

      {/* Aggregate KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <DollarSign size={24} />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">Total Net Disbursement</div>
            <div className="kpi-value">${totalNetDisbursement.toLocaleString()}</div>
            <div className="kpi-trend" style={{ color: 'var(--success-text)' }}>
              Direct Deposit Ready
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">Total Gross Earnings</div>
            <div className="kpi-value">${totalGrossDisbursement.toLocaleString()}</div>
            <div className="kpi-trend" style={{ color: 'var(--text-secondary)' }}>
              Across {employees.length} employees
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
            <ShieldAlert size={24} />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">Statutory Taxes & PF</div>
            <div className="kpi-value">${totalDeductions.toLocaleString()}</div>
            <div className="kpi-trend" style={{ color: 'var(--danger)' }}>
              Tax compliance withheld
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1.25rem'
      }}>
        <button
          onClick={() => setActiveSubTab('structures')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeSubTab === 'structures' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeSubTab === 'structures' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeSubTab === 'structures' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          <CreditCard size={16} /> Salary Structures ({employees.length})
        </button>

        <button
          onClick={() => setActiveSubTab('runs')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            border: 'none',
            background: 'transparent',
            borderBottom: activeSubTab === 'runs' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeSubTab === 'runs' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeSubTab === 'runs' ? 700 : 500,
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          <Layers size={16} /> Batch Payroll Runs ({payrollRuns.length})
        </button>
      </div>

      {activeSubTab === 'structures' && (
        <>
          {/* Search & Filter */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search employee by name, department..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                  />
                </div>

                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', minWidth: '160px' }}
                >
                  {departments.map(d => (
                    <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
                  ))}
                </select>
              </div>

              <Badge variant="success">
                <CheckCircle size={13} /> All Structures Validated
              </Badge>
            </div>
          </div>

          {/* Payroll Master Table */}
          <div className="card">
            <div className="table-container">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Base Salary</th>
                    <th>Allowances</th>
                    <th>Total Deductions</th>
                    <th>Net Take-Home</th>
                    <th>Bank Account</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map(emp => {
                    const s = emp.salaryStructure || {};
                    const base = Number(s.baseSalary) || 0;
                    const allowances = (Number(s.hra) || 0) + (Number(s.specialAllowance) || 0) + (Number(s.transportAllowance) || 0);
                    const deductions = (Number(s.pfDeduction) || 0) + (Number(s.taxDeduction) || 0) + (Number(s.otherDeductions) || 0);
                    const net = (Number(s.netSalary) || (base + allowances - deductions));

                    return (
                      <tr key={emp.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {emp.avatar ? (
                              <img src={emp.avatar} alt={emp.name} className="avatar avatar-sm" />
                            ) : (
                              <div className="avatar avatar-sm">{emp.name?.charAt(0)}</div>
                            )}
                            <div>
                              <div style={{ fontWeight: 700 }}>{emp.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.designation}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <Badge variant="primary">{emp.department}</Badge>
                        </td>

                        <td style={{ fontWeight: 600 }}>${base.toLocaleString()}</td>
                        <td>+${allowances.toLocaleString()}</td>
                        <td style={{ color: 'var(--danger)', fontWeight: 600 }}>-${deductions.toLocaleString()}</td>
                        <td>
                          <strong style={{ color: 'var(--success)', fontSize: '0.95rem' }}>
                            ${net.toLocaleString()}
                          </strong>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {s.bankName || 'Silicon Valley Bank'} <br />
                          <span style={{ color: 'var(--text-muted)' }}>{s.accountNumber || '**** 8821'}</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingEmployee(emp)}
                              title="Configure Salary Structure"
                            >
                              <Edit size={13} /> Edit Structure
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setPayslipEmployee(emp)}
                              title="View & Print Payslip"
                            >
                              <Printer size={13} /> Payslip
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeSubTab === 'runs' && (
        <div className="card">
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Historical & Pending Payroll Batches</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Track generated cycles, lock salary components, and disburse payslips
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowRunModal(true)}>
              <Play size={14} /> New Batch Run
            </Button>
          </div>

          <div className="table-container">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Cycle / Period</th>
                  <th>Status</th>
                  <th>Employees Processed</th>
                  <th>Total Gross</th>
                  <th>Total Deductions</th>
                  <th>Total Net Disbursed</th>
                  <th>Generated Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrollRuns.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                      No payroll runs generated yet. Click "New Batch Run" to start.
                    </td>
                  </tr>
                ) : (
                  payrollRuns.map(run => (
                    <tr key={run.id}>
                      <td style={{ fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={16} color="var(--primary)" />
                          <span>{run.month} {run.year}</span>
                        </div>
                      </td>
                      <td>
                        <Badge
                          variant={
                            run.status === 'Published'
                              ? 'success'
                              : run.status === 'Locked'
                              ? 'warning'
                              : 'primary'
                          }
                        >
                          {run.status}
                        </Badge>
                      </td>
                      <td>{run.employeeCount || employees.length} Members</td>
                      <td style={{ fontWeight: 600 }}>${Number(run.totalGross || 0).toLocaleString()}</td>
                      <td style={{ color: 'var(--danger)' }}>-${Number(run.totalDeductions || 0).toLocaleString()}</td>
                      <td>
                        <strong style={{ color: 'var(--success)' }}>
                          ${Number(run.totalNet || 0).toLocaleString()}
                        </strong>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(run.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          {run.status === 'Draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setConfirmLockRun(run)}
                            >
                              <Lock size={13} /> Lock Run
                            </Button>
                          )}
                          {run.status === 'Locked' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setConfirmPublishRun(run)}
                            >
                              <Send size={13} /> Publish & Disburse
                            </Button>
                          )}
                          {run.status === 'Published' && (
                            <Badge variant="success">Disbursed</Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Run Payroll Batch Modal */}
      <Modal
        isOpen={showRunModal}
        onClose={() => setShowRunModal(false)}
        title="Execute Monthly Payroll Batch"
      >
        <form onSubmit={handleRunPayroll}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            This process calculates gross compensation, allowances, statutory tax withholdings, and net take-home for all active employees for the selected period.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Month</label>
              <select
                value={runMonth}
                onChange={e => setRunMonth(e.target.value)}
                className="form-select"
                required
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Year</label>
              <input
                type="number"
                value={runYear}
                onChange={e => setRunYear(Number(e.target.value))}
                className="form-input"
                min="2020"
                max="2035"
                required
              />
            </div>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.825rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Batch Preview Summary:</div>
            <div>• Eligible Active Employees: <strong>{employees.filter(e => e.status !== 'Inactive').length}</strong></div>
            <div>• Estimated Net Disbursement: <strong>${totalNetDisbursement.toLocaleString()}</strong></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="outline" type="button" onClick={() => setShowRunModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={generating}>
              <Play size={15} /> Execute Calculation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={!!confirmLockRun}
        onClose={() => setConfirmLockRun(null)}
        onConfirm={async () => {
          if (confirmLockRun) {
            await lockPayroll(confirmLockRun.id);
            setConfirmLockRun(null);
          }
        }}
        title="Lock Payroll Batch?"
        message={`Are you sure you want to lock the payroll for ${confirmLockRun?.month} ${confirmLockRun?.year}? Once locked, salary structures cannot be modified for this cycle.`}
        confirmText="Lock Batch"
        variant="warning"
      />

      <ConfirmationDialog
        isOpen={!!confirmPublishRun}
        onClose={() => setConfirmPublishRun(null)}
        onConfirm={async () => {
          if (confirmPublishRun) {
            await publishPayroll(confirmPublishRun.id);
            setConfirmPublishRun(null);
          }
        }}
        title="Publish & Disburse Payslips?"
        message={`This will disburse the calculated payroll of $${Number(confirmPublishRun?.totalNet || 0).toLocaleString()} and make official payslips instantly available in all employee portals.`}
        confirmText="Publish & Disburse"
        variant="primary"
      />

      {/* Modals */}
      <SalaryStructureModal
        employee={editingEmployee}
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
      />

      <PayslipModal
        employee={payslipEmployee}
        month={selectedMonth}
        isOpen={!!payslipEmployee}
        onClose={() => setPayslipEmployee(null)}
      />
    </div>
  );
};
