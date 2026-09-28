import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { X, Calendar, AlertTriangle, Send } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ApplyLeaveModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { applyLeave } = useHRMS();

  const [leaveType, setLeaveType] = useState('Paid');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // Calculate days between fromDate and toDate
  const calculateDays = () => {
    if (!fromDate || !toDate) return 0;
    if (isHalfDay) return 0.5;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = end - start;
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const daysCount = calculateDays();
  const balanceTypeKey = leaveType.toLowerCase();
  const availableBalance = currentUser?.leaveBalances?.[balanceTypeKey]?.remaining ?? 10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fromDate || !toDate) {
      setError('Please select both start and end dates.');
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    if (daysCount <= 0) {
      setError('Invalid date range.');
      return;
    }

    if (daysCount > availableBalance) {
      setError(`Insufficient ${leaveType} leave balance. You only have ${availableBalance} day(s) remaining.`);
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason or remarks for your leave request.');
      return;
    }

    setSubmitting(true);
    try {
      await applyLeave({
        employeeId: currentUser.id || currentUser.employeeId,
        employeeName: currentUser.name,
        leaveType,
        fromDate,
        toDate,
        days: daysCount,
        reason
      });

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) { /* ignore */ }

      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
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
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="modal-title">Apply for Time Off</h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>Submit your leave request for supervisor review</p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{
                background: 'var(--danger-light)',
                color: 'var(--danger-text)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem'
              }}>
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Leave Balance Overview Chip */}
            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Available <strong>{leaveType}</strong> Balance:
              </span>
              <span className={`badge ${availableBalance > 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.85rem', padding: '0.3rem 0.75rem' }}>
                {availableBalance} Days Left
              </span>
            </div>

            {/* Leave Type Select */}
            <div className="form-group">
              <label className="form-label">Leave Type</label>
              <select
                value={leaveType}
                onChange={e => setLeaveType(e.target.value)}
                className="form-select"
              >
                <option value="Paid">Paid Time Off (Annual Leave)</option>
                <option value="Sick">Sick / Medical Leave</option>
                <option value="Casual">Casual Leave</option>
                <option value="Unpaid">Unpaid Leave</option>
              </select>
            </div>

            {/* Half Day Checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="checkbox"
                id="halfDayCheck"
                checked={isHalfDay}
                onChange={e => setIsHalfDay(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <label htmlFor="halfDayCheck" style={{ fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                Half Day Leave (0.5 day)
              </label>
            </div>

            {/* Dates Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => {
                    setFromDate(e.target.value);
                    if (isHalfDay || !toDate) setToDate(e.target.value);
                  }}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="form-input"
                  disabled={isHalfDay}
                  required
                />
              </div>
            </div>

            {/* Duration Display */}
            {fromDate && toDate && (
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--primary)',
                fontWeight: 600,
                marginBottom: '1rem',
                padding: '0.5rem',
                background: 'var(--primary-light)',
                borderRadius: 'var(--radius-sm)'
              }}>
                Requested Duration: {daysCount} Business Day(s)
              </div>
            )}

            {/* Reason */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Remarks & Reason</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Please describe reason for leave and hand-over notes..."
                rows={3}
                className="form-textarea"
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting...' : <><Send size={15} /> Submit Application</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
