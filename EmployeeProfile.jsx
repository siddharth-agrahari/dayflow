import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { EditProfileModal } from '../../components/Modals/EditProfileModal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { ProgressBar } from '../../components/common/ProgressBar';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Briefcase,
  DollarSign,
  FileText,
  Edit3,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
  Shield,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Upload,
  Trash2,
  AlertCircle,
  Activity,
  Sparkles
} from 'lucide-react';

export const EmployeeProfile = () => {
  const { currentUser, isAdmin } = useAuth();
  const { attendanceLogs, leaveRequests, refreshData } = useHRMS();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'job' | 'salary' | 'documents' | 'timeline'
  const [showEditModal, setShowEditModal] = useState(false);

  // Documents state
  const [documents, setDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Identity Proof');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState(null);

  const p = currentUser?.personalDetails || {};
  const j = currentUser?.jobDetails || {};
  const s = currentUser?.salaryStructure || {};

  // Fetch real documents from API
  const fetchDocuments = async () => {
    try {
      setDocLoading(true);
      const docs = await api.documents.getAll({ employeeId: currentUser?.employeeId || currentUser?.id });
      if (Array.isArray(docs)) {
        setDocuments(docs);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setDocLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchDocuments();
    }
  }, [currentUser?.id, currentUser?.employeeId]);

  // Profile Completion Calculation
  const checklistItems = [
    { label: 'Profile Picture / Avatar', completed: !!currentUser?.avatar, weight: 15 },
    { label: 'Primary Contact Phone', completed: !!p.phone, weight: 15 },
    { label: 'Residential Home Address', completed: !!p.address, weight: 15 },
    { label: 'Emergency Contact Person', completed: !!p.emergencyContact, weight: 15 },
    { label: 'Blood Group Specification', completed: !!p.bloodGroup, weight: 10 },
    { label: 'Direct Deposit Bank Details', completed: !!s.accountNumber, weight: 15 },
    { label: 'Identity / Contract Documents', completed: documents.length > 0 || (currentUser?.documents && currentUser.documents.length > 0), weight: 15 }
  ];

  const completionPercentage = checklistItems.reduce(
    (sum, item) => (item.completed ? sum + item.weight : sum),
    0
  );

  // Handle Document Upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadTitle || selectedFile.name);
      formData.append('category', uploadCategory);
      formData.append('employeeId', currentUser?.employeeId || currentUser?.id);

      await api.documents.upload(formData);
      toast.success(`Document "${uploadTitle || selectedFile.name}" uploaded successfully.`);
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadTitle('');
      await fetchDocuments();
      await refreshData();
    } catch (err) {
      toast.error(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!deletingDocId) return;
    try {
      await api.documents.delete(deletingDocId);
      toast.success('Document deleted.');
      setDeletingDocId(null);
      await fetchDocuments();
      await refreshData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete document');
    }
  };

  // Recent timeline events for this user
  const userLogs = attendanceLogs.filter(
    l => l.employeeId === currentUser?.id || l.employeeId === currentUser?.employeeId
  ).slice(0, 5);

  const userLeaves = leaveRequests.filter(
    r => r.employeeId === currentUser?.id || r.employeeId === currentUser?.employeeId
  ).slice(0, 5);

  return (
    <div className="page-body">
      {/* Profile Overview Header Card */}
      <div className="card-glass" style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="avatar avatar-xl"
                  style={{ border: '4px solid var(--primary-light)', boxShadow: 'var(--shadow-md)' }}
                />
              ) : (
                <div className="avatar avatar-xl">{currentUser?.name?.charAt(0)}</div>
              )}
              <span style={{
                position: 'absolute',
                bottom: '4px',
                right: '4px',
                width: '18px',
                height: '18px',
                background: 'var(--success)',
                border: '3px solid var(--bg-secondary)',
                borderRadius: '50%'
              }} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{currentUser?.name}</h1>
                <Badge variant={currentUser?.status === 'Active' ? 'success' : 'warning'}>
                  {currentUser?.status || 'Active'}
                </Badge>
                <Badge variant="primary">
                  {currentUser?.role === 'admin' ? 'Super Admin' : currentUser?.role === 'manager' ? 'Team Lead / Manager' : 'Staff Employee'}
                </Badge>
              </div>

              <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {currentUser?.designation} • <strong>{currentUser?.department}</strong>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.75rem', flexWrap: 'wrap', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Mail size={14} color="var(--primary)" />
                  <span>{currentUser?.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Phone size={14} color="var(--primary)" />
                  <span>{p.phone || '+1 (555) 234-5678'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} color="var(--primary)" />
                  <span>{p.address?.split(',')[0] || 'San Francisco, CA'}</span>
                </div>
              </div>
            </div>
          </div>

          <Button variant="primary" onClick={() => setShowEditModal(true)}>
            <Edit3 size={16} /> {isAdmin ? 'Edit All Employee Info' : 'Edit Contact Details'}
          </Button>
        </div>
      </div>

      {/* Profile Completion Checklist Banner */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Profile Completion Status</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
              ({checklistItems.filter(i => i.completed).length} of {checklistItems.length} items complete)
            </span>
          </div>
          <Badge variant={completionPercentage === 100 ? 'success' : 'primary'}>
            {completionPercentage}% Complete
          </Badge>
        </div>

        <ProgressBar
          progress={completionPercentage}
          color={completionPercentage === 100 ? 'var(--success)' : 'var(--primary)'}
          height="10px"
        />

        {completionPercentage < 100 && (
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            {checklistItems.filter(i => !i.completed).map((item, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <AlertCircle size={12} color="var(--warning)" /> Needs: {item.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-nav">
        <button
          onClick={() => setActiveTab('personal')}
          className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
        >
          <User size={16} /> Personal Details
        </button>
        <button
          onClick={() => setActiveTab('job')}
          className={`tab-btn ${activeTab === 'job' ? 'active' : ''}`}
        >
          <Briefcase size={16} /> Job & Organization
        </button>
        <button
          onClick={() => setActiveTab('salary')}
          className={`tab-btn ${activeTab === 'salary' ? 'active' : ''}`}
        >
          <DollarSign size={16} /> Salary Structure
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
        >
          <FileText size={16} /> Documents ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
        >
          <Activity size={16} /> Activity Stream
        </button>
      </div>

      {/* Tab 1: Personal Details */}
      {activeTab === 'personal' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Personal Information</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Synchronized with HR master</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>Phone Number</label>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.phone || 'Not provided'}</div>
            </div>

            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>Date of Birth</label>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.dob || '1992-06-15'}</div>
            </div>

            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>Gender</label>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.gender || 'Female'}</div>
            </div>

            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>Marital Status</label>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.maritalStatus || 'Single'}</div>
            </div>

            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>Emergency Contact</label>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.emergencyContact || 'Family Contact (+1 555-111-2222)'}</div>
            </div>

            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>Blood Group</label>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.bloodGroup || 'O+'}</div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>Residential Address</label>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', background: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
                {p.address || '742 Evergreen Terrace, San Francisco, CA 94105'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Job & Organization */}
      {activeTab === 'job' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Job & Employment Profile</h3>
            <Badge variant="primary">Dayflow Systems Inc.</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>Employee ID</label>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>
                {currentUser?.employeeId || currentUser?.id}
              </div>
            </div>

            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>Department</label>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{currentUser?.department}</div>
            </div>

            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>Designation / Title</label>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{currentUser?.designation}</div>
            </div>

            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>Reporting Manager</label>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{j.manager || 'Eleanor Vance (CHRO)'}</div>
            </div>

            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>Date of Joining</label>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{currentUser?.joiningDate || '2022-01-10'}</div>
            </div>

            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>Employment Type</label>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{j.employmentType || 'Full-time (Permanent)'}</div>
            </div>

            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>Work Location</label>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{j.workLocation || 'San Francisco HQ (Hybrid)'}</div>
            </div>

            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>Working Hours / Shift</label>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{j.workSchedule || '09:00 AM - 06:00 PM (Mon-Fri)'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Salary Structure */}
      {activeTab === 'salary' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Monthly Compensation & Salary Breakdown</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Read-only confidential payroll breakdown</p>
            </div>
            <Badge variant="success">Direct Deposit Configured</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success-text)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                Earnings ($)
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>Basic Salary</span>
                <strong>${(s.baseSalary || 7500).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>House Rent Allowance (HRA)</span>
                <strong>${(s.hra || 2500).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>Special Allowance</span>
                <strong>${(s.specialAllowance || 1200).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>Transport Allowance</span>
                <strong>${(s.transportAllowance || 400).toLocaleString()}</strong>
              </div>
            </div>

            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger-text)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                Deductions ($)
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>Provident Fund (PF)</span>
                <strong style={{ color: 'var(--danger)' }}>-${(s.pfDeduction || 900).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <span>Income Tax (TDS)</span>
                <strong style={{ color: 'var(--danger)' }}>-${(s.taxDeduction || 1350).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>Other Health/Insurance</span>
                <strong style={{ color: 'var(--danger)' }}>-${(s.otherDeductions || 150).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--primary-light)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>
                Net Monthly Take-Home Pay
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Bank: {s.bankName || 'Silicon Valley Bank'} • Acc: {s.accountNumber || '**** 8821'}
              </div>
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit' }}>
              ${(s.netSalary || 9200).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Documents (Real backend upload and delete) */}
      {activeTab === 'documents' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Employee Documents & Compliance Files</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Upload government ID, tax forms, or offer contracts</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setShowUploadModal(true)}>
              <Upload size={14} /> Upload Document
            </Button>
          </div>

          {documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <FileText size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
              <div>No documents uploaded yet.</div>
              <Button variant="outline" size="sm" style={{ marginTop: '0.75rem' }} onClick={() => setShowUploadModal(true)}>
                Upload First File
              </Button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {documents.map(doc => (
                <div
                  key={doc.id}
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'var(--primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      flexShrink: 0
                    }}>
                      <FileText size={20} />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {doc.category || 'General'} • {doc.fileSize || '1.2 MB'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        <Download size={13} /> View / Save
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => setDeletingDocId(doc.id)}
                      title="Delete Document"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Activity Stream Timeline */}
      {activeTab === 'timeline' && (
        <div className="card">
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Personal Workday Activity Stream</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Recent attendance punches, leave submissions, and profile events</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)', margin: '1rem 0 1rem 0.5rem' }}>
            {userLogs.map((log, idx) => (
              <div key={`punch-${idx}`} style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '-23px', top: '2px', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--success)' }} />
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Punch: {log.date}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Clocked In: {log.checkIn || '-'} • Clocked Out: {log.checkOut || 'In Progress'} ({log.workHours || '8h'})
                </div>
              </div>
            ))}

            {userLeaves.map((leave, idx) => (
              <div key={`leave-${idx}`} style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '-23px', top: '2px', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--purple)' }} />
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Leave Application: {leave.leaveType}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {leave.fromDate} to {leave.toDate} ({leave.days} days) • Status: <strong>{leave.status}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Verification / Employment Document"
      >
        <form onSubmit={handleFileUpload}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
            <Input
              label="Document Title"
              placeholder="e.g. Government ID or Contract Signed"
              value={uploadTitle}
              onChange={e => setUploadTitle(e.target.value)}
              required
            />

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={uploadCategory}
                onChange={e => setUploadCategory(e.target.value)}
              >
                <option value="Identity Proof">Identity Proof (Passport, Driving License)</option>
                <option value="Employment Contract">Employment Contract & NDA</option>
                <option value="Tax & Compliance">Tax Forms (W-4, Form 16, PAN)</option>
                <option value="Educational Certificates">Educational Certificate</option>
                <option value="Other">Other Document</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Select File (PDF, PNG, JPG, DOCX - max 10MB)</label>
              <input
                type="file"
                className="form-input"
                onChange={e => setSelectedFile(e.target.files[0])}
                accept=".pdf,.png,.jpg,.jpeg,.docx,.xlsx"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button variant="outline" type="button" onClick={() => setShowUploadModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={uploading}>
              <Upload size={14} /> Upload File
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingDocId}
        onClose={() => setDeletingDocId(null)}
        onConfirm={handleDeleteDocument}
        title="Delete Document?"
        message="Are you sure you want to permanently delete this document from your profile?"
        confirmText="Yes, Delete"
        variant="danger"
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        employee={currentUser}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  );
};
