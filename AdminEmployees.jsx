import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useHRMS } from '../../context/HRMSContext';
import { AddEmployeeModal } from '../../components/Modals/AddEmployeeModal';
import { EditProfileModal } from '../../components/Modals/EditProfileModal';
import { SalaryStructureModal } from '../../components/Modals/SalaryStructureModal';
import { PayslipModal } from '../../components/Modals/PayslipModal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  DollarSign,
  Printer,
  Trash2,
  UserCheck,
  Building,
  Mail,
  Phone,
  Download,
  UserX,
  AlertTriangle
} from 'lucide-react';

export const AdminEmployees = () => {
  const { switchUser } = useAuth();
  const { employees, deleteEmployee, deactivateEmployee } = useHRMS();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [salaryEmployee, setSalaryEmployee] = useState(null);
  const [payslipEmployee, setPayslipEmployee] = useState(null);
  const [deactivatingEmployee, setDeactivatingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);

  // Deactivation form state
  const [exitDate, setExitDate] = useState(new Date().toISOString().split('T')[0]);
  const [exitReason, setExitReason] = useState('Voluntary resignation');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [deactivatingLoading, setDeactivatingLoading] = useState(false);

  const departments = ['ALL', 'Engineering', 'Design & UX', 'Human Resources', 'Marketing', 'Product', 'Sales'];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalItems = filteredEmployees.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Email', 'Role', 'Department', 'Designation', 'Joining Date', 'Status', 'Net Salary'];
    const rows = filteredEmployees.map(e => [
      e.employeeId,
      e.name,
      e.email,
      e.role,
      e.department,
      e.designation,
      e.joiningDate,
      e.status,
      e.salaryStructure?.netSalary || 0
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dayflow-employees-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeactivate = async () => {
    if (!deactivatingEmployee) return;
    setDeactivatingLoading(true);
    try {
      await deactivateEmployee(deactivatingEmployee.employeeId, {
        exitDate,
        reason: exitReason,
        handoverNotes
      });
      setDeactivatingEmployee(null);
    } finally {
      setDeactivatingLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEmployee) return;
    await deleteEmployee(deletingEmployee.employeeId);
    setDeletingEmployee(null);
  };

  const columns = [
    {
      key: 'name',
      label: 'Employee',
      render: (_, emp) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {emp.avatar ? (
            <img src={emp.avatar} alt={emp.name} className="avatar avatar-sm" />
          ) : (
            <div className="avatar avatar-sm">{emp.name.charAt(0)}</div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{emp.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'designation',
      label: 'Role & Title',
      render: (_, emp) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{emp.designation}</div>
          <span className={`badge ${emp.role === 'admin' || emp.role === 'super_admin' ? 'badge-primary' : emp.role === 'manager' ? 'badge-purple' : 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>
            {emp.role?.toUpperCase()}
          </span>
        </div>
      )
    },
    {
      key: 'department',
      label: 'Department',
      render: (dept) => <span style={{ fontWeight: 600 }}>{dept}</span>
    },
    {
      key: 'joiningDate',
      label: 'Joining Date',
      render: (date) => <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{date}</span>
    },
    {
      key: 'salary',
      label: 'Net Monthly',
      render: (_, emp) => (
        <span style={{ fontWeight: 700, color: 'var(--success-text)' }}>
          ${(emp.salaryStructure?.netSalary || 0).toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <Badge
          variant={
            status === 'Active' ? 'success' :
            status === 'On Leave' ? 'purple' :
            status === 'Probation' ? 'warning' : 'danger'
          }
          dot
        >
          {status}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, emp) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setEditingEmployee(emp)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.35rem' }}
            title="Edit Full Profile"
          >
            <Edit size={15} />
          </button>
          <button
            onClick={() => setSalaryEmployee(emp)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.35rem', color: 'var(--primary)' }}
            title="Adjust Compensation Structure"
          >
            <DollarSign size={15} />
          </button>
          <button
            onClick={() => setPayslipEmployee(emp)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.35rem', color: 'var(--success)' }}
            title="Generate & Print Payslip"
          >
            <Printer size={15} />
          </button>
          {emp.status === 'Active' && (
            <button
              onClick={() => setDeactivatingEmployee(emp)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '0.35rem', color: 'var(--warning-text)' }}
              title="Offboarding & Deactivation"
            >
              <UserX size={15} />
            </button>
          )}
          <button
            onClick={() => setDeletingEmployee(emp)}
            className="btn btn-ghost btn-sm"
            style={{ padding: '0.35rem', color: 'var(--danger)' }}
            title="Remove from Directory"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="page-body">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employee Directory</h1>
          <p className="page-subtitle">Manage company staff, organizational structure, compensation, onboarding, and offboarding</p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={handleExportCSV} icon={Download}>
            Export CSV
          </Button>
          <Button onClick={() => setShowAddModal(true)} icon={UserPlus}>
            Onboard New Employee
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, email, designation, or ID..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          {/* Department Filter */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <Filter size={15} /> Dept:
            </div>
            <select
              value={departmentFilter}
              onChange={e => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 1rem' }}
            >
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="form-select"
              style={{ width: 'auto', padding: '0.45rem 1rem' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Probation">Probation</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>
            {filteredEmployees.length} Employee{filteredEmployees.length !== 1 ? 's' : ''} Listed
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin full management directory</span>
        </div>

        <Table
          columns={columns}
          data={paginatedEmployees}
          emptyMessage="No employees found matching the search criteria."
          keyField="employeeId"
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Offboarding Deactivation Modal (Requirement 64) */}
      <Modal
        isOpen={!!deactivatingEmployee}
        onClose={() => setDeactivatingEmployee(null)}
        title="Employee Offboarding & Deactivation"
        subtitle={`Controlled departure process for ${deactivatingEmployee?.name}`}
        maxWidth="520px"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeactivatingEmployee(null)} disabled={deactivatingLoading}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeactivate} loading={deactivatingLoading}>
              Confirm Offboarding
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            background: 'var(--warning-light)',
            color: 'var(--warning-text)',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            display: 'flex',
            gap: '0.65rem'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Historical Data Protected:</strong> Deactivating will revoke login access while preserving all historical attendance, leave approvals, and payroll records intact.
            </div>
          </div>

          <Input
            label="Exit / Termination Date"
            type="date"
            value={exitDate}
            onChange={e => setExitDate(e.target.value)}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Reason for Departure</label>
            <select
              value={exitReason}
              onChange={e => setExitReason(e.target.value)}
              className="form-select"
            >
              <option value="Voluntary resignation">Voluntary Resignation</option>
              <option value="Contract Completion">Contract Completion</option>
              <option value="Career Transition">Career Transition</option>
              <option value="Retirement">Retirement</option>
              <option value="Organizational Restructuring">Organizational Restructuring</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Handover & Knowledge Transfer Notes</label>
            <textarea
              value={handoverNotes}
              onChange={e => setHandoverNotes(e.target.value)}
              placeholder="Enter asset return status, project handover owner, or departure checklist notes..."
              className="form-input"
              rows={3}
            />
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deletingEmployee}
        onClose={() => setDeletingEmployee(null)}
        onConfirm={handleDelete}
        title="Remove Employee from Directory"
        description={`Are you sure you want to permanently remove ${deletingEmployee?.name} (${deletingEmployee?.employeeId}) from the directory?`}
        confirmText="Delete Employee"
      />

      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      <EditProfileModal
        employee={editingEmployee}
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
      />

      <SalaryStructureModal
        employee={salaryEmployee}
        isOpen={!!salaryEmployee}
        onClose={() => setSalaryEmployee(null)}
      />

      <PayslipModal
        employee={payslipEmployee}
        isOpen={!!payslipEmployee}
        onClose={() => setPayslipEmployee(null)}
      />
    </div>
  );
};
