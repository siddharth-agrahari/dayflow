import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  CalendarCheck,
  PlaneTakeoff,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  Laptop,
  MapPin,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ManagerDashboard = ({ setActiveTab }) => {
  const { currentUser } = useAuth();
  const {
    employees,
    attendanceLogs,
    leaveRequests,
    updateLeaveStatus
  } = useHRMS();
  const toast = useToast();

  // Rejection modal
  const [rejectLeaveId, setRejectLeaveId] = useState(null);
  const [rejectComment, setRejectComment] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Determine team members: employees in the same department
  const teamMembers = employees.filter(
    e => e.department === currentUser?.department && e.id !== currentUser?.id
  );

  const todayStr = new Date().toISOString().split('T')[0];

  // Team attendance today
  const teamTodayLogs = attendanceLogs.filter(
    l => l.date === todayStr && teamMembers.some(tm => tm.id === l.employeeId || tm.employeeId === l.employeeId)
  );

  const teamPresentToday = teamTodayLogs.filter(l => l.checkIn).length;
  const teamRemoteToday = teamTodayLogs.filter(l => l.mode === 'Remote').length;

  // Pending leaves for this team
  const teamPendingLeaves = leaveRequests.filter(
    r => (r.status === 'Pending') && teamMembers.some(tm => tm.id === r.employeeId || tm.employeeId === r.employeeId)
  );

  const handleQuickApprove = async (leaveId) => {
    try {
      await updateLeaveStatus(leaveId, 'Approved', 'Approved by Team Manager');
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      } catch (e) { /* ignore */ }
    } catch (err) {
      // toast shown in context
    }
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectComment.trim()) {
      toast.error('Please specify a reason for rejection.');
      return;
    }
    try {
      setRejecting(true);
      await updateLeaveStatus(rejectLeaveId, 'Rejected', rejectComment);
      setRejectLeaveId(null);
      setRejectComment('');
    } catch (err) {
      // toast shown in context
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Team Workspace — {currentUser?.department}</h1>
          <p className="page-subtitle">
            Lead: {currentUser?.name} • Managing {teamMembers.length} team members
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" onClick={() => setActiveTab && setActiveTab('attendance')}>
            <CalendarCheck size={15} /> Team Attendance
          </Button>
          <Button variant="primary" onClick={() => setActiveTab && setActiveTab('leave-approvals')}>
            <PlaneTakeoff size={15} /> Review All Leaves
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">Team Direct Reports</div>
            <div className="kpi-value">{teamMembers.length}</div>
            <div className="kpi-trend" style={{ color: 'var(--primary)' }}>In {currentUser?.department}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <CalendarCheck size={24} />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">Clocked In Today</div>
            <div className="kpi-value">{teamPresentToday} / {teamMembers.length}</div>
            <div className="kpi-trend" style={{ color: 'var(--success-text)' }}>
              {teamRemoteToday} working remotely
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box" style={{ background: 'var(--warning-light)', color: 'var(--warning-text)' }}>
            <Clock size={24} />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">Pending Time-Off Requests</div>
            <div className="kpi-value">{teamPendingLeaves.length}</div>
            <div className="kpi-trend" style={{ color: teamPendingLeaves.length > 0 ? 'var(--warning-text)' : 'var(--text-muted)' }}>
              {teamPendingLeaves.length > 0 ? 'Requires your sign-off' : 'All clear'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Direct Reports & Pending Leaves */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(320px, 1fr)', gap: '1.5rem' }}>
        {/* Team Members List */}
        <div className="card">
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Team Directory & Live Status</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{teamMembers.length} members</span>
          </div>

          <div className="table-container">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Designation</th>
                  <th>Today's Punch</th>
                  <th>Location Mode</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map(member => {
                  const log = teamTodayLogs.find(l => l.employeeId === member.id || l.employeeId === member.employeeId);
                  const isPresent = !!log?.checkIn;

                  return (
                    <tr key={member.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="avatar avatar-sm" />
                          ) : (
                            <div className="avatar avatar-sm">{member.name?.charAt(0)}</div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700 }}>{member.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{member.designation}</td>
                      <td>
                        {isPresent ? (
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '0.825rem', color: 'var(--success-text)' }}>
                              ● {log.checkIn}
                            </span>
                            {log.workHours && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.workHours}</div>}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Not clocked in</span>
                        )}
                      </td>
                      <td>
                        {isPresent ? (
                          <Badge variant="secondary" size="sm">
                            {log?.mode === 'Remote' ? <Laptop size={11} /> : <MapPin size={11} />} {log?.mode || 'Office'}
                          </Badge>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Leave Requests for Team */}
        <div className="card">
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Team Leave Requests</h3>
            <Badge variant="warning">{teamPendingLeaves.length} Pending</Badge>
          </div>

          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {teamPendingLeaves.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                <CheckCircle size={36} color="var(--success)" style={{ margin: '0 auto 0.75rem auto', opacity: 0.6 }} />
                <div style={{ fontWeight: 600 }}>No pending leave approvals!</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Your team has no outstanding requests.</div>
              </div>
            ) : (
              teamPendingLeaves.map(leave => (
                <div
                  key={leave.id}
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{leave.employeeName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {leave.leaveType} Leave • {leave.days} day(s)
                      </div>
                    </div>
                    <Badge variant="purple">{leave.fromDate} to {leave.toDate}</Badge>
                  </div>

                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    "{leave.reason}"
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => setRejectLeaveId(leave.id)}
                    >
                      <XCircle size={14} /> Reject
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleQuickApprove(leave.id)}
                    >
                      <CheckCircle size={14} /> Approve
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectLeaveId}
        onClose={() => setRejectLeaveId(null)}
        title="Reject Leave Request"
      >
        <form onSubmit={handleConfirmReject}>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Reason for Rejection / Supervisor Remarks</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g. Critical release scheduled for that week; please reschedule."
              value={rejectComment}
              onChange={e => setRejectComment(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="outline" type="button" onClick={() => setRejectLeaveId(null)}>
              Cancel
            </Button>
            <Button variant="danger" type="submit" loading={rejecting}>
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
