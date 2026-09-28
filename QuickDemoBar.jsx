import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { UserCheck, Shield, Sparkles, RotateCcw, Sun, Moon, Users } from 'lucide-react';
import { ConfirmationDialog } from '../common/ConfirmationDialog';

export const QuickDemoBar = () => {
  const { currentUser, switchUser, theme, toggleTheme } = useAuth();
  const { employees, resetSampleData } = useHRMS();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Key demo personas
  const demoPersonas = [
    { email: 'admin@dayflow.com', name: 'Eleanor Vance', label: 'Admin (CHRO)', role: 'super_admin' },
    { email: 'sarah@dayflow.com', name: 'Sarah Jenkins', label: 'Manager (Eng)', role: 'manager' },
    { email: 'marcus@dayflow.com', name: 'Marcus Chen', label: 'Manager (Design)', role: 'manager' },
    { email: 'alex@dayflow.com', name: 'Alex Rivera', label: 'Alex (Senior Dev)', role: 'employee' },
    { email: 'sophia@dayflow.com', name: 'Sophia Rodriguez', label: 'Sophia (Marketing)', role: 'employee' },
    { email: 'devon@dayflow.com', name: 'Devon Knight', label: 'Devon (DevOps)', role: 'employee' }
  ];

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetSampleData();
      setShowResetConfirm(false);
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <div style={{
        background: 'linear-gradient(90deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
        color: '#ffffff',
        padding: '0.45rem 1.5rem',
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        zIndex: 100,
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sparkles size={15} color="#fbbf24" />
          <span style={{ fontWeight: 700 }}>Live Persona Switcher:</span>
          <span style={{ opacity: 0.85, fontSize: '0.75rem' }} className="d-none d-md-inline">
            Real backend JWT authorization switch:
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {demoPersonas.map(persona => {
            const isCurrent = currentUser?.email === persona.email;
            return (
              <button
                key={persona.email}
                onClick={() => switchUser(persona)}
                style={{
                  background: isCurrent ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                  color: isCurrent ? '#1e1b4b' : '#ffffff',
                  border: isCurrent ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '9999px',
                  padding: '0.2rem 0.65rem',
                  fontSize: '0.72rem',
                  fontWeight: isCurrent ? 700 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease'
                }}
                title={`Switch session to ${persona.name} (${persona.role})`}
              >
                {persona.role === 'super_admin' ? (
                  <Shield size={11} color={isCurrent ? '#4f46e5' : '#fbbf24'} />
                ) : persona.role === 'manager' ? (
                  <Users size={11} color={isCurrent ? '#06b6d4' : '#67e8f9'} />
                ) : (
                  <UserCheck size={11} color={isCurrent ? '#10b981' : '#a7f3d0'} />
                )}
                <span>{persona.label}</span>
              </button>
            );
          })}

          {/* Reset Demo Data Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            title="Reset database to default seed state"
            style={{
              background: 'rgba(239, 68, 68, 0.22)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              borderRadius: '9999px',
              padding: '0.2rem 0.6rem',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              marginLeft: '0.35rem'
            }}
          >
            <RotateCcw size={11} />
            <span>Reset Demo DB</span>
          </button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset Production Demo Database"
        description="Are you sure you want to reset all records (employees, attendance logs, leave applications, payroll runs) back to the clean initial seed snapshot?"
        confirmText="Reset Database"
        loading={resetting}
      />
    </>
  );
};
