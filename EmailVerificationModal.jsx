import React, { useState } from 'react';
import { X, MailCheck, ArrowRight, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export const EmailVerificationModal = ({ email, isOpen, onVerify, onClose }) => {
  const [code, setCode] = useState(['5', '8', '2', '', '', '']);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) { /* ignore */ }

    onVerify();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '460px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ justifyContent: 'center', position: 'relative' }}>
          <h3 className="modal-title">Verify Your Email</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ position: 'absolute', right: '1rem', padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleVerify}>
          <div className="modal-body">
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              margin: '0 auto 1.25rem'
            }}>
              <MailCheck size={28} />
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              We sent a 6-digit verification code to <br />
              <strong style={{ color: 'var(--text-primary)' }}>{email || 'your-email@company.com'}</strong>
            </p>

            {error && (
              <div style={{
                background: 'var(--danger-light)',
                color: 'var(--danger-text)',
                fontSize: '0.8rem',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem'
              }}>
                {error}
              </div>
            )}

            {/* OTP Inputs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(idx, e.target.value)}
                  style={{
                    width: '45px',
                    height: '52px',
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                  onFocus={e => e.target.select()}
                />
              ))}
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={() => setCode(['5', '8', '2', '9', '1', '4'])}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
              >
                Auto-fill Code
              </button>
            </div>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'center' }}>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Verify & Complete Sign Up <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
