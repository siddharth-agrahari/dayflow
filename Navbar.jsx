import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Shield,
  Search,
  Menu,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertCircle,
  Command,
  ChevronRight,
  Settings
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar, activeTab, setActiveTab, onOpenCommandPalette }) => {
  const { currentUser, logout, theme, toggleTheme, isAdmin, isManager } = useAuth();
  const { notifications, markAllNotificationsAsRead, markNotificationAsRead } = useHRMS();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (type) => {
    switch (type) {
      case 'leave': return <Clock size={16} color="#8b5cf6" />;
      case 'attendance': return <CheckCircle2 size={16} color="#10b981" />;
      case 'payroll': return <Briefcase size={16} color="#0ea5e9" />;
      default: return <AlertCircle size={16} color="#f59e0b" />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return isAdmin ? 'Executive Command Center' : isManager ? 'Manager Team Dashboard' : 'Employee Workspace';
      case 'employees': return 'Employee Directory';
      case 'attendance': return isAdmin ? 'Company Attendance Matrix' : 'Attendance History & Tracking';
      case 'leave': return 'Leave & Time Off';
      case 'leave-approvals': return 'Leave Approvals Desk';
      case 'payroll': return isAdmin ? 'Company Payroll Master' : 'Salary & Payslips';
      case 'analytics': return 'HR Analytics & BI';
      case 'reports': return 'Reports & Compliance';
      case 'settings': return 'Organization & Settings';
      case 'audit-logs': return 'Audit Trail Logs';
      case 'profile': return 'Employee Profile';
      case 'holidays': return 'Holiday Calendar';
      default: return 'Overview';
    }
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Left section: Hamburger, Brand, and Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
        <button
          onClick={onToggleSidebar}
          className="btn btn-ghost btn-sm d-lg-none"
          style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}
          title="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.1rem',
            flexShrink: 0
          }}>
            D
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'nowrap' }}>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Dayflow
              </span>
              <ChevronRight size={14} color="var(--text-muted)" />
              <span style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {getPageTitle()}
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {isAdmin ? 'Admin & Operations Suite' : isManager ? 'Team Manager Workspace' : 'Employee Portal'}
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Command Palette Quick Search Bar */}
      <div style={{ display: 'flex', flex: 1, maxWidth: '360px', margin: '0 1rem' }} className="d-none d-md-block">
        <button
          onClick={onOpenCommandPalette}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.45rem 0.85rem',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-focus)';
            e.currentTarget.style.background = 'var(--bg-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.background = 'var(--bg-tertiary)';
          }}
          title="Search anything (Ctrl+K)"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={15} />
            <span>Search employees, pages, actions...</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <kbd style={{ fontSize: '0.65rem', padding: '1px 5px' }}>Ctrl</kbd>
            <kbd style={{ fontSize: '0.65rem', padding: '1px 5px' }}>K</kbd>
          </div>
        </button>
      </div>

      {/* Right side: Mobile Search Icon, Dark/Light Mode, Notifications, User Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Mobile Search Icon */}
        <button
          onClick={onOpenCommandPalette}
          className="btn btn-ghost btn-sm d-md-none"
          style={{ padding: '0.45rem', borderRadius: '50%' }}
          title="Search (Ctrl+K)"
        >
          <Search size={18} />
        </button>

        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            fontWeight: 700
          }}
          title={theme === 'dark' ? 'Switch to Normal (Light) Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={15} color="#fbbf24" />
              <span className="d-none d-sm-inline">Light</span>
            </>
          ) : (
            <>
              <Moon size={15} color="var(--primary)" />
              <span className="d-none d-sm-inline">Dark</span>
            </>
          )}
        </button>

        {/* Notification Center */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-ghost btn-sm"
            style={{
              position: 'relative',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Notification Center"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '18px',
                height: '18px',
                background: 'var(--danger)',
                color: '#fff',
                borderRadius: '50%',
                fontSize: '0.65rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '370px',
              maxWidth: '90vw',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 100,
              overflow: 'hidden',
              animation: 'slideUp 0.18s ease-out'
            }}>
              <div style={{
                padding: '1rem 1.25rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--bg-tertiary)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Bell size={24} style={{ opacity: 0.4, margin: '0 auto 0.5rem' }} />
                    <div>No notifications yet</div>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (!n.read) markNotificationAsRead(n.id);
                        if (n.link) {
                          setActiveTab(n.link.replace('/', ''));
                          setShowNotifications(false);
                        }
                      }}
                      style={{
                        padding: '0.85rem 1.25rem',
                        borderBottom: '1px solid var(--border-color)',
                        background: n.read ? 'transparent' : 'var(--primary-light)',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: 'var(--bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {getNotifIcon(n.type)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.title}</span>
                          {!n.read && (
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                          )}
                        </div>
                        <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {n.createdAt || 'Recent'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-md)'
            }}
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="avatar avatar-sm"
              />
            ) : (
              <div className="avatar avatar-sm">{currentUser?.name?.charAt(0) || 'U'}</div>
            )}
            <div style={{ textAlign: 'left' }} className="d-none d-md-block">
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {currentUser?.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {currentUser?.designation?.split('&')[0]}
              </div>
            </div>
          </button>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '250px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 100,
              padding: '0.5rem',
              animation: 'slideUp 0.18s ease-out'
            }}>
              <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{currentUser?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser?.email}</div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.7rem',
                  color: 'var(--primary)',
                  marginTop: '6px',
                  fontWeight: 600,
                  background: 'var(--primary-light)',
                  padding: '2px 8px',
                  borderRadius: '9999px'
                }}>
                  <Shield size={11} /> {currentUser?.role?.toUpperCase()} • {currentUser?.employeeId}
                </div>
              </div>

              <div style={{ padding: '0.5rem 0' }}>
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setShowUserMenu(false);
                  }}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem' }}
                >
                  <User size={16} /> My Profile
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setShowUserMenu(false);
                    }}
                    className="btn btn-ghost"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem' }}
                  >
                    <Settings size={16} /> System Settings
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="btn btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem', color: 'var(--danger)' }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
