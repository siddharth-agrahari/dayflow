import React, { useState, useEffect } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { X, DollarSign, Calculator, Check, ArrowRight } from 'lucide-react';

export const SalaryStructureModal = ({ employee, isOpen, onClose }) => {
  const { updateSalaryStructure } = useHRMS();

  const [structure, setStructure] = useState({
    baseSalary: 0,
    hra: 0,
    specialAllowance: 0,
    transportAllowance: 0,
    pfDeduction: 0,
    taxDeduction: 0,
    otherDeductions: 0,
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    pan: ''
  });

  useEffect(() => {
    if (employee?.salaryStructure) {
      setStructure({
        baseSalary: employee.salaryStructure.baseSalary || 0,
        hra: employee.salaryStructure.hra || 0,
        specialAllowance: employee.salaryStructure.specialAllowance || 0,
        transportAllowance: employee.salaryStructure.transportAllowance || 0,
        pfDeduction: employee.salaryStructure.pfDeduction || 0,
        taxDeduction: employee.salaryStructure.taxDeduction || 0,
        otherDeductions: employee.salaryStructure.otherDeductions || 0,
        bankName: employee.salaryStructure.bankName || 'Silicon Valley Bank',
        accountNumber: employee.salaryStructure.accountNumber || '**** **** 1234',
        ifscCode: employee.salaryStructure.ifscCode || 'SVB001',
        pan: employee.salaryStructure.pan || 'DAYFLOW01'
      });
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  const grossSalary =
    Number(structure.baseSalary) +
    Number(structure.hra) +
    Number(structure.specialAllowance) +
    Number(structure.transportAllowance);

  const totalDeductions =
    Number(structure.pfDeduction) +
    Number(structure.taxDeduction) +
    Number(structure.otherDeductions);

  const netSalary = grossSalary - totalDeductions;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSalaryStructure(employee.id, {
      ...structure,
      grossSalary,
      totalDeductions,
      netSalary
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'var(--success-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success-text)'
            }}>
              <DollarSign size={18} />
            </div>
            <div>
              <h3 className="modal-title">Configure Salary Structure</h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                {employee.name} • {employee.designation} ({employee.department})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.25rem' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
            {/* Live Net Pay Card */}
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
              color: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>
                  Calculated Monthly Take-Home Pay
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: '#34d399', marginTop: '2px' }}>
                  ${netSalary.toLocaleString()}
                </div>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                <div style={{ opacity: 0.85 }}>Gross: <strong>${grossSalary.toLocaleString()}</strong></div>
                <div style={{ opacity: 0.85, color: '#fca5a5' }}>Deductions: <strong>-${totalDeductions.toLocaleString()}</strong></div>
              </div>
            </div>

            {/* Earnings Breakdown */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                Earnings & Allowances ($ / month)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Basic Salary ($)</label>
                  <input
                    type="number"
                    value={structure.baseSalary}
                    onChange={e => setStructure({ ...structure, baseSalary: Number(e.target.value) })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">House Rent Allowance (HRA) ($)</label>
                  <input
                    type="number"
                    value={structure.hra}
                    onChange={e => setStructure({ ...structure, hra: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Special Allowance ($)</label>
                  <input
                    type="number"
                    value={structure.specialAllowance}
                    onChange={e => setStructure({ ...structure, specialAllowance: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Transport Allowance ($)</label>
                  <input
                    type="number"
                    value={structure.transportAllowance}
                    onChange={e => setStructure({ ...structure, transportAllowance: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)', marginBottom: '0.75rem' }}>
                Monthly Deductions ($)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Provident Fund (PF)</label>
                  <input
                    type="number"
                    value={structure.pfDeduction}
                    onChange={e => setStructure({ ...structure, pfDeduction: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Income Tax (TDS)</label>
                  <input
                    type="number"
                    value={structure.taxDeduction}
                    onChange={e => setStructure({ ...structure, taxDeduction: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Other Deductions</label>
                  <input
                    type="number"
                    value={structure.otherDeductions}
                    onChange={e => setStructure({ ...structure, otherDeductions: Number(e.target.value) })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Banking Details */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                Disbursement Account
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Bank Name</label>
                  <input
                    type="text"
                    value={structure.bankName}
                    onChange={e => setStructure({ ...structure, bankName: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Account Number</label>
                  <input
                    type="text"
                    value={structure.accountNumber}
                    onChange={e => setStructure({ ...structure, accountNumber: e.target.value })}
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
            <button type="submit" className="btn btn-success">
              <Check size={16} /> Save Salary Structure
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
