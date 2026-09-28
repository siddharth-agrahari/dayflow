import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { ApplyLeaveModal } from '../../components/Modals/ApplyLeaveModal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { ProgressBar } from '../../components/common/ProgressBar';
import {
  PlaneTakeoff,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  MessageSquare,
  Trash2
} from 'lucide-react';

export const EmployeeLeave = () => {
  const { currentUser } = useAuth();
  const { leaveRequests, cancelLeave } = useHRMS();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cancelingLeaveId, setCancelingLeaveId] = useState(null);

  const myRequests = leaveRequests.filter(
    r => r.employeeId === currentUser?.id || r.employeeId === currentUser?.employeeId
  );

  const filteredRequests = statusFilter === 'ALL'
    ? myRequests
    : myRequests.filter(r => r.status.toUpperCase() === statusFilter);

  const balances = currentUser?.leaveBalances || {
    paid: { total: 18, used: 4, remaining: 14 },
    sick: { total: 12, used: 2, remaining: 10 },
    casual: { total: 8, used: 1, remaining: 7 },
    unpaid: { total: 5, used: 0, remaining: 5 }
  };

  return (
    <div className="page-body">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Leave & Time Off</h1>
          <p className="page-subtitle">Manage your leave applications, track balances, and view approval status</p>
        </div>

        <Button variant="primary" onClick={() => setShowApplyModal(true)}>
          <Plus size={16} /> Apply for Leave
        </Button>
      </div>

      {/* Leave Balances Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {/* Paid Leave */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>Paid Leave</span>
            <Badge variant="primary">Annual</Badge>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>
              {balances.paid?.remaining ?? 14} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>days left</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Used: {balances.paid?.used ?? 4} of {balances.paid?.total ?? 18} total
            </div>
            <ProgressBar
              progress={Math.round(((balances.paid?.used ?? 4) / (balances.paid?.total || 18)) * 100)}
              color="var(--primary)"
              height="6px"
              style={{ marginTop: '0.75rem' }}
            />
          </div>
        </div>

        {/* Sick Leave */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--warning-text)' }}>Sick Leave</span>
            <Badge variant="warning">Medical</Badge>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>
              {balances.sick?.remaining ?? 10} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>days left</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Used: {balances.sick?.used ?? 2} of {balances.sick?.total ?? 12} total
            </div>
            <ProgressBar
              progress={Math.round(((balances.sick?.used ?? 2) / (balances.sick?.total || 12)) * 100)}
              color="var(--warning-text)"
              height="6px"
              style={{ marginTop: '0.75rem' }}
            />
          </div>
        </div>

        {/* Casual Leave */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--purple)' }}>Casual Leave</span>
            <Badge variant="purple">Flex</Badge>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>
              {balances.casual?.remaining ?? 7} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>days left</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Used: {balances.casual?.used ?? 1} of {balances.casual?.total ?? 8} total
            </div>
            <ProgressBar
              progress={Math.round(((balances.casual?.used ?? 1) / (balances.casual?.total || 8)) * 100)}
              color="var(--purple)"
              height="6px"
              style={{ marginTop: '0.75rem' }}
            />
          </div>
        </div>

        {/* Unpaid Leave */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Unpaid Leave</span>
            <Badge variant="secondary">Standard</Badge>
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Outfit' }}>
              {balances.unpaid?.remaining ?? 5} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>days left</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Used: {balances.unpaid?.used ?? 0} of {balances.unpaid?.total ?? 5} total
            </div>
            <ProgressBar
              progress={Math.round(((balances.unpaid?.used ?? 0) / (balances.unpaid?.total || 5)) * 100)}
              color="var(--text-secondary)"
              height="6px"
              style={{ marginTop: '0.75rem' }}
            />
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Leave Requests History</h3>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container">
          <table className="hrms-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Reviewer Comments</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No leave requests found for this filter.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>#{req.id}</td>
                    <td>
                      <Badge variant="purple">{req.leaveType}</Badge>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <strong>{req.fromDate}</strong> to <strong>{req.toDate}</strong>
                    </td>
                    <td style={{ fontWeight: 700 }}>{req.days} day(s)</td>
                    <td style={{ maxWidth: '220px', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      {req.reason}
                    </td>
                    <td>
                      <Badge
                        variant={
                          req.status === 'Approved'
                            ? 'success'
                            : req.status === 'Rejected'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {req.status === 'Approved' && <CheckCircle size={12} />}
                        {req.status === 'Rejected' && <XCircle size={12} />}
                        {req.status === 'Pending' && <Clock size={12} />}
                        {req.status}
                      </Badge>
                    </td>
                    <td style={{ fontSize: '0.825rem', color: req.adminComment ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {req.adminComment ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <MessageSquare size={13} color="var(--primary)" />
                          <span>"{req.adminComment}"</span>
                        </div>
                      ) : (
                        'Awaiting supervisor review'
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {req.status === 'Pending' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          style={{ color: 'var(--danger)' }}
                          onClick={() => setCancelingLeaveId(req.id)}
                          title="Cancel this pending leave request"
                        >
                          <Trash2 size={13} /> Cancel
                        </Button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Finalized</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmationDialog
        isOpen={!!cancelingLeaveId}
        onClose={() => setCancelingLeaveId(null)}
        onConfirm={async () => {
          if (cancelingLeaveId) {
            await cancelLeave(cancelingLeaveId);
            setCancelingLeaveId(null);
          }
        }}
        title="Cancel Leave Application?"
        message={`Are you sure you want to cancel leave request #${cancelingLeaveId}? This action cannot be undone.`}
        confirmText="Yes, Cancel Leave"
        variant="danger"
      />

      <ApplyLeaveModal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} />
    </div>
  );
};
