import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: !!localStorage.getItem('token'),
    user: {
      email: localStorage.getItem('userEmail') || null,
      username: localStorage.getItem('userName') || null,
      role: localStorage.getItem('userRole') || null,
    },
  });

  useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          if (decoded.exp && decoded.exp < currentTime) {
            localStorage.removeItem('token');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            setAuthState({ isAuthenticated: false, user: { email: null, username: null, role: null } });
            return;
          }
          const role = decoded.role || 'USER';
          setAuthState((prev) => ({
            ...prev,
            user: {
              email: localStorage.getItem('userEmail') || decoded.sub || null,
              username: localStorage.getItem('userName') || null,
              role: role,
            },
            isAuthenticated: true,
          }));
          localStorage.setItem('userRole', role);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          localStorage.removeItem('userRole');
          setAuthState({ isAuthenticated: false, user: { email: null, username: null, role: null } });
        }
      } else {
        setAuthState({ isAuthenticated: false, user: { email: null, username: null, role: null } });
      }
    };

    validateAuth();

    const handleStorageChange = () => {
      validateAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response data:', response.data);
      const { token, email: userEmail, username } = response.data;
      if (!username) {
        console.warn('Username not found in response, using fallback');
      }
      const decoded = jwtDecode(token);
      const role = decoded.role || 'USER';
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', userEmail);
      localStorage.setItem('userName', username || '');
      localStorage.setItem('userRole', role);
      setAuthState({ isAuthenticated: true, user: { email: userEmail, username: username || '', role } });
    } catch (error) {
      throw new Error('Login failed');
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
      console.log('Register response data:', response.data);
      const { token, email: userEmail, username: userName } = response.data;
      if (!userName) {
        console.warn('Username not found in response, using provided username');
      }
      const decoded = jwtDecode(token);
      const userRole = decoded.role || 'USER';
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', userEmail);
      localStorage.setItem('userName', userName || username || '');
      localStorage.setItem('userRole', userRole);
      setAuthState({ isAuthenticated: true, user: { email: userEmail, username: userName || username || '', role: userRole } });
    } catch (error) {
      throw new Error('Registration failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true }); // Вызов серверного logout
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      setAuthState({ isAuthenticated: false, user: { email: null, username: null, role: null } });
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      // Продолжаем очистку на клиенте даже при ошибке сервера
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      setAuthState({ isAuthenticated: false, user: { email: null, username: null, role: null } });
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