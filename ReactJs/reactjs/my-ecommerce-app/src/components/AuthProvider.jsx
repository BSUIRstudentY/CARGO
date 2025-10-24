import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const validateAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      clearAuthState();
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        console.warn('Token expired');
        clearAuthState();
        navigate('/login');
        return;
      }

      // Validate userRole against JWT role
      const jwtRole = decoded.role || 'USER';
      const storedRole = localStorage.getItem('userRole');
      if (storedRole !== jwtRole) {
        console.warn('Role mismatch detected. Updating localStorage.userRole to match JWT.');
        localStorage.setItem('userRole', jwtRole);
      }

      setAuthState({
        isAuthenticated: true,
        user: {
          email: localStorage.getItem('userEmail') || decoded.sub || null,
          username: localStorage.getItem('userName') || null,
          role: jwtRole,
        },
      });
    } catch (error) {
      console.error('Invalid token:', error);
      clearAuthState();
      navigate('/login');
    }
  };

  const clearAuthState = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setAuthState({
      isAuthenticated: false,
      user: { email: null, username: null, role: null },
    });
  };

  useEffect(() => {
    validateAuth();

    const handleStorageChange = (event) => {
      if (event.key === 'userRole' || event.key === 'token') {
        console.log('Storage change detected for userRole or token');
        validateAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const login = async (email, password, role) => {
    try {
      const loginEndpoint = role === 'CARGO' ? '/auth/login-supplier' : '/auth/login-user';
      const response = await api.post(loginEndpoint, { email, password });
      console.log('Login response data:', response.data);
      const { token, email: userEmail, username, userRole } = response.data;
      const decoded = jwtDecode(token);
      const roleToSet = userRole || decoded.role || 'USER';

      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', userEmail);
      localStorage.setItem('userName', username || '');
      localStorage.setItem('userRole', roleToSet);

      setAuthState({
        isAuthenticated: true,
        user: { email: userEmail, username: username || '', role: roleToSet },
      });

      navigate(
        roleToSet === 'CARGO' ? '/supplier-dashboard' :
        roleToSet === 'ADMIN' ? '/admin-dashboard' :
        '/'
      );
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const registerUser = async (username, email, password, referralCode) => {
    try {
      const response = await api.post('/auth/register-user', {
        username,
        email,
        password,
        referralCode,
      });
      console.log('Register user response data:', response.data);
      const { token, email: userEmail, username: userName, userRole } = response.data;
      const decoded = jwtDecode(token);
      const roleToSet = userRole || decoded.role || 'USER';

      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', userEmail);
      localStorage.setItem('userName', userName || username || '');
      localStorage.setItem('userRole', roleToSet);

      setAuthState({
        isAuthenticated: true,
        user: { email: userEmail, username: userName || username || '', role: roleToSet },
      });
      navigate('/');
    } catch (error) {
      console.error('User registration error:', error);
      throw new Error('User registration failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const registerSupplier = async (username, email, password, companyName, description, websiteUrl, address) => {
    try {
      const response = await api.post('/auth/register-supplier', {
        username,
        email,
        password,
        companyName,
        description,
        websiteUrl,
        address,
      });
      console.log('Register supplier response data:', response.data);
      const { token, email: userEmail, username: userName, userRole } = response.data;
      const decoded = jwtDecode(token);
      const roleToSet = userRole || decoded.role || 'CARGO';

      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', userEmail);
      localStorage.setItem('userName', userName || username || '');
      localStorage.setItem('userRole', roleToSet);

      setAuthState({
        isAuthenticated: true,
        user: { email: userEmail, username: userName || username || '', role: roleToSet },
      });
      navigate('/supplier-dashboard');
    } catch (error) {
      console.error('Supplier registration error:', error);
      throw new Error('Supplier registration failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });
      clearAuthState();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      clearAuthState();
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, registerUser, registerSupplier, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}