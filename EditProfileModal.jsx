import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { X, Save, UserCheck, ShieldAlert, Image, Phone, MapPin, Briefcase } from 'lucide-react';

export const EditProfileModal = ({ employee, isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  const { updateEmployee } = useHRMS();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    designation: '',
    department: '',
    status: 'Active',
    avatar: '',
    phone: '',
    address: '',
    dob: '',
    gender: '',
    maritalStatus: '',
    emergencyContact: '',
    bloodGroup: '',
    manager: '',
    workLocation: '',
    employmentType: ''
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        role: employee.role || 'employee',
        designation: employee.designation || '',
        department: employee.department || '',
        status: employee.status || 'Active',
        avatar: employee.avatar || '',
        phone: employee.personalDetails?.phone || '',
        address: employee.personalDetails?.address || '',
        dob: employee.personalDetails?.dob || '',
        gender: employee.personalDetails?.gender || '',
        maritalStatus: employee.personalDetails?.maritalStatus || '',
        emergencyContact: employee.personalDetails?.emergencyContact || '',
        bloodGroup: employee.personalDetails?.bloodGroup || '',
        manager: employee.jobDetails?.manager || '',
        workLocation: employee.jobDetails?.workLocation || '',
        employmentType: employee.jobDetails?.employmentType || 'Full-time'
      });
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedData = {
      name: isAdmin ? formData.name : employee.name,
      email: isAdmin ? formData.email : employee.email,
      role: isAdmin ? formData.role : employee.role,
      designation: isAdmin ? formData.designation : employee.designation,
      department: isAdmin ? formData.department : employee.department,
      status: isAdmin ? formData.status : employee.status,
      avatar: formData.avatar || employee.avatar,
      personalDetails: {
        ...employee.personalDetails,
        phone: formData.phone,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        dob: isAdmin ? formData.dob : employee.personalDetails?.dob,
        gender: isAdmin ? formData.gender : employee.personalDetails?.gender,
        maritalStatus: isAdmin ? formData.maritalStatus : employee.personalDetails?.maritalStatus,
        bloodGroup: isAdmin ? formData.bloodGroup : employee.personalDetails?.bloodGroup
      },
      jobDetails: {
        ...employee.jobDetails,
        manager: isAdmin ? formData.manager : employee.jobDetails?.manager,
        workLocation: isAdmin ? formData.workLocation : employee.jobDetails?.workLocation,
        employmentType: isAdmin ? formData.employmentType : employee.jobDetails?.employmentType
      }
    };

    updateEmployee(employee.id, updatedData);
    onClose();
  };

  const presetAvatars = [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {isAdmin ? `Edit Employee Profile (${employee.name})` : 'Update Personal Information'}
            </h3>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              {isAdmin
                ? 'Admin mode: full edit rights for organizational & personal records'
                : 'Employee mode: update contact details and profile picture'}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
            {/* Avatar Selector Section */}
            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ display: 'inline-block', position: 'relative' }}>
                <img
                  src={formData.avatar || employee.avatar}
                  alt="Avatar Preview"
                  className="avatar avatar-xl"
                  style={{ margin: '0 auto', border: '3px solid var(--primary)' }}
                />
              </div>
              <div style={{ marginTop: '0.75rem' }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Choose an avatar or paste image URL:</label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {presetAvatars.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Preset"
                      onClick={() => setFormData({ ...formData, avatar: url })}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        border: formData.avatar === url ? '2px solid var(--primary)' : '2px solid transparent',
                        transform: formData.avatar === url ? 'scale(1.1)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    />
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="Or paste custom image link..."
                  value={formData.avatar}
                  onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                  className="form-input"
                  style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            {/* Admin-only Primary Fields */}
            {isAdmin && (
              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldAlert size={16} /> Admin Organizational Controls
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="form-select"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin / HR Officer</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      className="form-select"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Probation">Probation</option>
                      <option value="Inactive">Inactive / Suspended</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={e => setFormData({ ...formData, department: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={e => setFormData({ ...formData, designation: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Editable Contact Fields (Available to both Employee & Admin) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.35rem' }}>
                Contact & Address Details
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Emergency Contact</label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="form-input"
                    placeholder="Name (+1 555-000-0000)"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Residential Address</label>
                <textarea
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="form-textarea"
                  rows={2}
                  placeholder="Street address, city, state, postal code"
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={15} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
