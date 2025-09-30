import React, { createContext, useEffect, useMemo, useState } from 'react';
import api from './api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.access_token);
    if (res.username) localStorage.setItem('username', res.username);
    setToken(res.access_token);
  };

  const register = async (username, email, password) => {
    await api.post('/auth/register', { username, email, password });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
  };

  const value = useMemo(() => ({ token, login, register, logout }), [token]);

  useEffect(() => {}, [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


