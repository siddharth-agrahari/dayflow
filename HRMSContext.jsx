import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const HRMSContext = createContext(null);

export const HRMSProvider = ({ children }) => {
  const { currentUser, updateCurrentUserData, token } = useAuth();
  const toast = useToast();

  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [payrollRuns, setPayrollRuns] = useState([]);

  const [loading, setLoading] = useState(true);

  // Load all primary data from backend API
  const refreshData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [
        empRes,
        attRes,
        leaveRes,
        annRes,
        notifRes,
        holRes,
        orgSummary,
        corRes,
        runsRes
      ] = await Promise.allSettled([
        api.employees.getAll(),
        api.attendance.getAll(),
        api.leaves.getAll(),
        api.announcements.getAll(),
        api.notifications.getAll(),
        api.holidays.getAll(),
        api.organization.getSummary(),
        api.attendance.getCorrections(),
        api.payroll.getRuns()
      ]);

      if (empRes.status === 'fulfilled' && empRes.value?.employees) {
        setEmployees(empRes.value.employees);
      }
      if (attRes.status === 'fulfilled' && Array.isArray(attRes.value)) {
        setAttendanceLogs(attRes.value);
      }
      if (leaveRes.status === 'fulfilled' && leaveRes.value?.leaves) {
        setLeaveRequests(leaveRes.value.leaves);
      }
      if (annRes.status === 'fulfilled' && Array.isArray(annRes.value)) {
        setAnnouncements(annRes.value);
      }
      if (notifRes.status === 'fulfilled' && notifRes.value?.notifications) {
        setNotifications(notifRes.value.notifications);
      }
      if (holRes.status === 'fulfilled' && Array.isArray(holRes.value)) {
        setHolidays(holRes.value);
      }
      if (orgSummary.status === 'fulfilled' && orgSummary.value) {
        setDepartments(orgSummary.value.departments || []);
        setShifts(orgSummary.value.shifts || []);
      }
      if (corRes.status === 'fulfilled' && Array.isArray(corRes.value)) {
        setCorrections(corRes.value);
      }
      if (runsRes.status === 'fulfilled' && Array.isArray(runsRes.value)) {
        setPayrollRuns(runsRes.value);
      }
    } catch (err) {
      console.error('Error refreshing HRMS data from API:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshData();
  }, [refreshData, currentUser?.id]);

  // Sync updated employee data to current auth user if matching
  useEffect(() => {
    if (currentUser && employees.length > 0) {
      const match = employees.find(e => e.id === currentUser.id || e.employeeId === currentUser.employeeId);
      if (match && JSON.stringify(match) !== JSON.stringify(currentUser)) {
        updateCurrentUserData(match);
      }
    }
  }, [employees]);

  // 1. Employee Management
  const addEmployee = async (empData) => {
    try {
      const newEmp = await api.employees.create(empData);
      setEmployees(prev => [newEmp, ...prev]);
      toast.success(`Employee ${newEmp.name} successfully onboarded.`);
      await refreshData();
      return newEmp;
    } catch (err) {
      toast.error(err.message || 'Failed to onboard employee.');
      throw err;
    }
  };

  const updateEmployee = async (id, updatedFields) => {
    try {
      const updated = await api.employees.update(id, updatedFields);
      setEmployees(prev => prev.map(e => (e.id === id || e.employeeId === id) ? updated : e));
      if (currentUser?.id === id || currentUser?.employeeId === id) {
        updateCurrentUserData(updated);
      }
      toast.success('Employee profile updated successfully.');
      return updated;
    } catch (err) {
      toast.error(err.message || 'Failed to update employee.');
      throw err;
    }
  };

  const deactivateEmployee = async (id, exitData) => {
    try {
      const result = await api.employees.deactivate(id, exitData);
      setEmployees(prev => prev.map(e => (e.id === id || e.employeeId === id) ? { ...e, status: 'Inactive' } : e));
      toast.warning(`Employee has been deactivated and offboarded.`);
      await refreshData();
      return result;
    } catch (err) {
      toast.error(err.message || 'Failed to deactivate employee.');
      throw err;
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await api.employees.delete(id);
      setEmployees(prev => prev.filter(e => e.id !== id && e.employeeId !== id));
      toast.success('Employee removed from directory.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete employee.');
      throw err;
    }
  };

  // 2. Attendance Management
  const checkIn = async (employeeId, workMode = 'Office') => {
    try {
      const record = await api.attendance.checkIn(employeeId, workMode);
      setAttendanceLogs(prev => {
        const existingIdx = prev.findIndex(l => l.id === record.id || (l.date === record.date && l.employeeId === record.employeeId));
        if (existingIdx >= 0) {
          const copy = [...prev];
          copy[existingIdx] = record;
          return copy;
        }
        return [record, ...prev];
      });
      toast.success(`Clocked in at ${record.checkIn} (${workMode}).`);
      await refreshData();
      return record;
    } catch (err) {
      toast.error(err.message || 'Failed to clock in.');
      throw err;
    }
  };

  const checkOut = async (employeeId) => {
    try {
      const record = await api.attendance.checkOut(employeeId);
      setAttendanceLogs(prev =>
        prev.map(l => (l.id === record.id || (l.date === record.date && l.employeeId === record.employeeId)) ? record : l)
      );
      toast.success(`Clocked out at ${record.checkOut}. Workday duration: ${record.workHours}.`);
      await refreshData();
      return record;
    } catch (err) {
      toast.error(err.message || 'Failed to clock out.');
      throw err;
    }
  };

  const requestAttendanceCorrection = async (correctionData) => {
    try {
      const cor = await api.attendance.requestCorrection(correctionData);
      setCorrections(prev => [cor, ...prev]);
      toast.success('Attendance correction request submitted to HR.');
      return cor;
    } catch (err) {
      toast.error(err.message || 'Failed to submit correction request.');
      throw err;
    }
  };

  const reviewAttendanceCorrection = async (id, status, adminNotes = '') => {
    try {
      await api.attendance.reviewCorrection(id, status, adminNotes);
      setCorrections(prev => prev.map(c => c.id === id ? { ...c, status, adminNotes } : c));
      toast.success(`Correction request ${status.toLowerCase()}.`);
      await refreshData();
    } catch (err) {
      toast.error(err.message || 'Failed to review correction.');
      throw err;
    }
  };

  // 3. Leave Management
  const applyLeave = async (leaveData) => {
    try {
      const newLeave = await api.leaves.apply(leaveData);
      setLeaveRequests(prev => [newLeave, ...prev]);
      toast.success('Leave application submitted for approval.');
      await refreshData();
      return newLeave;
    } catch (err) {
      toast.error(err.message || 'Failed to submit leave request.');
      throw err;
    }
  };

  const updateLeaveStatus = async (leaveId, status, adminComment = '') => {
    try {
      if (status === 'Approved') {
        await api.leaves.approve(leaveId, adminComment);
        toast.success(`Leave request #${leaveId} approved.`);
      } else {
        await api.leaves.reject(leaveId, adminComment);
        toast.warning(`Leave request #${leaveId} rejected.`);
      }
      await refreshData();
    } catch (err) {
      toast.error(err.message || `Failed to update leave status.`);
      throw err;
    }
  };

  const cancelLeave = async (leaveId) => {
    try {
      await api.leaves.cancel(leaveId);
      setLeaveRequests(prev => prev.filter(l => l.id !== leaveId));
      toast.info('Leave request cancelled.');
      await refreshData();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel leave.');
      throw err;
    }
  };

  // 4. Payroll Management
  const updateSalaryStructure = async (employeeId, salaryData) => {
    try {
      const updated = await api.payroll.updateSalary(employeeId, salaryData);
      setEmployees(prev => prev.map(e => (e.id === employeeId || e.employeeId === employeeId) ? updated : e));
      toast.success('Salary structure components updated.');
      await refreshData();
      return updated;
    } catch (err) {
      toast.error(err.message || 'Failed to update salary.');
      throw err;
    }
  };

  const generatePayroll = async (month, year) => {
    try {
      const run = await api.payroll.generate(month, year);
      toast.success(`Payroll run for ${month} ${year} generated successfully.`);
      await refreshData();
      return run;
    } catch (err) {
      toast.error(err.message || 'Failed to generate payroll.');
      throw err;
    }
  };

  const lockPayroll = async (id) => {
    try {
      await api.payroll.lock(id);
      toast.info('Payroll run locked. Further modifications frozen.');
      await refreshData();
    } catch (err) {
      toast.error(err.message || 'Failed to lock payroll.');
      throw err;
    }
  };

  const publishPayroll = async (id) => {
    try {
      await api.payroll.publish(id);
      toast.success('Payroll disbursed and payslips published to all employees.');
      await refreshData();
    } catch (err) {
      toast.error(err.message || 'Failed to publish payroll.');
      throw err;
    }
  };

  // 5. Notifications
  const markNotificationAsRead = async (id) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // 6. Reset Database Demo Data
  const resetSampleData = async () => {
    try {
      await api.auth.resetDemo();
      toast.success('All database records reset to initial production state.');
      await refreshData();
    } catch (err) {
      toast.error(err.message || 'Failed to reset sample data.');
    }
  };

  return (
    <HRMSContext.Provider
      value={{
        employees,
        leaveRequests,
        attendanceLogs,
        announcements,
        notifications,
        holidays,
        departments,
        shifts,
        corrections,
        payrollRuns,
        loading,
        refreshData,
        addEmployee,
        updateEmployee,
        deactivateEmployee,
        deleteEmployee,
        checkIn,
        checkOut,
        requestAttendanceCorrection,
        reviewAttendanceCorrection,
        applyLeave,
        updateLeaveStatus,
        cancelLeave,
        updateSalaryStructure,
        generatePayroll,
        lockPayroll,
        publishPayroll,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetSampleData
      }}
    >
      {children}
    </HRMSContext.Provider>
  );
};

export const useHRMS = () => {
  const ctx = useContext(HRMSContext);
  if (!ctx) {
    throw new Error('useHRMS must be used within an HRMSProvider');
  }
  return ctx;
};
