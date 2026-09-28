import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Table } from '../../components/common/Table';
import {
  CalendarCheck,
  Filter,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Laptop,
  MapPin,
  Edit2,
  Download,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';

export const AdminAttendance = () => {
  const {
    employees,
    attendanceLogs,
    corrections,
    reviewAttendanceCorrection
  } = useHRMS();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Regularization review modal
  const [reviewingCorrection, setReviewingCorrection] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Combine employees with their attendance log for the selected date
  const combinedAttendance = employees.map(emp => {
    const existingLog = attendanceLogs.find(
      l => l.date === selectedDate && (l.employeeId === emp.id || l.employeeId === emp.employeeId)
    );

    return {
      id: existingLog ? existingLog.id : `ATT-${selectedDate.replace(/-/g, '')}-${emp.employeeId}`,
      employeeId: emp.employeeId,
      employeeName: emp.name,
      employeeAvatar: emp.avatar,
      department: emp.department,
      designation: emp.designation,
      date: selectedDate,
      checkIn: existingLog?.checkIn || null,
      checkOut: existingLog?.checkOut || null,
      workHours: existingLog?.workHours || (existingLog?.checkIn ? 'In Progress' : '0h 0m'),
      status: existingLog?.status || (emp.status === 'On Leave' ? 'Leave' : 'Absent'),
      workMode: existingLog?.workMode || '-'
    };
  });

  const filteredLogs = combinedAttendance.filter(log => {
    const matchesDept = departmentFilter === 'ALL' || log.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchesDept && matchesStatus;
  });

  const presentCount = combinedAttendance.filter(l => l.status === 'Present').length;
  const lateCount = combinedAttendance.filter(l => l.status === 'Late').length;
  const halfDayCount = combinedAttendance.filter(l => l.status === 'Half-day').length;
  const leaveCount = combinedAttendance.filter(l => l.status === 'Leave').length;
  const absentCount = combinedAttendance.filter(l => l.status === 'Absent').length;

  const pendingCorrections = corrections ? corrections.filter(c => c.status === 'Pending') : [];

  const handleReview = async (status) => {
    if (!reviewingCorrection) return;
    setReviewLoading(true);
    try {
      await reviewAttendanceCorrection(reviewingCorrection.id, status, adminNotes);
      setReviewingCorrection(null);
      setAdminNotes('');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Employee ID', 'Employee Name', 'Department', 'Check In', 'Check Out', 'Working Hours', 'Mode', 'Status'];
    const rows = filteredLogs.map(l => [
      l.date,
      l.employeeId,
      l.employeeName,
      l.department,
      l.checkIn || '-',
      l.checkOut || '-',
      l.workHours || '0h 0m',
      l.workMode || '-',
      l.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dayflow-attendance-${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee',
      render: (_, log) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {log.employeeAvatar ? (
            <img src={log.employeeAvatar} alt={log.employeeName} className="avatar avatar-sm" />
          ) : (
            <div className="avatar avatar-sm">{log.employeeName.charAt(0)}</div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{log.employeeName}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.employeeId}</div>
          </div>
        </div>
      )
    },
    { key: 'department', label: 'Department' },
    {
      key: 'checkIn',
      label: 'Punch In',
      render: (val) => <span style={{ fontWeight: 600 }}>{val || '-'}</span>
    },
    {
      key: 'checkOut',
      label: 'Punch Out',
      render: (val) => <span>{val || '-'}</span>
    },
    {
      key: 'workHours',
      label: 'Duration',
      render: (val) => <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{val}</span>
    },
    {
      key: 'workMode',
      label: 'Mode',
      render: (mode) => (
        mode !== '-' ? (
          <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
            {mode === 'Remote' ? <Laptop size={11} /> : <MapPin size={11} />} {mode}
          </span>
        ) : '-'
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <Badge
          variant={
            status === 'Present' ? 'success' :
            status === 'Late' ? 'warning' :
            status === 'Half-day' ? 'warning' :
            status === 'Leave' ? 'purple' : 'danger'
          }
          dot
        >
          {status}
        </Badge>
      )
    }
  ];

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Attendance Matrix</h1>
          <p className="page-subtitle">Real-time daily punch logs, employee check-ins, and attendance regularization desk</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <Calendar size={16} color="var(--primary)" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>

          <Button variant="secondary" onClick={handleExportCSV} icon={Download}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">Present On Duty</div>
            <div className="kpi-value">{presentCount}</div>
            <div className="kpi-trend" style={{ color: 'var(--success-text)' }}>Active working shifts</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <Clock size={24} />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">Late Punches</div>
            <div className="kpi-value">{lateCount}</div>
            <div className="kpi-trend" style={{ color: 'var(--warning-text)' }}>Past shift grace period</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>
            <Calendar size={24} />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">On Leave</div>
            <div className="kpi-value">{leaveCount}</div>
            <div className="kpi-trend" style={{ color: 'var(--purple)' }}>Approved time-off</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
            <AlertCircle size={24} />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">Unlogged / Absent</div>
            <div className="kpi-value">{absentCount}</div>
            <div className="kpi-trend" style={{ color: 'var(--danger)' }}>No punch recorded</div>
          </div>
        </div>
      </div>

      {/* Attendance Regularization Queue (Requirement 20) */}
      {pendingCorrections.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--warning-text)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Pending Attendance Regularization Requests ({pendingCorrections.length})</h3>
            </div>
            <span className="badge badge-warning">Awaiting HR Review</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingCorrections.map(c => (
              <div
                key={c.id}
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {c.employeeName} ({c.employeeId}) • Date: <strong>{c.date}</strong>
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Requested: {c.requestedCheckIn} to {c.requestedCheckOut} • Reason: <em>"{c.reason}"</em>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button size="sm" onClick={() => setReviewingCorrection(c)}>
                    Review & Regularize
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            Attendance Matrix for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.4rem 0.8rem' }}
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design & UX">Design & UX</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Product">Product</option>
              <option value="Sales">Sales</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '0.4rem 0.8rem' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Half-day">Half-day</option>
              <option value="Leave">Leave</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card">
        <Table
          columns={columns}
          data={filteredLogs}
          emptyMessage={`No attendance records found for ${selectedDate}.`}
          keyField="employeeId"
        />
      </div>

      {/* Regularization Review Modal */}
      <Modal
        isOpen={!!reviewingCorrection}
        onClose={() => setReviewingCorrection(null)}
        title="Review Attendance Regularization"
        subtitle={`Correction request from ${reviewingCorrection?.employeeName}`}
        maxWidth="500px"
        footer={
          <>
            <Button
              variant="danger"
              onClick={() => handleReview('Rejected')}
              disabled={reviewLoading}
            >
              <X size={15} /> Reject
            </Button>
            <Button
              variant="success"
              onClick={() => handleReview('Approved')}
              loading={reviewLoading}
            >
              <Check size={15} /> Approve & Update Log
            </Button>
          </>
        }
      >
        {reviewingCorrection && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div><strong>Employee:</strong> {reviewingCorrection.employeeName} ({reviewingCorrection.employeeId})</div>
              <div style={{ marginTop: '4px' }}><strong>Date:</strong> {reviewingCorrection.date}</div>
              <div style={{ marginTop: '4px' }}><strong>Requested Check In:</strong> {reviewingCorrection.requestedCheckIn}</div>
              <div style={{ marginTop: '4px' }}><strong>Requested Check Out:</strong> {reviewingCorrection.requestedCheckOut}</div>
              <div style={{ marginTop: '6px', color: 'var(--text-secondary)' }}>
                <strong>Reason:</strong> {reviewingCorrection.reason}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Supervisor Notes / Feedback (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Add verification notes or reason for approval/rejection..."
                className="form-input"
                rows={3}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
