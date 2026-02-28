import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';
import { authStorage } from '../utils/authStorage';

// Создаём QueryClient для кэша
const queryClient = new QueryClient();

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // отправляем httpOnly-куку с каждым запросом
});

// Request interceptor: для мобильного приложения — заголовок Authorization; для веба — кука (withCredentials)
api.interceptors.request.use(
  (config) => {
    const token = authStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 401/403: сессия недействительна — сбрасываем состояние и мягко редиректим на главную (без модалки)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const url = (error.config?.url ?? '').replace(/^\//, '');
      if (!/users\/me\/?$/.test(url)) {
        window.dispatchEvent(new CustomEvent('auth:sessionInvalid'));
      }
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
