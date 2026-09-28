import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Users,
  CalendarCheck,
  PlaneTakeoff,
  DollarSign,
  Search,
  FileSpreadsheet
} from 'lucide-react';

export const AdminReports = () => {
  const { employees, attendanceLogs, leaveRequests, payrollRuns } = useHRMS();
  const toast = useToast();

  const [activeReport, setActiveReport] = useState('employees'); // 'employees' | 'attendance' | 'leaves' | 'payroll'
  const [selectedDept, setSelectedDept] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const departments = ['All', ...new Set(employees.map(e => e.department).filter(Boolean))];

  // 1. Employee Report Filter
  const filteredEmployees = employees.filter(e => {
    const matchesDept = selectedDept === 'All' || e.department === selectedDept;
    const matchesSearch = e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.designation?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // 2. Attendance Report Filter
  const filteredAttendance = attendanceLogs.filter(a => {
    const matchesSearch = a.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.date?.includes(searchTerm);
    return matchesSearch;
  });

  // 3. Leaves Report Filter
  const filteredLeaves = leaveRequests.filter(l => {
    const matchesSearch = l.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.leaveType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.status?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // CSV Export Utility
  const downloadCSV = (headers, rows, filename) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [
      headers.join(','),
      ...rows.map(r => r.map(field => `"${String(field || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename} report exported successfully.`);
  };

  const handleExport = () => {
    if (activeReport === 'employees') {
      const headers = ['Employee ID', 'Name', 'Email', 'Department', 'Designation', 'Role', 'Status', 'Joining Date', 'Work Location'];
      const rows = filteredEmployees.map(e => [
        e.employeeId || e.id,
        e.name,
        e.email,
        e.department,
        e.designation,
        e.role,
        e.status || 'Active',
        e.joiningDate || '',
        e.workLocation || 'Office'
      ]);
      downloadCSV(headers, rows, 'Dayflow_Employees_Report');
    } else if (activeReport === 'attendance') {
      const headers = ['Date', 'Employee ID', 'Employee Name', 'Check In', 'Check Out', 'Work Hours', 'Status', 'Work Mode'];
      const rows = filteredAttendance.map(a => [
        a.date,
        a.employeeId,
        a.employeeName,
        a.checkIn || '',
        a.checkOut || '',
        a.workHours || '',
        a.status || 'Present',
        a.workMode || 'Office'
      ]);
      downloadCSV(headers, rows, 'Dayflow_Attendance_Report');
    } else if (activeReport === 'leaves') {
      const headers = ['Leave ID', 'Employee ID', 'Employee Name', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Status'];
      const rows = filteredLeaves.map(l => [
        l.id,
        l.employeeId,
        l.employeeName,
        l.leaveType,
        l.startDate,
        l.endDate,
        l.days,
        l.reason,
        l.status
      ]);
      downloadCSV(headers, rows, 'Dayflow_Leaves_Report');
    } else if (activeReport === 'payroll') {
      const headers = ['Cycle', 'Total Gross', 'Total Deductions', 'Total Net Disbursed', 'Employees Processed', 'Status', 'Date'];
      const rows = payrollRuns.map(p => [
        `${p.month} ${p.year}`,
        p.totalGross,
        p.totalDeductions,
        p.totalNet,
        p.employeeCount || employees.length,
        p.status,
        p.createdAt
      ]);
      downloadCSV(headers, rows, 'Dayflow_Payroll_Batches_Report');
    }
  };

  return (
    <div className="page-body">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Enterprise Reports & Data Hub</h1>
          <p className="page-subtitle">Generate, filter, and export organizational compliance, attendance, leave, and payroll reports</p>
        </div>

        <Button variant="primary" onClick={handleExport}>
          <Download size={15} /> Export Active Report (.CSV)
        </Button>
      </div>

      {/* Report Selection Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {[
          { id: 'employees', label: 'Employee Headcount', icon: Users, count: filteredEmployees.length },
          { id: 'attendance', label: 'Attendance Audit', icon: CalendarCheck, count: filteredAttendance.length },
          { id: 'leaves', label: 'Leave Utilization', icon: PlaneTakeoff, count: filteredLeaves.length },
          { id: 'payroll', label: 'Payroll Batches', icon: DollarSign, count: payrollRuns.length }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className="card"
              style={{
                cursor: 'pointer',
                padding: '1.25rem',
                border: isActive ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                background: isActive ? 'var(--primary-light)' : 'var(--bg-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <Icon size={20} color={isActive ? 'var(--primary)' : 'var(--text-secondary)'} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {tab.count} Records
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isActive ? 'var(--primary)' : 'var(--text-primary)' }}>
                {tab.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={`Search in ${activeReport} report...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          {activeReport === 'employees' && (
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
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            <FileSpreadsheet size={16} /> Ready for instant CSV stream
          </div>
        </div>
      </div>

      {/* Report Data Table Preview */}
      <div className="card">
        <div className="table-container">
          {activeReport === 'employees' && (
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Role</th>
                  <th>Work Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{emp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                    </td>
                    <td><Badge variant="primary">{emp.department}</Badge></td>
                    <td>{emp.designation}</td>
                    <td><Badge variant="secondary">{emp.role}</Badge></td>
                    <td>{emp.workLocation || 'Office'}</td>
                    <td>
                      <Badge variant={emp.status === 'Inactive' ? 'danger' : 'success'}>
                        {emp.status || 'Active'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'attendance' && (
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Total Hours</th>
                  <th>Work Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map(a => (
                  <tr key={a.id || `${a.employeeId}-${a.date}`}>
                    <td style={{ fontWeight: 600 }}>{a.date}</td>
                    <td>{a.employeeName}</td>
                    <td>{a.checkIn || '-'}</td>
                    <td>{a.checkOut || '-'}</td>
                    <td style={{ fontWeight: 600 }}>{a.workHours || '-'}</td>
                    <td><Badge variant="secondary">{a.workMode || 'Office'}</Badge></td>
                    <td>
                      <Badge
                        variant={
                          a.status === 'Present'
                            ? 'success'
                            : a.status === 'Late'
                            ? 'warning'
                            : a.status === 'Half-day'
                            ? 'primary'
                            : 'danger'
                        }
                      >
                        {a.status || 'Present'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'leaves' && (
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Duration</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{l.employeeName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {l.employeeId}</div>
                    </td>
                    <td><Badge variant="primary">{l.leaveType}</Badge></td>
                    <td style={{ fontSize: '0.85rem' }}>{l.startDate} to {l.endDate}</td>
                    <td style={{ fontWeight: 700 }}>{l.days} days</td>
                    <td style={{ maxWidth: '250px', fontSize: '0.85rem' }}>{l.reason}</td>
                    <td>
                      <Badge
                        variant={
                          l.status === 'Approved'
                            ? 'success'
                            : l.status === 'Rejected'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {l.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeReport === 'payroll' && (
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Cycle Period</th>
                  <th>Status</th>
                  <th>Processed Headcount</th>
                  <th>Total Gross</th>
                  <th>Total Deductions</th>
                  <th>Total Net Disbursed</th>
                </tr>
              </thead>
              <tbody>
                {payrollRuns.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>{p.month} {p.year}</td>
                    <td>
                      <Badge variant={p.status === 'Published' ? 'success' : p.status === 'Locked' ? 'warning' : 'primary'}>
                        {p.status}
                      </Badge>
                    </td>
                    <td>{p.employeeCount || employees.length} Employees</td>
                    <td>${Number(p.totalGross || 0).toLocaleString()}</td>
                    <td style={{ color: 'var(--danger)' }}>-${Number(p.totalDeductions || 0).toLocaleString()}</td>
                    <td><strong style={{ color: 'var(--success)' }}>${Number(p.totalNet || 0).toLocaleString()}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
