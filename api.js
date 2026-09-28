/**
 * Dayflow HRMS 2.0 Unified API Client
 * Automatically attaches JWT bearer tokens and standardizes responses
 */

const API_BASE = '/api';

export class ApiError extends Error {
  constructor(message, code = 'API_ERROR', status = 500, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.errors = errors;
  }
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('dayflow_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers
  });

  // Handle file downloads directly
  if (options.responseType === 'blob') {
    if (!response.ok) {
      throw new ApiError('Failed to download file', 'DOWNLOAD_FAILED', response.status);
    }
    return response.blob();
  }

  let result;
  try {
    result = await response.json();
  } catch (err) {
    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}: Server Error`, 'HTTP_ERROR', response.status);
    }
    return null;
  }

  if (!response.ok || !result.success) {
    const message = result?.message || `Request failed with status ${response.status}`;
    const code = result?.code || 'ERROR';

    // Auto clear expired/invalid tokens
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('dayflow_token');
      localStorage.removeItem('dayflow_auth_user');
      window.dispatchEvent(new CustomEvent('dayflow:unauthorized'));
    }

    throw new ApiError(message, code, response.status, result?.errors || []);
  }

  return result.data;
}

export const api = {
  // Authentication
  auth: {
    login: (identifier, password) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
    register: (userData) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    me: () =>
      request('/auth/me'),
    changePassword: (currentPassword, newPassword) =>
      request('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
    logout: () =>
      request('/auth/logout', { method: 'POST' }),
    resetDemo: () =>
      request('/auth/reset-demo', { method: 'POST' })
  },

  // Employees
  employees: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/employees${q ? `?${q}` : ''}`);
    },
    getById: (id) =>
      request(`/employees/${id}`),
    create: (employeeData) =>
      request('/employees', { method: 'POST', body: JSON.stringify(employeeData) }),
    update: (id, updates) =>
      request(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }),
    deactivate: (id, exitData) =>
      request(`/employees/${id}/deactivate`, { method: 'POST', body: JSON.stringify(exitData) }),
    delete: (id) =>
      request(`/employees/${id}`, { method: 'DELETE' })
  },

  // Attendance
  attendance: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/attendance${q ? `?${q}` : ''}`);
    },
    getCalendar: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/attendance/calendar${q ? `?${q}` : ''}`);
    },
    checkIn: (employeeId, workMode = 'Office') =>
      request('/attendance/check-in', { method: 'POST', body: JSON.stringify({ employeeId, workMode }) }),
    checkOut: (employeeId) =>
      request('/attendance/check-out', { method: 'POST', body: JSON.stringify({ employeeId }) }),
    requestCorrection: (correctionData) =>
      request('/attendance/correction-request', { method: 'POST', body: JSON.stringify(correctionData) }),
    getCorrections: () =>
      request('/attendance/corrections'),
    reviewCorrection: (id, status, adminNotes = '') =>
      request(`/attendance/corrections/${id}`, { method: 'PATCH', body: JSON.stringify({ status, adminNotes }) })
  },

  // Leaves
  leaves: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/leaves${q ? `?${q}` : ''}`);
    },
    apply: (leaveData) =>
      request('/leaves', { method: 'POST', body: JSON.stringify(leaveData) }),
    approve: (id, adminComment = '') =>
      request(`/leaves/${id}/approve`, { method: 'PATCH', body: JSON.stringify({ adminComment }) }),
    reject: (id, adminComment) =>
      request(`/leaves/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ adminComment }) }),
    cancel: (id) =>
      request(`/leaves/${id}/cancel`, { method: 'DELETE' })
  },

  // Payroll
  payroll: {
    getOverview: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/payroll${q ? `?${q}` : ''}`);
    },
    getRuns: () =>
      request('/payroll/runs'),
    generate: (month, year) =>
      request('/payroll/generate', { method: 'POST', body: JSON.stringify({ month, year }) }),
    lock: (id) =>
      request(`/payroll/lock/${id}`, { method: 'PATCH' }),
    publish: (id) =>
      request(`/payroll/publish/${id}`, { method: 'PATCH' }),
    updateSalary: (employeeId, salaryData) =>
      request(`/payroll/salary/${employeeId}`, { method: 'PATCH', body: JSON.stringify(salaryData) }),
    getPayslips: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/payroll/payslips${q ? `?${q}` : ''}`);
    },
    getPayslipById: (id) =>
      request(`/payroll/payslip/${id}`)
  },

  // Organization
  organization: {
    getSummary: () =>
      request('/organization/summary'),
    getDepartments: () =>
      request('/organization/departments'),
    createDepartment: (deptData) =>
      request('/organization/departments', { method: 'POST', body: JSON.stringify(deptData) }),
    getDesignations: () =>
      request('/organization/designations'),
    createDesignation: (desigData) =>
      request('/organization/designations', { method: 'POST', body: JSON.stringify(desigData) }),
    getShifts: () =>
      request('/organization/shifts'),
    createShift: (shiftData) =>
      request('/organization/shifts', { method: 'POST', body: JSON.stringify(shiftData) })
  },

  // Holidays
  holidays: {
    getAll: (year) =>
      request(`/holidays${year ? `?year=${year}` : ''}`),
    create: (holidayData) =>
      request('/holidays', { method: 'POST', body: JSON.stringify(holidayData) }),
    delete: (id) =>
      request(`/holidays/${id}`, { method: 'DELETE' })
  },

  // Announcements
  announcements: {
    getAll: () =>
      request('/announcements'),
    create: (annData) =>
      request('/announcements', { method: 'POST', body: JSON.stringify(annData) }),
    delete: (id) =>
      request(`/announcements/${id}`, { method: 'DELETE' })
  },

  // Notifications
  notifications: {
    getAll: () =>
      request('/notifications'),
    markRead: (id) =>
      request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () =>
      request('/notifications/read-all', { method: 'POST' })
  },

  // Reports
  reports: {
    getSummary: () =>
      request('/reports/summary'),
    getEmployees: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/reports/employees${q ? `?${q}` : ''}`);
    },
    getAttendance: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/reports/attendance${q ? `?${q}` : ''}`);
    },
    getLeaves: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/reports/leaves${q ? `?${q}` : ''}`);
    },
    getPayroll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/reports/payroll${q ? `?${q}` : ''}`);
    }
  },

  // Audit Logs
  auditLogs: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/audit-logs${q ? `?${q}` : ''}`);
    }
  },

  // Documents
  documents: {
    getAll: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/documents${q ? `?${q}` : ''}`);
    },
    upload: async (formData) => {
      const token = localStorage.getItem('dayflow_token');
      const res = await fetch(`${API_BASE}/documents/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new ApiError(data.message || 'Upload failed', data.code || 'UPLOAD_ERROR', res.status);
      }
      return data.data;
    },
    delete: (id) =>
      request(`/documents/${id}`, { method: 'DELETE' })
  }
};
