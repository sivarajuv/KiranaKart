import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE = 'http://localhost:8080/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('fm_token');
    const savedUser = localStorage.getItem('fm_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    setLoading(false);
  }, []);

  // Intercept 401 responses and auto-logout
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          const url = err.config?.url || '';
          if (!url.includes('/auth/login')) {
            logout();
          }
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const login = async (username, password) => {
    const res = await axios.post(`${API_BASE}/auth/login`, { username, password });
    const { token, user } = res.data;
    setToken(token);
    setUser(user);
    localStorage.setItem('fm_token', token);
    localStorage.setItem('fm_user', JSON.stringify(user));
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return user;
  };

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fm_token');
    localStorage.removeItem('fm_user');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const isAdmin = () => user?.role === 'ADMIN';
  const isCashier = () => user?.role === 'CASHIER';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin, isCashier }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
