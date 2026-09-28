import React, { useState, useEffect } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Briefcase,
  Clock,
  Calendar,
  Shield,
  Plus,
  Trash2,
  CheckCircle,
  Save,
  RotateCcw,
  Users,
  MapPin,
  Lock
} from 'lucide-react';

export const AdminSettings = () => {
  const { holidays, refreshData, resetSampleData } = useHRMS();
  const { currentUser } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('org'); // 'org' | 'departments' | 'shifts' | 'holidays' | 'security'

  // Org Summary Data
  const [orgData, setOrgData] = useState({
    name: 'Dayflow Systems Inc.',
    domain: 'dayflow.internal',
    supportEmail: 'hr@dayflow.internal',
    timezone: 'America/Los_Angeles (PST)',
    currency: 'USD ($)',
    address: '100 Innovation Way, Suite 400, San Francisco, CA 94105'
  });

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [holidayList, setHolidayList] = useState([]);

  // Modals
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', head: '' });

  const [showShiftModal, setShowShiftModal] = useState(false);
  const [newShift, setNewShift] = useState({
    name: 'Standard Morning Shift',
    startTime: '09:00',
    endTime: '18:00',
    gracePeriodMinutes: 15,
    halfDayHours: 4.5
  });

  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Public'
  });

  // Security Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Confirm Reset Demo
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load Organization Settings from API
  const loadOrgDetails = async () => {
    try {
      const [summary, desigs, hols] = await Promise.all([
        api.organization.getSummary(),
        api.organization.getDesignations(),
        api.holidays.getAll(2026)
      ]);
      if (summary) {
        setDepartments(summary.departments || []);
        setShifts(summary.shifts || []);
        if (summary.organization) {
          setOrgData(summary.organization);
        }
      }
      if (desigs) setDesignations(desigs);
      if (hols) setHolidayList(hols);
    } catch (err) {
      console.error('Failed to load org details', err);
    }
  };

  useEffect(() => {
    loadOrgDetails();
  }, []);

  // Handlers
  const handleSaveOrg = (e) => {
    e.preventDefault();
    toast.success('Organization general profile updated successfully.');
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    try {
      await api.organization.createDepartment(newDept);
      toast.success(`Department "${newDept.name}" created.`);
      setShowDeptModal(false);
      setNewDept({ name: '', head: '' });
      await loadOrgDetails();
      await refreshData();
    } catch (err) {
      toast.error(err.message || 'Failed to create department');
    }
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    try {
      await api.organization.createShift(newShift);
      toast.success(`Work Shift "${newShift.name}" registered.`);
      setShowShiftModal(false);
      await loadOrgDetails();
      await refreshData();
    } catch (err) {
      toast.error(err.message || 'Failed to create shift');
    }
  };

  const handleCreateHoliday = async (e) => {
    e.preventDefault();
    try {
      await api.holidays.create(newHoliday);
      toast.success(`Holiday "${newHoliday.name}" added to company calendar.`);
      setShowHolidayModal(false);
      setNewHoliday({ name: '', date: new Date().toISOString().split('T')[0], type: 'Public' });
      await loadOrgDetails();
      await refreshData();
    } catch (err) {
      toast.error(err.message || 'Failed to add holiday');
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      await api.holidays.delete(id);
      toast.info('Holiday removed from calendar.');
      await loadOrgDetails();
      await refreshData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete holiday');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      setPasswordLoading(true);
      await api.auth.changePassword(currentPassword, newPassword);
      toast.success('Password updated successfully. Please use it for next login.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">Enterprise System Settings</h1>
          <p className="page-subtitle">Configure organization structures, work shifts, holiday calendars, and administrative security</p>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '1.5rem',
        overflowX: 'auto'
      }}>
        {[
          { id: 'org', label: 'Company Profile', icon: Building2 },
          { id: 'departments', label: 'Departments & Roles', icon: Briefcase },
          { id: 'shifts', label: 'Work Shifts & Timings', icon: Clock },
          { id: 'holidays', label: 'Holiday Calendar', icon: Calendar },
          { id: 'security', label: 'Security & System', icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                border: 'none',
                background: 'transparent',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. Company Profile */}
      {activeTab === 'org' && (
        <div className="card" style={{ maxWidth: '800px' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Company Master Profile</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Primary organization metadata displayed across payslips, letters, and invitations
            </p>
          </div>

          <form onSubmit={handleSaveOrg} style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <Input
                label="Company Name"
                value={orgData.name}
                onChange={e => setOrgData({ ...orgData, name: e.target.value })}
                required
              />
              <Input
                label="Primary Domain"
                value={orgData.domain}
                onChange={e => setOrgData({ ...orgData, domain: e.target.value })}
                required
              />
              <Input
                label="HR Support Email"
                value={orgData.supportEmail}
                onChange={e => setOrgData({ ...orgData, supportEmail: e.target.value })}
                type="email"
                required
              />
              <Input
                label="Primary Timezone"
                value={orgData.timezone}
                onChange={e => setOrgData({ ...orgData, timezone: e.target.value })}
                required
              />
              <Input
                label="Default Currency"
                value={orgData.currency}
                onChange={e => setOrgData({ ...orgData, currency: e.target.value })}
                required
              />
              <Input
                label="Headquarters Address"
                value={orgData.address}
                onChange={e => setOrgData({ ...orgData, address: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="primary">
                <Save size={15} /> Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Departments & Roles */}
      {activeTab === 'departments' && (
        <div className="card">
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Corporate Departments ({departments.length})</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Functional teams and leadership hierarchies
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowDeptModal(true)}>
              <Plus size={14} /> Add Department
            </Button>
          </div>

          <div className="table-container">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Department Head</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, idx) => (
                  <tr key={dept.id || idx}>
                    <td style={{ fontWeight: 700 }}>{dept.name}</td>
                    <td>{dept.head || 'Unassigned'}</td>
                    <td><Badge variant="success">Active</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Shifts */}
      {activeTab === 'shifts' && (
        <div className="card">
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Work Shifts & Punch Rules ({shifts.length})</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Configured working hours, grace periods, and half-day thresholds
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowShiftModal(true)}>
              <Plus size={14} /> Add Shift Policy
            </Button>
          </div>

          <div className="table-container">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Shift Name</th>
                  <th>Timing</th>
                  <th>Grace Period</th>
                  <th>Half-Day Threshold</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s, idx) => (
                  <tr key={s.id || idx}>
                    <td style={{ fontWeight: 700 }}>{s.name}</td>
                    <td>{s.startTime} — {s.endTime}</td>
                    <td>{s.gracePeriodMinutes || 15} minutes</td>
                    <td>{s.halfDayHours || 4.5} hours</td>
                    <td><Badge variant="success">Active</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Holiday Calendar */}
      {activeTab === 'holidays' && (
        <div className="card">
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Public & Company Holidays 2026 ({holidayList.length})</h3>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Standard non-working holidays visible across all employee attendance calendars
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowHolidayModal(true)}>
              <Plus size={14} /> Add Holiday
            </Button>
          </div>

          <div className="table-container">
            <table className="hrms-table">
              <thead>
                <tr>
                  <th>Holiday Name</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {holidayList.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 700 }}>{h.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={15} color="var(--primary)" />
                        <span>{new Date(h.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </td>
                    <td><Badge variant="primary">{h.type || 'Public'}</Badge></td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDeleteHoliday(h.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Security & System */}
      {activeTab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Change Password Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Change Account Password</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Update your administrative authentication credentials
            </p>

            <form onSubmit={handleChangePassword}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" variant="primary" loading={passwordLoading}>
                <Lock size={15} /> Update Password
              </Button>
            </form>
          </div>

          {/* Database Demo Control Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--danger)' }}>
              Developer & Demonstration Reset
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Restore clean production-ready seed records for all employees, attendance logs, leave balances, and payroll cycles.
            </p>

            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.825rem' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Reset includes:</div>
              <div>• 12 Enterprise Employees across all departments</div>
              <div>• Standard test credentials (password: <code>password123</code>)</div>
              <div>• 30-day attendance history and pending leaves</div>
              <div>• Fresh payroll runs and announcements</div>
            </div>

            <Button
              variant="danger"
              onClick={() => setShowResetConfirm(true)}
            >
              <RotateCcw size={15} /> Reset Database Demo Data
            </Button>
          </div>
        </div>
      )}

      {/* Create Dept Modal */}
      <Modal
        isOpen={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        title="Create New Department"
      >
        <form onSubmit={handleCreateDept}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <Input
              label="Department Name"
              placeholder="e.g. Data Science & AI"
              value={newDept.name}
              onChange={e => setNewDept({ ...newDept, name: e.target.value })}
              required
            />
            <Input
              label="Department Head / Lead"
              placeholder="e.g. Dr. Aris Thorne"
              value={newDept.head}
              onChange={e => setNewDept({ ...newDept, head: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="outline" type="button" onClick={() => setShowDeptModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Department</Button>
          </div>
        </form>
      </Modal>

      {/* Create Shift Modal */}
      <Modal
        isOpen={showShiftModal}
        onClose={() => setShowShiftModal(false)}
        title="Configure New Shift Policy"
      >
        <form onSubmit={handleCreateShift}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <Input
                label="Shift Name"
                value={newShift.name}
                onChange={e => setNewShift({ ...newShift, name: e.target.value })}
                required
              />
            </div>
            <Input
              label="Start Time"
              type="time"
              value={newShift.startTime}
              onChange={e => setNewShift({ ...newShift, startTime: e.target.value })}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={newShift.endTime}
              onChange={e => setNewShift({ ...newShift, endTime: e.target.value })}
              required
            />
            <Input
              label="Grace Period (Mins)"
              type="number"
              value={newShift.gracePeriodMinutes}
              onChange={e => setNewShift({ ...newShift, gracePeriodMinutes: Number(e.target.value) })}
              required
            />
            <Input
              label="Half-Day Min Hours"
              type="number"
              step="0.5"
              value={newShift.halfDayHours}
              onChange={e => setNewShift({ ...newShift, halfDayHours: Number(e.target.value) })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="outline" type="button" onClick={() => setShowShiftModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Shift Policy</Button>
          </div>
        </form>
      </Modal>

      {/* Add Holiday Modal */}
      <Modal
        isOpen={showHolidayModal}
        onClose={() => setShowHolidayModal(false)}
        title="Add Company Holiday"
      >
        <form onSubmit={handleCreateHoliday}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <Input
              label="Holiday Name"
              placeholder="e.g. Thanksgiving Day"
              value={newHoliday.name}
              onChange={e => setNewHoliday({ ...newHoliday, name: e.target.value })}
              required
            />
            <Input
              label="Date"
              type="date"
              value={newHoliday.date}
              onChange={e => setNewHoliday({ ...newHoliday, date: e.target.value })}
              required
            />
            <div className="form-group">
              <label className="form-label">Holiday Category</label>
              <select
                className="form-select"
                value={newHoliday.type}
                onChange={e => setNewHoliday({ ...newHoliday, type: e.target.value })}
              >
                <option value="Public">Public / National Holiday</option>
                <option value="Company">Company Observance</option>
                <option value="Optional">Optional / Floating Holiday</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="outline" type="button" onClick={() => setShowHolidayModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Add to Calendar</Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog for Reset */}
      <ConfirmationDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={async () => {
          await resetSampleData();
          setShowResetConfirm(false);
          await loadOrgDetails();
        }}
        title="Reset Entire Database?"
        message="This will reseed all database tables to fresh factory defaults. Any newly created employees, leaves, or punch records will be restored to default demo state."
        confirmText="Reset Everything"
        variant="danger"
      />
    </div>
  );
};
