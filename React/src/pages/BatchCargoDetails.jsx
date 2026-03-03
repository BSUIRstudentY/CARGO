import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  TruckIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronRightIcon,
  CubeIcon,
} from '@heroicons/react/24/solid';
import { useAuth } from '../components/AuthProvider';
import api from '../api/axiosInstance';

const getStatusDisplay = (status) => {
  const styles = {
    UNFINISHED: { text: 'В процессе', dot: 'bg-amber-400' },
    PURCHASING: { text: 'Закупка', dot: 'bg-[var(--ev-gold)]' },
    CHECKING: { text: 'Проверка', dot: 'bg-[var(--ev-gold)]' },
    PACKAGING: { text: 'Упаковка', dot: 'bg-[var(--ev-gold)]' },
    SHIPPED: { text: 'В пути', dot: 'bg-emerald-400' },
    FINISHED: { text: 'Завершён', dot: 'bg-emerald-400' },
    ARRIVED_IN_MINSK: { text: 'В Минске', dot: 'bg-[var(--ev-gold)]' },
    COMPLETED: { text: 'Доставлен', dot: 'bg-emerald-400' },
    REFUSED: { text: 'Отклонён', dot: 'bg-red-400' },
  };
  return styles[status] || { text: status, dot: 'bg-[var(--ev-text-muted)]' };
};

const getOrderStatusDisplay = (status) => {
  const map = {
    PENDING: { text: 'Ожидает', c: 'text-amber-200 bg-amber-500/15' },
    VERIFIED: { text: 'Подтверждён', c: 'text-[var(--ev-gold)] bg-[var(--ev-gold)]/15' },
    PAID: { text: 'Оплачен', c: 'text-emerald-300 bg-emerald-500/15' },
    PROCESSED: { text: 'Обработан', c: 'text-[var(--ev-gold)] bg-[var(--ev-gold)]/15' },
    COMPLETED: { text: 'Завершён', c: 'text-emerald-300 bg-emerald-500/15' },
    CANCELLED: { text: 'Отменён', c: 'text-red-300 bg-red-500/15' },
    REFUSED: { text: 'Отклонён', c: 'text-red-300 bg-red-500/15' },
    REFUNDED: { text: 'Возвращён', c: 'text-[var(--ev-text-muted)] bg-[var(--ev-text-muted)]/10' },
  };
  const s = map[status] || { text: status || '—', c: 'text-[var(--ev-text-muted)] bg-[var(--ev-gold)]/10' };
  return { text: s.text, className: `rounded-lg px-2 py-0.5 text-xs font-medium ${s.c}` };
};

