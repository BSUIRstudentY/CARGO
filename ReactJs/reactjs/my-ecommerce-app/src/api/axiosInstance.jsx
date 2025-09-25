import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';

// Создаём QueryClient для кэша
const queryClient = new QueryClient();

const api = axios.create({
  baseURL: 'https://fluvion.by/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — добавляем токен
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — обрабатываем 403
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403 && !localStorage.getItem('token')) {
      const event = new CustomEvent('authError', {
        detail: { message: 'Пожалуйста, войдите или зарегистрируйтесь для продолжения.' },
      });
      window.dispatchEvent(event);
    }
    return Promise.reject(error);
  }
);

// === Оборачиваем методы для кэширования GET через React Query ===
const methods = ['get', 'delete', 'post', 'put', 'patch'];

const apiWithCache = {};

methods.forEach((method) => {
  apiWithCache[method] = async function (...args) {
    const isGet = method === 'get';
    const url = args[0];
    const config = args[1] || {};

    if (isGet) {
      // Для GET-запросов пробуем взять из React Query кэша
      const queryKey = [url, config.params || {}];
      const cached = queryClient.getQueryData(queryKey);
      if (cached) return { data: cached };

      // Если нет кэша, делаем реальный запрос
      const response = await api[method](...args);
      queryClient.setQueryData(queryKey, response.data);
      return response;
    } else {
      // Для мутаций просто выполняем запрос и инвалидируем кэш для URL
      const response = await api[method](...args);
      queryClient.invalidateQueries([url]);
      return response;
    }
  };
});

export default apiWithCache;
export { queryClient };
