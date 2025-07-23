import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import api from '../api/axiosInstance';

function AdminPanel({ section = 'home' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (section === 'orders' && location.pathname === '/admin/orders') {
      setLoading(true);
      setError(null);
      api.get('/orders?status=PENDING')
        .then((response) => {
          if (response.data) {
            setOrders(response.data);
          } else {
            setError('Нет данных в ответе сервера');
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching orders:', error);
          setError('Ошибка загрузки заказов: ' + (error.response?.status === 403 ? 'Доступ запрещён (403)' : error.message));
          setLoading(false);
        });
    }
  }, [section, location.pathname]);

  const handleOrders = () => navigate('/admin/orders');
  const handleSupport = () => navigate('/admin/support');
  const handleStatistics = () => navigate('/admin/statistics');
  const handleSuppliers = () => navigate('/admin/suppliers');
  const handleCommission = () => navigate('/admin/commission');

  const renderSection = () => {
    switch (section) {
      case 'orders':
        return (
          <div className="h-full">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">Управление заказами</h2>
            {loading && <p>Загрузка...</p>}
            {error && <p className="text-red-500">{error}</p>}
            <div className="h-[calc(100vh-200px)] overflow-y-auto space-y-4 p-2">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 hover:bg-gray-700 transition duration-200 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-lg font-semibold text-white">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-400">Клиент: {order.userEmail || 'Неизвестно'}</p>
                      <p className="text-sm text-gray-400">Сумма: ¥{order.totalClientPrice?.toFixed(2) || '0.00'}</p>
                      <p className="text-sm text-gray-400">Дата: {new Date(order.dateCreated).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/orders/check/${order.id}`)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
                    >
                      Проверить
                    </button>
                  </div>
                ))
              ) : (
                !loading && !error && <p className="text-gray-400">Нет не подтверждённых заказов.</p>
              )}
            </div>
          </div>
        );
      case 'support':
        return (
          <div>
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">Техническая поддержка</h2>
            <p>Обработка запросов пользователей.</p>
          </div>
        );
      case 'statistics':
        return (
          <div>
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">Статистика</h2>
            <p>Аналитика продаж и активности.</p>
          </div>
        );
      case 'suppliers':
        return (
          <div>
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">Поставщики</h2>
            <p>Управление поставщиками.</p>
          </div>
        );
      case 'commission':
        return (
          <div>
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">Комиссии</h2>
            <p>Настройка комиссий.</p>
          </div>
        );
      case 'home':
      default:
        return (
          <div>
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">Главная админ-панель</h2>
            <p>Добро пожаловать в панель управления!</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[var(--accent-color)] mb-6">Панель администратора</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={handleOrders}
          className="px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white hover:bg-opacity-80 transition duration-300"
        >
          Заказы
        </button>
        <button
          onClick={handleSupport}
          className="px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white hover:bg-opacity-80 transition duration-300"
        >
          Тех. поддержка
        </button>
        <button
          onClick={handleStatistics}
          className="px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white hover:bg-opacity-80 transition duration-300"
        >
          Статистика
        </button>
        <button
          onClick={handleSuppliers}
          className="px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white hover:bg-opacity-80 transition duration-300"
        >
          Поставщики
        </button>
        <button
          onClick={handleCommission}
          className="px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white hover:bg-opacity-80 transition duration-300"
        >
          Комиссии
        </button>
      </div>
      <div className="mt-6">
        {renderSection()}
        <Outlet />
      </div>
    </div>
  );
}

export default AdminPanel;