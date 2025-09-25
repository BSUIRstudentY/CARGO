import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { TruckIcon, ArrowPathIcon, ClockIcon } from '@heroicons/react/24/solid';
import api from '../api/axiosInstance';

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

  // Map status to display text and color
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
        return { text: status, color: 'text-gray-300' };
    }
  };

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
      <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6 relative z-10">Отправления</h2>
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-center relative z-10"
        >
          {error}
          <button
            onClick={() => fetchBatchCargos(page)}
            className="ml-4 px-3 py-1 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition duration-300"
          >
            <ArrowPathIcon className="w-5 h-5 inline mr-1" />
            Повторить
          </button>
        </motion.div>
      )}
      {batchCargos.length === 0 && !loading && !error ? (
        <p className="text-center text-gray-400 text-lg relative z-10">
          Нет заказов, включённых в сборные грузы.
        </p>
      ) : (
        <div className="grid gap-4">
          {batchCargos.map((batch, index) => {
            const statusDisplay = getStatusDisplay(batch.status);
            return (
              <Tilt key={batch.id} tiltMaxAngleX={10} tiltMaxAngleY={10} perspective={1000}>
                <div ref={index === batchCargos.length - 1 ? lastBatchElementRef : null}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => handleViewBatchCargoDetails(batch.id)}
                    className="bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg border border-gray-600 p-4 transition-all duration-300 hover:shadow-[0_0_15px_#10b981] cursor-pointer relative z-10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TruckIcon className="w-6 h-6 text-[var(--accent-color)]" />
                        <h3 className="text-xl font-semibold text-white">
                          Груз #{batch.id}
                        </h3>
                      </div>
                    </div>
                    <p className="text-gray-300 mt-2">
                      <strong>Дата создания:</strong> {new Date(batch.creationDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-300">
                      <strong>Дата закупки:</strong> {new Date(batch.purchaseDate).toLocaleDateString()}
                    </p>
                    <p className="text-gray-300">
                      <strong>Статус:</strong>{' '}
                      <span className={statusDisplay.color}>
                        {statusDisplay.text}
                      </span>
                    </p>
                    <p className="text-gray-300">
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
        <div className="text-center text-gray-400 mt-4">
          <ClockIcon className="w-6 h-6 animate-spin mx-auto text-[var(--accent-color)]" />
          <p>Загрузка...</p>
        </div>
      )}
    </div>
  );
};

export default BatchCargosTab;