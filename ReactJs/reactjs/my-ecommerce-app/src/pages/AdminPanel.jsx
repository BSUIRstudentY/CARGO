import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import api from '../api/axiosInstance';

function AdminPanel({ section = 'home' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  useEffect(() => {
    if (section === 'orders' && location.pathname === '/admin/orders') {
      setLoading(true);
      setError(null);
      api.get(`/orders?status=${statusFilter}`)
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
    } else if (section === 'catalog' && location.pathname === '/admin/catalog') {
      setLoading(true);
      setError(null);
      api.get('/products')
        .then((response) => {
          if (response.data && response.data.content) {
            setProducts(response.data.content);
          } else {
            setError('Нет данных в ответе сервера');
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching products:', error);
          setError('Ошибка загрузки продуктов: ' + (error.response?.status === 403 ? 'Доступ запрещён (403)' : error.message));
          setLoading(false);
        });
    }
  }, [section, location.pathname, statusFilter]);

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот продукт?')) {
      try {
        await api.delete(`/products/${productId}`);
        setProducts(products.filter((p) => p.id !== productId));
        alert('Продукт успешно удалён');
      } catch (error) {
        setError('Ошибка удаления продукта: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/catalog/${productId}`);
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

  const renderSection = () => {
    switch (section) {
      case 'orders':
        return (
          <div className="h-full">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">Управление заказами</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300">Фильтр по статусу</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full max-w-xs px-3 py-2 bg-gray-600 text-white rounded-lg"
              >
                <option value="ALL">Все</option>
                <option value="PENDING">Ожидает подтверждения</option>
                <option value="VERIFIED">Подтверждён</option>
                
              </select>
            </div>
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
                      <p className={`text-sm ${getStatusColor(order.status)}`}>
                        Статус: {order.status === 'REFUSED' ? `Отклонён (${order.reasonRefusal})` : order.status}
                      </p>
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
                !loading && !error && <p className="text-gray-400">Нет заказов.</p>
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
      case 'catalog':
        return (
          <div className="h-full">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">Каталог продуктов</h2>
            {loading && <p>Загрузка...</p>}
            {error && <p className="text-red-500">{error}</p>}
            <div className="h-[calc(100vh-200px)] overflow-y-auto space-y-4 p-2">
              {products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 hover:bg-gray-700 transition duration-200 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-lg font-semibold text-white">{product.name}</p>
                      <p className="text-sm text-gray-400">Цена: ¥{product.price?.toFixed(2)}</p>
                      <p className="text-sm text-gray-400">URL: {product.url}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProduct(product.id)}
                        className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition duration-200"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200"
                      >
                        Удалить
                      </button>
                      <button
                        onClick={() => navigate(`/admin/catalog/${product.id}`)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
                      >
                        Детали
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                !loading && !error && <p className="text-gray-400">Нет продуктов.</p>
              )}
            </div>
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
      {renderSection()}
      <Outlet />
    </div>
  );
}

export default AdminPanel;