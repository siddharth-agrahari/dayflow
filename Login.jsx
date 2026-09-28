import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import {
  Shield,
  UserCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Sun,
  Moon,
  Eye,
  EyeOff,
  CheckCircle2,
  CalendarCheck,
  PlaneTakeoff,
  DollarSign,
  Users,
  BadgePercent,
  KeyRound,
  IdCard
} from 'lucide-react';

export const Login = ({ onGoToSignup }) => {
  const { login, switchUser, theme, toggleTheme } = useAuth();
  const { employees } = useHRMS();

  const [loginMethod, setLoginMethod] = useState('employeeId'); // 'employeeId' | 'email'
  const [identifier, setIdentifier] = useState('EMP-1002');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(identifier, password);
      if (!res.success) {
        setError(res.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (personaId) => {
    setIdentifier(personaId);
    setPassword('password123');
    setError('');
    setLoading(true);
    try {
      const res = await login(personaId, 'password123');
      if (!res.success) {
        setError(res.error || 'Quick login failed.');
      }
    } catch (err) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      transition: 'background 0.3s ease, color 0.3s ease'
    }}>
      {/* Top Landing Header Bar */}
      <header style={{
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.25rem',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
          }}>
            D
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>Dayflow</span>
            <span style={{ fontSize: '0.75rem', marginLeft: '6px', color: 'var(--primary)', fontWeight: 700 }}>HRMS</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Dark / Normal Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '0.8rem'
            }}
            title={theme === 'dark' ? 'Switch to Normal (Light) Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="var(--primary)" />}
            <span>{theme === 'dark' ? 'Normal Mode' : 'Dark Mode'}</span>
          </button>

          <button
            onClick={onGoToSignup}
            className="btn btn-primary btn-sm"
          >
            Create Account
          </button>
        </div>
      </header>

      {/* Main Split Hero Landing & Login Container */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.5rem',
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '3rem',
          alignItems: 'center',
          width: '100%'
        }}>
          {/* Left Column: Brand Hero & Presentation */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginBottom: '1.25rem',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
              <Sparkles size={14} color="var(--primary)" />
              Employee & Admin HR Portal
            </div>

            <h1 style={{
              fontSize: '2.75rem',
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: '1rem',
              color: 'var(--text-primary)'
            }}>
              Every workday, <br />
              <span style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                perfectly aligned.
              </span>
            </h1>

            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '520px'
            }}>
              Log in with your official <strong>Employee ID</strong> (e.g. <code>EMP-1002</code>) or <strong>Email</strong> to access your personal attendance history in daily and weekly views, submit leaves, and download payslips.
            </p>

            {/* Core Feature Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--success-light)', color: 'var(--success-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarCheck size={16} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Daily & Weekly History</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--purple-light)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PlaneTakeoff size={16} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Leave Request Desk</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={16} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Downloadable Payslips</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--secondary-light)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IdCard size={16} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Employee ID Login</span>
              </div>
            </div>

            {/* Quick Demo 1-Click Cards */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} /> Quick Demo Personas (1-Click Test):
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('EMP-1001')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', fontSize: '0.78rem' }}
                  disabled={loading}
                >
                  <Shield size={14} color="var(--primary)" />
                  <span>Eleanor (Admin)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('EMP-1004')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', fontSize: '0.78rem' }}
                  disabled={loading}
                >
                  <Users size={14} color="#06b6d4" />
                  <span>Sarah (Manager)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('EMP-1002')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', fontSize: '0.78rem' }}
                  disabled={loading}
                >
                  <IdCard size={14} color="var(--secondary)" />
                  <span>Alex (Senior Dev)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('EMP-1003')}
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'flex-start', fontSize: '0.78rem' }}
                  disabled={loading}
                >
                  <IdCard size={14} color="var(--purple)" />
                  <span>Marcus (Manager)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Box with Employee ID / Email tabs */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem 2rem',
            boxShadow: 'var(--shadow-xl)',
            maxWidth: '460px',
            width: '100%',
            margin: '0 auto',
            position: 'relative'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0 }}>Employee Login</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Sign in with your Employee ID or Work Email
              </p>
            </div>

            {/* Login Method Toggle */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-tertiary)',
              padding: '0.25rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              border: '1px solid var(--border-color)'
            }}>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod('employeeId');
                  if (!identifier.startsWith('EMP')) setIdentifier('EMP-1002');
                }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: loginMethod === 'employeeId' ? 'var(--bg-secondary)' : 'transparent',
                  color: loginMethod === 'employeeId' ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: loginMethod === 'employeeId' ? 700 : 500,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  boxShadow: loginMethod === 'employeeId' ? 'var(--shadow-sm)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <IdCard size={15} /> Employee ID
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMethod('email');
                  if (identifier.startsWith('EMP')) setIdentifier('alex@dayflow.com');
                }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: loginMethod === 'email' ? 'var(--bg-secondary)' : 'transparent',
                  color: loginMethod === 'email' ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: loginMethod === 'email' ? 700 : 500,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  boxShadow: loginMethod === 'email' ? 'var(--shadow-sm)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <Mail size={15} /> Work Email
              </button>
            </div>

            {error && (
              <div style={{
                background: 'var(--danger-light)',
                color: 'var(--danger-text)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.85rem'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">
                  {loginMethod === 'employeeId' ? 'Employee ID (e.g. EMP-1002)' : 'Work Email Address'}
                </label>
                <div style={{ position: 'relative' }}>
                  {loginMethod === 'employeeId' ? (
                    <IdCard size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  ) : (
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  )}
                  <input
                    type="text"
                    required
                    placeholder={loginMethod === 'employeeId' ? 'EMP-1002' : 'alex@dayflow.com'}
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Tip: You can use Employee ID (<code>EMP-1001</code>, <code>EMP-1002</code>) or Email.
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Password</label>
                  <span
                    style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => alert('Demo password is "password123" for all sample accounts.')}
                  >
                    Forgot password?
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '10px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                  />
                  Remember my credentials
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', fontWeight: 700 }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : (
                  <>Sign In to Dayflow <ArrowRight size={18} /></>
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              New employee without access?{' '}
              <button
                type="button"
                onClick={onGoToSignup}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Sign Up here
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '1.25rem 2rem',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        background: 'var(--bg-secondary)'
      }}>
        Dayflow HRMS Platform © 2026. Every workday, perfectly aligned.
      </footer>
    </div>
  );
};
