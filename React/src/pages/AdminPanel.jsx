import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Loading } from '../components/ui/Loading';
import { PageHeader } from '../components/ui/PageHeader';
import Tilt from 'react-parallax-tilt';
import { ShoppingCartIcon, CubeIcon, CheckCircleIcon, XCircleIcon, ClockIcon, ArrowLeftIcon, ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

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
    {
      try {
        await api.delete(`/products/${productId}`);
        setProducts(products.filter((p) => p.id !== productId));
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
        return 'text-red-500 bg-red-500/20 border-red-500/50';
      case 'PENDING':
        return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/50';
      case 'VERIFIED':
        return 'text-green-500 bg-green-500/20 border-green-500/50';
      case 'RECEIVED':
        return 'text-blue-500 bg-blue-500/20 border-blue-500/50';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/50';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'REFUSED':
        return 'Отклонён';
      case 'PENDING':
        return 'Ожидает';
      case 'VERIFIED':
        return 'Подтверждён';
      case 'RECEIVED':
        return 'Получен';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'REFUSED':
        return <XCircleIcon className="w-4 h-4" />;
      case 'PENDING':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const renderPagination = () => (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 0}
      >
        <ArrowLeftIcon className="w-4 h-4 inline mr-2" />
        Назад
      </Button>
      <span className="text-[#cdcdcd] text-sm font-medium">
        Страница {page + 1} из {totalPages} (Всего: {totalElements})
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(page + 1)}
        disabled={isLastPage}
      >
        Далее
        <ArrowRightIcon className="w-4 h-4 inline ml-2" />
      </Button>
    </div>
  );

  const renderSection = () => {
    switch (section) {
      case 'orders':
        return (
          <div className="space-y-8">
            <PageHeader 
              title="Управление заказами"
              subtitle={`Найдено заказов: ${totalElements}`}
            />

            {/* Filter */}
            <Card>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#cdcdcd]">Фильтр по статусу:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(0);
                  }}
                  className="select-dark px-4 py-2 bg-[#1a1a1a] border-2 border-[#333333] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e81e2d]/50 transition-all"
                >
                  <option value="ALL">Все</option>
                  <option value="PENDING">Ожидает</option>
                  <option value="VERIFIED">Подтверждён</option>
                  <option value="REFUSED">Отклонён</option>
                  <option value="RECEIVED">Получен</option>
                </select>
              </div>
            </Card>

            <AnimatePresence>
              {error && (
                <Alert 
                  type="error" 
                  message={error} 
                  onClose={() => setError('')}
                />
              )}
            </AnimatePresence>

            {loading ? (
              <Loading message="Загрузка заказов..." />
            ) : orders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000}>
                      <Card className="group hover:border-[#e81e2d]/50 transition-all">
                        <div className="space-y-4">
                          {/* Order Header */}
                          <div className="flex items-start justify-between border-b border-[#333333] pb-3">
                            <div>
                              <h3 className="text-lg font-bold text-white mb-1">
                                #{order.orderNumber}
                              </h3>
                              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span>{getStatusLabel(order.status)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Order Info */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-[#808080]">Клиент:</span>
                              <span className="text-[#cdcdcd] font-medium truncate" title={order.userEmail || 'Неизвестно'}>
                                {order.userEmail || 'Неизвестно'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-[#808080]">Сумма:</span>
                              <span className="text-white font-bold">¥{order.totalClientPrice?.toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-[#808080]">Дата:</span>
                              <span className="text-[#cdcdcd]">
                                {new Date(order.dateCreated).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                            {order.status === 'REFUSED' && order.reasonRefusal && (
                              <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
                                {order.reasonRefusal}
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => navigate(`/admin/orders/check/${order.id}`)}
                            className="w-full"
                          >
                            <MagnifyingGlassIcon className="w-4 h-4 inline mr-2" />
                            Проверить заказ
                          </Button>
                        </div>
                      </Card>
                    </Tilt>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <ShoppingCartIcon className="w-16 h-16 text-[#808080] mx-auto mb-4" />
                  <p className="text-[#cdcdcd] text-lg">Нет заказов</p>
                  <p className="text-[#808080] text-sm mt-2">Заказы с выбранным статусом отсутствуют</p>
                </div>
              </Card>
            )}

            {renderPagination()}
          </div>
        );
      case 'catalog':
        return (
          <div className="space-y-8">
            <PageHeader 
              title="Каталог продуктов"
              subtitle={`Найдено товаров: ${totalElements}`}
            />

            <AnimatePresence>
              {error && (
                <Alert 
                  type="error" 
                  message={error} 
                  onClose={() => setError('')}
                />
              )}
            </AnimatePresence>

            {loading ? (
              <Loading message="Загрузка товаров..." />
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000}>
                      <Card className="group hover:border-[#e81e2d]/50 transition-all">
                        <div className="space-y-4">
                          {/* Product Image */}
                          <div className="w-full h-48 bg-[#1a1a1a] rounded-lg border-2 border-[#333333] flex items-center justify-center overflow-hidden group-hover:border-[#e81e2d]/50 transition-colors">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-contain p-4"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/128x128?text=Нет+изображения';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#808080] text-sm">
                                Нет изображения
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="space-y-2">
                            <h3 className="text-base font-bold text-white line-clamp-2 group-hover:text-[#e81e2d] transition-colors" title={product.name}>
                              {product.name}
                            </h3>
                            <p className="text-lg font-bold bg-gradient-to-r from-[#e81e2d] to-[#ff4757] bg-clip-text text-transparent">
                              ¥{product.price?.toFixed(2) || '0.00'}
                            </p>
                            {product.url && (
                              <p className="text-xs text-[#808080] truncate" title={product.url}>
                                {product.url}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2 border-t border-[#333333]">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEditProduct(product.id)}
                              className="flex-1"
                            >
                              Ред.
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              Уд.
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => navigate(`/admin/catalog/${product.id}`)}
                              className="flex-1"
                            >
                              Дет.
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Tilt>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <div className="text-center py-12">
                  <CubeIcon className="w-16 h-16 text-[#808080] mx-auto mb-4" />
                  <p className="text-[#cdcdcd] text-lg">Нет товаров</p>
                  <p className="text-[#808080] text-sm mt-2">Товары отсутствуют в каталоге</p>
                </div>
              </Card>
            )}

            {renderPagination()}
          </div>
        );
      case 'support':
        return (
          <div className="space-y-8">
            <PageHeader 
              title="Техническая поддержка"
              subtitle="Управление обращениями пользователей"
            />
            <Card>
              <div className="text-center py-12">
                <p className="text-[#cdcdcd]">Раздел в разработке</p>
              </div>
            </Card>
          </div>
        );
      case 'statistics':
        return (
          <div className="space-y-8">
            <PageHeader 
              title="Статистика"
              subtitle="Аналитика и отчёты"
            />
            <Card>
              <div className="text-center py-12">
                <p className="text-[#cdcdcd]">Раздел в разработке</p>
              </div>
            </Card>
          </div>
        );
      case 'suppliers':
        return (
          <div className="space-y-8">
            <PageHeader 
              title="Поставщики"
              subtitle="Управление поставщиками"
            />
            <Card>
              <div className="text-center py-12">
                <p className="text-[#cdcdcd]">Раздел в разработке</p>
              </div>
            </Card>
          </div>
        );
      case 'commission':
        return (
          <div className="space-y-8">
            <PageHeader 
              title="Комиссии"
              subtitle="Настройка комиссий"
            />
            <Card>
              <div className="text-center py-12">
                <p className="text-[#cdcdcd]">Раздел в разработке</p>
              </div>
            </Card>
          </div>
        );
      case 'home':
      default:
        return (
          <div className="space-y-8">
            <PageHeader 
              title="Главная админ-панель"
              subtitle="Добро пожаловать в панель администратора"
            />
            <Card>
              <div className="text-center py-12">
                <p className="text-[#cdcdcd]">Выберите раздел для работы</p>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto relative z-10">
        {renderSection()}
      </div>
      <Outlet />
    </div>
  );
}

export default AdminPanel;
