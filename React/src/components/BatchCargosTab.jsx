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
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';
import { Loading } from './ui/Loading';

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
    return <Loading message="Загрузка сборных грузов..." />;
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#00f0ff]/20 to-[#a78bfa]/20 border border-[#00f0ff]/30">
            <TruckIcon className="w-6 h-6 sm:w-7 sm:h-7 text-[#00f0ff]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
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
                    className="flex items-center gap-2"
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
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="p-4 rounded-full bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] mb-4">
                <TruckIcon className="w-12 h-12 sm:w-16 sm:h-16 text-[#9ca3af]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Нет сборных грузов</h3>
              <p className="text-[#9ca3af] text-sm sm:text-base">
                Ваши заказы, включённые в сборные грузы, появятся здесь
              </p>
            </div>
          </Card>
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
                  <Card 
                    className="p-4 sm:p-6 cursor-pointer group"
                    onClick={() => handleViewBatchCargoDetails(batch.id)}
                    hover={true}
                  >
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start justify-between">
                      {/* Левая часть - основная информация */}
                      <div className="flex-1 w-full min-w-0">
                        <div className="flex items-start gap-3 sm:gap-4 mb-4">
                          <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#00f0ff] via-[#a78bfa] to-[#10b981] flex items-center justify-center shadow-lg">
                            <TruckIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 group-hover:text-[#00f0ff] transition-colors truncate">
                              Груз #{batch.id}
                            </h3>
                            <p className="text-sm text-[#9ca3af] flex items-center gap-2">
                              <span className="inline-flex items-center gap-1">
                                <CheckCircleIcon className="w-4 h-4" />
                                {ordersCount} {ordersText}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Статус */}
                        <div className="mb-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border text-sm font-semibold ${statusDisplay.bgColor} ${statusDisplay.borderColor} ${statusDisplay.color}`}>
                            {statusDisplay.icon}
                            <span>{statusDisplay.text}</span>
                          </span>
                        </div>

                        {/* Даты */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-[#9ca3af]">
                            <CalendarIcon className="w-4 h-4 text-[#00f0ff] flex-shrink-0" />
                            <span className="text-[#808080]">Создан:</span>
                            <span className="text-white font-medium">{formatDate(batch.creationDate)}</span>
                          </div>
                          {batch.purchaseDate && (
                            <div className="flex items-center gap-2 text-[#9ca3af]">
                              <CalendarIcon className="w-4 h-4 text-[#00f0ff] flex-shrink-0" />
                              <span className="text-[#808080]">Выкуп:</span>
                              <span className="text-white font-medium">{formatDate(batch.purchaseDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Правая часть - кнопка */}
                      <div className="flex items-center w-full sm:w-auto">
                        <Button
                          variant="primary"
                          size="md"
                          className="w-full sm:w-auto flex items-center justify-center gap-2 group-hover:scale-105 transition-transform"
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span className="hidden sm:inline">Подробнее</span>
                          <span className="sm:hidden">Детали</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
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
            <ClockIcon className="w-8 h-8 animate-spin text-[#00f0ff]" />
            <p className="text-[#9ca3af] text-sm">Загрузка...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BatchCargosTab;
