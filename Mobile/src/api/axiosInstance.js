import { Platform } from 'react-native';
import { authStorage } from '../utils/authStorage';

// Базовый URL API
const getBaseURL = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8080/api';
    }
    return 'http://localhost:8080/api';
  }
  return 'https://fluvion.by/api';
};

const BASE_URL = getBaseURL();
console.log('API BASE_URL:', BASE_URL);

// Простой API клиент без кэширования (React Query сам кэширует)
const api = {
  get: async (url, config = {}) => {
    return api.request('GET', url, null, config);
  },

  post: async (url, data, config = {}) => {
    return api.request('POST', url, data, config);
  },

  put: async (url, data, config = {}) => {
    return api.request('PUT', url, data, config);
  },

  patch: async (url, data, config = {}) => {
    return api.request('PATCH', url, data, config);
  },

  delete: async (url, config = {}) => {
    return api.request('DELETE', url, null, config);
  },

  request: async (method, url, data = null, config = {}) => {
    try {
      // Получаем токен
      let token = null;
      try {
        token = await AsyncStorage.getItem('token');
      } catch (e) {
        console.warn('AsyncStorage error:', e);
      }
      
      // Формируем полный URL
      const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
      
      // Настройки запроса
      const headers = {
        'Content-Type': 'application/json',
        ...(config.headers || {}),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const requestConfig = {
        method,
        headers,
      };

      // Добавляем тело запроса
      if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        requestConfig.body = JSON.stringify(data);
      }

      // Добавляем параметры для GET
      let finalUrl = fullUrl;
      if (config.params && method === 'GET') {
        const params = new URLSearchParams();
        Object.keys(config.params).forEach(key => {
          if (config.params[key] != null) {
            params.append(key, config.params[key]);
          }
        });
        const queryString = params.toString();
        if (queryString) {
          finalUrl = `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}${queryString}`;
        }
      }

      console.log(`[API] ${method} ${finalUrl}`);
      
      const response = await fetch(finalUrl, requestConfig);
      return handleResponse(response);
    } catch (error) {
      console.error('[API] Request error:', error);
      throw error;
    }
  },
};

// Обработка ответа
const handleResponse = async (response) => {
  let data = {};
  
  try {
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }
  } catch (error) {
    console.error('[API] Parse error:', error);
    data = {};
  }

  const result = {
    data: data || {},
    status: response.status || 200,
    statusText: response.statusText || 'OK',
    headers: response.headers || {},
  };

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed: ${response.status}`);
    error.response = result;
    error.status = response.status;
    
    // Обработка 401/403 — очищаем безопасное хранилище
    if (response.status === 401 || response.status === 403) {
      try {
        await authStorage.clear();
      } catch (e) {
        console.warn('Error clearing auth:', e);
      }
    }
    
    throw error;
  }

  return result;
};

export default api;
