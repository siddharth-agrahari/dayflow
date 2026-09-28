import React, { useState } from 'react';
import { X, Printer, Download, CheckCircle, FileText, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PayslipModal = ({ employee, month = 'August 2026', isOpen, onClose }) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !employee) return null;

  const s = employee.salaryStructure || {
    baseSalary: 8000,
    hra: 2600,
    specialAllowance: 1400,
    transportAllowance: 400,
    pfDeduction: 960,
    taxDeduction: 1400,
    otherDeductions: 140,
    netSalary: 9900,
    bankName: 'Silicon Valley Bank',
    accountNumber: '**** **** 1234',
    pan: 'DAYFLOW99X'
  };

  const grossEarnings = (s.baseSalary || 0) + (s.hra || 0) + (s.specialAllowance || 0) + (s.transportAllowance || 0);
  const totalDeductions = (s.pfDeduction || 0) + (s.taxDeduction || 0) + (s.otherDeductions || 0);
  const netPay = grossEarnings - totalDeductions;

  const handlePrint = () => {
    window.print();
  };

  // Feature: Download Official Payslip Document (.html / standalone file)
  const handleDownloadFile = () => {
    const payslipHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Payslip - ${employee.name} - ${month}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; color: #0f172a; padding: 40px 20px; margin: 0; }
    .slip-container { max-width: 750px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 25px; }
    .brand { font-size: 24px; font-weight: 800; color: #1e1b4b; margin: 0; }
    .badge { background: #ecfdf5; color: #065f46; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; border: 1px solid #10b981; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 25px; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px; }
    th { background: #f1f5f9; padding: 10px 14px; text-align: left; font-weight: 700; color: #334155; }
    td { padding: 10px 14px; border-bottom: 1px solid #f1f5f9; }
    .net-box { background: #eef2ff; border: 2px solid #6366f1; border-radius: 8px; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .net-amount { font-size: 28px; font-weight: 800; color: #1e1b4b; }
    .footer { display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="slip-container">
    <div class="header">
      <div>
        <h1 class="brand">Dayflow Systems Inc.</h1>
        <p style="font-size: 13px; color: #64748b; margin: 4px 0 0 0;">100 Innovation Way, Suite 400 • San Francisco, CA 94105</p>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 20px; font-weight: 800; color: #4f46e5;">OFFICIAL PAYSLIP</div>
        <div style="font-size: 14px; font-weight: 600; color: #334155;">Period: ${month}</div>
        <span class="badge">Verified & Disbursed</span>
      </div>
    </div>

    <div class="meta-grid">
      <div>
        <div><strong>Employee Name:</strong> ${employee.name}</div>
        <div><strong>Employee ID:</strong> ${employee.id || employee.employeeId}</div>
        <div><strong>Department:</strong> ${employee.department}</div>
        <div><strong>Designation:</strong> ${employee.designation}</div>
      </div>
      <div>
        <div><strong>Bank Name:</strong> ${s.bankName || 'Silicon Valley Bank'}</div>
        <div><strong>Account No:</strong> ${s.accountNumber || '**** 4412'}</div>
        <div><strong>PAN / Tax ID:</strong> ${s.pan || 'DAYFLOW99X'}</div>
        <div><strong>Paid Working Days:</strong> 30 Days</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>EARNINGS</th>
          <th style="text-align: right;">AMOUNT ($)</th>
          <th style="border-left: 1px solid #e2e8f0;">DEDUCTIONS</th>
          <th style="text-align: right;">AMOUNT ($)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Basic Salary</td>
          <td style="text-align: right; font-weight: 600;">$${(s.baseSalary || 0).toLocaleString()}</td>
          <td style="border-left: 1px solid #e2e8f0;">Provident Fund (PF)</td>
          <td style="text-align: right; font-weight: 600; color: #dc2626;">$${(s.pfDeduction || 0).toLocaleString()}</td>
        </tr>
        <tr>
          <td>House Rent Allowance (HRA)</td>
          <td style="text-align: right; font-weight: 600;">$${(s.hra || 0).toLocaleString()}</td>
          <td style="border-left: 1px solid #e2e8f0;">Income Tax (TDS)</td>
          <td style="text-align: right; font-weight: 600; color: #dc2626;">$${(s.taxDeduction || 0).toLocaleString()}</td>
        </tr>
        <tr>
          <td>Special Allowance</td>
          <td style="text-align: right; font-weight: 600;">$${(s.specialAllowance || 0).toLocaleString()}</td>
          <td style="border-left: 1px solid #e2e8f0;">Other Deductions</td>
          <td style="text-align: right; font-weight: 600; color: #dc2626;">$${(s.otherDeductions || 0).toLocaleString()}</td>
        </tr>
        <tr>
          <td>Transport Allowance</td>
          <td style="text-align: right; font-weight: 600;">$${(s.transportAllowance || 0).toLocaleString()}</td>
          <td style="border-left: 1px solid #e2e8f0;">-</td>
          <td style="text-align: right;">$0</td>
        </tr>
      </tbody>
      <tfoot>
        <tr style="background: #f8fafc; font-weight: bold; border-top: 2px solid #e2e8f0;">
          <td>Total Gross Earnings</td>
          <td style="text-align: right; color: #059669;">$${grossEarnings.toLocaleString()}</td>
          <td style="border-left: 1px solid #e2e8f0;">Total Deductions</td>
          <td style="text-align: right; color: #dc2626;">$${totalDeductions.toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>

    <div class="net-box">
      <div>
        <div style="font-size: 12px; font-weight: bold; color: #4338ca; text-transform: uppercase;">Net Monthly Take-Home Pay</div>
        <div style="font-size: 13px; color: #64748b;">(Gross Earnings minus Total Statutory Deductions)</div>
      </div>
      <div class="net-amount">$${netPay.toLocaleString()}</div>
    </div>

    <div class="footer">
      <div>
        <div style="height: 35px; border-bottom: 1px dashed #94a3b8; width: 180px;"></div>
        <div style="margin-top: 4px;">Employee Signature</div>
      </div>
      <div style="text-align: right;">
        <div style="height: 35px; border-bottom: 1px dashed #94a3b8; width: 180px; text-align: center; color: #4f46e5; font-weight: bold;">Eleanor Vance (CHRO)</div>
        <div style="margin-top: 4px;">Authorized HR Signatory</div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([payslipHTML], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Payslip_${employee.name.replace(/\s+/g, '_')}_${month.replace(/\s+/g, '_')}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (e) { /* ignore */ }

    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog payslip-printable" style={{ maxWidth: '780px', background: '#ffffff', color: '#0f172a' }} onClick={e => e.stopPropagation()}>
        {/* Modal Action Bar (Hidden during Print) */}
        <div className="no-print" style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem' }}>Employee Salary Slip</span>
            <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Verified & Disbursed</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button onClick={handleDownloadFile} className="btn btn-success btn-sm">
              <Download size={15} /> Download Payslip File
            </button>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={15} /> Print / Save as PDF
            </button>
            <button onClick={onClose} className="btn btn-ghost btn-sm">
              <X size={18} />
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="no-print" style={{
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #10b981',
            padding: '0.65rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem'
          }}>
            <CheckCircle size={16} color="#10b981" />
            <span>Payslip downloaded successfully to your computer!</span>
          </div>
        )}

        {/* Printable Payslip Body */}
        <div style={{ padding: '2rem' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #4f46e5',
            paddingBottom: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1.1rem'
                }}>
                  D
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e1b4b', margin: 0 }}>Dayflow Systems Inc.</h2>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                100 Innovation Way, Suite 400 • San Francisco, CA 94105 • support@dayflow.com
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4f46e5' }}>OFFICIAL PAYSLIP</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Period: {month}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Disbursement: Direct Deposit</div>
            </div>
          </div>

          {/* Employee Information Matrix */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem'
          }}>
            <div>
              <div style={{ marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Employee Name:</span> <strong style={{ color: '#0f172a' }}>{employee.name}</strong>
              </div>
              <div style={{ marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Employee ID:</span> <strong style={{ color: '#0f172a' }}>{employee.id || employee.employeeId}</strong>
              </div>
              <div style={{ marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Department:</span> <strong style={{ color: '#0f172a' }}>{employee.department}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Designation:</span> <strong style={{ color: '#0f172a' }}>{employee.designation}</strong>
              </div>
            </div>

            <div>
              <div style={{ marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Bank Name:</span> <strong style={{ color: '#0f172a' }}>{s.bankName || 'Silicon Valley Bank'}</strong>
              </div>
              <div style={{ marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>Account No:</span> <strong style={{ color: '#0f172a' }}>{s.accountNumber || '**** 4412'}</strong>
              </div>
              <div style={{ marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>PAN / Tax ID:</span> <strong style={{ color: '#0f172a' }}>{s.pan || 'DAYFLOW99X'}</strong>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Total Paid Days:</span> <strong style={{ color: '#0f172a' }}>30 Days</strong>
              </div>
            </div>
          </div>

          {/* Earnings vs Deductions Table */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.65rem 1rem', textAlign: 'left', fontWeight: 700, color: '#334155', width: '35%' }}>EARNINGS</th>
                  <th style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 700, color: '#334155', width: '15%' }}>AMOUNT ($)</th>
                  <th style={{ padding: '0.65rem 1rem', textAlign: 'left', fontWeight: 700, color: '#334155', width: '35%', borderLeft: '1px solid #e2e8f0' }}>DEDUCTIONS</th>
                  <th style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 700, color: '#334155', width: '15%' }}>AMOUNT ($)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.65rem 1rem' }}>Basic Salary</td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 600 }}>${(s.baseSalary || 0).toLocaleString()}</td>
                  <td style={{ padding: '0.65rem 1rem', borderLeft: '1px solid #e2e8f0' }}>Provident Fund (PF)</td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>${(s.pfDeduction || 0).toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.65rem 1rem' }}>House Rent Allowance (HRA)</td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 600 }}>${(s.hra || 0).toLocaleString()}</td>
                  <td style={{ padding: '0.65rem 1rem', borderLeft: '1px solid #e2e8f0' }}>Income Tax (TDS)</td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>${(s.taxDeduction || 0).toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.65rem 1rem' }}>Special Allowance</td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 600 }}>${(s.specialAllowance || 0).toLocaleString()}</td>
                  <td style={{ padding: '0.65rem 1rem', borderLeft: '1px solid #e2e8f0' }}>Other Deductions</td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 600, color: '#dc2626' }}>${(s.otherDeductions || 0).toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.65rem 1rem' }}>Transport Allowance</td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 600 }}>${(s.transportAllowance || 0).toLocaleString()}</td>
                  <td style={{ padding: '0.65rem 1rem', borderLeft: '1px solid #e2e8f0' }}>-</td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>$0</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #e2e8f0' }}>
                  <td style={{ padding: '0.75rem 1rem' }}>Gross Earnings</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#059669' }}>${grossEarnings.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 1rem', borderLeft: '1px solid #e2e8f0' }}>Total Deductions</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#dc2626' }}>${totalDeductions.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Net Salary Highlight Box */}
          <div style={{
            background: '#eef2ff',
            border: '2px solid #6366f1',
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4338ca', textTransform: 'uppercase' }}>
                Net Monthly Take-Home Pay
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
                (Gross Earnings minus Total Deductions)
              </div>
            </div>

            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e1b4b', fontFamily: 'Outfit' }}>
              ${netPay.toLocaleString()}
            </div>
          </div>

          {/* Signatures & Footer Notice */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ height: '35px', borderBottom: '1px dashed #94a3b8' }}></div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Employee Signature</div>
            </div>

            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ height: '35px', borderBottom: '1px dashed #94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 700, fontSize: '0.8rem' }}>
                Eleanor Vance (CHRO)
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Authorized HR Signatory</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.7rem', color: '#94a3b8' }}>
            This is a computer-generated official payslip from Dayflow HRMS. No manual seal required.
          </div>
        </div>
      </div>
    </div>
  );
};
