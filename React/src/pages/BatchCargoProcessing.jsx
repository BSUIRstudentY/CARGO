import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShoppingBagIcon,
  CubeIcon,
} from '@heroicons/react/24/solid';
import api from '../api/axiosInstance';
import Tilt from 'react-parallax-tilt';
import { Loading } from '../components/ui/Loading';

const BatchCargoProcessing = () => {
  const { batchId, orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get(`/orders/${orderId}`)
      .then((response) => {
        if (response?.data) {
          const hasMissingIds = response.data.items?.some(item => !item.id);
          if (hasMissingIds) {
            setError('Некоторые товары не имеют ID. Проверьте данные заказа.');
          } else {
            setOrder(response.data);
          }
        } else {
          setError('Данные заказа не найдены');
        }
        setLoading(false);
      })
      .catch((err) => {
        let errorMessage = 'Ошибка загрузки заказа';
        if (err.code === 'ERR_NETWORK') errorMessage = 'Нет связи с сервером.';
        else if (err.response?.status === 403) errorMessage = 'Доступ запрещён';
        else errorMessage = err.response?.data?.message || err.message || errorMessage;
        setError(errorMessage);
        setLoading(false);
      });
  }, [orderId]);

  const getPurchaseStatusDisplay = (status) => {
    const map = {
      PURCHASED: { text: 'Выкуплен', c: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30', icon: <CheckCircleIcon className="w-4 h-4" /> },
      NOT_PURCHASED: { text: 'Не выкуплен', c: 'text-red-300 bg-red-500/15 border-red-500/30', icon: <XCircleIcon className="w-4 h-4" /> },
      PENDING: { text: 'Ожидает', c: 'text-amber-200 bg-amber-500/15 border-amber-500/30', icon: <ClockIcon className="w-4 h-4" /> },
    };
    const s = map[status] || map.PENDING;
    return { ...s, className: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${s.c}` };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--ev-void)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-[var(--ev-gold)]/30 border-t-[var(--ev-gold)] animate-spin" />
          <p className="text-sm text-[var(--ev-text-muted)]">Загрузка заказа...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-[var(--ev-void)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--ev-glass)] backdrop-blur-sm rounded-2xl p-8 max-w-md text-center border border-[var(--ev-gold)]/20"
        >
          <XCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-[var(--ev-text)] font-medium mb-6">{error}</p>
          <button
            onClick={() => navigate(`/batch-cargo-details/${batchId}`)}
            className="w-full py-2.5 rounded-xl bg-[var(--ev-gold)]/20 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] text-sm font-medium hover:bg-[var(--ev-gold)]/30 transition-colors"
          >
            К сборному грузу
          </button>
        </motion.div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[var(--ev-void)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--ev-glass)] backdrop-blur-sm rounded-2xl p-8 max-w-sm text-center border border-[var(--ev-gold)]/20"
        >
          <ShoppingBagIcon className="w-12 h-12 text-[var(--ev-text-muted)] mx-auto mb-4" />
          <p className="text-[var(--ev-text)] font-medium mb-6">Заказ не найден</p>
          <button
            onClick={() => navigate(`/batch-cargo-details/${batchId}`)}
            className="w-full py-2.5 rounded-xl bg-[var(--ev-gold)]/20 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] text-sm font-medium hover:bg-[var(--ev-gold)]/30 transition-colors"
          >
            К сборному грузу
          </button>
        </motion.div>
      </div>
    );
  }

  const isSelfPickup = order.totalClientPrice === 0;

  return (
    <div className="min-h-screen bg-[var(--ev-void)] text-[var(--ev-text)] font-[var(--ev-font-body)]">
      <Helmet>
        <title>{`Заказ #${order.orderNumber} | Сборный груз | Fluvion`}</title>
        <meta name="description" content={`Детали заказа #${order.orderNumber} в сборном грузе.`} />
      </Helmet>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-28">
        <button
          type="button"
          onClick={() => navigate(`/batch-cargo-details/${batchId}`)}
          className="inline-flex items-center gap-2 text-[var(--ev-text-muted)] hover:text-[var(--ev-gold)] text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          К сборному грузу
        </button>

        {/* Карточка заказа */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 overflow-hidden">
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 flex items-center justify-center shrink-0">
                <ShoppingBagIcon className="w-7 h-7 text-[var(--ev-gold)]" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-[var(--ev-font-display)] text-xl sm:text-2xl font-semibold text-[var(--ev-text)]">
                  Заказ #{order.orderNumber}
                </h1>
                <p className="text-sm text-[var(--ev-text-muted)] mt-0.5">
                  Создан {new Date(order.dateCreated).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                {order.deliveryAddress && (
                  <p className="text-sm text-[var(--ev-text-muted)] mt-2">
                    Адрес: {order.deliveryAddress}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        <h2 className="ev-label text-[var(--ev-gold)] text-xs font-semibold uppercase tracking-wider mb-4">
          Товары в заказе ({order.items?.length || 0})
        </h2>

        {order.items && order.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {order.items.map((item, index) => {
              const purchaseStatus = getPurchaseStatusDisplay(item.purchaseStatus || 'PENDING');
              const name = isSelfPickup ? (item.trackingNumber || 'Самовыкуп') : (item.productName || 'Без названия');
              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                  className="rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 overflow-hidden hover:border-[var(--ev-gold)]/25 transition-colors p-6"
                >
                  {!isSelfPickup && item.imageUrl ? (
                    <div className="w-full h-48 bg-[var(--ev-void)]/50 rounded-xl mb-4 overflow-hidden flex items-center justify-center border border-[var(--ev-gold)]/10">
                      <img
                        src={item.imageUrl}
                        alt={name}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=—'; }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-[var(--ev-void)]/50 rounded-xl mb-4 flex items-center justify-center border border-[var(--ev-gold)]/10">
                      <CubeIcon className="w-12 h-12 text-[var(--ev-gold)]/30" />
                    </div>
                  )}

                  <h4 className="text-lg font-semibold text-[var(--ev-text)] mb-3 line-clamp-2">
                    {name}
                  </h4>

                  {!isSelfPickup && (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--ev-text-muted)]">Количество:</span>
                        <span className="text-[var(--ev-text)] font-medium">{item.quantity || 1}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--ev-text-muted)]">Цена за единицу:</span>
                        <span className="text-[var(--ev-text)] font-medium">¥{(item.priceAtTime || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-[var(--ev-gold)]/10">
                        <span className="text-[var(--ev-text-muted)] font-medium">Итого:</span>
                        <span className="text-[var(--ev-gold)] font-semibold">
                          ¥{((item.priceAtTime || 0) * (item.quantity || 1)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {item.trackingNumber && (
                    <div className="mb-4 p-3 bg-[var(--ev-void)]/30 rounded-xl border border-[var(--ev-gold)]/10">
                      <p className="text-xs text-[var(--ev-text-muted)] mb-0.5">Трек-номер</p>
                      <p className="text-sm text-[var(--ev-text)] font-mono break-all">{item.trackingNumber}</p>
                    </div>
                  )}

                  <div className="flex items-center pt-4 border-t border-[var(--ev-gold)]/10">
                    <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${purchaseStatus.className}`}>
                      {purchaseStatus.icon}
                      {purchaseStatus.text}
                    </span>
                  </div>

                  {item.purchaseStatus === 'NOT_PURCHASED' && item.purchaseRefusalReason && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                      <p className="text-xs text-red-400 font-medium mb-0.5">Причина отказа:</p>
                      <p className="text-sm text-red-300">{item.purchaseRefusalReason}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 p-10 text-center">
            <CubeIcon className="w-12 h-12 text-[var(--ev-text-muted)]/50 mx-auto mb-3" />
            <p className="text-[var(--ev-text)] font-medium">Нет товаров в заказе</p>
            <p className="text-sm text-[var(--ev-text-muted)] mt-1">Товары отсутствуют</p>
          </div>
        )}

        <div className="mt-10">
          <button
            onClick={() => navigate(`/batch-cargo-details/${batchId}`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--ev-gold)]/20 text-[var(--ev-text-muted)] text-sm font-medium hover:text-[var(--ev-gold)] hover:border-[var(--ev-gold)]/40 hover:bg-[var(--ev-gold)]/5 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Вернуться к сборному грузу
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchCargoProcessing;
