import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { ApplyLeaveModal } from '../../components/Modals/ApplyLeaveModal';
import { PayslipModal } from '../../components/Modals/PayslipModal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { KPICard } from '../../components/common/KPICard';
import { ProgressBar } from '../../components/common/ProgressBar';
import {
  Clock,
  CalendarCheck,
  PlaneTakeoff,
  DollarSign,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  TrendingUp,
  MapPin,
  Laptop,
  PartyPopper
} from 'lucide-react';

export const EmployeeDashboard = ({ setActiveTab }) => {
  const { currentUser, logout } = useAuth();
  const { attendanceLogs, leaveRequests, announcements, holidays, checkIn, checkOut } = useHRMS();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [workMode, setWorkMode] = useState('Office');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [punchLoading, setPunchLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = currentTime.toISOString().split('T')[0];
  const myTodayLog = attendanceLogs.find(
    log => log.date === todayStr && (log.employeeId === currentUser?.id || log.employeeId === currentUser?.employeeId)
  );

  const isCheckedIn = !!myTodayLog?.checkIn && !myTodayLog?.checkOut;
  const isCheckedOut = !!myTodayLog?.checkOut;

  const myLeaves = leaveRequests.filter(
    r => r.employeeId === currentUser?.id || r.employeeId === currentUser?.employeeId
  );
  const pendingLeaves = myLeaves.filter(r => r.status === 'Pending');

  // Leave balances
  const balances = currentUser?.leaveBalances || {
    paid: { remaining: 14, total: 18, used: 4 },
    sick: { remaining: 10, total: 12, used: 2 },
    casual: { remaining: 7, total: 8, used: 1 },
    unpaid: { remaining: 5, total: 5, used: 0 }
  };

  const totalLeavesRemaining =
    (balances.paid?.remaining || 0) +
    (balances.sick?.remaining || 0) +
    (balances.casual?.remaining || 0);

  // Next upcoming holiday
  const upcomingHolidays = [...(holidays || [])]
    .filter(h => h.date >= todayStr)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextHoliday = upcomingHolidays[0];

  const handlePunchIn = async () => {
    try {
      setPunchLoading(true);
      await checkIn(currentUser?.employeeId || currentUser?.id, workMode);
    } catch (err) {
      // toast already shown in context
    } finally {
      setPunchLoading(false);
    }
  };

  const handlePunchOut = async () => {
    try {
      setPunchLoading(true);
      await checkOut(currentUser?.employeeId || currentUser?.id);
    } catch (err) {
      // toast already shown in context
    } finally {
      setPunchLoading(false);
    }
  };

  return (
    <div className="page-body">
      {/* Header Welcome Bar */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title">Welcome back, {currentUser?.name?.split(' ')[0]}! 👋</h1>
          </div>
          <p className="page-subtitle">
            {currentUser?.designation} • {currentUser?.department} • ID: {currentUser?.id || currentUser?.employeeId}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button variant="primary" onClick={() => setShowLeaveModal(true)}>
            <PlaneTakeoff size={16} /> Request Time Off
          </Button>
          <Button variant="secondary" onClick={() => setShowPayslipModal(true)}>
            <DollarSign size={16} /> View Payslip
          </Button>
        </div>
      </div>

      {/* Hero Grid: Live Punch/Attendance Clock & Quick Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(300px, 1.8fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Attendance Tracker Card */}
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <Clock size={18} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Daily Attendance</span>
              </div>

              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  onClick={() => setWorkMode('Office')}
                  className={`btn btn-sm ${workMode === 'Office' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  <MapPin size={12} /> Office
                </button>
                <button
                  type="button"
                  onClick={() => setWorkMode('Remote')}
                  className={`btn btn-sm ${workMode === 'Remote' ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  <Laptop size={12} /> Remote
                </button>
              </div>
            </div>

            {/* Live Clock Display */}
            <div style={{ textAlign: 'center', padding: '1.25rem 0' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                fontFamily: 'Outfit, sans-serif',
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)'
              }}>
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>

            {/* Today's Punch Information */}
            <div style={{
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              fontSize: '0.825rem'
            }}>
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Punch In Time</div>
                <div style={{ fontWeight: 700, marginTop: '2px', color: myTodayLog?.checkIn ? 'var(--success-text)' : 'var(--text-secondary)' }}>
                  {myTodayLog?.checkIn || 'Not logged yet'}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)' }}>Punch Out Time</div>
                <div style={{ fontWeight: 700, marginTop: '2px', color: myTodayLog?.checkOut ? 'var(--primary)' : 'var(--text-secondary)' }}>
                  {myTodayLog?.checkOut || (isCheckedIn ? 'In Progress...' : '--:--')}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)' }}>Today's Status</div>
                <Badge
                  variant={myTodayLog?.status === 'Present' ? 'success' : myTodayLog?.status === 'Late' ? 'warning' : 'secondary'}
                  style={{ marginTop: '2px' }}
                >
                  {myTodayLog?.status || 'Pending'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div>
            {!isCheckedIn && !isCheckedOut && (
              <Button
                variant="success"
                size="lg"
                onClick={handlePunchIn}
                disabled={punchLoading}
                style={{ width: '100%', fontWeight: 700 }}
              >
                <CheckCircle2 size={18} /> {punchLoading ? 'Clocking In...' : `Clock In (${workMode})`}
              </Button>
            )}

            {isCheckedIn && (
              <Button
                variant="danger"
                size="lg"
                onClick={handlePunchOut}
                disabled={punchLoading}
                style={{ width: '100%', fontWeight: 700 }}
              >
                <Clock size={18} /> {punchLoading ? 'Clocking Out...' : 'Clock Out for the Day'}
              </Button>
            )}

            {isCheckedOut && (
              <div style={{
                background: 'var(--success-light)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'var(--success-text)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}>
                ✓ Workday Completed ({myTodayLog?.workHours || '8h 0m'})
              </div>
            )}
          </div>
        </div>

        {/* Quick KPI Overview Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {/* Card 1: Leave Balance */}
          <div className="card card-hover" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('leave')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="kpi-icon-box" style={{ background: 'var(--purple-light)', color: 'var(--purple)' }}>
                <PlaneTakeoff size={24} />
              </div>
              <span className="badge badge-purple">Time Off</span>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div className="kpi-label">Available Leave Balance</div>
              <div className="kpi-value">{totalLeavesRemaining} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>Days</span></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Paid: {balances.paid?.remaining} • Sick: {balances.sick?.remaining} • Casual: {balances.casual?.remaining}
              </div>
            </div>
          </div>

          {/* Card 2: Attendance History */}
          <div className="card card-hover" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('attendance')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="kpi-icon-box" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                <CalendarCheck size={24} />
              </div>
              <span className="badge badge-success">On Track</span>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div className="kpi-label">Monthly Attendance</div>
              <div className="kpi-value">96.8%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success-text)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <TrendingUp size={13} /> 21 of 22 working days logged
              </div>
            </div>
          </div>

          {/* Card 3: Salary Snapshot */}
          <div className="card card-hover" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('payroll')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="kpi-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <DollarSign size={24} />
              </div>
              <span className="badge badge-primary">August 2026</span>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div className="kpi-label">Net Take-Home Pay</div>
              <div className="kpi-value">${(currentUser?.salaryStructure?.netSalary || 8500).toLocaleString()}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Disbursed to {currentUser?.salaryStructure?.bankName || 'Direct Deposit'}
              </div>
            </div>
          </div>

          {/* Card 4: My Profile */}
          <div className="card card-hover" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('profile')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="kpi-icon-box" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)' }}>
                <User size={24} />
              </div>
              <span className="badge badge-neutral">Full Record</span>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <div className="kpi-label">Employee Profile</div>
              <div className="kpi-value" style={{ fontSize: '1.25rem' }}>{currentUser?.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.35rem', fontWeight: 600 }}>
                View & Edit Contact Details →
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Company Announcements & Pending Requests */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.8fr) minmax(300px, 1.2fr)', gap: '1.5rem' }}>
        {/* Company Announcements */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Megaphone size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Company Notices & Updates</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {announcements.map(ann => (
              <div
                key={ann.id}
                style={{
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  borderLeft: '4px solid var(--primary)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {ann.title}
                  </div>
                  <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>{ann.category}</span>
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.4 }}>
                  {ann.content}
                </p>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Posted on {ann.date} by {ann.author}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Active Time-Off Requests */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Recent Leaves</h3>
            <button onClick={() => setActiveTab('leave')} className="btn btn-ghost btn-sm" style={{ fontSize: '0.78rem' }}>
              View All
            </button>
          </div>

          {myLeaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No leave requests submitted yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {myLeaves.slice(0, 3).map(req => (
                <div
                  key={req.id}
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{req.leaveType} Leave ({req.days}d)</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {req.fromDate} to {req.toDate}
                    </div>
                  </div>

                  <Badge variant={req.status === 'Approved' ? 'success' : req.status === 'Rejected' ? 'danger' : 'warning'}>
                    {req.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Next Upcoming Holiday Banner */}
      {nextHoliday && (
        <div className="card" style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <PartyPopper size={20} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)' }}>Next Official Holiday</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'Outfit' }}>{nextHoliday.name}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {new Date(nextHoliday.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <Badge variant="primary">{nextHoliday.type || 'Public'}</Badge>
            </div>
          </div>
        </div>
      )}

      <ApplyLeaveModal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} />
      <PayslipModal employee={currentUser} isOpen={showPayslipModal} onClose={() => setShowPayslipModal(false)} />
    </div>
  );
};
