import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import api from '../api/axiosInstance';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { ClockIcon } from '@heroicons/react/24/solid';

// Define currency conversion rate (not used for display, kept for reference)
const CNY_TO_BYN_RATE = 0.45;

const OrderHistoryTab = ({ handleOrderDetailsHistory, refresh }) => {
  const { user } = useAuth();
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
      if (!user?.email) {
        setError('Пользователь не авторизован');
        setLoading(false);
        return;
      }
      console.log(`Fetching order history for page ${page}`);
      setLoading(true);
      try {
        const response = await api.get(`/order-history?page=${page - 1}&size=10`);
        const { orders, totalPages } = response.data;
        // Filter out invalid orders
        const validOrders = (orders || []).filter(
          (order) => order && order.id && order.orderNumber && order.dateCreated
        );
        setOrders((prevOrders) => (page === 1 ? validOrders : [...prevOrders, ...validOrders]));
        setHasMore(page < totalPages);
        if (validOrders.length === 0 && orders?.length > 0) {
          console.warn('All orders in response were invalid or null:', orders);
          setError('Заказы не найдены или содержат некорректные данные. Попробуйте позже.');
        }
        setError(null);
      } catch (err) {
        console.error('API Error:', err);
        let errorMessage = 'Ошибка загрузки заказов';
        if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Не удалось подключиться к серверу.';
        } else if (err.response?.status === 403) {
          errorMessage = 'Доступ запрещён (403). Проверьте токен.';
        } else {
          errorMessage = err.response?.data?.message || err.message || 'Неизвестная ошибка';
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
        isInitialLoad.current = false;
      }
    };
    fetchOrders();
  }, [page, refresh, user?.email]);

  return (
    <div
      ref={containerRef}
      className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-8 shadow-xl border border-gray-700/50 relative h-[70vh] overflow-y-auto scrollbar-hide"
    >
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.3)_0%,transparent_70%)] pointer-events-none" />
      <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6 relative z-10">История отправлений</h2>
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-center"
        >
          {error}
        </motion.div>
      )}
      {orders.length > 0 ? (
        <div className="grid gap-4">
          {orders.map((order, index) => {
            const statusDisplay =
              order.status === 'REFUSED'
                ? { text: 'Отклонён', color: 'text-red-300' }
                : { text: 'Груз доставлен', color: 'text-green-300' };
            return (
              <Tilt
                key={order.id}
                tiltMaxAngleX={10}
                tiltMaxAngleY={10}
                perspective={1000}
              >
                <div ref={index === orders.length - 1 ? lastOrderElementRef : null}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg border border-gray-600 p-4 transition-all duration-300 hover:shadow-[0_0_15px_#10b981] cursor-pointer"
                    onClick={() => handleOrderDetailsHistory(order.id)}
                  >
                    <p className="text-gray-300">
                      <strong>Дата:</strong>{' '}
                      {order.dateCreated
                        ? new Date(order.dateCreated).toLocaleDateString('ru-RU')
                        : 'Не указана'}
                    </p>
                    <p className="text-gray-300">
                      <strong>Номер:</strong> {order.orderNumber || 'Не указан'}
                    </p>
                    <p className="text-gray-300">
                      <strong>Статус:</strong>{' '}
                      <span className={statusDisplay.color}>{statusDisplay.text}</span>
                    </p>
                    <p className="text-gray-300">
                      <strong>Стоимость:</strong> ¥{(order.totalClientPrice || 0).toFixed(2)}
                    </p>
                  </motion.div>
                </div>
              </Tilt>
            );
          })}
        </div>
      ) : (
        !loading && (
          <p className="text-center text-gray-400 text-lg relative z-10">
            История отправлений пуста.
          </p>
        )
      )}
      {loading && !isInitialLoad.current && (
        <div className="text-center text-gray-400 mt-4">
          <ClockIcon className="w-6 h-6 animate-spin mx-auto text-[var(--accent-color)]" />
          <p>Загрузка...</p>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryTab;