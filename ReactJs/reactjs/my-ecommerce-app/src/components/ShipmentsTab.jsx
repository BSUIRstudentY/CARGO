import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { ClockIcon } from '@heroicons/react/24/solid';
import api from '../api/axiosInstance';

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
        setOrders((prevOrders) => (page === 1 ? content : [...prevOrders, ...content]));
        setHasMore(!last);
        setError(null);
      } catch (err) {
        console.error('API Error:', err);
        setError('Ошибка загрузки заказов: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
        isInitialLoad.current = false;
      }
    };
    fetchOrders();
  }, [page, refresh]);

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
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.3)_0%,transparent_70%)] pointer-events-none" />
      <h2 className="text-3xl font-bold text-cyan-400 mb-6 relative z-10">Мои отправления</h2>
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center text-base font-medium relative z-10"
        >
          {error}
        </motion.div>
      )}
      {orders.length > 0 ? (
        <div className="grid gap-4">
          {orders.map((order, index) => {
            const totalChinaDeliveryPrice = order.items?.reduce((sum, item) => {
              return sum + ((item.chinaDeliveryPrice || 0) * (item.quantity || 1));
            }, 0) || 0;
            const totalOrderPrice = (order.totalClientPrice || 0) + totalChinaDeliveryPrice;
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
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-900/30 backdrop-blur-lg border border-cyan-400/20 shadow-lg hover:shadow-cyan-400/20 rounded-lg p-4 transition-all duration-300 cursor-pointer text-cyan-400 hover:text-cyan-200 relative z-10"
                    onClick={() => handleViewOrderDetails(order.id)}
                  >
                    <p><strong>Дата:</strong> {new Date(order.dateCreated).toLocaleDateString()}</p>
                    <p><strong>Номер:</strong> {order.orderNumber}</p>
                    <p>
                      <strong>Статус:</strong>{' '}
                      <span className={order.status === 'PENDING' ? 'text-yellow-300' : 'text-emerald-300'}>
                        {order.status === 'PENDING' ? 'Ожидает подтверждения' : 'Подтверждён'}
                      </span>
                    </p>
                    {totalOrderPrice > 0 && (
                      <p><strong>Стоимость:</strong> ¥{totalOrderPrice.toFixed(2)}</p>
                    )}
                    {totalOrderPrice > 0 && order.status !== 'PAID' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePay(order.id);
                        }}
                        className="mt-2 px-4 py-2 bg-cyan-900/30 border border-cyan-400/20 shadow-lg hover:shadow-cyan-400/20 text-cyan-400 hover:text-cyan-200 rounded-lg transition-all duration-300"
                      >
                        Оплатить
                      </motion.button>
                    )}
                    {order.status === 'PAID' && (
                      <p className="text-emerald-300 mt-2">Оплачено</p>
                    )}
                  </motion.div>
                </div>
              </Tilt>
            );
          })}
        </div>
      ) : (
        !loading && (
          <p className="text-center text-gray-400 text-lg relative z-10">
            У вас пока нет текущих отправлений.
          </p>
        )
      )}
      {loading && !isInitialLoad.current && (
        <div className="text-center text-gray-400 mt-4">
          <ClockIcon className="w-6 h-6 animate-spin mx-auto text-orange-400" />
          <p>Загрузка...</p>
        </div>
      )}
    </div>
  );
};

export default ShipmentsTab;