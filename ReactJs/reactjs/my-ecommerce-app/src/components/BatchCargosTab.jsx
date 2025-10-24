import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { TruckIcon, ArrowPathIcon, ClockIcon } from '@heroicons/react/24/solid';
import api from '../api/axiosInstance';

// Append global styles for consistency with DeliveryPayment.jsx
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

const BatchCargosTab = ({ userEmail, handleViewOrderDetails, refresh }) => {
  const [batchCargos, setBatchCargos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const observer = useRef();
  const containerRef = useRef(null);
  const isInitialLoad = useRef(true);
  const navigate = useNavigate();

  const debounce = useCallback((func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  const lastBatchElementRef = useCallback(
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

  const fetchBatchCargos = async (pageNum) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/batch-cargos/departure?page=${pageNum - 1}&size=10&sort=creationDate,desc`);
      const { content, last } = response.data;
      const sanitizedData = content.map((batch) => ({
        ...batch,
        orders: Array.isArray(batch.orders) ? batch.orders : [],
      }));
      setBatchCargos((prevBatches) => (pageNum === 1 ? sanitizedData : [...prevBatches, ...sanitizedData]));
      setHasMore(!last);
    } catch (error) {
      console.error('Error fetching batch cargos:', error);
      let errorMessage = 'Ошибка загрузки грузов';
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Не удалось подключиться к серверу. Проверьте интернет-соединение.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Доступ запрещён (403). Проверьте токен.';
      } else {
        errorMessage = error.response?.data?.message || error.message || 'Неизвестная ошибка';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      isInitialLoad.current = false;
    }
  };

  useEffect(() => {
    if (userEmail) {
      fetchBatchCargos(page);
    }
  }, [userEmail, page, refresh]);

  const handleViewBatchCargoDetails = (batchId) => {
    navigate(`/batch-cargo-details/${batchId}`);
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'UNFINISHED':
        return { text: 'В процессе', color: 'text-yellow-300' };
      case 'FINISHED':
        return { text: 'Завершён', color: 'text-emerald-300' };
      case 'ARRIVED_IN_MINSK':
        return { text: 'Груз в Минске', color: 'text-blue-300' };
      case 'COMPLETED':
        return { text: 'Груз доставлен', color: 'text-green-300' };
      default:
        return { text: status, color: 'text-accent-primary' };
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-[70vh] bg-primary rounded-2xl p-8 shadow-card border border-primary/50 relative overflow-y-auto scrollbar-hide"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,37,73,0.3)_0%,transparent_70%)] pointer-events-none" />
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold font-display text-accent-primary mb-6 relative z-10 animate-fade-in-down"
      >
        Отправления
      </motion.h2>
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center text-base font-medium font-sans relative z-10"
        >
          {error}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchBatchCargos(page)}
            className="ml-4 px-3 py-1 bg-accent-primary text-primary border border-primary/50 shadow-card hover:shadow-accent-primary/40 rounded-lg transition-all duration-300 font-sans"
          >
            <ArrowPathIcon className="w-5 h-5 inline mr-1 text-primary" />
            Повторить
          </motion.button>
        </motion.div>
      )}
      {batchCargos.length === 0 && !loading && !error ? (
        <p className="text-center text-secondary text-lg font-sans relative z-10">
          Нет заказов, включённых в сборные грузы.
        </p>
      ) : (
        <div className="grid gap-4">
          {batchCargos.map((batch, index) => {
            const statusDisplay = getStatusDisplay(batch.status);
            return (
              <Tilt
                key={batch.id}
                tiltMaxAngleX={8}
                tiltMaxAngleY={8}
                perspective={1200}
              >
                <div ref={index === batchCargos.length - 1 ? lastBatchElementRef : null}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleViewBatchCargoDetails(batch.id)}
                    className="bg-tertiary backdrop-blur-lg border border-primary/50 shadow-card hover:shadow-accent-primary/40 rounded-lg p-4 transition-all duration-300 cursor-pointer text-secondary hover:text-accent-primary relative z-10 font-sans"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TruckIcon className="w-6 h-6 text-accent-primary" />
                        <h3 className="text-xl font-semibold text-accent-primary font-sans">
                          Груз #{batch.id}
                        </h3>
                      </div>
                    </div>
                    <p className="text-base">
                      <strong>Дата создания:</strong>{' '}
                      {new Date(batch.creationDate).toLocaleDateString()}
                    </p>
                    <p className="text-base">
                      <strong>Дата закупки:</strong>{' '}
                      {new Date(batch.purchaseDate).toLocaleDateString()}
                    </p>
                    <p className="text-base">
                      <strong>Статус:</strong>{' '}
                      <span className={statusDisplay.color}>
                        {statusDisplay.text}
                      </span>
                    </p>
                    <p className="text-base">
                      <strong>Заказов:</strong> {(batch.orders || []).length}
                    </p>
                  </motion.div>
                </div>
              </Tilt>
            );
          })}
        </div>
      )}
      {loading && !isInitialLoad.current && (
        <div className="text-center text-secondary mt-4">
          <ClockIcon className="w-6 h-6 animate-spin mx-auto text-accent-primary" />
          <p className="text-base font-sans">Загрузка...</p>
        </div>
      )}
    </div>
  );
};

export default BatchCargosTab;