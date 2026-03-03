import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TruckIcon, 
  ArrowPathIcon, 
  ClockIcon,
  CheckCircleIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/solid';
import api from '../api/axiosInstance';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';

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
    const statusConfig = {
      UNFINISHED: { 
        text: 'В процессе', 
        color: 'text-yellow-300', 
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/50',
        icon: <ClockIcon className="w-4 h-4" />
      },
      PURCHASING: { 
        text: 'Закупка товаров', 
        color: 'text-blue-300', 
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/50',
        icon: <ClockIcon className="w-4 h-4" />
      },
      CHECKING: { 
        text: 'Проверка товаров', 
        color: 'text-purple-300', 
        bgColor: 'bg-purple-500/20',
        borderColor: 'border-purple-500/50',
        icon: <ClockIcon className="w-4 h-4" />
      },
      PACKAGING: { 
        text: 'Упаковка', 
        color: 'text-indigo-300', 
        bgColor: 'bg-indigo-500/20',
        borderColor: 'border-indigo-500/50',
        icon: <ClockIcon className="w-4 h-4" />
      },
      SHIPPED: { 
        text: 'Отправлен', 
        color: 'text-emerald-300', 
        bgColor: 'bg-emerald-500/20',
        borderColor: 'border-emerald-500/50',
        icon: <TruckIcon className="w-4 h-4" />
      },
      FINISHED: { 
        text: 'Завершён', 
        color: 'text-emerald-300', 
        bgColor: 'bg-emerald-500/20',
        borderColor: 'border-emerald-500/50',
        icon: <CheckCircleIcon className="w-4 h-4" />
      },
      ARRIVED_IN_MINSK: { 
        text: 'В Минске', 
        color: 'text-blue-300', 
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/50',
        icon: <TruckIcon className="w-4 h-4" />
      },
      COMPLETED: { 
        text: 'Доставлен', 
        color: 'text-green-300', 
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/50',
        icon: <CheckCircleIcon className="w-4 h-4" />
      },
      REFUSED: { 
        text: 'Отклонён', 
        color: 'text-[#9ca3af]', 
        bgColor: 'bg-[rgba(156,163,175,0.15)]',
        borderColor: 'border-[rgba(156,163,175,0.3)]',
        icon: <ClockIcon className="w-4 h-4" />
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (isInitialLoad.current && loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-[var(--ev-gold)]/30 border-t-[var(--ev-gold)] animate-spin" />
          <p className="text-sm text-[var(--ev-text-muted)]">Загрузка сборных грузов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20">
            <TruckIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--ev-gold)]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--ev-text)]">
            Сборные грузы
          </h2>
        </div>
      </motion.div>

      {/* Ошибка */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert 
              type="error" 
              message={
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span>{error}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPage(1);
                      fetchBatchCargos(1);
                    }}
                    className="flex items-center gap-2 border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/10"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Повторить
                  </Button>
                </div>
              }
              onClose={() => setError(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Список грузов */}
      <div
        ref={containerRef}
        className="space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto overflow-x-hidden scrollbar-hide pb-safe"
      >
        {batchCargos.length === 0 && !loading && !error ? (
          <div className="p-12 text-center rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15">
            <div className="flex flex-col items-center">
              <div className="p-4 rounded-full bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 mb-4">
                <TruckIcon className="w-12 h-12 sm:w-16 sm:h-16 text-[var(--ev-text-muted)]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[var(--ev-text)] mb-2">Нет сборных грузов</h3>
              <p className="text-[var(--ev-text-muted)] text-sm sm:text-base">
                Ваши заказы, включённые в сборные грузы, появятся здесь
              </p>
            </div>
          </div>
        ) : (
          batchCargos.map((batch, index) => {
            const statusDisplay = getStatusDisplay(batch.status);
            // Используем orderCount, если он есть, иначе считаем из orders
            const ordersCount = batch.orderCount !== undefined && batch.orderCount !== null 
              ? batch.orderCount 
              : (batch.orders || []).length;
            const ordersText = ordersCount === 1 ? 'заказ' : (ordersCount >= 2 && ordersCount <= 4) ? 'заказа' : 'заказов';
            
            return (
              <div
                key={batch.id}
                ref={index === batchCargos.length - 1 ? lastBatchElementRef : null}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -3 }}
                >
                  <div
                    className="p-4 sm:p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 cursor-pointer group transition-colors"
                    onClick={() => handleViewBatchCargoDetails(batch.id)}
                  >
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start justify-between">
                      <div className="flex-1 w-full min-w-0">
                        <div className="flex items-start gap-3 sm:gap-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 flex items-center justify-center">
                            <TruckIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--ev-gold)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-semibold text-[var(--ev-text)] mb-1 group-hover:text-[var(--ev-gold)] transition-colors truncate">
                              Груз #{batch.id}
                            </h3>
                            <p className="text-sm text-[var(--ev-text-muted)] flex items-center gap-2">
                              <span className="inline-flex items-center gap-1">
                                <CheckCircleIcon className="w-4 h-4" />
                                {ordersCount} {ordersText}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border text-sm font-semibold ${statusDisplay.bgColor} ${statusDisplay.borderColor} ${statusDisplay.color}`}>
                            {statusDisplay.icon}
                            <span>{statusDisplay.text}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-[var(--ev-text-muted)]">
                            <CalendarIcon className="w-4 h-4 text-[var(--ev-gold)] flex-shrink-0" />
                            <span>Создан:</span>
                            <span className="text-[var(--ev-text)] font-medium">{formatDate(batch.creationDate)}</span>
                          </div>
                          {batch.purchaseDate && (
                            <div className="flex items-center gap-2 text-[var(--ev-text-muted)]">
                              <CalendarIcon className="w-4 h-4 text-[var(--ev-gold)] flex-shrink-0" />
                              <span>Выкуп:</span>
                              <span className="text-[var(--ev-text)] font-medium">{formatDate(batch.purchaseDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center w-full sm:w-auto">
                        <span className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--ev-gold)]/15 border border-[var(--ev-gold)]/30 text-[var(--ev-gold)] font-medium group-hover:bg-[var(--ev-gold)]/25 transition-colors">
                          <EyeIcon className="w-4 h-4" />
                          <span className="hidden sm:inline">Подробнее</span>
                          <span className="sm:hidden">Детали</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })
        )}
      </div>

      {/* Загрузка */}
      {loading && !isInitialLoad.current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6"
        >
          <div className="flex flex-col items-center gap-3">
            <ClockIcon className="w-8 h-8 animate-spin text-[var(--ev-gold)]" />
            <p className="text-[var(--ev-text-muted)] text-sm">Загрузка...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BatchCargosTab;
