import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

function OrderHistoryList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/order-history', {
        params: { status: statusFilter },
      });
      if (response?.data) {
        setOrders(response.data);
      } else {
        setError('Данные заказов не найдены');
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
      let errorMessage = 'Ошибка загрузки истории заказов';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Доступ запрещён (403). Проверьте, что вы авторизованы как ADMIN или пользователь.';
        } else {
          errorMessage = error.response.data?.message || error.message || 'Неизвестная ошибка';
        }
      } else {
        errorMessage = error.message || 'Ошибка сети';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'REFUSED':
        return 'text-red-500';
      case 'PENDING':
        return 'text-white';
      case 'VERIFIED':
        return 'text-green-500';
      case 'RECEIVED':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) return <p className="text-center text-gray-400 animate-pulse">Загрузка...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-gray-800 min-h-screen text-white">
      <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">История заказов</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">Фильтр по статусу</label>
        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="w-full max-w-xs px-3 py-2 bg-gray-600 text-white rounded-lg"
        >
          <option value="ALL">Все</option>
          <option value="REFUSED">Отклонён</option>
          <option value="RECEIVED">Получен</option>
        </select>
      </div>
      {orders.length === 0 ? (
        <p className="text-center text-gray-400">Нет заказов в истории</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => navigate(`/admin/orderHistory/${order.id}`)}
            >
              <h3 className="text-lg font-semibold text-[var(--accent-color)]">
                Заказ #{order.orderNumber}
              </h3>
              <p className={`text-sm ${getStatusColor(order.status)}`}>
                Статус: {order.status === 'REFUSED' ? `Отклонён (${order.reasonRefusal})` : order.status}
              </p>
              <p className="text-sm text-gray-400">
                Дата: {new Date(order.dateCreated).toLocaleString()}
              </p>
              <p className="text-sm text-gray-400">Сумма: ¥{order.totalClientPrice?.toFixed(2)}</p>
              <p className="text-sm text-gray-400">Email: {order.userEmail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistoryList;