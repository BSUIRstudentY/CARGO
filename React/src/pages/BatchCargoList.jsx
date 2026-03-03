import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../components/AuthProvider';
import { Helmet } from 'react-helmet-async';
import api from '../api/axiosInstance';
import {
  TruckIcon,
  CalendarIcon,
  ChevronRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import { Button } from '../components/ui/Button';

const getStatusDisplay = (status) => {
  const base = 'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium';
  switch (status) {
    case 'UNFINISHED':
      return { text: 'В процессе', className: `${base} bg-amber-500/15 text-amber-200`, icon: <ClockIcon className="w-3.5 h-3.5" /> };
    case 'PURCHASING':
      return { text: 'Закупка', className: `${base} bg-[var(--ev-gold)]/15 text-[var(--ev-gold)]`, icon: <ClockIcon className="w-3.5 h-3.5" /> };
    case 'CHECKING':
      return { text: 'Проверка', className: `${base} bg-[var(--ev-gold)]/15 text-[var(--ev-gold)]`, icon: <ClockIcon className="w-3.5 h-3.5" /> };
    case 'PACKAGING':
      return { text: 'Упаковка', className: `${base} bg-[var(--ev-gold)]/15 text-[var(--ev-gold)]`, icon: <ClockIcon className="w-3.5 h-3.5" /> };
    case 'SHIPPED':
      return { text: 'В пути', className: `${base} bg-emerald-500/15 text-emerald-300`, icon: <TruckIcon className="w-3.5 h-3.5" /> };
    case 'FINISHED':
      return { text: 'Завершён', className: `${base} bg-emerald-500/15 text-emerald-300`, icon: <CheckCircleIcon className="w-3.5 h-3.5" /> };
    case 'ARRIVED_IN_MINSK':
      return { text: 'В Минске', className: `${base} bg-[var(--ev-gold)]/15 text-[var(--ev-gold)]`, icon: <TruckIcon className="w-3.5 h-3.5" /> };
    case 'COMPLETED':
      return { text: 'Доставлен', className: `${base} bg-emerald-500/15 text-emerald-300`, icon: <CheckCircleIcon className="w-3.5 h-3.5" /> };
    case 'REFUSED':
      return { text: 'Отклонён', className: `${base} bg-red-500/15 text-red-300`, icon: <XCircleIcon className="w-3.5 h-3.5" /> };
    default:
      return { text: status, className: `${base} bg-[var(--ev-gold)]/10 text-[var(--ev-text-muted)]`, icon: <TruckIcon className="w-3.5 h-3.5" /> };
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
};

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
          if (entries[0].isIntersecting && hasMore) debounce(() => setPage((p) => p + 1), 300)();
        },
        { root: containerRef.current, rootMargin: '100px', threshold: 0.1 }
      );
      observer.current.observe(node);
    },
    [loading, hasMore, debounce]
  );

  const fetchBatchCargos = async (pageNum) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/batch-cargos/all?page=${pageNum - 1}&size=10&sort=creationDate,desc`);
      const { content, last } = response.data;
      setBatchCargos((prev) => (pageNum === 1 ? content : [...prev, ...content]));
      setHasMore(!last);
    } catch (err) {
      let msg = 'Ошибка загрузки';
      if (err.code === 'ERR_NETWORK') msg = 'Нет связи. Проверьте интернет.';
      else if (err.response?.status === 403) msg = 'Доступ запрещён';
      else msg = err.response?.data?.message || err.message || msg;
      setError(msg);
    } finally {
      setLoading(false);
      isInitialLoad.current = false;
    }
  };

  useEffect(() => {
    if (user?.email) fetchBatchCargos(page);
  }, [user?.email, page]);

  const handleBatchClick = (batchId) => navigate(`/batch-cargo-details/${batchId}`);

  if (isInitialLoad.current && loading) {
    return (
      <div className="min-h-screen bg-[var(--ev-void)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--ev-gold)]/30 border-t-[var(--ev-gold)] rounded-full animate-spin" />
          <p className="text-sm text-[var(--ev-text-muted)]">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--ev-void)] text-[var(--ev-text)] font-[var(--ev-font-body)]">
      <Helmet>
        <title>Сборные грузы | Fluvion</title>
        <meta name="description" content="Отслеживайте статус ваших грузов из Китая." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-28">
        {/* Заголовок */}
        <header className="mb-8 sm:mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 flex items-center justify-center shrink-0">
              <TruckIcon className="w-7 h-7 text-[var(--ev-gold)]" />
            </div>
            <div>
              <h1 className="font-[var(--ev-font-display)] text-2xl sm:text-3xl font-light text-[var(--ev-text)]">
                Сборные грузы
              </h1>
              <p className="text-sm text-[var(--ev-text-muted)] mt-0.5">
                Ваши грузы с заказами из Китая
              </p>
            </div>
          </div>
        </header>

        {/* Ошибка */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 sm:p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <p className="text-sm text-red-200 flex-1">{error}</p>
              <button
                type="button"
                onClick={() => fetchBatchCargos(1)}
                className="text-sm text-[var(--ev-gold)] hover:underline flex items-center gap-1.5 shrink-0"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Повторить
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={containerRef} className="space-y-4">
          {batchCargos.length === 0 && !loading && !error ? (
            <div className="rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 p-8 sm:p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--ev-gold)]/5 flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="w-8 h-8 text-[var(--ev-text-muted)]/60" />
              </div>
              <p className="text-[var(--ev-text)] font-medium text-lg mb-2">Пока нет грузов</p>
              <p className="text-sm text-[var(--ev-text-muted)] max-w-sm mx-auto mb-6 leading-relaxed">
                Оформите заказ в разделе «Заказать товар» — после оплаты заказ попадёт в сборный груз и появится здесь.
              </p>
              <Button variant="ev-outline" size="md" onClick={() => navigate('/terminal')}>
                Заказать товар
              </Button>
            </div>
          ) : (
            batchCargos.map((batch, index) => {
              const statusDisplay = getStatusDisplay(batch.status);
              return (
                <motion.div
                  key={batch.id}
                  ref={index === batchCargos.length - 1 ? lastBatchElementRef : null}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className="group"
                >
                  <button
                    type="button"
                    onClick={() => handleBatchClick(batch.id)}
                    className="w-full text-left rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 p-5 sm:p-6 hover:border-[var(--ev-gold)]/30 hover:bg-[var(--ev-gold)]/5 transition-all duration-200 active:scale-[0.99]"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 flex items-center justify-center shrink-0 group-hover:bg-[var(--ev-gold)]/15 transition-colors">
                        <TruckIcon className="w-6 h-6 text-[var(--ev-gold)]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 gap-y-1">
                          <span className="font-semibold text-[var(--ev-text)] text-lg">Груз #{batch.id}</span>
                          <span className={statusDisplay.className}>
                            {statusDisplay.icon}
                            {statusDisplay.text}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--ev-text-muted)] mt-1.5">
                          Создан {formatDate(batch.creationDate)}
                          {batch.purchaseDate && (
                            <span className="sm:before:content-['·'] sm:before:mx-1.5">
                              Закупка {formatDate(batch.purchaseDate)}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--ev-gold)]/5 flex items-center justify-center group-hover:bg-[var(--ev-gold)]/10 transition-colors">
                        <ChevronRightIcon className="w-5 h-5 text-[var(--ev-text-muted)] group-hover:text-[var(--ev-gold)] transition-colors" />
                      </div>
                    </div>
                  </button>
                </motion.div>
              );
            })
          )}

          {loading && !isInitialLoad.current && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-2 text-[var(--ev-text-muted)] text-sm">
                <div className="w-5 h-5 border-2 border-[var(--ev-gold)]/30 border-t-[var(--ev-gold)] rounded-full animate-spin" />
                Загрузка...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchCargoList;
