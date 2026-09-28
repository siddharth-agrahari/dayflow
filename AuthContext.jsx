import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('dayflow_auth_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('dayflow_token'));
  const [loading, setLoading] = useState(true);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('dayflow_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dayflow_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Verify session on mount or when token changes
  const verifySession = useCallback(async () => {
    const storedToken = localStorage.getItem('dayflow_token');
    if (storedToken) {
      try {
        const data = await api.auth.me();
        if (data?.employee) {
          setCurrentUser(data.employee);
          localStorage.setItem('dayflow_auth_user', JSON.stringify(data.employee));
        }
      } catch (err) {
        console.warn('Session verification failed, logging in default demo persona:', err.message);
        // If stored token expired, fallback to logging in Eleanor Vance (Admin)
        await loginDefaultPersona();
      }
    } else {
      // Default auto-login to Eleanor Vance (Super Admin) for immediate rich exploration
      await loginDefaultPersona();
    }
    setLoading(false);
  }, []);

  const loginDefaultPersona = async () => {
    try {
      const res = await api.auth.login('admin@dayflow.com', 'password123');
      if (res?.token && res?.employee) {
        setToken(res.token);
        setCurrentUser(res.employee);
        localStorage.setItem('dayflow_token', res.token);
        localStorage.setItem('dayflow_auth_user', JSON.stringify(res.employee));
      }
    } catch (err) {
      console.error('Failed default persona login:', err);
    }
  };

  useEffect(() => {
    verifySession();

    const handleUnauthorized = () => {
      setCurrentUser(null);
      setToken(null);
      localStorage.removeItem('dayflow_token');
      localStorage.removeItem('dayflow_auth_user');
    };

    window.addEventListener('dayflow:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('dayflow:unauthorized', handleUnauthorized);
  }, [verifySession]);

  const login = async (identifier, password) => {
    try {
      const data = await api.auth.login(identifier, password);
      if (data?.token && data?.employee) {
        setToken(data.token);
        setCurrentUser(data.employee);
        localStorage.setItem('dayflow_token', data.token);
        localStorage.setItem('dayflow_auth_user', JSON.stringify(data.employee));
        return { success: true, user: data.employee };
      }
      return { success: false, error: 'Login failed to return credentials.' };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid credentials.' };
    }
  };

  const register = async (userData) => {
    try {
      const data = await api.auth.register(userData);
      if (data?.token && data?.employee) {
        setToken(data.token);
        setCurrentUser(data.employee);
        localStorage.setItem('dayflow_token', data.token);
        localStorage.setItem('dayflow_auth_user', JSON.stringify(data.employee));
        return { success: true, user: data.employee };
      }
      return { success: false, error: 'Registration failed.' };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) { /* ignore */ }
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('dayflow_token');
    localStorage.removeItem('dayflow_auth_user');
  };

  // Switch persona using real backend login
  const switchUser = async (user) => {
    const identifier = user.email || user.employeeId || user.id;
    try {
      const data = await api.auth.login(identifier, 'password123');
      if (data?.token && data?.employee) {
        setToken(data.token);
        setCurrentUser(data.employee);
        localStorage.setItem('dayflow_token', data.token);
        localStorage.setItem('dayflow_auth_user', JSON.stringify(data.employee));
      }
    } catch (err) {
      console.error('Failed to switch persona:', err);
    }
  };

  const updateCurrentUserData = (updatedFields) => {
    setCurrentUser(prev => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem('dayflow_auth_user', JSON.stringify(merged));
      return merged;
    });
  };

  const changePassword = async (currentPassword, newPassword) => {
    return api.auth.changePassword(currentPassword, newPassword);
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isManager = currentUser?.role === 'manager';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        token,
        loading,
        login,
        register,
        logout,
        switchUser,
        updateCurrentUserData,
        changePassword,
        theme,
        toggleTheme,
        isAdmin,
        isManager
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
