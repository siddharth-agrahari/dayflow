import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { LeaveDecisionModal } from '../../components/Modals/LeaveDecisionModal';
import { AddEmployeeModal } from '../../components/Modals/AddEmployeeModal';
import { KPICard } from '../../components/common/KPICard';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  CalendarCheck,
  PlaneTakeoff,
  DollarSign,
  UserPlus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Shield,
  Activity,
  Laptop,
  MapPin,
  FileText,
  Megaphone,
  Filter
} from 'lucide-react';

export const AdminDashboard = ({ setActiveTab, onOpenAnnouncementModal }) => {
  const { currentUser } = useAuth();
  const {
    employees,
    attendanceLogs,
    leaveRequests,
    corrections,
    announcements
  } = useHRMS();

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [trendRange, setTrendRange] = useState('month'); // 'week' | 'month'

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLogs = attendanceLogs.filter(l => l.date === todayStr);

  const totalEmployees = employees.length;
  const presentToday = todayLogs.filter(l => l.status === 'Present').length;
  const lateToday = todayLogs.filter(l => l.status === 'Late').length;
  const onLeaveToday = todayLogs.filter(l => l.status === 'Leave').length;

  const pendingLeaves = leaveRequests.filter(r => r.status === 'Pending');
  const pendingCorrections = corrections ? corrections.filter(c => c.status === 'Pending') : [];
  const totalPending = pendingLeaves.length + pendingCorrections.length;

  const totalPayrollCost = employees.reduce((acc, emp) => {
    return acc + (emp.salaryStructure?.netSalary || 8000);
  }, 0);

  const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 95;

  // Department distribution
  const deptCounts = {};
  employees.forEach(e => {
    deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
  });

  const deptColors = ['#4f46e5', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];

  // Attendance Trend Mock Points for visual chart
  const trendData = trendRange === 'week' ? [
    { label: 'Mon', rate: 94 },
    { label: 'Tue', rate: 96 },
    { label: 'Wed', rate: 98 },
    { label: 'Thu', rate: 92 },
    { label: 'Fri', rate: 96 }
  ] : [
    { label: 'W1', rate: 93 },
    { label: 'W2', rate: 95 },
    { label: 'W3', rate: 97 },
    { label: 'W4', rate: 96 }
  ];

  return (
    <div className="page-body">
      {/* Header bar */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title">Executive HR Command Center 📊</h1>
          </div>
          <p className="page-subtitle">
            Welcome back, {currentUser?.name}. Real-time organization metrics, attendance operations, and approval queues.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button onClick={() => setShowAddEmpModal(true)} icon={UserPlus}>
            Onboard Employee
          </Button>
          <Button variant="secondary" onClick={() => setActiveTab('payroll')} icon={DollarSign}>
            Payroll Master
          </Button>
          <Button variant="secondary" onClick={() => setActiveTab('reports')} icon={FileText}>
            Export Reports
          </Button>
        </div>
      </div>

      {/* Top KPI Row */}
      <div className="kpi-grid">
        <KPICard
          title="Total Workforce"
          value={totalEmployees}
          subtitle="Across all departments"
          trend="+1 this month"
          trendType="up"
          icon={Users}
          iconBg="var(--primary-light)"
          iconColor="var(--primary)"
          onClick={() => setActiveTab('employees')}
        />

        <KPICard
          title="On Duty Today"
          value={presentToday}
          subtitle={`${attendanceRate}% attendance rate`}
          trend={`${lateToday} logged late`}
          trendType={lateToday > 0 ? 'down' : 'up'}
          icon={CalendarCheck}
          iconBg="var(--success-light)"
          iconColor="var(--success)"
          onClick={() => setActiveTab('attendance')}
        />

        <KPICard
          title="On Leave Today"
          value={onLeaveToday}
          subtitle="Scheduled time-off"
          trend="Approved leaves"
          trendType="neutral"
          icon={PlaneTakeoff}
          iconBg="var(--purple-light)"
          iconColor="var(--purple)"
          onClick={() => setActiveTab('leave-approvals')}
        />

        <KPICard
          title="Pending Approvals"
          value={totalPending}
          subtitle={`${pendingLeaves.length} leaves, ${pendingCorrections.length} corrections`}
          trend={totalPending > 0 ? 'Requires action' : 'All caught up'}
          trendType={totalPending > 0 ? 'down' : 'up'}
          icon={Clock}
          iconBg="var(--warning-light)"
          iconColor="var(--warning-text)"
          onClick={() => setActiveTab('leave-approvals')}
        />

        <KPICard
          title="Monthly Net Payroll"
          value={`$${(totalPayrollCost / 1000).toFixed(1)}k`}
          subtitle="Direct deposit disbursement"
          trend="Validated & ready"
          trendType="neutral"
          icon={DollarSign}
          iconBg="var(--secondary-light)"
          iconColor="var(--secondary)"
          onClick={() => setActiveTab('payroll')}
        />
      </div>

      {/* Quick Actions Action Bar (Requirement 16) */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Quick HR Operations:</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button size="sm" variant="secondary" onClick={() => setShowAddEmpModal(true)} icon={UserPlus}>
              Add Employee
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setActiveTab('leave-approvals')} icon={PlaneTakeoff}>
              Review Leaves ({pendingLeaves.length})
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setActiveTab('attendance')} icon={CalendarCheck}>
              Attendance Corrections ({pendingCorrections.length})
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setActiveTab('payroll')} icon={DollarSign}>
              Run Payroll
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setActiveTab('reports')} icon={FileText}>
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics & BI Charts Section (Requirement 14) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Attendance Trend Line/Bar Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Attendance Performance</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average rate: 96.2%</span>
            </div>

            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                onClick={() => setTrendRange('week')}
                className={`btn btn-sm ${trendRange === 'week' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              >
                This Week
              </button>
              <button
                onClick={() => setTrendRange('month')}
                className={`btn btn-sm ${trendRange === 'month' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              >
                This Month
              </button>
            </div>
          </div>

          {/* SVG Trend Chart */}
          <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '1.25rem', padding: '1rem 0' }}>
            {trendData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>{d.rate}%</span>
                <div style={{
                  width: '100%',
                  height: `${(d.rate - 80) * 6}px`,
                  background: 'linear-gradient(180deg, var(--primary) 0%, rgba(79, 70, 229, 0.4) 100%)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.4s ease'
                }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Headcount by Department */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Workforce Composition</h3>
            <span className="badge badge-neutral">{employees.length} Staff Members</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(deptCounts).map(([dept, count], idx) => {
              const percent = Math.round((count / Math.max(1, employees.length)) * 100);
              const color = deptColors[idx % deptColors.length];

              return (
                <div key={dept}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>{dept}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{count} ({percent}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: color, borderRadius: '9999px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Pending Approvals & Live Check-in Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(300px, 1.8fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Pending Leave Approvals Action Queue */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlaneTakeoff size={18} color="var(--warning-text)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Leave Approval Queue</h3>
            </div>
            <button onClick={() => setActiveTab('leave-approvals')} className="btn btn-ghost btn-sm" style={{ fontSize: '0.78rem' }}>
              View All ({pendingLeaves.length})
            </button>
          </div>

          {pendingLeaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <CheckCircle size={32} color="var(--success)" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>All Caught Up!</div>
              <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>No pending leave requests requiring action.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {pendingLeaves.slice(0, 4).map(req => (
                <div
                  key={req.id}
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {req.employeeAvatar ? (
                      <img src={req.employeeAvatar} alt={req.employeeName} className="avatar avatar-sm" />
                    ) : (
                      <div className="avatar avatar-sm">{req.employeeName?.charAt(0)}</div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{req.employeeName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {req.leaveType} Leave • {req.days}d ({req.fromDate})
                      </div>
                    </div>
                  </div>

                  <Button size="sm" onClick={() => setSelectedLeave(req)}>
                    Review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-Time Attendance Stream (Requirement 15) */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="var(--success)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Real-Time Activity Stream</h3>
            </div>
            <button onClick={() => setActiveTab('attendance')} className="btn btn-ghost btn-sm" style={{ fontSize: '0.78rem' }}>
              Full Matrix →
            </button>
          </div>

          <div className="table-container">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Punch In</th>
                  <th>Mode</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No attendance activity recorded today yet.
                    </td>
                  </tr>
                ) : (
                  todayLogs.slice(0, 6).map(log => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 700 }}>{log.employeeName}</td>
                      <td>{log.department}</td>
                      <td style={{ fontWeight: 600 }}>{log.checkIn || '-'}</td>
                      <td>
                        <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {log.workMode === 'Remote' ? <Laptop size={11} /> : <MapPin size={11} />} {log.workMode || 'Office'}
                        </span>
                      </td>
                      <td>
                        <Badge
                          variant={
                            log.status === 'Present'
                              ? 'success'
                              : log.status === 'Late'
                              ? 'warning'
                              : log.status === 'Leave'
                              ? 'purple'
                              : 'danger'
                          }
                          dot
                        >
                          {log.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <LeaveDecisionModal
        request={selectedLeave}
        isOpen={!!selectedLeave}
        onClose={() => setSelectedLeave(null)}
      />

      <AddEmployeeModal
        isOpen={showAddEmpModal}
        onClose={() => setShowAddEmpModal(false)}
      />
    </div>
  );
};
