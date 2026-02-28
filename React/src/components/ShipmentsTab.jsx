import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  ShoppingBagIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/solid';
import api from '../api/axiosInstance';
import { Button } from './ui/Button';

const ShipmentsTab = ({ handleViewOrderDetails, handlePay, refresh }) => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const observer = useRef();
  const containerRef = useRef(null);
  const isInitialLoad = useRef(true);

  const debounce = useCallback((func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  const lastOrderElementRef = useCallback(
    (node) => {
      if (loading || !node) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            debounce(() => setPage((prevPage) => prevPage + 1), 300)();
          }
        },
        {
          root: containerRef.current,
          rootMargin: '100px',
          threshold: 0.1,
        }
      );
      observer.current.observe(node);
    },
    [loading, hasMore, debounce]
  );

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/orders?page=${page - 1}&size=10&sort=dateCreated,desc`);
        const { content, last } = response.data;

        setOrders((prevOrders) =>
          page === 1 ? content : [...prevOrders, ...content]
        );
        setHasMore(!last);
        setError(null);
      } catch (err) {
        console.error('API Error:', err);
        setError(
          'Ошибка загрузки заказов: ' +
            (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
        isInitialLoad.current = false;
      }
    };

    fetchOrders();
  }, [page, refresh]);

  const getStatusDisplay = (status) => {
    const statusConfig = {
      PENDING: {
        text: 'Ожидает подтверждения',
        color: 'text-yellow-300',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/50',
        icon: <ClockIcon className="w-4 h-4" />
      },
      VERIFIED: {
        text: 'Подтверждён',
        color: 'text-blue-300',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/50',
        icon: <CheckCircleIcon className="w-4 h-4" />
      },
      PAID: {
        text: 'Оплачен',
        color: 'text-emerald-300',
        bgColor: 'bg-emerald-500/20',
        borderColor: 'border-emerald-500/50',
        icon: <CheckCircleIcon className="w-4 h-4" />
      },
      PROCESSED: {
        text: 'Обработан',
        color: 'text-purple-300',
        bgColor: 'bg-purple-500/20',
        borderColor: 'border-purple-500/50',
        icon: <CheckCircleIcon className="w-4 h-4" />
      },
      COMPLETED: {
        text: 'Завершён',
        color: 'text-green-300',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/50',
        icon: <CheckCircleIcon className="w-4 h-4" />
      },
      CANCELLED: {
        text: 'Отменён',
        color: 'text-[#9ca3af]',
        bgColor: 'bg-[rgba(156,163,175,0.15)]',
        borderColor: 'border-[rgba(156,163,175,0.3)]',
        icon: <XCircleIcon className="w-4 h-4" />
      },
      REFUSED: {
        text: 'Отклонён',
        color: 'text-[#9ca3af]',
        bgColor: 'bg-[rgba(156,163,175,0.15)]',
        borderColor: 'border-[rgba(156,163,175,0.3)]',
        icon: <XCircleIcon className="w-4 h-4" />
      },
      REFUNDED: {
        text: 'Возвращён',
        color: 'text-orange-300',
        bgColor: 'bg-orange-500/20',
        borderColor: 'border-orange-500/50',
        icon: <XCircleIcon className="w-4 h-4" />
      }
    };
    return statusConfig[status] || {
      text: status,
      color: 'text-[#808080]',
      bgColor: 'bg-[#808080]/20',
      borderColor: 'border-[#808080]/50',
      icon: <ClockIcon className="w-4 h-4" />
    };
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent flex items-center gap-3">
          <ShoppingBagIcon className="w-8 h-8 text-[#00f0ff]" />
          Заказы
        </h2>
      </motion.div>

      {/* Ошибка */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-xl text-[#ef4444] text-center"
        >
          {error}
        </motion.div>
      )}

      {/* Список заказов */}
      <div
        ref={containerRef}
        className="space-y-4 max-h-[60vh] overflow-y-auto overflow-x-hidden scrollbar-hide"
      >
        {orders.length > 0 ? (
          orders.map((order, index) => {
            const totalChinaDeliveryPrice =
              order.items?.reduce((sum, item) => {
                return sum + (item.chinaDeliveryPrice || 0) * (item.quantity || 1);
              }, 0) || 0;

            const totalOrderPrice = (order.totalClientPrice || 0) + totalChinaDeliveryPrice;
            const statusDisplay = getStatusDisplay(order.status);

            return (
              <div
                key={order.id}
                ref={index === orders.length - 1 ? lastOrderElementRef : null}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  onClick={() => handleViewOrderDetails(order.id)}
                >
                  <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[#00f0ff]/50 hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 cursor-pointer group overflow-x-hidden overflow-y-hidden">
                      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
                        {/* Левая часть - основная информация */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#00f0ff] via-[#a78bfa] to-[#10b981] rounded-lg flex items-center justify-center">
                              <ShoppingBagIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-[#e5e7eb] group-hover:text-[#00f0ff] transition-colors">
                                Заказ #{order.orderNumber}
                              </h3>
                              <p className="text-sm text-[#808080]">
                                {order.items?.length || 0} {((order.items?.length || 0) === 1) ? 'товар' : ((order.items?.length || 0) >= 2 && (order.items?.length || 0) <= 4) ? 'товара' : 'товаров'}
                              </p>
                            </div>
                          </div>

                          {/* Статус */}
                          <div className="mb-4">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${statusDisplay.bgColor} ${statusDisplay.borderColor} ${statusDisplay.color}`}>
                              {statusDisplay.icon}
                              <span className="font-semibold">{statusDisplay.text}</span>
                            </span>
                          </div>

                          {/* Информация */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-[#cdcdcd]">
                              <CalendarIcon className="w-4 h-4 text-[#808080]" />
                              <span className="text-[#808080]">Дата:</span>
                              <span className="text-white">
                                {new Date(order.dateCreated).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                            {totalOrderPrice > 0 && (
                              <div className="flex items-center gap-2 text-[#cdcdcd]">
                                <CurrencyDollarIcon className="w-4 h-4 text-[#808080]" />
                                <span className="text-[#808080]">Сумма:</span>
                                <span className="text-white font-semibold">
                                  ¥{totalOrderPrice.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Кнопка оплаты */}
                          {totalOrderPrice > 0 &&
                            order.status === 'VERIFIED' &&
                            order.status !== 'PAID' && (
                              <div className="mt-4">
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePay(order.id);
                                  }}
                                  className="bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)]"
                                >
                                  Оплатить
                                </Button>
                              </div>
                            )}
                        </div>

                        {/* Правая часть - кнопка */}
                        <div className="flex items-center">
                          <div className="px-4 py-2 bg-[rgba(0,240,255,0.1)] hover:bg-[rgba(0,240,255,0.15)] border border-[rgba(0,240,255,0.3)] rounded-lg transition-all duration-300 group-hover:border-[#00f0ff]">
                            <span className="text-[#00f0ff] font-semibold">Подробнее →</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
            );
          })
        ) : (
          !loading && (
            <div className="p-12 text-center rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <ShoppingBagIcon className="w-16 h-16 text-[#9ca3af] mx-auto mb-4" />
              <p className="text-xl text-[#e5e7eb] mb-2">Нет заказов</p>
              <p className="text-[#9ca3af]">Ваши заказы появятся здесь</p>
            </div>
          )
        )}
      </div>

      {/* Загрузка */}
      {loading && !isInitialLoad.current && (
        <div className="text-center py-4">
          <ClockIcon className="w-6 h-6 animate-spin mx-auto text-[#00f0ff] mb-2" />
          <p className="text-[#808080]">Загрузка...</p>
        </div>
      )}
    </div>
  );
};

export default ShipmentsTab;
