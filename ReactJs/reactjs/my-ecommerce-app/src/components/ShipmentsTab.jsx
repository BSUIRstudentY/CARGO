import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { ClockIcon } from '@heroicons/react/24/solid';
import api from '../api/axiosInstance';

// Append global styles for consistency with OrderDetails.jsx
const styles = `
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-down {
    animation: fadeInDown 0.6s ease-out;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-up {
    animation: slideUp 0.5s ease-out;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

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
      className="h-[70vh] bg-primary rounded-2xl p-8 shadow-card border border-primary/50 relative overflow-y-auto scrollbar-hide"
      style={{
        '@media (max-width: 640px)': {
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,37,73,0.3)_0%,transparent_70%)] pointer-events-none" />
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold font-display text-accent-primary mb-6 relative z-10 animate-fade-in-down break-words"
        style={{
          '@media (max-width: 640px)': {
            fontSize: '24px',
            marginBottom: '16px',
            overflowWrap: 'break-word',
            whiteSpace: 'normal',
          }
        }}
      >
        Мои отправления
      </motion.h2>
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center text-base font-medium font-sans relative z-10 break-words"
          style={{
            '@media (max-width: 640px)': {
              padding: '12px',
              fontSize: '14px',
              borderRadius: '8px',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }
          }}
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
                tiltMaxAngleX={8}
                tiltMaxAngleY={8}
                perspective={1200}
              >
                <div ref={index === orders.length - 1 ? lastOrderElementRef : null}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
                    whileTap={{ scale: 0.97 }}
                    className="bg-tertiary backdrop-blur-lg border border-primary/50 shadow-card hover:shadow-accent-primary/40 rounded-lg p-4 transition-all duration-300 cursor-pointer text-secondary hover:text-accent-primary relative z-10"
                    onClick={() => handleViewOrderDetails(order.id)}
                    style={{
                      '@media (max-width: 640px)': {
                        padding: '12px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      }
                    }}
                  >
                    <p className="text-base font-sans">
                      <strong>Дата:</strong> {new Date(order.dateCreated).toLocaleDateString()}
                    </p>
                    <p className="text-base font-sans">
                      <strong>Номер:</strong> {order.orderNumber}
                    </p>
                    <p className="text-base font-sans">
                      <strong>Статус:</strong>{' '}
                      <span className={order.status === 'PENDING' ? 'text-yellow-300' : 'text-green-300'}>
                        {order.status === 'PENDING' ? 'Ожидает подтверждения' : 'Подтверждён'}
                      </span>
                    </p>
                    {totalOrderPrice > 0 && (
                      <p className="text-base font-sans">
                        <strong>Стоимость:</strong> ¥{totalOrderPrice.toFixed(2)}
                      </p>
                    )}
                    {totalOrderPrice > 0 && order.status === 'VERIFIED' && order.status !== 'PAID' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePay(order.id);
                        }}
                        className="mt-2 px-4 py-2 bg-accent-primary text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold font-sans shadow-card"
                        style={{
                          '@media (max-width: 640px)': {
                            padding: '8px 12px',
                            fontSize: '14px',
                            borderRadius: '6px',
                          }
                        }}
                      >
                        Оплатить
                      </motion.button>
                    )}
                    {order.status === 'PAID' && (
                      <p className="text-green-300 mt-2 text-base font-sans">Оплачено</p>
                    )}
                    
                  </motion.div>
                </div>
              </Tilt>
            );
          })}
        </div>
      ) : (
        !loading && (
          <p className="text-center text-secondary text-lg font-sans relative z-10">
            У вас пока нет текущих отправлений.
          </p>
        )
      )}
      {loading && !isInitialLoad.current && (
        <div className="text-center text-secondary mt-4">
          <ClockIcon className="w-6 h-6 animate-spin mx-auto text-accent-primary" style={{
            '@media (max-width: 640px)': {
              width: '20px',
              height: '20px',
            }
          }} />
          <p className="text-base font-sans">Загрузка...</p>
        </div>
      )}
    </div>
  );
};

export default ShipmentsTab;