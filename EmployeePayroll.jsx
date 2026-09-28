import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PayslipModal } from '../../components/Modals/PayslipModal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  DollarSign,
  Printer,
  Calendar,
  CheckCircle,
  TrendingUp,
  Download,
  ShieldCheck,
  CreditCard,
  FileText
} from 'lucide-react';

export const EmployeePayroll = () => {
  const { currentUser } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  const s = currentUser?.salaryStructure || {
    baseSalary: 8200,
    hra: 2800,
    specialAllowance: 1500,
    transportAllowance: 400,
    pfDeduction: 984,
    taxDeduction: 1450,
    otherDeductions: 166,
    netSalary: 10300,
    bankName: 'Chase Bank',
    accountNumber: '**** **** 4192',
    ifscCode: 'CHAS00918',
    pan: 'BNPAX3421K'
  };

  const grossSalary = (s.baseSalary || 0) + (s.hra || 0) + (s.specialAllowance || 0) + (s.transportAllowance || 0);
  const totalDeductions = (s.pfDeduction || 0) + (s.taxDeduction || 0) + (s.otherDeductions || 0);
  const netSalary = grossSalary - totalDeductions;

  useEffect(() => {
    let mounted = true;
    const loadPayslips = async () => {
      try {
        setLoading(true);
        const data = await api.payroll.getPayslips();
        if (mounted && Array.isArray(data) && data.length > 0) {
          setPayslips(data);
        } else if (mounted) {
          // Fallback seed slips if none generated yet
          setPayslips([
            { month: 'August 2026', grossSalary, totalDeductions, netSalary, status: 'Disbursed', disbursementDate: '2026-08-01' },
            { month: 'July 2026', grossSalary, totalDeductions, netSalary, status: 'Disbursed', disbursementDate: '2026-07-01' },
            { month: 'June 2026', grossSalary, totalDeductions, netSalary, status: 'Disbursed', disbursementDate: '2026-06-01' }
          ]);
        }
      } catch (err) {
        if (mounted) {
          setPayslips([
            { month: 'August 2026', grossSalary, totalDeductions, netSalary, status: 'Disbursed', disbursementDate: '2026-08-01' },
            { month: 'July 2026', grossSalary, totalDeductions, netSalary, status: 'Disbursed', disbursementDate: '2026-07-01' }
          ]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadPayslips();
    return () => { mounted = false; };
  }, [grossSalary, totalDeductions, netSalary]);

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">Salary & Payslips</h1>
          <p className="page-subtitle">Confidential compensation overview and monthly payslip downloads</p>
        </div>

        <button
          onClick={() => {
            setSelectedMonth('August 2026');
            setShowPayslipModal(true);
          }}
          className="btn btn-primary"
        >
          <Printer size={16} /> View & Print Current Payslip
        </button>
      </div>

      {/* Hero: Net Pay Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        color: '#ffffff',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a5b4fc', fontWeight: 700 }}>
              Monthly Net Take-Home (August 2026)
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit', color: '#34d399', marginTop: '0.25rem' }}>
              ${netSalary.toLocaleString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#e0e7ff' }}>
              <CreditCard size={15} /> Disbursed via Direct Deposit to {s.bankName || 'Bank Account'} ({s.accountNumber})
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Gross Earnings</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2px' }}>${grossSalary.toLocaleString()}</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: '0.75rem', color: '#fca5a5' }}>Total Deductions</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '2px', color: '#fca5a5' }}>-${totalDeductions.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Earnings vs Deductions Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Earnings Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success-text)' }}>Earnings & Allowances</h3>
            <span className="badge badge-success">Monthly</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Basic Salary</span>
              <strong>${(s.baseSalary || 0).toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>House Rent Allowance (HRA)</span>
              <strong>${(s.hra || 0).toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Special Allowance</span>
              <strong>${(s.specialAllowance || 0).toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Transport Allowance</span>
              <strong>${(s.transportAllowance || 0).toLocaleString()}</strong>
            </div>

            <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Total Gross Pay</span>
              <span style={{ color: 'var(--success)' }}>${grossSalary.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Deductions Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--danger-text)' }}>Tax & Mandatory Deductions</h3>
            <span className="badge badge-danger">Statutory</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Provident Fund (PF)</span>
              <strong style={{ color: 'var(--danger)' }}>-${(s.pfDeduction || 0).toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Income Tax / TDS</span>
              <strong style={{ color: 'var(--danger)' }}>-${(s.taxDeduction || 0).toLocaleString()}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Medical & Health Deductions</span>
              <strong style={{ color: 'var(--danger)' }}>-${(s.otherDeductions || 0).toLocaleString()}</strong>
            </div>

            <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Total Deductions</span>
              <span style={{ color: 'var(--danger)' }}>-${totalDeductions.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Payslips Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Historical Salary Slips</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Disbursed archive</span>
        </div>

        <div className="table-container">
          <table className="hrms-table">
            <thead>
              <tr>
                <th>Payslip Period</th>
                <th>Disbursement Date</th>
                <th>Gross Pay</th>
                <th>Total Deductions</th>
                <th>Net Take-Home</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading confidential salary slips...
                  </td>
                </tr>
              ) : payslips.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No published payslips found.
                  </td>
                </tr>
              ) : (
                payslips.map((slip, i) => {
                  const gross = slip.grossSalary ?? slip.gross ?? 0;
                  const deductions = slip.totalDeductions ?? slip.deductions ?? 0;
                  const net = slip.netSalary ?? slip.net ?? (gross - deductions);
                  const dateStr = slip.disbursementDate || slip.date || '2026-08-01';

                  return (
                    <tr key={slip.id || i}>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{slip.month}</td>
                      <td>{dateStr}</td>
                      <td>${gross.toLocaleString()}</td>
                      <td style={{ color: 'var(--danger)' }}>-${deductions.toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>${net.toLocaleString()}</td>
                      <td>
                        <Badge variant="success">
                          <CheckCircle size={12} /> {slip.status || 'Disbursed'}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedMonth(slip.month);
                            setShowPayslipModal(true);
                          }}
                        >
                          <Printer size={13} /> View Payslip
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PayslipModal
        employee={currentUser}
        month={selectedMonth}
        isOpen={showPayslipModal}
        onClose={() => setShowPayslipModal(false)}
      />
    </div>
  );
};
