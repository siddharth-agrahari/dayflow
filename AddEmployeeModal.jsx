import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { X, UserPlus, Sparkles, Building, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AddEmployeeModal = ({ isOpen, onClose }) => {
  const { addEmployee } = useHRMS();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'employee',
    department: 'Engineering',
    designation: 'Software Engineer',
    joiningDate: new Date().toISOString().split('T')[0],
    phone: '',
    address: '',
    dob: '1996-05-10',
    gender: 'Female',
    baseSalary: 7000,
    hra: 2400,
    specialAllowance: 1000,
    transportAllowance: 300,
    pfDeduction: 840,
    taxDeduction: 1100,
    otherDeductions: 100,
    bankName: 'Silicon Valley Bank',
    accountNumber: '**** **** 5521'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEmp = addEmployee(formData);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) { /* ignore */ }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}>
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="modal-title">Onboard New Employee</h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                Register personal, job, and initial payroll structure
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
            {/* Step 1: Basic Information */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building size={16} /> 1. Personal & Company Role
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Miller"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. jordan@dayflow.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="form-select"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design & UX">Design & UX</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Product">Product</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Frontend Developer"
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">System Role *</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="form-select"
                  >
                    <option value="employee">Standard Employee</option>
                    <option value="admin">Admin / HR Officer</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Joining Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Contact & Personal Details */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                2. Contact & Address
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="form-select"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Residential Address</label>
                <input
                  type="text"
                  placeholder="Street, City, State, ZIP"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            {/* Step 3: Initial Salary Structure */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success-text)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <DollarSign size={16} /> 3. Monthly Compensation & Salary Structure ($)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Base Salary ($)</label>
                  <input
                    type="number"
                    value={formData.baseSalary}
                    onChange={e => setFormData({ ...formData, baseSalary: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">HRA ($)</label>
                  <input
                    type="number"
                    value={formData.hra}
                    onChange={e => setFormData({ ...formData, hra: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Special Allowance ($)</label>
                  <input
                    type="number"
                    value={formData.specialAllowance}
                    onChange={e => setFormData({ ...formData, specialAllowance: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Transport ($)</label>
                  <input
                    type="number"
                    value={formData.transportAllowance}
                    onChange={e => setFormData({ ...formData, transportAllowance: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PF Deduction ($)</label>
                  <input
                    type="number"
                    value={formData.pfDeduction}
                    onChange={e => setFormData({ ...formData, pfDeduction: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tax Deduction ($)</label>
                  <input
                    type="number"
                    value={formData.taxDeduction}
                    onChange={e => setFormData({ ...formData, taxDeduction: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <UserPlus size={16} /> Complete Onboarding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
