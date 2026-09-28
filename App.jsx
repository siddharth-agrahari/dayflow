import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Layout/Navbar';
import { Sidebar } from './components/Layout/Sidebar';
import { QuickDemoBar } from './components/Layout/QuickDemoBar';
import { CommandPalette } from './components/Layout/CommandPalette';

// Auth Pages
import { Login } from './pages/Auth/Login';
import { Signup } from './pages/Auth/Signup';

// Employee Pages
import { EmployeeDashboard } from './pages/Employee/EmployeeDashboard';
import { EmployeeProfile } from './pages/Employee/EmployeeProfile';
import { EmployeeAttendance } from './pages/Employee/EmployeeAttendance';
import { EmployeeLeave } from './pages/Employee/EmployeeLeave';
import { EmployeePayroll } from './pages/Employee/EmployeePayroll';
import { EmployeeHolidays } from './pages/Employee/EmployeeHolidays';

// Manager Pages
import { ManagerDashboard } from './pages/Manager/ManagerDashboard';

// Admin Pages
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { AdminEmployees } from './pages/Admin/AdminEmployees';
import { AdminAttendance } from './pages/Admin/AdminAttendance';
import { AdminLeaveApprovals } from './pages/Admin/AdminLeaveApprovals';
import { AdminPayroll } from './pages/Admin/AdminPayroll';
import { AdminAnalytics } from './pages/Admin/AdminAnalytics';
import { AdminReports } from './pages/Admin/AdminReports';
import { AdminSettings } from './pages/Admin/AdminSettings';
import { AdminAuditLogs } from './pages/Admin/AdminAuditLogs';

export default function App() {
  const { currentUser, isAdmin, isManager } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // If user is not authenticated, display login/signup
  if (!currentUser) {
    return authView === 'login' ? (
      <Login onGoToSignup={() => setAuthView('signup')} />
    ) : (
      <Signup onGoToLogin={() => setAuthView('login')} />
    );
  }

  // Render current tab content based on role
  const renderContent = () => {
    if (isAdmin) {
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard setActiveTab={setActiveTab} />;
        case 'employees':
          return <AdminEmployees />;
        case 'attendance':
          return <AdminAttendance />;
        case 'leave-approvals':
          return <AdminLeaveApprovals />;
        case 'payroll':
          return <AdminPayroll />;
        case 'analytics':
          return <AdminAnalytics />;
        case 'reports':
          return <AdminReports />;
        case 'settings':
          return <AdminSettings />;
        case 'audit-logs':
          return <AdminAuditLogs />;
        case 'profile':
          return <EmployeeProfile />;
        default:
          return <AdminDashboard setActiveTab={setActiveTab} />;
      }
    } else if (isManager) {
      switch (activeTab) {
        case 'dashboard':
          return <ManagerDashboard setActiveTab={setActiveTab} />;
        case 'employees':
          return <AdminEmployees />;
        case 'attendance':
          return <AdminAttendance />;
        case 'leave-approvals':
          return <AdminLeaveApprovals />;
        case 'reports':
          return <AdminReports />;
        case 'profile':
          return <EmployeeProfile />;
        default:
          return <ManagerDashboard setActiveTab={setActiveTab} />;
      }
    } else {
      // Standard Employee View
      switch (activeTab) {
        case 'dashboard':
          return <EmployeeDashboard setActiveTab={setActiveTab} />;
        case 'profile':
          return <EmployeeProfile />;
        case 'attendance':
          return <EmployeeAttendance />;
        case 'leave':
          return <EmployeeLeave />;
        case 'payroll':
          return <EmployeePayroll />;
        case 'holidays':
          return <EmployeeHolidays />;
        default:
          return <EmployeeDashboard setActiveTab={setActiveTab} />;
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Quick Interactive Demo & Persona Switcher */}
      <QuickDemoBar />

      <div className="app-container" style={{ flex: 1 }}>
        {/* Responsive Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Main Content Area */}
        <div className="main-content">
          <Navbar
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          />

          <main style={{ flex: 1 }}>
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Global Command Palette Modal (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
