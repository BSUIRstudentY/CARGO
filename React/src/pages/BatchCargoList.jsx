import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/AuthProvider';
import Tilt from 'react-parallax-tilt';
import api from '../api/axiosInstance';
import { 
  TruckIcon, 
  CalendarIcon, 
  UserGroupIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Loading } from '../components/ui/Loading';

/**
 * Страница списка сборных грузов
 * Показывает все сборные грузы, в которых участвует пользователь
 */
const BatchCargoList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batchCargos, setBatchCargos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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
      // Получаем все сборные грузы без фильтрации
      const response = await api.get(`/batch-cargos/all?page=${pageNum - 1}&size=10&sort=creationDate,desc`);
      const { content, last } = response.data;
      
      // Показываем все грузы - при просмотре деталей пользователь увидит только свои заказы
      setBatchCargos((prevBatches) => (pageNum === 1 ? content : [...prevBatches, ...content]));
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
    if (user?.email) {
      fetchBatchCargos(page);
    }
  }, [user?.email, page]);

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'UNFINISHED':
        return { 
          text: 'В процессе', 
          color: 'text-yellow-300', 
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/50',
          icon: <ClockIcon className="w-5 h-5" />
        };
      case 'PURCHASING':
        return { 
          text: 'Закупка товаров', 
          color: 'text-blue-300',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/50',
          icon: <ClockIcon className="w-5 h-5" />
        };
      case 'CHECKING':
        return { 
          text: 'Проверка товаров', 
          color: 'text-purple-300',
          bgColor: 'bg-purple-500/20',
          borderColor: 'border-purple-500/50',
          icon: <ClockIcon className="w-5 h-5" />
        };
      case 'PACKAGING':
        return { 
          text: 'Упаковка', 
          color: 'text-indigo-300',
          bgColor: 'bg-indigo-500/20',
          borderColor: 'border-indigo-500/50',
          icon: <ClockIcon className="w-5 h-5" />
        };
      case 'SHIPPED':
        return { 
          text: 'Отправлен', 
          color: 'text-emerald-300',
          bgColor: 'bg-emerald-500/20',
          borderColor: 'border-emerald-500/50',
          icon: <TruckIcon className="w-5 h-5" />
        };
      case 'FINISHED':
        return { 
          text: 'Завершён', 
          color: 'text-emerald-300',
          bgColor: 'bg-emerald-500/20',
          borderColor: 'border-emerald-500/50',
          icon: <CheckCircleIcon className="w-5 h-5" />
        };
      case 'ARRIVED_IN_MINSK':
        return { 
          text: 'Груз в Минске', 
          color: 'text-blue-300',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/50',
          icon: <TruckIcon className="w-5 h-5" />
        };
      case 'COMPLETED':
        return { 
          text: 'Груз доставлен', 
          color: 'text-green-300',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/50',
          icon: <CheckCircleIcon className="w-5 h-5" />
        };
      case 'REFUSED':
        return { 
          text: 'Отклонён', 
          color: 'text-red-300',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/50',
          icon: <XCircleIcon className="w-5 h-5" />
        };
      default:
        return { 
          text: status, 
          color: 'text-[#407CFF]',
          bgColor: 'bg-[#407CFF]/20',
          borderColor: 'border-[#407CFF]/50',
          icon: <TruckIcon className="w-5 h-5" />
        };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleBatchClick = (batchId) => {
    navigate(`/batch-cargo-details/${batchId}`);
  };

  if (isInitialLoad.current && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <Loading message="Загрузка сборных грузов..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto relative z-10">
        <PageHeader
          kicker="Логистика"
          title="Сборные грузы"
          subtitle="Все сборные грузы. При просмотре деталей вы увидите только свои заказы"
        />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <Card className="p-6 bg-red-500/20 border border-red-500/50">
                <div className="flex items-center justify-between">
                  <p className="text-red-300 text-center flex-1">{error}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fetchBatchCargos(page)}
                    className="ml-4 px-4 py-2 bg-[#e81e2d] hover:bg-[#ff4757] text-white rounded-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                    Повторить
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={containerRef} className="space-y-6">
          {batchCargos.length === 0 && !loading && !error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-6 sm:p-12 text-center">
                <TruckIcon className="w-12 h-12 sm:w-16 sm:h-16 text-[#808080] mx-auto mb-3 sm:mb-4" />
                <p className="text-lg sm:text-xl text-[#cdcdcd] mb-1.5 sm:mb-2">Нет сборных грузов</p>
                <p className="text-[#808080] text-xs sm:text-base">Сборные грузы пока не созданы.</p>
              </Card>
            </motion.div>
          ) : (
            batchCargos.map((batch, index) => {
              const statusDisplay = getStatusDisplay(batch.status);

              return (
                <div key={batch.id} ref={index === batchCargos.length - 1 ? lastBatchElementRef : null}>
                  <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1200}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <Card 
                        className={`p-4 sm:p-6 bg-[#1a1a1a] border border-[#333] hover:border-[#407CFF]/50 cursor-pointer transition-all duration-300 group`}
                        onClick={() => handleBatchClick(batch.id)}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                          {/* Левая часть: Информация о грузе */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-[#e81e2d] to-[#ff4757] rounded-lg sm:rounded-xl flex items-center justify-center">
                                <TruckIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg sm:text-2xl font-bold text-white group-hover:text-[#407CFF] transition-colors">
                                  Сборный груз #{batch.id}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold border ${statusDisplay.bgColor} ${statusDisplay.borderColor} ${statusDisplay.color} flex items-center gap-1.5 sm:gap-2`}>
                                    {statusDisplay.icon}
                                    {statusDisplay.text}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Детали */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[#cdcdcd]">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-[#407CFF]" />
                                <div>
                                  <p className="text-xs text-[#808080]">Дата создания</p>
                                  <p className="text-sm font-medium">{formatDate(batch.creationDate)}</p>
                                </div>
                              </div>
                              {batch.purchaseDate && (
                                <div className="flex items-center gap-2">
                                  <CalendarIcon className="w-5 h-5 text-[#407CFF]" />
                                  <div>
                                    <p className="text-xs text-[#808080]">Дата закупки</p>
                                    <p className="text-sm font-medium">{formatDate(batch.purchaseDate)}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Правая часть: Стрелка */}
                          <div className="flex items-center justify-center md:justify-end">
                            <motion.div
                              whileHover={{ x: 5 }}
                              transition={{ duration: 0.2 }}
                              className="w-12 h-12 bg-[#407CFF]/20 rounded-full flex items-center justify-center group-hover:bg-[#407CFF]/30 transition-colors"
                            >
                              <ArrowRightIcon className="w-6 h-6 text-[#407CFF]" />
                            </motion.div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </Tilt>
                </div>
              );
            })
          )}

          {/* Индикатор загрузки */}
          {loading && !isInitialLoad.current && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-8"
            >
              <div className="flex items-center gap-3 text-[#cdcdcd]">
                <ClockIcon className="w-6 h-6 animate-spin text-[#407CFF]" />
                <p>Загрузка...</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchCargoList;

