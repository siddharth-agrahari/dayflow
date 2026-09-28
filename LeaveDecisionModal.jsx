import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { X, CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

export const LeaveDecisionModal = ({ request, isOpen, onClose }) => {
  const { updateLeaveStatus } = useHRMS();
  const [comment, setComment] = useState('');
  const [actionType, setActionType] = useState('Approved'); // or 'Rejected'

  if (!isOpen || !request) return null;

  const handleDecision = (status) => {
    updateLeaveStatus(request.id, status, comment.trim());

    if (status === 'Approved') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) { /* ignore */ }
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Review Time Off Request</h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              Request #{request.id} • Submitted on {request.appliedOn}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Employee Info Card */}
          <div style={{
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {request.employeeAvatar ? (
              <img src={request.employeeAvatar} alt={request.employeeName} className="avatar avatar-md" />
            ) : (
              <div className="avatar">{request.employeeName?.charAt(0)}</div>
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{request.employeeName}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {request.department} • Employee ID: {request.employeeId}
              </div>
            </div>
          </div>

          {/* Leave Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Leave Type
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '2px', color: 'var(--primary)' }}>
                {request.leaveType} Leave
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Date Range
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: '2px' }}>
                {request.fromDate} to {request.toDate}
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Duration
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '2px', color: 'var(--success)' }}>
                {request.days} Day(s)
              </div>
            </div>
          </div>

          {/* Reason Section */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Employee Reason:</label>
            <div style={{
              background: 'var(--bg-primary)',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
              fontStyle: 'italic',
              border: '1px solid var(--border-color)'
            }}>
              "{request.reason}"
            </div>
          </div>

          {/* HR Decision Remarks */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Supervisor / HR Feedback & Comments:</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add approval remarks or reason for rejection..."
              rows={3}
              className="form-textarea"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleDecision('Rejected')}
            className="btn btn-danger"
          >
            <XCircle size={16} /> Reject Request
          </button>
          <button
            type="button"
            onClick={() => handleDecision('Approved')}
            className="btn btn-success"
          >
            <CheckCircle size={16} /> Approve Leave
          </button>
        </div>
      </div>
    </div>
  );
};
