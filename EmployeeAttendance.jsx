import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Filter,
  TrendingUp,
  MapPin,
  Laptop,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  List,
  Check,
  CalendarDays,
  FileEdit,
  Info
} from 'lucide-react';

export const EmployeeAttendance = () => {
  const { currentUser } = useAuth();
  const {
    attendanceLogs,
    holidays,
    checkIn,
    checkOut,
    requestAttendanceCorrection
  } = useHRMS();
  const toast = useToast();

  // 'weekly' | 'calendar' | 'daily' | 'history'
  const [activeView, setActiveView] = useState('weekly');
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);

  // Month & Year state for Calendar view
  const [calMonth, setCalMonth] = useState(7); // 0-indexed: 7 = August
  const [calYear, setCalYear] = useState(2026);

  // Selected Day Modal
  const [selectedDayData, setSelectedDayData] = useState(null);

  // Regularization Modal
  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({
    date: '',
    originalCheckIn: '',
    originalCheckOut: '',
    proposedCheckIn: '09:00',
    proposedCheckOut: '18:00',
    reason: ''
  });
  const [regSubmitting, setRegSubmitting] = useState(false);

  // Filter logs for current employee
  const myLogs = attendanceLogs.filter(
    log => log.employeeId === currentUser?.id || log.employeeId === currentUser?.employeeId
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const todayLog = myLogs.find(l => l.date === todayStr);

  const isCheckedIn = !!todayLog?.checkIn && !todayLog?.checkOut;
  const isCheckedOut = !!todayLog?.checkOut;

  // Week calculation
  const getWeekDates = (offset = 0) => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + (offset * 7));
    const day = baseDate.getDay();
    const diff = baseDate.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(baseDate.setDate(diff));

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const fullDayName = d.toLocaleDateString('en-US', { weekday: 'long' });

      const log = myLogs.find(l => l.date === dateStr);
      let hoursNum = 0;
      if (log?.workHours && log.workHours.includes('h')) {
        const parts = log.workHours.split('h');
        hoursNum = parseFloat(parts[0]) + (parseFloat(parts[1] || 0) / 60);
      } else if (log?.checkIn && !log?.checkOut) {
        hoursNum = 7.5;
      }

      weekDays.push({
        date: dateStr,
        dayName,
        fullDayName,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        log,
        hours: hoursNum,
        status: log ? log.status : (d > new Date() ? 'Upcoming' : 'Weekend / Off')
      });
    }
    return weekDays;
  };

  const currentWeekDays = getWeekDates(selectedWeekOffset);
  const totalWeeklyHours = currentWeekDays.reduce((sum, d) => sum + (d.hours || 0), 0);
  const targetWeeklyHours = 40;
  const weekProgressPercent = Math.min(100, Math.round((totalWeeklyHours / targetWeeklyHours) * 100));

  // Calendar Grid builder
  const buildMonthCalendar = () => {
    const firstDay = new Date(calYear, calMonth, 1);
    const lastDay = new Date(calYear, calMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Monday-first indexing: 0 = Mon, ..., 6 = Sun
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const calendarCells = [];

    // Empty cells before 1st of month
    for (let i = 0; i < startDayOfWeek; i++) {
      calendarCells.push(null);
    }

    // Days 1 through daysInMonth
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(calYear, calMonth, day);
      const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;

      const log = myLogs.find(l => l.date === dateStr);
      const holiday = holidays.find(h => h.date === dateStr);

      let status = 'Absent';
      if (holiday) {
        status = 'Holiday';
      } else if (log) {
        status = log.status || 'Present';
      } else if (isWeekend) {
        status = 'Weekend';
      } else if (dayDate > new Date()) {
        status = 'Upcoming';
      }

      calendarCells.push({
        day,
        dateStr,
        dayDate,
        isWeekend,
        holiday,
        log,
        status
      });
    }

    return calendarCells;
  };

  const calendarCells = buildMonthCalendar();

  const handleDayClick = (cell) => {
    if (!cell) return;
    setSelectedDayData(cell);
  };

  const handleOpenRegularization = (dateStr, log) => {
    setRegForm({
      date: dateStr,
      originalCheckIn: log?.checkIn || 'Not logged',
      originalCheckOut: log?.checkOut || 'Not logged',
      proposedCheckIn: log?.checkIn || '09:00',
      proposedCheckOut: log?.checkOut || '18:00',
      reason: ''
    });
    setShowRegModal(true);
  };

  const handleSubmitRegularization = async (e) => {
    e.preventDefault();
    if (!regForm.reason.trim()) {
      toast.error('Please provide a reason for the regularization request.');
      return;
    }
    try {
      setRegSubmitting(true);
      await requestAttendanceCorrection({
        employeeId: currentUser?.id || currentUser?.employeeId,
        employeeName: currentUser?.name,
        date: regForm.date,
        originalCheckIn: regForm.originalCheckIn,
        originalCheckOut: regForm.originalCheckOut,
        proposedCheckIn: regForm.proposedCheckIn,
        proposedCheckOut: regForm.proposedCheckOut,
        reason: regForm.reason
      });
      setShowRegModal(false);
      setSelectedDayData(null);
    } catch (err) {
      // toast shown in context
    } finally {
      setRegSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Present': return 'badge-success';
      case 'Late': return 'badge-warning';
      case 'Half-day': return 'badge-primary';
      case 'Leave': return 'badge-purple';
      case 'Holiday': return 'badge-teal';
      case 'Absent': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="page-body">
      {/* Header & View Switcher */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Attendance History & Tracking</h1>
          <p className="page-subtitle">Punch records, monthly calendar visualization, and regularization requests</p>
        </div>

        {/* View Toggle Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-secondary)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <button
            onClick={() => setActiveView('weekly')}
            className={`btn btn-sm ${activeView === 'weekly' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <CalendarDays size={14} /> Weekly Timesheet
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`btn btn-sm ${activeView === 'calendar' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Calendar size={14} /> Monthly Calendar
          </button>
          <button
            onClick={() => setActiveView('daily')}
            className={`btn btn-sm ${activeView === 'daily' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Clock size={14} /> Daily Stream
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`btn btn-sm ${activeView === 'history' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <List size={14} /> All Logs
          </button>
        </div>
      </div>

      {/* Quick Punch In/Out Action Card */}
      <div className="card-glass" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="pulse-dot" style={{ background: isCheckedIn ? 'var(--success)' : 'var(--text-muted)' }} />
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                Today's Shift: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {todayLog?.checkIn
                ? `Clocked in at ${todayLog.checkIn} (${todayLog.mode || 'Office'}) • Duration: ${todayLog.workHours}`
                : 'No check-in recorded for today yet.'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!isCheckedIn && !isCheckedOut && (
              <>
                <Button variant="success" onClick={() => checkIn(currentUser.id, 'Office')}>
                  <CheckCircle2 size={16} /> Clock In (Office)
                </Button>
                <Button variant="secondary" onClick={() => checkIn(currentUser.id, 'Remote')}>
                  <Laptop size={16} /> Clock In (Remote)
                </Button>
              </>
            )}

            {isCheckedIn && (
              <Button variant="danger" onClick={() => checkOut(currentUser.id)}>
                <Clock size={16} /> Clock Out Now
              </Button>
            )}

            {isCheckedOut && (
              <Badge variant="success" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                ✓ Today Completed ({todayLog?.workHours})
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: MONTHLY CALENDAR GRID (NEW & ENHANCED) */}
      {activeView === 'calendar' && (
        <div className="card">
          <div style={{
            padding: '1.25rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  if (calMonth === 0) {
                    setCalMonth(11);
                    setCalYear(y => y - 1);
                  } else {
                    setCalMonth(m => m - 1);
                  }
                }}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft size={16} />
              </button>

              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                {monthNames[calMonth]} {calYear}
              </h3>

              <button
                onClick={() => {
                  if (calMonth === 11) {
                    setCalMonth(0);
                    setCalYear(y => y + 1);
                  } else {
                    setCalMonth(m => m + 1);
                  }
                }}
                className="btn btn-secondary btn-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Legend Pills */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
              <span className="badge badge-success">● Present</span>
              <span className="badge badge-warning">● Late</span>
              <span className="badge badge-primary">● Half-Day</span>
              <span className="badge badge-purple">● Leave</span>
              <span className="badge badge-teal">★ Holiday</span>
              <span className="badge badge-danger">● Absent</span>
            </div>
          </div>

          <div style={{ padding: '1rem' }}>
            {/* Weekday Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}>
              <div>MON</div>
              <div>TUE</div>
              <div>WED</div>
              <div>THU</div>
              <div>FRI</div>
              <div>SAT</div>
              <div>SUN</div>
            </div>

            {/* Calendar Cells Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '0.5rem'
            }}>
              {calendarCells.map((cell, idx) => {
                if (!cell) {
                  return <div key={idx} style={{ minHeight: '90px', opacity: 0.2 }} />;
                }

                const isToday = cell.dateStr === todayStr;

                return (
                  <div
                    key={idx}
                    onClick={() => handleDayClick(cell)}
                    style={{
                      minHeight: '95px',
                      border: isToday ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.5rem',
                      background: isToday ? 'var(--primary-light)' : cell.isWeekend ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                    className="card-hover"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: isToday ? 'var(--primary)' : 'var(--text-primary)' }}>
                        {cell.day}
                      </span>
                      {isToday && <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700 }}>TODAY</span>}
                    </div>

                    <div>
                      {cell.holiday ? (
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal, #0d9488)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          ★ {cell.holiday.name}
                        </div>
                      ) : cell.log ? (
                        <div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 600 }}>{cell.log.workHours || 'In Progress'}</div>
                          <span className={`badge ${getStatusBadgeColor(cell.log.status)}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                            {cell.log.status}
                          </span>
                        </div>
                      ) : (
                        <span className={`badge ${getStatusBadgeColor(cell.status)}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.35rem' }}>
                          {cell.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: WEEKLY TIMESHEET VIEW */}
      {activeView === 'weekly' && (
        <div>
          {/* Week Selector Bar */}
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWeekOffset(prev => prev - 1)}
                >
                  <ChevronLeft size={16} /> Previous Week
                </Button>

                <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                  Week: {currentWeekDays[0].displayDate} — {currentWeekDays[6].displayDate} {selectedWeekOffset === 0 && <span className="badge badge-primary" style={{ marginLeft: '6px' }}>Current Week</span>}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWeekOffset(prev => prev + 1)}
                  disabled={selectedWeekOffset >= 0}
                >
                  Next Week <ChevronRight size={16} />
                </Button>
              </div>

              {/* Weekly Hours Progress Metric */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Weekly Hours</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {totalWeeklyHours.toFixed(1)} / {targetWeeklyHours} hrs
                  </div>
                </div>
                <div style={{ width: '100px', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${weekProgressPercent}%`, height: '100%', background: 'var(--primary)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* 7-Day Weekly Grid Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {currentWeekDays.map((d, i) => (
              <div
                key={i}
                className="card card-hover"
                style={{
                  padding: '1.25rem 1rem',
                  borderTop: d.date === todayStr ? '4px solid var(--primary)' : '1px solid var(--border-color)',
                  background: d.date === todayStr ? 'var(--primary-light)' : 'var(--bg-secondary)',
                  cursor: 'pointer'
                }}
                onClick={() => handleDayClick({ dateStr: d.date, log: d.log, status: d.status })}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{d.dayName}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.displayDate}</span>
                </div>

                <div style={{ margin: '0.75rem 0' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', color: d.hours > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                    {d.hours > 0 ? `${d.hours.toFixed(1)}h` : '--'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {d.log?.checkIn ? `${d.log.checkIn} - ${d.log.checkOut || 'Now'}` : 'No punch'}
                  </div>
                </div>

                <div>
                  <Badge variant={d.status === 'Present' ? 'success' : d.status === 'Half-day' ? 'warning' : d.status === 'Leave' ? 'purple' : 'neutral'} size="sm">
                    {d.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Summary Breakdown Table */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Weekly Detailed Timesheet</h3>
              <Badge variant="success">{currentWeekDays.filter(d => d.hours > 0).length} Days Logged</Badge>
            </div>

            <div className="table-container">
              <table className="hrms-table">
                <thead>
                  <tr>
                    <th>Day & Date</th>
                    <th>Punch In</th>
                    <th>Punch Out</th>
                    <th>Working Hours</th>
                    <th>Mode</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentWeekDays.map((d, idx) => (
                    <tr key={idx} style={{ background: d.date === todayStr ? 'var(--primary-light)' : 'transparent' }}>
                      <td style={{ fontWeight: 700 }}>
                        {d.fullDayName} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({d.date})</span>
                      </td>
                      <td>{d.log?.checkIn || '-'}</td>
                      <td>{d.log?.checkOut || (d.log?.checkIn ? <span style={{ color: 'var(--primary)' }}>In Progress</span> : '-')}</td>
                      <td style={{ fontWeight: 700, color: d.hours > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {d.log?.workHours || (d.hours > 0 ? `${d.hours.toFixed(1)}h` : '0h 0m')}
                      </td>
                      <td>
                        {d.log?.mode && d.log.mode !== '-' ? (
                          <Badge variant="secondary" size="sm">
                            {d.log.mode === 'Remote' ? <Laptop size={11} /> : <MapPin size={11} />} {d.log.mode}
                          </Badge>
                        ) : '-'}
                      </td>
                      <td>
                        <Badge variant={d.status === 'Present' ? 'success' : d.status === 'Half-day' ? 'warning' : d.status === 'Leave' ? 'purple' : 'neutral'}>
                          {d.status}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenRegularization(d.date, d.log)}
                          title="Request Attendance Regularization"
                        >
                          <FileEdit size={13} /> Regularize
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DAILY VIEW */}
      {activeView === 'daily' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(300px, 1.8fr)', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Today's Daily Punch Stream</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)', margin: '1rem 0 1rem 0.5rem' }}>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '-23px', top: '2px', width: '14px', height: '14px', borderRadius: '50%', background: todayLog?.checkIn ? 'var(--success)' : 'var(--text-muted)' }} />
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Shift Start (Punch In)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {todayLog?.checkIn ? `Recorded at ${todayLog.checkIn} (${todayLog.mode || 'Office'})` : 'Awaiting punch in'}
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '-23px', top: '2px', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--primary)' }} />
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Standard Lunch Interval</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  01:00 PM — 02:00 PM (1 hour auto-deducted)
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '-23px', top: '2px', width: '14px', height: '14px', borderRadius: '50%', background: todayLog?.checkOut ? 'var(--danger)' : 'var(--text-muted)' }} />
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Shift End (Punch Out)</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {todayLog?.checkOut ? `Clocked out at ${todayLog.checkOut}` : 'Shift currently in progress'}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Daily Shift Policy</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Standard Working Hours</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>8.0 Hours</div>
              </div>

              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Grace Time Policy</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)', marginTop: '2px' }}>15 Minutes</div>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Employees checking in after 09:15 AM will be flagged as Late. Less than 4.5 hours of tracked work will be classified as a Half-day.
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: FULL LOG HISTORY */}
      {activeView === 'history' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Complete Attendance History Log</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Showing all entries ({myLogs.length})</span>
          </div>

          <div className="table-container">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Total Work Hours</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  myLogs.map(log => (
                    <tr key={log.id}>
                      <td style={{ fontWeight: 600 }}>{log.date}</td>
                      <td>{log.checkIn || '-'}</td>
                      <td>{log.checkOut || (log.checkIn ? <span style={{ color: 'var(--primary)' }}>In Progress</span> : '-')}</td>
                      <td style={{ fontWeight: 600 }}>{log.workHours || '0h 0m'}</td>
                      <td>
                        <Badge variant="secondary" size="sm">
                          {log.mode === 'Remote' ? <Laptop size={12} /> : <MapPin size={12} />} {log.mode || 'Office'}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={log.status === 'Present' ? 'success' : log.status === 'Half-day' ? 'warning' : log.status === 'Leave' ? 'purple' : 'danger'}>
                          {log.status}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenRegularization(log.date, log)}
                        >
                          <FileEdit size={13} /> Regularize
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Day Inspection Modal */}
      {selectedDayData && (
        <Modal
          isOpen={!!selectedDayData}
          onClose={() => setSelectedDayData(null)}
          title={`Day Details: ${selectedDayData.dateStr}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                <Badge variant={selectedDayData.status === 'Present' ? 'success' : selectedDayData.status === 'Half-day' ? 'warning' : 'neutral'}>
                  {selectedDayData.status}
                </Badge>
              </div>

              {selectedDayData.log ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Check In:</span>
                    <strong>{selectedDayData.log.checkIn || '-'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Check Out:</span>
                    <strong>{selectedDayData.log.checkOut || '-'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Work Hours:</span>
                    <strong style={{ color: 'var(--primary)' }}>{selectedDayData.log.workHours || '-'}</strong>
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {selectedDayData.holiday
                    ? `Public Holiday: ${selectedDayData.holiday.name}`
                    : 'No attendance punch logged for this calendar date.'}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="outline" onClick={() => setSelectedDayData(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const dateStr = selectedDayData.dateStr;
                  const log = selectedDayData.log;
                  setSelectedDayData(null);
                  handleOpenRegularization(dateStr, log);
                }}
              >
                <FileEdit size={15} /> Request Regularization
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Attendance Regularization Modal */}
      <Modal
        isOpen={showRegModal}
        onClose={() => setShowRegModal(false)}
        title="Request Attendance Regularization"
      >
        <form onSubmit={handleSubmitRegularization}>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            If your biometric punch or check-in was missed due to technical issues, field work, or an emergency, submit a regularization request for HR / Manager approval.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
            <Input
              label="Selected Date"
              type="date"
              value={regForm.date}
              onChange={e => setRegForm({ ...regForm, date: e.target.value })}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Proposed Check-In Time"
                type="time"
                value={regForm.proposedCheckIn}
                onChange={e => setRegForm({ ...regForm, proposedCheckIn: e.target.value })}
                required
              />
              <Input
                label="Proposed Check-Out Time"
                type="time"
                value={regForm.proposedCheckOut}
                onChange={e => setRegForm({ ...regForm, proposedCheckOut: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reason for Missed Punch / Correction</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Worked at client site in the morning; punch terminal offline."
                value={regForm.reason}
                onChange={e => setRegForm({ ...regForm, reason: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="outline" type="button" onClick={() => setShowRegModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={regSubmitting}>
              Submit Request to HR
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
