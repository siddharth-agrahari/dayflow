import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { LeaveDecisionModal } from '../../components/Modals/LeaveDecisionModal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import {
  PlaneTakeoff,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Filter,
  Check,
  X,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminLeaveApprovals = () => {
  const { leaveRequests, updateLeaveStatus } = useHRMS();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const filteredRequests = statusFilter === 'ALL'
    ? leaveRequests
    : leaveRequests.filter(r => r.status.toUpperCase() === statusFilter);

  const pendingCount = leaveRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'Approved').length;
  const rejectedCount = leaveRequests.filter(r => r.status === 'Rejected').length;

  const handleQuickApprove = async (req) => {
    await updateLeaveStatus(req.id, 'Approved', 'Quick 1-click approval by HR supervisor');
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) { /* ignore */ }
  };

  const handleExportCSV = () => {
    const headers = ['Request ID', 'Employee ID', 'Employee Name', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Status', 'Supervisor Comment'];
    const rows = filteredRequests.map(r => [
      r.id,
      r.employeeId,
      r.employeeName,
      r.department,
      r.leaveType,
      r.fromDate,
      r.toDate,
      r.days,
      r.reason,
      r.status,
      r.adminComment || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dayflow-leaves-${statusFilter.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      key: 'employeeName',
      label: 'Employee',
      render: (_, req) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {req.employeeAvatar ? (
            <img src={req.employeeAvatar} alt={req.employeeName} className="avatar avatar-sm" />
          ) : (
            <div className="avatar avatar-sm">{req.employeeName?.charAt(0)}</div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{req.employeeName}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{req.department} • {req.employeeId}</div>
          </div>
        </div>
      )
    },
    {
      key: 'leaveType',
      label: 'Leave Type',
      render: (type) => (
        <span className={`badge ${
          type === 'Paid' ? 'badge-primary' :
          type === 'Sick' ? 'badge-warning' :
          type === 'Casual' ? 'badge-purple' : 'badge-neutral'
        }`}>
          {type} Leave
        </span>
      )
    },
    {
      key: 'dates',
      label: 'Date Range',
      render: (_, req) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{req.fromDate} to {req.toDate}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{req.days} Day(s) {req.isHalfDay ? '(Half-day)' : ''}</div>
        </div>
      )
    },
    {
      key: 'reason',
      label: 'Employee Reason',
      render: (reason) => (
        <div style={{ maxWidth: '280px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          {reason}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <Badge
          variant={
            status === 'Approved' ? 'success' :
            status === 'Pending' ? 'warning' :
            status === 'Rejected' ? 'danger' : 'neutral'
          }
          dot
        >
          {status}
        </Badge>
      )
    },
    {
      key: 'adminComment',
      label: 'Supervisor Feedback',
      render: (comment) => (
        <span style={{ fontSize: '0.78rem', color: comment ? 'var(--text-primary)' : 'var(--text-muted)', fontStyle: comment ? 'normal' : 'italic' }}>
          {comment || 'No feedback logged'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, req) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
          {req.status === 'Pending' ? (
            <>
              <button
                onClick={() => handleQuickApprove(req)}
                className="btn btn-success btn-sm"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                title="1-Click Quick Approve"
              >
                <Check size={14} /> Approve
              </button>
              <button
                onClick={() => setSelectedLeave(req)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                title="Review with Custom Comments"
              >
                Review
              </button>
            </>
          ) : (
            <button
              onClick={() => setSelectedLeave(req)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Details
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leave Approvals Desk</h1>
          <p className="page-subtitle">Review employee time off applications, balance entitlements, and provide feedback</p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <Button variant="secondary" onClick={handleExportCSV} icon={Download}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="kpi-grid">
        <div className="kpi-card" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('PENDING')}>
          <div className="kpi-icon-box" style={{ background: 'var(--warning-light)', color: 'var(--warning-text)' }}>
            <Clock size={24} />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">Pending Review</div>
            <div className="kpi-value">{pendingCount}</div>
            <div className="kpi-trend" style={{ color: 'var(--warning-text)' }}>Requires HR action</div>
          </div>
        </div>

        <div className="kpi-card" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('APPROVED')}>
          <div className="kpi-icon-box" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">Approved</div>
            <div className="kpi-value">{approvedCount}</div>
            <div className="kpi-trend" style={{ color: 'var(--success-text)' }}>Synced with attendance</div>
          </div>
        </div>

        <div className="kpi-card" style={{ cursor: 'pointer' }} onClick={() => setStatusFilter('REJECTED')}>
          <div className="kpi-icon-box" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
            <XCircle size={24} />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">Rejected</div>
            <div className="kpi-value">{rejectedCount}</div>
            <div className="kpi-trend" style={{ color: 'var(--danger)' }}>With feedback reason</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            Showing {filteredRequests.length} Leave Application{filteredRequests.length !== 1 ? 's' : ''}
          </div>

          <div style={{ display: 'flex', gap: '0.45rem' }}>
            {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`btn btn-sm ${statusFilter === tab ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <Table
          columns={columns}
          data={filteredRequests}
          emptyMessage={`No ${statusFilter.toLowerCase()} leave requests found.`}
          keyField="id"
        />
      </div>

      <LeaveDecisionModal
        request={selectedLeave}
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
      />
    </div>
  );
};
