import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { ArrowLeftIcon, CreditCardIcon, CheckCircleIcon, TruckIcon, UserIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';


function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loadingPay, setLoadingPay] = useState(false);
  const [payError, setPayError] = useState(null);
  const [currentShippingRate, setCurrentShippingRate] = useState(null);

  const { data: order, isLoading: loading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    },
    retry: 3,
    retryDelay: (attempt) => attempt * 1000,
  });

  // Загружаем текущий курс доставки
  useEffect(() => {
    const fetchShippingRate = async () => {
      try {
        const response = await api.get('/exchange-rates/shipping/current');
        if (response.data && response.data.rate) {
          setCurrentShippingRate(response.data.rate);
        }
      } catch (error) {
        console.error('Ошибка при получении курса доставки:', error);
        setCurrentShippingRate(6.0); // Fallback
      }
    };
    fetchShippingRate();
  }, []);

  const handlePayClick = async () => {
    if (loadingPay) return;
    setLoadingPay(true);
    setPayError(null);

    try {
      const isSelfPickup = order.totalClientPrice === 0;

      const totalItemsPrice = order.items?.reduce((sum, item) => {
        return sum + (item.priceAtTime || 0) * (item.quantity || 1);
      }, 0) || 0;

      const totalChinaDeliveryPrice = order.items?.reduce((sum, item) => {
        return sum + (item.chinaDeliveryPrice || 0);
      }, 0) || 0;

      const amount = order.totalClientPrice + totalChinaDeliveryPrice;

      const response = await api.post('/payment/create', {
        orderId: parseInt(orderId),
        amount,
      });

      if (response.data.success && response.data.formUrl) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C9A97A', '#D4AF37', '#F5F5F5'],
        });
        window.location.href = response.data.formUrl;
      } else {
        throw new Error('Invalid response from payment API');
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      setPayError(
        'Ошибка инициации оплаты: ' +
          (err.response?.data?.error || err.message)
      );
    } finally {
      setLoadingPay(false);
    }
  };

  // Экраны загрузки и ошибок
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-[var(--ev-gold)] text-xl bg-[var(--ev-glass)] p-8 rounded-2xl border border-[var(--ev-gold)]/20"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--ev-gold)]/30 border-t-[var(--ev-gold)] mx-auto mb-6" />
          Загрузка деталей заказа...
        </motion.div>
      </div>
    );
  }

  if (error) {
    const errorMsg =
      error.response?.status === 403
        ? 'Доступ запрещён. Обратитесь к администратору.'
        : 'Ошибка загрузки деталей заказа: ' +
          (error.response?.data?.errorMessage || error.message);

    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-red-300 text-xl bg-red-500/10 p-8 rounded-2xl border border-red-500/20"
        >
          {errorMsg}
        </motion.div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-[var(--ev-text-muted)] text-xl bg-[var(--ev-glass)] p-8 rounded-2xl border border-[var(--ev-gold)]/15"
        >
          Заказ не найден
        </motion.div>
      </div>
    );
  }

  const isSelfPickup = order.totalClientPrice === 0;

  const CNY_TO_BYN_RATE = 0.45;

  const totalItemsPrice = order.items?.reduce((sum, item) => {
    return sum + (item.priceAtTime || 0) * (item.quantity || 1);
  }, 0) || 0;

  const totalChinaDeliveryPrice = order.items?.reduce((sum, item) => {
    return sum + (item.chinaDeliveryPrice || 0);
  }, 0) || 0;

  // Функция для перевода статуса заказа на русский
  const getOrderStatusText = (status) => {
    const statusMap = {
      'PENDING': 'Ожидает подтверждения',
      'VERIFIED': 'Подтверждён',
      'PAID': 'Оплачен',
      'PROCESSED': 'Обработан',
      'COMPLETED': 'Завершён',
      'CANCELLED': 'Отменён',
      'REFUSED': 'Отклонён',
      'REFUNDED': 'Возвращён'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="min-h-screen bg-transparent text-[var(--ev-text)] py-4 px-3 sm:py-12 sm:px-6 lg:px-8 relative overflow-hidden pb-20 sm:pb-12">

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--ev-text)]">
            Детали заказа #{order.orderNumber}
          </h1>
          <p className="text-[var(--ev-text-muted)] text-sm sm:text-base mt-1">
            Просмотрите информацию о вашем заказе
          </p>
        </motion.div>

        <AnimatePresence>
          {payError && (
            <Alert
              type="error"
              message={payError}
              onClose={() => setPayError(null)}
              className="mb-4 sm:mb-8"
            />
          )}
        </AnimatePresence>

        {/* Информационное сообщение о курсе доставки */}
        {order.status === 'VERIFIED' && order.totalClientPrice > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4 sm:mb-8"
          >
            <div className="p-3 sm:p-6 bg-[var(--ev-glass)] rounded-xl sm:rounded-2xl border border-[var(--ev-gold)]/20 hover:border-[var(--ev-gold)]/30 transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[var(--ev-gold)]/10 rounded-full flex items-center justify-center border border-[var(--ev-gold)]/25">
                    <InformationCircleIcon className="w-5 h-5 sm:w-7 sm:h-7 text-[var(--ev-gold)]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-xl font-semibold mb-2 sm:mb-3 text-[var(--ev-text)]">
                    Курс доставки
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-base text-[var(--ev-text-muted)]">
                    <p className="flex items-start gap-2">
                      <span>
                        <strong className="text-[var(--ev-text)]">Текущий курс:</strong>{' '}
                        <span className="text-[var(--ev-gold)] font-semibold">
                          ${currentShippingRate ? currentShippingRate.toFixed(2) : '6.00'} за кг
                        </span>
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-[var(--ev-gold)] mt-0.5">🔒</span>
                      <span>При оплате курс будет зафиксирован на момент оплаты.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Информация о зафиксированном курсе для оплаченных заказов */}
        {order.status === 'PAID' && order.shippingRateFixed && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4 sm:mb-8"
          >
            <div className="p-3 sm:p-6 bg-[var(--ev-glass)] rounded-xl sm:rounded-2xl border border-[var(--ev-gold)]/20 hover:border-[var(--ev-gold)]/30 transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[var(--ev-gold)]/10 rounded-full flex items-center justify-center border border-[var(--ev-gold)]/25">
                    <CheckCircleIcon className="w-5 h-5 sm:w-7 sm:h-7 text-[var(--ev-gold)]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-xl font-semibold mb-2 sm:mb-3 text-[var(--ev-text)]">
                    Курс зафиксирован
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-base text-[var(--ev-text-muted)]">
                    <p className="flex items-start gap-2">
                      <span className="text-[var(--ev-gold)] mt-0.5">🔒</span>
                      <span>Курс: <strong className="text-[var(--ev-gold)] font-semibold">${order.shippingRateFixed.toFixed(2)} за кг</strong></span>
                    </p>
                    <p className="text-xs sm:text-sm text-[var(--ev-text-muted)]">На момент оплаты, не изменится.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Информационное сообщение для оплаченных заказов */}
        {order.status === 'PAID' && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4 sm:mb-8"
          >
            <div className="p-3 sm:p-6 bg-emerald-500/10 rounded-xl sm:rounded-2xl border border-emerald-500/20 transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                    <CheckCircleIcon className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-xl font-semibold mb-2 sm:mb-3 text-emerald-300">
                    Оплачен!
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-base text-[var(--ev-text-muted)]">
                    <p className="flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span>
                      <span>Заказ в обработке, будет в ближайшем сборном грузе.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <TruckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--ev-gold)] mt-0.5 flex-shrink-0" />
                      <span>Статус груза — в уведомлениях.</span>
                    </p>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-emerald-500/20">
                      <p className="flex items-start gap-2 text-[var(--ev-text)] text-xs sm:text-base">
                        <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--ev-gold)] mt-0.5 flex-shrink-0" />
                        <span><strong>Сборные грузы</strong> — в профиле или в меню.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Информация о заказе и финансы */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-12"
        >
          <div className="p-4 sm:p-6 bg-[var(--ev-glass)] rounded-xl sm:rounded-2xl border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <h3 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-4 text-[var(--ev-text)]">
              О заказе
            </h3>
            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <p className="text-[var(--ev-text-muted)]">
                <strong className="text-[var(--ev-text)]">Дата:</strong>{' '}
                <span className="text-[var(--ev-text)]">{new Date(order.dateCreated).toLocaleString('ru-RU')}</span>
              </p>
              <div>
                <p className="text-[var(--ev-text-muted)] mb-1 sm:mb-2">
                  <strong className="text-[var(--ev-text)]">Статус:</strong>
                </p>
                <span
                  className={`inline-block px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm ${
                    order.status === 'PENDING'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : order.status === 'VERIFIED'
                      ? 'bg-[var(--ev-gold)]/20 text-[var(--ev-gold)] border border-[var(--ev-gold)]/40'
                      : order.status === 'PAID'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : order.status === 'PROCESSED'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : order.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : (order.status === 'CANCELLED' || order.status === 'REFUSED')
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                      : 'bg-[var(--ev-text-muted)]/20 text-[var(--ev-text-muted)] border border-[var(--ev-text-muted)]/40'
                  }`}
                >
                  {getOrderStatusText(order.status)}
                </span>
                {order.status === 'PENDING' && (
                  <p className="text-purple-300 text-sm mt-2">
                    Заказ ждёт одобрения администратора.
                  </p>
                )}
                {(order.status === 'CANCELLED' || order.status === 'REFUSED') && order.reasonRefusal && (
                  <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-red-300 font-semibold text-sm mb-1">Причина отказа:</p>
                    <p className="text-red-200/90 text-sm">{order.reasonRefusal}</p>
                  </div>
                )}
              </div>
              {(order.lastName || order.firstName || order.middleName) && (
                <p className="text-[var(--ev-text-muted)]">
                  <strong className="text-[var(--ev-text)]">ФИО:</strong>{' '}
                  <span className="text-[var(--ev-text)]">
                    {`${order.lastName || ''} ${order.firstName || ''} ${order.middleName || ''}`.trim() || 'Не указано'}
                  </span>
                </p>
              )}
              {order.userPhone && (
                <p className="text-[var(--ev-text-muted)]">
                  <strong className="text-[var(--ev-text)]">Указанный телефон:</strong>{' '}
                  <span className="text-[var(--ev-text)]">{order.userPhone}</span>
                </p>
              )}
              <p className="text-[var(--ev-text-muted)]">
                <strong className="text-[var(--ev-text)]">Адрес доставки:</strong>{' '}
                <span className="text-[var(--ev-text)]">{order.deliveryAddress || 'Не указан'}</span>
              </p>
              {order.trackingNumber && (
                <p className="text-[var(--ev-text-muted)]">
                  <strong className="text-[var(--ev-text)]">Трек-номер:</strong>{' '}
                  <span className="text-[var(--ev-text)]">{order.trackingNumber}</span>
                </p>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-[var(--ev-glass)] rounded-xl sm:rounded-2xl border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <h3 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-4 text-[var(--ev-text)]">
              Финансы
            </h3>

            {isSelfPickup ? (
              <p className="text-[var(--ev-gold)] text-xs sm:text-base bg-[var(--ev-gold)]/10 p-2 sm:p-3 rounded-lg border border-[var(--ev-gold)]/20">
                Самовыкуп — оплата только за доставку.
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                <p className="text-[var(--ev-text-muted)]">
                  <strong className="text-[var(--ev-text)]">Сумма товаров:</strong>{' '}
                  <span className="text-[var(--ev-gold)] font-medium">
                    {(totalItemsPrice * CNY_TO_BYN_RATE).toFixed(2)} BYN
                  </span>
                  <span className="text-xs text-[var(--ev-text-muted)] ml-2">
                    (¥{totalItemsPrice.toFixed(2)})
                  </span>
                </p>
                {totalChinaDeliveryPrice > 0 && (
                  <p className="text-[var(--ev-text-muted)]">
                    <strong className="text-[var(--ev-text)]">Доставка по Китаю:</strong>{' '}
                    <span className="text-[var(--ev-gold)] font-medium">
                      {(totalChinaDeliveryPrice * CNY_TO_BYN_RATE).toFixed(2)} BYN
                    </span>
                    <span className="text-xs text-[var(--ev-text-muted)] ml-2">
                      (¥{totalChinaDeliveryPrice.toFixed(2)})
                    </span>
                  </p>
                )}
                {order.insurance && order.insuranceCost > 0 && (
                  <p className="text-[var(--ev-text-muted)]">
                    <strong className="text-[var(--ev-text)]">Стоимость страховки:</strong>{' '}
                    <span className="text-[var(--ev-gold)] font-medium">
                      {(order.insuranceCost * CNY_TO_BYN_RATE).toFixed(2)} BYN
                    </span>
                    <span className="text-xs text-[var(--ev-text-muted)] ml-2">
                      (¥{order.insuranceCost.toFixed(2)})
                    </span>
                  </p>
                )}
                {order.supplierCost > 0 && (
                  <p className="text-[var(--ev-text-muted)]">
                    <strong className="text-[var(--ev-text)]">Стоимость поставщика:</strong>{' '}
                    <span className="text-[var(--ev-gold)] font-medium">
                      {(order.supplierCost * CNY_TO_BYN_RATE).toFixed(2)} BYN
                    </span>
                    <span className="text-xs text-[var(--ev-text-muted)] ml-2">
                      (¥{order.supplierCost.toFixed(2)})
                    </span>
                  </p>
                )}
                {order.userDiscountApplied > 0 && (
                  <p className="text-emerald-400">
                    <strong>Скидка пользователя:</strong>{' '}
                    <span className="font-medium">
                      -{(order.userDiscountApplied * CNY_TO_BYN_RATE).toFixed(2)} BYN
                    </span>
                    <span className="text-xs text-emerald-400/70 ml-2">
                      (-¥{order.userDiscountApplied.toFixed(2)})
                    </span>
                  </p>
                )}
                {order.discountValue > 0 && (
                  <p className="text-emerald-400">
                    <strong>
                      Скидка по промокоду
                      {order.discountType === 'PERCENTAGE' && ` (${order.discountValue}%)`}:
                    </strong>{' '}
                    <span className="font-medium">
                      -{(order.discountType === 'PERCENTAGE'
                        ? (totalItemsPrice * order.discountValue / 100)
                        : order.discountValue) * CNY_TO_BYN_RATE} BYN
                    </span>
                    <span className="text-xs text-emerald-400/70 ml-2">
                      (-¥{order.discountType === 'PERCENTAGE'
                        ? (totalItemsPrice * order.discountValue / 100).toFixed(2)
                        : order.discountValue.toFixed(2)})
                    </span>
                  </p>
                )}

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[var(--ev-gold)]/15">
                  <p className="text-[var(--ev-text-muted)] font-semibold mb-1 sm:mb-2 text-xs sm:text-base">
                    <strong className="text-[var(--ev-text)]">Итого:</strong>
                  </p>
                  <div className="w-full bg-[var(--ev-gold)]/10 rounded-full h-2 sm:h-3">
                    <motion.div
                      className="bg-[var(--ev-gold)] h-2 sm:h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1, ease: 'easeInOut' }}
                    />
                  </div>
                  <p className="text-xl sm:text-3xl font-bold text-[var(--ev-gold)] mt-1 sm:mt-2">
                    {((order.totalClientPrice + totalChinaDeliveryPrice) * CNY_TO_BYN_RATE).toFixed(2)} BYN
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--ev-text-muted)] mt-0.5 sm:mt-1">
                    (¥{(order.totalClientPrice + totalChinaDeliveryPrice).toFixed(2)})
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* Товары / Трек-номера */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6 sm:mb-12"
        >
          <div className="p-4 sm:p-6 bg-[var(--ev-glass)] rounded-xl sm:rounded-2xl border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <h3 className="text-lg sm:text-2xl font-semibold mb-4 sm:mb-6 text-[var(--ev-text)]">
              {isSelfPickup ? 'Трек-номера' : 'Товары'}
            </h3>

            {isSelfPickup ? (
              order.items?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 sm:p-4 bg-[var(--ev-gold)]/5 rounded-lg sm:rounded-xl border border-[var(--ev-gold)]/15 transition-all duration-300"
                    >
                      <p className="font-medium text-sm sm:text-lg text-[var(--ev-text)] break-words">
                        {item.trackingNumber || 'Трек не указан'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[var(--ev-text-muted)] text-sm sm:text-base">
                  Нет трек-номеров.
                </p>
              )
            ) : order.items?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 sm:p-4 bg-[var(--ev-gold)]/5 rounded-lg sm:rounded-xl border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/30 transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/product/${item.productId}`)}
                  >
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="w-12 h-12 sm:w-20 sm:h-20 bg-[var(--ev-gold)]/5 rounded-md border border-[var(--ev-gold)]/15 flex items-center justify-center p-1 sm:p-2 overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName || 'Товар'}
                            className="w-full h-full object-contain transform hover:scale-105 transition duration-300"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/80x80?text=Нет+фото';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-[var(--ev-text-muted)]">
                            Нет фото
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-lg text-[var(--ev-text)] break-words line-clamp-2">
                          {item.productName || 'Без названия'}
                        </p>
                        <p className="text-[var(--ev-text-muted)] mt-0.5 text-xs sm:text-base">
                          x{item.quantity} • ¥{item.priceAtTime?.toFixed(2)}
                        </p>
                        {item.chinaDeliveryPrice > 0 && (
                          <p className="text-[var(--ev-text-muted)] text-xs sm:text-base">Китай: ¥{item.chinaDeliveryPrice.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[var(--ev-text-muted)] text-sm sm:text-base">
                Нет товаров.
              </p>
            )}
          </div>
        </motion.section>

        {/* Кнопки действий */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-4"
        >
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 text-sm sm:text-base py-2.5 sm:py-3 w-full sm:w-auto border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/10"
          >
            <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Назад
          </Button>

          {order.status === 'VERIFIED' && order.totalClientPrice > 0 && !loadingPay && (
            <Button
              variant="primary"
              onClick={handlePayClick}
              className="flex items-center justify-center gap-2 text-sm sm:text-base py-2.5 sm:py-3 w-full sm:w-auto bg-[var(--ev-gold)]/15 border border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/25"
            >
              <CreditCardIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Оплатить
            </Button>
          )}

          {loadingPay && (
            <Button variant="primary" disabled className="flex items-center justify-center gap-2 text-sm py-2.5 w-full sm:w-auto bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 text-[var(--ev-text-muted)]">
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-[var(--ev-gold)]/30 border-t-[var(--ev-gold)]" />
              Оплата...
            </Button>
          )}
        </motion.section>
      </div>
    </div>
  );
}

export default OrderDetails;