// src/api/nonCacheApi.js
import axios from 'axios';
import { authStorage } from '../utils/authStorage';

const nonCacheApi = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Добавляем токен автоматически (из sessionStorage)
nonCacheApi.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401/403 → нет или неверная кука: выходим из аккаунта (не для /users/me — тот обрабатывает AuthProvider при загрузке)
nonCacheApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const url = (error.config?.url ?? '').replace(/^\//, '');
      const isInitialCheck = /users\/me\/?$/.test(url);
      if (!isInitialCheck) {
        authStorage.removeToken();
        window.dispatchEvent(new CustomEvent('auth:sessionInvalid'));
      }
    }
    return Promise.reject(error);
  }
);

export default nonCacheApi;