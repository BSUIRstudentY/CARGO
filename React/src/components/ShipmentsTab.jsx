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
        color: 'text-[var(--ev-text-muted)]',
        bgColor: 'bg-[var(--ev-text-muted)]/15',
        borderColor: 'border-[var(--ev-text-muted)]/30',
        icon: <XCircleIcon className="w-4 h-4" />
      },
      REFUSED: {
        text: 'Отклонён',
        color: 'text-[var(--ev-text-muted)]',
        bgColor: 'bg-[var(--ev-text-muted)]/15',
        borderColor: 'border-[var(--ev-text-muted)]/30',
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
      color: 'text-[var(--ev-text-muted)]',
      bgColor: 'bg-[var(--ev-text-muted)]/20',
      borderColor: 'border-[var(--ev-text-muted)]/30',
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
        <h2 className="text-2xl font-semibold text-[var(--ev-text)] flex items-center gap-3">
          <ShoppingBagIcon className="w-7 h-7 text-[var(--ev-gold)]" />
          Заказы
        </h2>
      </motion.div>

      {/* Ошибка */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-center"
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
                  <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 hover:bg-[var(--ev-gold)]/5 transition-all duration-300 cursor-pointer group overflow-x-hidden overflow-y-hidden">
                      <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 flex items-center justify-center">
                              <ShoppingBagIcon className="w-6 h-6 text-[var(--ev-gold)]" />
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-[var(--ev-text)] group-hover:text-[var(--ev-gold)] transition-colors">
                                Заказ #{order.orderNumber}
                              </h3>
                              <p className="text-sm text-[var(--ev-text-muted)]">
                                {order.items?.length || 0} {((order.items?.length || 0) === 1) ? 'товар' : ((order.items?.length || 0) >= 2 && (order.items?.length || 0) <= 4) ? 'товара' : 'товаров'}
                              </p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${statusDisplay.bgColor} ${statusDisplay.borderColor} ${statusDisplay.color}`}>
                              {statusDisplay.icon}
                              <span className="font-semibold">{statusDisplay.text}</span>
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-[var(--ev-text-muted)]">
                              <CalendarIcon className="w-4 h-4 text-[var(--ev-gold)]/70" />
                              <span>Дата:</span>
                              <span className="text-[var(--ev-text)]">
                                {new Date(order.dateCreated).toLocaleDateString('ru-RU')}
                              </span>
                            </div>
                            {totalOrderPrice > 0 && (
                              <div className="flex items-center gap-2 text-[var(--ev-text-muted)]">
                                <CurrencyDollarIcon className="w-4 h-4 text-[var(--ev-gold)]/70" />
                                <span>Сумма:</span>
                                <span className="text-[var(--ev-text)] font-semibold">
                                  ¥{totalOrderPrice.toFixed(2)}
                                </span>
                              </div>
                            )}
                          </div>

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
                                  className="bg-[var(--ev-gold)]/15 border border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/25"
                                >
                                  Оплатить
                                </Button>
                              </div>
                            )}
                        </div>

                        <div className="flex items-center">
                          <div className="px-4 py-2 bg-[var(--ev-gold)]/10 hover:bg-[var(--ev-gold)]/15 border border-[var(--ev-gold)]/25 rounded-lg transition-all duration-300 group-hover:border-[var(--ev-gold)]/40">
                            <span className="text-[var(--ev-gold)] font-semibold">Подробнее →</span>
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
            <div className="p-12 text-center rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15">
              <ShoppingBagIcon className="w-16 h-16 text-[var(--ev-text-muted)]/60 mx-auto mb-4" />
              <p className="text-xl text-[var(--ev-text)] mb-2">Нет заказов</p>
              <p className="text-[var(--ev-text-muted)]">Ваши заказы появятся здесь</p>
            </div>
          )
        )}
      </div>

      {/* Загрузка */}
      {loading && !isInitialLoad.current && (
        <div className="text-center py-4">
          <ClockIcon className="w-6 h-6 animate-spin mx-auto text-[var(--ev-gold)] mb-2" />
          <p className="text-[var(--ev-text-muted)]">Загрузка...</p>
        </div>
      )}
    </div>
  );
};

export default ShipmentsTab;
