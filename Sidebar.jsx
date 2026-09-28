import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  PlaneTakeoff,
  DollarSign,
  BarChart3,
  UserCircle,
  LogOut,
  ShieldCheck,
  Clock,
  X,
  FileText,
  Settings,
  Shield,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, activeTab, setActiveTab }) => {
  const { currentUser, logout, isAdmin, isManager } = useAuth();
  const { leaveRequests, corrections } = useHRMS();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('dayflow_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('dayflow_sidebar_collapsed', String(next));
      return next;
    });
  };

  const pendingLeavesCount = leaveRequests.filter(r => r.status === 'Pending').length;
  const pendingCorrectionsCount = corrections ? corrections.filter(c => c.status === 'Pending').length : 0;
  const totalPending = pendingLeavesCount + pendingCorrectionsCount;

  const employeeNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: UserCircle },
    { id: 'attendance', label: 'Attendance & Calendar', icon: CalendarCheck },
    { id: 'leave', label: 'Leave Requests', icon: PlaneTakeoff },
    { id: 'payroll', label: 'Salary & Payslips', icon: DollarSign },
    { id: 'holidays', label: 'Holiday Calendar', icon: Calendar }
  ];

  const managerNavItems = [
    { id: 'dashboard', label: 'Team Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Team Directory', icon: Users },
    { id: 'attendance', label: 'Team Attendance', icon: CalendarCheck },
    {
      id: 'leave-approvals',
      label: 'Leave Approvals',
      icon: PlaneTakeoff,
      badge: pendingLeavesCount > 0 ? pendingLeavesCount : null
    },
    { id: 'reports', label: 'Team Reports', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: UserCircle }
  ];

  const adminNavItems = [
    { id: 'dashboard', label: 'HR Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employee Directory', icon: Users },
    {
      id: 'attendance',
      label: 'Attendance Matrix',
      icon: CalendarCheck,
      badge: pendingCorrectionsCount > 0 ? pendingCorrectionsCount : null
    },
    {
      id: 'leave-approvals',
      label: 'Leave Approvals',
      icon: PlaneTakeoff,
      badge: pendingLeavesCount > 0 ? pendingLeavesCount : null
    },
    { id: 'payroll', label: 'Payroll Master', icon: DollarSign },
    { id: 'analytics', label: 'HR Analytics & BI', icon: BarChart3 },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
    { id: 'settings', label: 'Organization & Settings', icon: Settings },
    { id: 'audit-logs', label: 'Audit Trail Logs', icon: Shield },
    { id: 'profile', label: 'Admin Profile', icon: UserCircle }
  ];

  const navItems = isAdmin ? adminNavItems : isManager ? managerNavItems : employeeNavItems;
  const sidebarWidth = isCollapsed ? '78px' : 'var(--sidebar-width)';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 49,
            display: 'block'
          }}
        />
      )}

      <aside
        style={{
          width: sidebarWidth,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isOpen ? 'translateX(0)' : undefined,
          boxShadow: 'var(--shadow-sm)'
        }}
        className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
      >
        {/* Brand Header */}
        <div style={{
          padding: isCollapsed ? '1rem 0.5rem' : '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border-color)',
          height: 'var(--header-height)',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.25rem',
              boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
              flexShrink: 0
            }}>
              D
            </div>

            {!isCollapsed && (
              <div style={{ whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  Dayflow
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  HRMS Platform 2.0
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm d-lg-none"
            style={{ padding: '0.25rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card Summary */}
        {!isCollapsed ? (
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-tertiary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="avatar" />
              ) : (
                <div className="avatar">{currentUser?.name?.charAt(0)}</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {currentUser?.name}
                </div>
                <div style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {currentUser?.designation}
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.675rem',
                  fontWeight: 600,
                  color: 'var(--success)',
                  marginTop: '2px'
                }}>
                  <span className="pulse-dot" style={{ background: 'var(--success)' }} />
                  <span>Online • {currentUser?.role?.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '0.75rem 0', display: 'flex', justifyContent: 'center', borderBottom: '1px solid var(--border-color)' }}>
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="avatar avatar-sm" title={currentUser.name} />
            ) : (
              <div className="avatar avatar-sm">{currentUser?.name?.charAt(0)}</div>
            )}
          </div>
        )}

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: isCollapsed ? '0.75rem 0.35rem' : '1rem 0.75rem', overflowY: 'auto' }}>
          {!isCollapsed && (
            <div style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              padding: '0.35rem 0.75rem 0.5rem 0.75rem'
            }}>
              {isAdmin ? 'Administration Suite' : isManager ? 'Manager Workspace' : 'Employee Workspace'}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  title={isCollapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    width: '100%',
                    padding: isCollapsed ? '0.65rem' : '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: isActive ? 'var(--primary-light)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon size={18} color={isActive ? 'var(--primary)' : 'currentColor'} style={{ flexShrink: 0 }} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>

                  {item.badge && !isCollapsed && (
                    <span style={{
                      background: 'var(--danger)',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)'
                    }}>
                      {item.badge}
                    </span>
                  )}

                  {item.badge && isCollapsed && (
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--danger)'
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer Actions: Collapse Sidebar Toggle & Sign Out */}
        <div style={{
          padding: isCollapsed ? '0.75rem 0.35rem' : '0.75rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          background: 'var(--bg-secondary)'
        }}>
          {/* Desktop Sidebar Collapse Button */}
          <button
            onClick={toggleCollapse}
            className="btn btn-ghost d-none d-lg-flex"
            style={{
              width: '100%',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              padding: '0.5rem'
            }}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {!isCollapsed && <span>Collapse Sidebar</span>}
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <button
            onClick={logout}
            className="btn btn-ghost"
            style={{
              width: '100%',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              color: 'var(--danger)',
              fontSize: '0.85rem',
              padding: '0.5rem'
            }}
            title="Sign Out"
          >
            <LogOut size={16} /> {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