const getPurchaseStatusDisplay = (status) => {
  const map = {
    PURCHASED: { text: 'Выкуплен', c: 'text-emerald-300 bg-emerald-500/15' },
    NOT_PURCHASED: { text: 'Не выкуплен', c: 'text-red-300 bg-red-500/15' },
  };
  const s = map[status] || { text: 'Ожидает', c: 'text-amber-200 bg-amber-500/15' };
  return { text: s.text, className: `rounded-lg px-2 py-0.5 text-xs font-medium ${s.c}` };
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const BatchCargoDetails = () => {
  const { user } = useAuth();
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batchCargo, setBatchCargo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBatchCargo = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/batch-cargos/usr/${batchId}`);
        if (response?.data) {
          const sanitized = {
            ...response.data,
            orders: Array.isArray(response.data.orders)
              ? response.data.orders.map((o) => ({ ...o, items: Array.isArray(o.items) ? o.items : [] }))
              : [],
          };
          setBatchCargo(sanitized);
        } else {
          setError('Данные груза не найдены');
        }
      } catch (err) {
        let msg = 'Ошибка загрузки';
        if (err.code === 'ERR_NETWORK') msg = 'Нет связи с сервером';
        else if (err.response?.status === 403) msg = 'Доступ запрещён';
        else msg = err.response?.data?.message || err.message || msg;
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) fetchBatchCargo();
  }, [batchId, user?.email]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--ev-void)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-[var(--ev-gold)]/30 border-t-[var(--ev-gold)] animate-spin" />
          <p className="text-sm text-[var(--ev-text-muted)]">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--ev-void)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--ev-glass)] backdrop-blur-sm rounded-xl p-8 max-w-sm text-center border border-[var(--ev-gold)]/20"
        >
          <XCircleIcon className="w-10 h-10 text-red-400 mx-auto mb-4" />
          <p className="text-[var(--ev-text)] font-medium mb-6">{error}</p>
          <button
            onClick={() => navigate('/batch-cargo-list')}
            className="w-full py-2.5 rounded-xl bg-[var(--ev-gold)]/20 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] text-sm font-medium hover:bg-[var(--ev-gold)]/30 transition-colors"
          >
            К списку грузов
          </button>
        </motion.div>
      </div>
    );
  }

  if (!batchCargo || batchCargo.orders.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--ev-void)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--ev-glass)] backdrop-blur-sm rounded-xl p-8 max-w-sm text-center border border-[var(--ev-gold)]/20"
        >
          <CubeIcon className="w-10 h-10 text-[var(--ev-text-muted)] mx-auto mb-4" />
          <p className="text-[var(--ev-text)] font-medium mb-2">В этом грузе нет ваших заказов</p>
          <p className="text-sm text-[var(--ev-text-muted)] mb-6">Показываются только заказы, в которых вы участвуете.</p>
          <button
            onClick={() => navigate('/batch-cargo-list')}
            className="w-full py-2.5 rounded-xl bg-[var(--ev-gold)]/20 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] text-sm font-medium hover:bg-[var(--ev-gold)]/30 transition-colors"
          >
            К списку грузов
          </button>
        </motion.div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(batchCargo.status);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--ev-void)] font-[var(--ev-font-body)]">
      <Helmet>
        <title>{`Груз #${batchCargo.id} | Сборные грузы | Fluvion`}</title>
        <meta name="description" content={`Детали сборного груза #${batchCargo.id}. Ваши заказы и статусы.`} />
      </Helmet>

      {/* Sidebar — инфо о грузе */}
      <aside className="lg:w-80 lg:min-h-screen lg:sticky lg:top-0 shrink-0 bg-[var(--ev-glass)] backdrop-blur-[var(--ev-glass-blur)] border-r border-[var(--ev-gold)]/15">
        <div className="p-6 sm:p-6 lg:p-8">
          <button
            type="button"
            onClick={() => navigate('/batch-cargo-list')}
            className="inline-flex items-center gap-2 text-[var(--ev-text-muted)] hover:text-[var(--ev-gold)] text-sm font-medium mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            К списку грузов
          </button>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 flex items-center justify-center">
              <TruckIcon className="w-6 h-6 text-[var(--ev-gold)]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[var(--ev-text)] font-[var(--ev-font-display)]">Груз #{batchCargo.id}</h1>
              <p className="text-[var(--ev-text-muted)] text-sm">Сборный груз</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-6">
            <span className={`w-2 h-2 rounded-full ${statusDisplay.dot}`} />
            <span className="text-sm font-medium text-[var(--ev-text)]">{statusDisplay.text}</span>
          </div>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-[var(--ev-text-muted)] mb-0.5">Создан</dt>
              <dd className="text-[var(--ev-text)] font-medium">{formatDate(batchCargo.creationDate)}</dd>
            </div>
            {batchCargo.purchaseDate && (
              <div>
                <dt className="text-[var(--ev-text-muted)] mb-0.5">Закупка</dt>
                <dd className="text-[var(--ev-text)] font-medium">{formatDate(batchCargo.purchaseDate)}</dd>
              </div>
            )}
          </dl>
          {batchCargo.description && (
            <div className="mt-6 pt-6 border-t border-[var(--ev-gold)]/10">
              <dt className="text-[var(--ev-text-muted)] text-sm mb-1">Описание</dt>
              <dd className="text-[var(--ev-text-muted)] text-sm leading-relaxed">{batchCargo.description}</dd>
            </div>
          )}
        </div>
      </aside>

      {/* Main — заказы */}
      <main className="flex-1 p-5 sm:p-6 lg:p-8 pb-28">
        <h2 className="ev-label text-[var(--ev-gold)] text-xs font-semibold uppercase tracking-wider mb-5">
          Ваши заказы ({batchCargo.orders.length})
        </h2>
        <div className="space-y-5 sm:space-y-6">
          {batchCargo.orders.map((order, idx) => {
            const orderStatus = getOrderStatusDisplay(order.status);
            const isSelfPickup = order.totalClientPrice === 0;
            return (
              <motion.article
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="bg-[var(--ev-glass)] backdrop-blur-[var(--ev-glass-blur)] rounded-2xl border border-[var(--ev-gold)]/15 overflow-hidden hover:border-[var(--ev-gold)]/25 transition-colors"
              >
                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-[var(--ev-text)] text-lg">Заказ #{order.orderNumber}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className={orderStatus.className}>{orderStatus.text}</span>
                      {order.totalClientPrice > 0 && (
                        <span className="text-sm text-[var(--ev-text-muted)]">¥{order.totalClientPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/batch-cargos/${batchId}/order/${order.id}`)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--ev-gold)]/20 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] text-sm font-medium hover:bg-[var(--ev-gold)]/30 hover:border-[var(--ev-gold)]/50 transition-colors shrink-0"
                  >
                    Детали
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>

                {order.items && order.items.length > 0 ? (
                  <div className="p-4 sm:p-5 border-t border-[var(--ev-gold)]/10">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
                      {order.items.map((item, itemIdx) => {
                        const purchaseStatus = getPurchaseStatusDisplay(item.purchaseStatus || 'PENDING');
                        const name = isSelfPickup ? (item.trackingNumber || 'Самовыкуп') : (item.productName || 'Без названия');
                        return (
                          <div
                            key={item.id || itemIdx}
                            className="flex flex-col rounded-xl border border-[var(--ev-gold)]/15 bg-[var(--ev-void)]/30 overflow-hidden hover:border-[var(--ev-gold)]/25 transition-colors aspect-[3/4] w-full"
                          >
                            <div className="flex-[7] min-h-0 w-full bg-[var(--ev-void)]/50 flex items-center justify-center">
                              {!isSelfPickup && item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={name}
                                  className="w-full h-full object-contain p-2"
                                  onError={(e) => { e.target.src = 'https://via.placeholder.com/120?text=—'; }}
                                />
                              ) : (
                                <CubeIcon className="w-10 h-10 text-[var(--ev-gold)]/30" />
                              )}
                            </div>
                            <div className="flex-[3] min-h-0 p-3 flex flex-col justify-center overflow-hidden">
                              <p className="text-sm font-medium text-[var(--ev-text)] line-clamp-2 leading-snug">{name}</p>
                              {!isSelfPickup && (
                                <p className="text-xs text-[var(--ev-text-muted)] mt-0.5">
                                  {item.quantity || 1} шт · ¥{(item.priceAtTime || 0).toFixed(2)}
                                </p>
                              )}
                              {item.trackingNumber && (
                                <p className="text-xs text-[var(--ev-text-muted)] font-mono truncate mt-0.5" title={item.trackingNumber}>
                                  {item.trackingNumber}
                                </p>
                              )}
                              <span className={`inline-block mt-1.5 !px-2 !py-0.5 !text-xs rounded-md w-fit ${purchaseStatus.className}`}>
                                {purchaseStatus.text}
                              </span>
                              {item.purchaseStatus === 'NOT_PURCHASED' && item.purchaseRefusalReason && (
                                <p className="text-xs text-red-300 mt-0.5 line-clamp-1">{item.purchaseRefusalReason}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 sm:p-5 border-t border-[var(--ev-gold)]/10">
                    <p className="text-sm text-[var(--ev-text-muted)]">Нет товаров</p>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>

        <div className="mt-10">
          <button
            onClick={() => navigate('/batch-cargo-list')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--ev-gold)]/20 text-[var(--ev-text-muted)] text-sm font-medium hover:text-[var(--ev-gold)] hover:border-[var(--ev-gold)]/40 hover:bg-[var(--ev-gold)]/5 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            К списку грузов
          </button>
        </div>
      </main>
    </div>
  );
};

export default BatchCargoDetails;
