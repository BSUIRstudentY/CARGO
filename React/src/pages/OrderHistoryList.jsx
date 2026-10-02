import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';
import { PageHeader } from '../components/ui/PageHeader';
import { Alert } from '../components/ui/Alert';
import { Loading } from '../components/ui/Loading';
import { StyledSelect } from '../components/ui/StyledSelect';

function OrderHistoryList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 12;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/orders', {
        params: { 
          status: statusFilter === 'ALL' ? null : statusFilter,
          page: currentPage,
          size: pageSize,
          sort: 'dateCreated,desc'
        },
      });
      if (response?.data) {
        // OrderController возвращает PagedResponse с полями: content, page, size, totalElements, totalPages, last
        const ordersList = Array.isArray(response.data.content) 
          ? response.data.content 
          : (Array.isArray(response.data) ? response.data : []);
        setOrders(ordersList);
        if (response.data.totalPages !== undefined) {
          setTotalPages(response.data.totalPages);
          setTotalItems(response.data.totalElements || 0);
        } else {
          // Fallback для старого формата
          const ordersArray = Array.isArray(response.data.orders) ? response.data.orders : [];
          setOrders(ordersArray);
          setTotalPages(response.data.totalPages || 0);
          setTotalItems(response.data.totalItems || ordersArray.length);
        }
      } else {
        setOrders([]);
        setError('Данные заказов не найдены');
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
      let errorMessage = 'Ошибка загрузки истории заказов';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Доступ запрещён. Проверьте, что вы авторизованы как ADMIN.';
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
  }, [statusFilter, currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'REFUSED':
        return 'text-[#ef4444]';
      case 'PENDING':
        return 'text-[#a78bfa]';
      case 'VERIFIED':
        return 'text-[#00f0ff]';
      case 'RECEIVED':
        return 'text-[#10b981]';
      case 'COMPLETED':
        return 'text-[#10b981]';
      case 'PAID':
        return 'text-[#00f0ff]';
      case 'PROCESSED':
        return 'text-[#a78bfa]';
      default:
        return 'text-[#9ca3af]';
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'REFUSED': 'Отклонён',
      'PENDING': 'Ожидает',
      'VERIFIED': 'Подтверждён',
      'RECEIVED': 'Получен',
      'COMPLETED': 'Завершён',
      'PAID': 'Оплачен',
      'PROCESSED': 'Обработан'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Loading message="Загрузка истории заказов..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageHeader
          kicker="Заказы"
          title="История заказов"
          subtitle={`Найдено заказов: ${totalItems || orders.length}`}
        />

        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')}
            className="mb-6"
          />
        )}

        {/* Фильтры */}
        <div className="mb-6 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
          <StyledSelect
            label="Фильтр по статусу"
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setCurrentPage(0); }}
            options={[
              { value: 'ALL', label: 'Все заказы' },
              { value: 'PENDING', label: 'Ожидает' },
              { value: 'PAID', label: 'Оплачен' },
              { value: 'VERIFIED', label: 'Подтверждён' },
              { value: 'PROCESSED', label: 'Обработан' },
              { value: 'COMPLETED', label: 'Завершён' },
              { value: 'RECEIVED', label: 'Получен' },
              { value: 'REFUSED', label: 'Отклонён' },
            ]}
            placeholder="Статус"
            className="max-w-xs"
          />
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-8 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <p className="text-[#9ca3af] text-lg">Нет заказов в истории</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/admin/orderHistory/${order.id || order.orderNumber}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                      #{order.orderNumber || order.id}
                    </h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(order.status)} bg-[rgba(255,255,255,0.05)]`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#9ca3af]">Дата:</span>
                      <span className="text-[#e5e7eb]">{formatDate(order.dateCreated)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#9ca3af]">Сумма:</span>
                      <span className="text-[#e5e7eb] font-medium">
                        ¥{order.totalClientPrice?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    {order.userEmail && (
                      <div className="flex justify-between">
                        <span className="text-[#9ca3af]">Email:</span>
                        <span className="text-[#e5e7eb] truncate ml-2" title={order.userEmail}>
                          {order.userEmail}
                        </span>
                      </div>
                    )}
                    {order.status === 'REFUSED' && order.reasonRefusal && (
                      <div className="pt-2 mt-2 border-t border-[rgba(255,255,255,0.1)]">
                        <span className="text-[#ef4444] text-xs">
                          Причина: {order.reasonRefusal}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Назад
                </button>
                <span className="px-4 py-2 text-[#9ca3af]">
                  Страница {currentPage + 1} из {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Вперёд
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default OrderHistoryList;
