import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import api from '../api/axiosInstance'; // Импортируем настроенный axios-инстанс

const AdminStats = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    onlineUsers: 0,
    totalClients: 0,
    currentOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stompClient, setStompClient] = useState(null);

  // Инициализация STOMP WebSocket и подписка на /topic/online
  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws/online',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('Connected to STOMP WebSocket');
        client.subscribe('/topic/online', (message) => {
          const onlineCount = parseInt(message.body, 10);
          console.log('Received online count:', onlineCount); // Debugging
          setStats((prevStats) => ({
            ...prevStats,
            onlineUsers: onlineCount,
          }));
        });
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame);
        setError('Ошибка подключения к WebSocket. Обновление онлайна недоступно.');
      },
      onWebSocketClose: () => {
        console.log('WebSocket closed');
        setError('WebSocket соединение закрыто. Попробуйте перезагрузить страницу.');
      },
    });

    client.activate();
    setStompClient(client);

    // Очистка при размонтировании компонента
    return () => {
      if (client.active) {
        client.deactivate();
        console.log('WebSocket disconnected');
      }
    };
  }, []);

  // Получение статистики totalClients и currentOrders через REST API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null); // Сбрасываем ошибку перед новым запросом
        const response = await api.get('/admin/stats');
        setStats((prevStats) => ({
          ...prevStats,
          totalClients: response.data.totalClients,
          currentOrders: response.data.currentOrders,
        }));
      } catch (err) {
        setError('Не удалось загрузить статистику. Попробуйте позже.');
        console.error('Ошибка загрузки статистики:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Обновление каждые 30 секунд
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-white text-center">
        Статистика админ-панели
      </h1>
      {isLoading && (
        <div className="text-center text-gray-400 flex items-center justify-center space-x-2">
          <svg
            className="animate-spin h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Загрузка...</span>
        </div>
      )}
      {error && (
        <div className="text-center text-red-500 mb-4 bg-red-100/10 p-4 rounded-lg">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg transform transition-transform duration-500 hover:scale-105 hover:shadow-xl">
          <h3 className="text-4xl font-bold text-white">{stats.onlineUsers}</h3>
          <p className="text-gray-400 mt-2">Пользователей онлайн</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg transform transition-transform duration-500 hover:scale-105 hover:shadow-xl">
          <h3 className="text-4xl font-bold text-white">{stats.totalClients}</h3>
          <p className="text-gray-400 mt-2">Всего клиентов</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg transform transition-transform duration-500 hover:scale-105 hover:shadow-xl">
          <h3 className="text-4xl font-bold text-white">{stats.currentOrders}</h3>
          <p className="text-gray-400 mt-2">Текущих заказов</p>
        </div>
      </div>
      <div className="mt-12 text-center space-x-4">
        <button
          onClick={() => navigate('/admin/users')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
        >
          Управление пользователями
        </button>
        <button
          onClick={() => navigate('/admin/orders')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 font-semibold"
        >
          Управление заказами
        </button>
      </div>
    </section>
  );
};

export default AdminStats;