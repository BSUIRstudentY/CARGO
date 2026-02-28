import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axiosInstance';
import { authStorage } from '../utils/authStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await authStorage.getToken();
      const userData = await authStorage.getUser();
      const userRole = await authStorage.getUserRole();

      if (token && userData) {
        setUser({
          ...userData,
          role: userRole || 'USER',
        });
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, email: userEmail, username } = response.data;
      
      // Декодируем токен для получения роли
      let role = 'USER';
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          role = payload.role || 'USER';
        }
      } catch (e) {
        console.warn('Could not decode token for role');
      }
      
      const userData = { email: userEmail, username, role };
      
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('userRole', role);
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Ошибка входа' 
      };
    }
  };

  const register = async (email, password, username, referralCode) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        username,
        referralCode,
      });
      
      const { token } = response.data;
      
      // Декодируем токен для получения роли
      let role = 'USER';
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          role = payload.role || 'USER';
        }
      } catch (e) {
        console.warn('Could not decode token for role');
      }
      
      const userData = { email, username, role };

      await authStorage.setToken(token);
      await authStorage.setUser(userData);
      await authStorage.setUserRole(role);

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Ошибка регистрации' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await authStorage.clear();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
