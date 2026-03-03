import React, { createContext, useContext, useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import api from '../api/axiosInstance';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { authStorage } from '../utils/authStorage';

function normalizeRole(role) {
  const r = (role || 'USER').toString().toUpperCase();
  return r === 'ADMIN' ? 'ADMIN' : 'USER';
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: {
      email: localStorage.getItem('userEmail') || null,
      username: localStorage.getItem('userName') || null,
      role: localStorage.getItem('userRole') || null,
    },
  });
  const navigate = useNavigate();

  const clearSession = () => {
    authStorage.removeToken();
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setAuthState({ isAuthenticated: false, user: { email: null, username: null, role: null } });
  };

  useEffect(() => {
    const validateAuth = async () => {
      authStorage.removeToken(); // миграция: JWT только в httpOnly-куке
      try {
        const res = await api.get('/users/me');
        if (res.data && res.status === 200) {
          const d = res.data;
          const user = {
            email: d.email ?? null,
            username: d.username ?? null,
            role: normalizeRole(d.role),
          };
          localStorage.setItem('userEmail', user.email || '');
          localStorage.setItem('userName', user.username || '');
          localStorage.setItem('userRole', user.role || '');
          setAuthState({ isAuthenticated: true, user });
        } else {
          clearSession();
        }
      } catch {
        clearSession();
      }
    };

    validateAuth();

    const handleStorageChange = () => {
      validateAuth();
    };
    const handleSessionInvalid = () => {
      clearSession();
      navigate('/', { replace: true });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:sessionInvalid', handleSessionInvalid);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:sessionInvalid', handleSessionInvalid);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { email: userEmail, username, role } = response.data;
      authStorage.removeToken(); // JWT только в httpOnly-куке, в localStorage не храним
      const normalizedRole = normalizeRole(role);
      localStorage.setItem('userEmail', userEmail || '');
      localStorage.setItem('userName', username || '');
      localStorage.setItem('userRole', normalizedRole);
      // Обновляем стейт синхронно до навигации, чтобы Layout сразу увидел правильную роль (админ/пользователь)
      flushSync(() => {
        setAuthState({
          isAuthenticated: true,
          user: { email: userEmail, username: username || '', role: normalizedRole },
        });
      });
      navigate('/');
    } catch (error) {
      // Пробрасываем ошибку, чтобы страница логина показала сообщение (например "Invalid email or password")
      throw error;
    }
  };

  const register = async (username, email, password, referralCode) => {
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        referralCode,
      });
      const { token } = response.data || {};
      const userRole = token ? (() => { try { return normalizeRole(jwtDecode(token).role); } catch { return 'USER'; } })() : 'USER';
      authStorage.removeToken();
      localStorage.setItem('userEmail', email || '');
      localStorage.setItem('userName', username || '');
      localStorage.setItem('userRole', userRole);
      flushSync(() => {
        setAuthState({ isAuthenticated: true, user: { email, username, role: userRole } });
      });
      navigate('/');
    } catch (error) {
      throw new Error('Registration failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      clearSession();
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}