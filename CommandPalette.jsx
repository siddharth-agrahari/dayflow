import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Users,
  CalendarCheck,
  PlaneTakeoff,
  DollarSign,
  BarChart3,
  Settings,
  Shield,
  FileText,
  User,
  ArrowRight,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';

export const CommandPalette = ({ isOpen, onClose, setActiveTab, onSelectEmployee }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const { currentUser, isAdmin } = useAuth();
  const { employees, leaveRequests } = useHRMS();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by caller or global listener
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Navigation pages
  const pages = [
    { title: 'Dashboard', tab: 'dashboard', icon: BarChart3, category: 'Pages' },
    { title: 'Employee Directory', tab: 'employees', icon: Users, category: 'Pages', adminOnly: true },
    { title: 'Attendance Tracker', tab: 'attendance', icon: CalendarCheck, category: 'Pages' },
    { title: 'Leave & Time Off', tab: 'leave', icon: PlaneTakeoff, category: 'Pages' },
    { title: 'Leave Approvals Desk', tab: 'leave-approvals', icon: PlaneTakeoff, category: 'Pages', adminOnly: true },
    { title: 'Payroll Master & Slips', tab: 'payroll', icon: DollarSign, category: 'Pages' },
    { title: 'HR Analytics Hub', tab: 'analytics', icon: BarChart3, category: 'Pages', adminOnly: true },
    { title: 'Reports & Export', tab: 'reports', icon: FileText, category: 'Pages', adminOnly: true },
    { title: 'Organization & Settings', tab: 'settings', icon: Settings, category: 'Pages', adminOnly: true },
    { title: 'Audit Trail Logs', tab: 'audit-logs', icon: Shield, category: 'Pages', adminOnly: true },
    { title: 'My Profile', tab: 'profile', icon: User, category: 'Pages' }
  ].filter(p => !p.adminOnly || isAdmin);

  const matchingPages = pages.filter(p => !q || p.title.toLowerCase().includes(q));

  const matchingEmployees = employees
    .filter(e =>
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.employeeId.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q) ||
      e.designation.toLowerCase().includes(q)
    )
    .slice(0, 5);

  const allItems = [
    ...matchingPages.map(p => ({ type: 'page', data: p })),
    ...matchingEmployees.map(e => ({ type: 'employee', data: e }))
  ];

  const handleSelect = (item) => {
    if (!item) return;
    if (item.type === 'page') {
      setActiveTab(item.data.tab);
      onClose();
    } else if (item.type === 'employee') {
      if (onSelectEmployee) {
        onSelectEmployee(item.data);
      } else {
        setActiveTab('employees');
      }
      onClose();
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, allItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        handleSelect(allItems[selectedIndex]);
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '5rem 1rem 2rem 1rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.18s ease-out'
        }}
      >
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <Search size={20} color="var(--primary)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search employees, pages, actions, settings... (Use ↑↓ and Enter)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '1rem',
              color: 'var(--text-primary)',
              outline: 'none',
              fontWeight: 500
            }}
          />
          <span style={{
            fontSize: '0.7rem',
            padding: '2px 6px',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-muted)',
            borderRadius: '4px',
            fontWeight: 700
          }}>
            ESC
          </span>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '0.5rem' }}>
          {allItems.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No matching employees or pages found for "{query}".
            </div>
          ) : (
            <div>
              {matchingPages.length > 0 && (
                <div>
                  <div style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--text-muted)',
                    padding: '0.5rem 0.75rem 0.25rem 0.75rem'
                  }}>
                    Workspace Navigation
                  </div>
                  {matchingPages.map((page, idx) => {
                    const Icon = page.icon;
                    const itemIndex = idx;
                    const isSelected = selectedIndex === itemIndex;

                    return (
                      <div
                        key={page.tab}
                        onClick={() => handleSelect({ type: 'page', data: page })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? 'var(--primary-light)' : 'transparent',
                          color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                          cursor: 'pointer',
                          transition: 'all 0.1s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Icon size={17} color={isSelected ? 'var(--primary)' : 'var(--text-secondary)'} />
                          <span style={{ fontWeight: isSelected ? 700 : 500, fontSize: '0.875rem' }}>{page.title}</span>
                        </div>
                        <ArrowRight size={14} style={{ opacity: isSelected ? 1 : 0.4 }} />
                      </div>
                    );
                  })}
                </div>
              )}

              {matchingEmployees.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'var(--text-muted)',
                    padding: '0.5rem 0.75rem 0.25rem 0.75rem'
                  }}>
                    Employees Directory
                  </div>
                  {matchingEmployees.map((emp, empIdx) => {
                    const itemIndex = matchingPages.length + empIdx;
                    const isSelected = selectedIndex === itemIndex;

                    return (
                      <div
                        key={emp.employeeId || emp.id}
                        onClick={() => handleSelect({ type: 'employee', data: emp })}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? 'var(--primary-light)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.1s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {emp.avatar ? (
                            <img src={emp.avatar} alt={emp.name} className="avatar avatar-sm" />
                          ) : (
                            <div className="avatar avatar-sm">{emp.name?.charAt(0)}</div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>
                              {emp.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                              {emp.designation} • {emp.department} • {emp.employeeId}
                            </div>
                          </div>
                        </div>
                        <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>
                          {emp.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div style={{
          padding: '0.65rem 1rem',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-tertiary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.72rem',
          color: 'var(--text-muted)'
        }}>
          <div>Navigate with <kbd>↑</kbd> <kbd>↓</kbd> and select with <kbd>↵ Enter</kbd></div>
          <div><kbd>Esc</kbd> to exit</div>
        </div>
      </div>
    </div>
  );
};
