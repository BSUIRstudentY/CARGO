import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';

function AdminPanel({ section = 'home' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);

  useEffect(() => {
    if (section === 'orders' && location.pathname === '/admin/orders') {
      fetchOrders();
    } else if (section === 'catalog' && location.pathname === '/admin/catalog') {
      fetchProducts();
    }
  }, [section, location.pathname, statusFilter, page]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/orders?page=${page}&size=${pageSize}&status=${statusFilter}`);
      if (response.data) {
        setOrders(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
        setIsLastPage(response.data.last);
      } else {
        setError('Нет данных в ответе сервера');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Ошибка загрузки заказов: ' + (error.response?.status === 403 ? 'Доступ запрещён (403)' : error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/products?page=${page}&size=${pageSize}`);
      if (response.data && response.data.content) {
        setProducts(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
        setIsLastPage(response.data.last);
      } else {
        setError('Нет данных в ответе сервера');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Ошибка загрузки продуктов: ' + (error.response?.status === 403 ? 'Доступ запрещён (403)' : error.message));
    } finally {
      setLoading(false);
    }
  };

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

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'REFUSED':
        return 'text-red-500';
      case 'PENDING':
        return 'text-yellow-500';
      case 'VERIFIED':
        return 'text-green-500';
      case 'RECEIVED':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };

  const renderPagination = () => (
    <div className="flex items-center justify-center gap-3 mt-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 0}
        className="px-3 py-1 bg-gray-700 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600 transition duration-300 text-sm"
      >
        Назад
      </motion.button>
      <span className="text-gray-400 text-sm">
        Страница {page + 1} из {totalPages} (Всего: {totalElements})
      </span>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handlePageChange(page + 1)}
        disabled={isLastPage}
        className="px-3 py-1 bg-gray-700 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600 transition duration-300 text-sm"
      >
        Далее
      </motion.button>
    </div>
  );

  const renderSection = () => {
    switch (section) {
      case 'orders':
        return (
          <div className="space-y-6">
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex justify-between items-center"
            >
              <h2 className="text-xl font-bold text-[var(--accent-color)]">Управление заказами</h2>
              <div className="w-40">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-2 py-1 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] text-sm"
                >
                  <option value="ALL">Все</option>
                  <option value="PENDING">Ожидает</option>
                  <option value="VERIFIED">Подтверждён</option>
                  <option value="REFUSED">Отклонён</option>
                  <option value="RECEIVED">Получен</option>
                </select>
              </div>
            </motion.header>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                  className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[var(--accent-color)]" />
              </motion.div>
            ) : orders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {orders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-lg p-4 shadow-lg border border-gray-700/50"
                  >
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-white truncate" title={order.orderNumber}>
                        #{order.orderNumber}
                      </p>
                      <p
                        className={`text-sm ${getStatusColor(order.status)} truncate`}
                        title={order.status === 'REFUSED' ? `Отклонён (${order.reasonRefusal})` : order.status}
                      >
                        Статус: {order.status === 'REFUSED' ? `Отклонён (${order.reasonRefusal})` : order.status}
                      </p>
                      <p className="text-sm text-gray-400 truncate" title={order.userEmail || 'Неизвестно'}>
                        Клиент: {order.userEmail || 'Неизвестно'}
                      </p>
                      <p className="text-sm text-gray-400">
                        Сумма: ¥{order.totalClientPrice?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-sm text-gray-400">
                        Дата: {new Date(order.dateCreated).toLocaleDateString()}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/admin/orders/check/${order.id}`)}
                        className="w-full px-3 py-1 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-color-dark)] transition duration-300 text-sm"
                      >
                        Проверить
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center text-sm">Нет заказов</p>
            )}

            {renderPagination()}
          </div>
        );
      case 'catalog':
        return (
          <div className="space-y-6">
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-xl font-bold text-[var(--accent-color)]">Каталог продуктов</h2>
            </motion.header>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.3 }}
                  className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[var(--accent-color)]" />
              </motion.div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-lg p-4 shadow-lg border border-gray-700/50"
                  >
                    <div className="w-full h-32 rounded-lg border-2 border-[var(--accent-color)] shadow-md overflow-hidden mb-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/96x96?text=Нет+изображения';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-gray-400 text-xs">
                          Нет изображения
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white truncate" title={product.name}>
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-400">¥{product.price?.toFixed(2)}</p>
                    <p className="text-sm text-gray-400 truncate" title={product.url}>
                      {product.url}
                    </p>
                    <div className="flex gap-2 mt-3 justify-end">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditProduct(product.id)}
                        className="px-2 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition duration-300 text-sm"
                      >
                        Ред.
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteProduct(product.id)}
                        className="px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 text-sm"
                      >
                        Уд.
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/admin/catalog/${product.id}`)}
                        className="px-2 py-1 bg-[var(--accent-color)] text-white rounded-lg hover:bg-[var(--accent-color-dark)] transition duration-300 text-sm"
                      >
                        Дет.
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center text-sm">Нет продуктов</p>
            )}

            {renderPagination()}
          </div>
        );
      case 'support':
        return (
          <div className="space-y-6">
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-xl font-bold text-[var(--accent-color)]">Техническая поддержка</h2>
            </motion.header>
          </div>
        );
      case 'statistics':
        return (
          <div className="space-y-6">
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-xl font-bold text-[var(--accent-color)]">Статистика</h2>
            </motion.header>
          </div>
        );
      case 'suppliers':
        return (
          <div className="space-y-6">
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-xl font-bold text-[var(--accent-color)]">Поставщики</h2>
            </motion.header>
          </div>
        );
      case 'commission':
        return (
          <div className="space-y-6">
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-xl font-bold text-[var(--accent-color)]">Комиссии</h2>
            </motion.header>
          </div>
        );
      case 'home':
      default:
        return (
          <div className="space-y-6">
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-xl font-bold text-[var(--accent-color)]">Главная админ-панель</h2>
            </motion.header>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.3)_0%,transparent_70%)] pointer-events-none" />
      <div className="max-w-5xl mx-auto relative">{renderSection()}</div>
      <Outlet />
    </div>
  );
}

export default AdminPanel;