import React from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { KPICard } from '../../components/common/KPICard';
import {
  BarChart3,
  TrendingUp,
  Users,
  CalendarCheck,
  PlaneTakeoff,
  DollarSign,
  PieChart,
  Award,
  Printer
} from 'lucide-react';

export const AdminAnalytics = () => {
  const { employees, attendanceLogs, leaveRequests } = useHRMS();

  // Department distribution
  const deptCounts = {};
  employees.forEach(emp => {
    deptCounts[emp.department] = (deptCounts[emp.department] || 0) + 1;
  });

  const deptColors = {
    'Engineering': '#6366f1',
    'Design & UX': '#06b6d4',
    'Human Resources': '#8b5cf6',
    'Marketing': '#f59e0b',
    'Product': '#10b981',
    'Sales': '#ec4899'
  };

  // Leave Type distribution
  const leaveCounts = { 'Paid': 0, 'Sick': 0, 'Casual': 0, 'Unpaid': 0 };
  leaveRequests.forEach(req => {
    if (leaveCounts[req.leaveType] !== undefined) {
      leaveCounts[req.leaveType] += req.days;
    }
  });

  const totalLogs = attendanceLogs.length;
  const presentLogs = attendanceLogs.filter(l => l.status === 'Present').length;
  const avgAttendanceRate = totalLogs > 0 ? ((presentLogs / totalLogs) * 100).toFixed(1) : '96.8';

  const totalLeaveDays = Object.values(leaveCounts).reduce((a, b) => a + b, 0);

  // Monthly Attendance trends
  const attendanceMonthlyTrends = [
    { month: 'Apr', rate: 94 },
    { month: 'May', rate: 96 },
    { month: 'Jun', rate: 92 },
    { month: 'Jul', rate: 97 },
    { month: 'Aug', rate: 98 }
  ];

  return (
    <div className="page-body">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">HR Analytics & Business Intelligence 📈</h1>
          <p className="page-subtitle">Organizational health metrics, attendance rate trends, and leave utilization</p>
        </div>

        <Button variant="secondary" onClick={() => window.print()}>
          <Printer size={16} /> Export Report Summary
        </Button>
      </div>

      {/* KPI Top Highlights */}
      <div className="kpi-grid">
        <KPICard
          title="Average Attendance Rate"
          value={`${avgAttendanceRate}%`}
          subtitle="+2.1% from last month"
          icon={TrendingUp}
          color="success"
        />

        <KPICard
          title="Total Active Headcount"
          value={employees.length}
          subtitle={`Across ${Object.keys(deptCounts).length} departments`}
          icon={Users}
          color="primary"
        />

        <KPICard
          title="Total Leave Days Used"
          value={totalLeaveDays}
          subtitle="Real-time company utilization"
          icon={PlaneTakeoff}
          color="warning"
        />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Chart 1: Headcount Distribution by Department */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Headcount by Department</h3>
            <Users size={18} color="var(--primary)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Object.entries(deptCounts).map(([dept, count]) => {
              const percent = Math.round((count / employees.length) * 100);
              const color = deptColors[dept] || '#6366f1';

              return (
                <div key={dept}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600 }}>{dept}</span>
                    <span>{count} ({percent}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: 'var(--bg-tertiary)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: color,
                        borderRadius: '9999px',
                        transition: 'width 0.8s ease-in-out'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Attendance Rate Trends */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Monthly Attendance Trends (%)</h3>
            <CalendarCheck size={18} color="var(--success)" />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '180px', paddingTop: '1rem' }}>
            {attendanceMonthlyTrends.map((t, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.35rem' }}>
                  {t.rate}%
                </div>
                <div
                  style={{
                    width: '36px',
                    height: `${(t.rate - 80) * 5}%`,
                    background: 'linear-gradient(180deg, var(--primary) 0%, rgba(99, 102, 241, 0.4) 100%)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.8s ease'
                  }}
                />
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 600 }}>
                  {t.month}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Leave Type Utilization */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Leave Category Utilization (Days)</h3>
            <PlaneTakeoff size={18} color="var(--purple)" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {Object.entries(leaveCounts).map(([type, days]) => (
              <div
                key={type}
                style={{
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  textAlign: 'center',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {type} Leave
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit', marginTop: '0.2rem' }}>
                  {days} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
