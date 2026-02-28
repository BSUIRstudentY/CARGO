import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { ArrowLeftIcon, CreditCardIcon, CheckCircleIcon, TruckIcon, UserIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
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
          colors: ['#00f0ff', '#a78bfa', '#10b981'],
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
          className="text-center text-[#00f0ff] text-2xl bg-[rgba(255,255,255,0.02)] p-8 rounded-2xl border border-[rgba(255,255,255,0.1)]"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-[#00f0ff] mx-auto mb-6" />
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
          className="text-center text-[#ef4444] text-xl bg-[rgba(239,68,68,0.1)] p-8 rounded-2xl border border-[rgba(239,68,68,0.3)]"
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
          className="text-center text-[#9ca3af] text-2xl bg-[rgba(255,255,255,0.02)] p-8 rounded-2xl border border-[rgba(255,255,255,0.1)]"
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
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-4 px-3 sm:py-12 sm:px-6 lg:px-8 relative overflow-hidden pb-20 sm:pb-12">

      <div className="max-w-7xl mx-auto relative z-10">
        <PageHeader
          title={`Детали заказа #${order.orderNumber}`}
          subtitle="Просмотрите информацию о вашем заказе"
          className="mb-4 sm:mb-8"
        />

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
            <div className="p-3 sm:p-6 bg-[rgba(0,240,255,0.1)] rounded-xl sm:rounded-2xl border border-[rgba(0,240,255,0.3)] transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[rgba(0,240,255,0.2)] rounded-full flex items-center justify-center border border-[rgba(0,240,255,0.4)]">
                    <InformationCircleIcon className="w-5 h-5 sm:w-7 sm:h-7 text-[#00f0ff]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-[#00f0ff] to-[#a78bfa] bg-clip-text text-transparent">
                    Курс доставки
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-base text-[#9ca3af]">
                    <p className="flex items-start gap-2">
                      <span>
                        <strong className="text-[#e5e7eb]">Текущий курс:</strong>{' '}
                        <span className="text-[#00f0ff] font-semibold">
                          ${currentShippingRate ? currentShippingRate.toFixed(2) : '6.00'} за кг
                        </span>
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="text-[#a78bfa] mt-0.5">🔒</span>
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
            <div className="p-3 sm:p-6 bg-[rgba(167,139,250,0.1)] rounded-xl sm:rounded-2xl border border-[rgba(167,139,250,0.3)] transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[rgba(167,139,250,0.2)] rounded-full flex items-center justify-center border border-[rgba(167,139,250,0.4)]">
                    <CheckCircleIcon className="w-5 h-5 sm:w-7 sm:h-7 text-[#a78bfa]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-[#a78bfa] to-[#00f0ff] bg-clip-text text-transparent">
                    Курс зафиксирован
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-base text-[#9ca3af]">
                    <p className="flex items-start gap-2">
                      <span className="text-[#a78bfa] mt-0.5">🔒</span>
                      <span>Курс: <strong className="text-[#a78bfa] font-semibold">${order.shippingRateFixed.toFixed(2)} за кг</strong></span>
                    </p>
                    <p className="text-xs sm:text-sm text-[#9ca3af]">На момент оплаты, не изменится.</p>
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
            <div className="p-3 sm:p-6 bg-[rgba(16,185,129,0.1)] rounded-xl sm:rounded-2xl border border-[rgba(16,185,129,0.3)] transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 bg-[rgba(16,185,129,0.2)] rounded-full flex items-center justify-center border border-[rgba(16,185,129,0.4)]">
                    <CheckCircleIcon className="w-5 h-5 sm:w-7 sm:h-7 text-[#10b981]" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-[#10b981] to-[#00f0ff] bg-clip-text text-transparent">
                    Оплачен!
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-base text-[#9ca3af]">
                    <p className="flex items-start gap-2">
                      <span className="text-[#10b981] mt-0.5">✓</span>
                      <span>Заказ в обработке, будет в ближайшем сборном грузе.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <TruckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#00f0ff] mt-0.5 flex-shrink-0" />
                      <span>Статус груза — в уведомлениях.</span>
                    </p>
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[rgba(16,185,129,0.2)]">
                      <p className="flex items-start gap-2 text-[#e5e7eb] text-xs sm:text-base">
                        <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#a78bfa] mt-0.5 flex-shrink-0" />
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
          <div className="p-4 sm:p-6 bg-[rgba(255,255,255,0.02)] rounded-xl sm:rounded-2xl border border-[rgba(255,255,255,0.05)] transition-all duration-300">
            <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
              О заказе
            </h3>
            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
              <p className="text-[#9ca3af]">
                <strong className="text-[#e5e7eb]">Дата:</strong>{' '}
                <span className="text-[#e5e7eb]">{new Date(order.dateCreated).toLocaleString('ru-RU')}</span>
              </p>
              <div>
                <p className="text-[#9ca3af] mb-1 sm:mb-2">
                  <strong className="text-[#e5e7eb]">Статус:</strong>
                </p>
                <span
                  className={`inline-block px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm ${
                    order.status === 'PENDING'
                      ? 'bg-[rgba(167,139,250,0.2)] text-[#a78bfa] border border-[rgba(167,139,250,0.4)]'
                      : order.status === 'VERIFIED'
                      ? 'bg-[rgba(0,240,255,0.2)] text-[#00f0ff] border border-[rgba(0,240,255,0.4)]'
                      : order.status === 'PAID'
                      ? 'bg-[rgba(16,185,129,0.2)] text-[#10b981] border border-[rgba(16,185,129,0.4)]'
                      : order.status === 'PROCESSED'
                      ? 'bg-[rgba(167,139,250,0.2)] text-[#a78bfa] border border-[rgba(167,139,250,0.4)]'
                      : order.status === 'COMPLETED'
                      ? 'bg-[rgba(16,185,129,0.2)] text-[#10b981] border border-[rgba(16,185,129,0.4)]'
                      : (order.status === 'CANCELLED' || order.status === 'REFUSED')
                      ? 'bg-[rgba(239,68,68,0.2)] text-[#ef4444] border border-[rgba(239,68,68,0.4)]'
                      : 'bg-[rgba(107,114,128,0.2)] text-[#9ca3af] border border-[rgba(107,114,128,0.4)]'
                  }`}
                >
                  {getOrderStatusText(order.status)}
                </span>
                {order.status === 'PENDING' && (
                  <p className="text-[#a78bfa] text-sm mt-2">
                    Заказ ждёт одобрения администратора.
                  </p>
                )}
                {(order.status === 'CANCELLED' || order.status === 'REFUSED') && order.reasonRefusal && (
                  <div className="mt-3 p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)]">
                    <p className="text-[#ef4444] font-semibold text-sm mb-1">Причина отказа:</p>
                    <p className="text-[#fca5a5] text-sm">{order.reasonRefusal}</p>
                  </div>
                )}
              </div>
              {(order.lastName || order.firstName || order.middleName) && (
                <p className="text-[#9ca3af]">
                  <strong className="text-[#e5e7eb]">ФИО:</strong>{' '}
                  <span className="text-[#e5e7eb]">
                    {`${order.lastName || ''} ${order.firstName || ''} ${order.middleName || ''}`.trim() || 'Не указано'}
                  </span>
                </p>
              )}
              {order.userPhone && (
                <p className="text-[#9ca3af]">
                  <strong className="text-[#e5e7eb]">Указанный телефон:</strong>{' '}
                  <span className="text-[#e5e7eb]">{order.userPhone}</span>
                </p>
              )}
              <p className="text-[#9ca3af]">
                <strong className="text-[#e5e7eb]">Адрес доставки:</strong>{' '}
                <span className="text-[#e5e7eb]">{order.deliveryAddress || 'Не указан'}</span>
              </p>
              {order.trackingNumber && (
                <p className="text-[#9ca3af]">
                  <strong className="text-[#e5e7eb]">Трек-номер:</strong>{' '}
                  <span className="text-[#e5e7eb]">{order.trackingNumber}</span>
                </p>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-[rgba(255,255,255,0.02)] rounded-xl sm:rounded-2xl border border-[rgba(255,255,255,0.05)] transition-all duration-300">
            <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
              Финансы
            </h3>

            {isSelfPickup ? (
              <p className="text-[#a78bfa] text-xs sm:text-base bg-[rgba(167,139,250,0.1)] p-2 sm:p-3 rounded-lg border border-[rgba(167,139,250,0.3)]">
                Самовыкуп — оплата только за доставку.
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                <p className="text-[#9ca3af]">
                  <strong className="text-[#e5e7eb]">Сумма товаров:</strong>{' '}
                  <span className="text-[#00f0ff] font-medium">
                    {(totalItemsPrice * CNY_TO_BYN_RATE).toFixed(2)} BYN
                  </span>
                  <span className="text-xs text-[#9ca3af] ml-2">
                    (¥{totalItemsPrice.toFixed(2)})
                  </span>
                </p>
                {totalChinaDeliveryPrice > 0 && (
                  <p className="text-[#9ca3af]">
                    <strong className="text-[#e5e7eb]">Доставка по Китаю:</strong>{' '}
                    <span className="text-[#00f0ff] font-medium">
                      {(totalChinaDeliveryPrice * CNY_TO_BYN_RATE).toFixed(2)} BYN
                    </span>
                    <span className="text-xs text-[#9ca3af] ml-2">
                      (¥{totalChinaDeliveryPrice.toFixed(2)})
                    </span>
                  </p>
                )}
                {order.insurance && order.insuranceCost > 0 && (
                  <p className="text-[#9ca3af]">
                    <strong className="text-[#e5e7eb]">Стоимость страховки:</strong>{' '}
                    <span className="text-[#00f0ff] font-medium">
                      {(order.insuranceCost * CNY_TO_BYN_RATE).toFixed(2)} BYN
                    </span>
                    <span className="text-xs text-[#9ca3af] ml-2">
                      (¥{order.insuranceCost.toFixed(2)})
                    </span>
                  </p>
                )}
                {order.supplierCost > 0 && (
                  <p className="text-[#9ca3af]">
                    <strong className="text-[#e5e7eb]">Стоимость поставщика:</strong>{' '}
                    <span className="text-[#00f0ff] font-medium">
                      {(order.supplierCost * CNY_TO_BYN_RATE).toFixed(2)} BYN
                    </span>
                    <span className="text-xs text-[#9ca3af] ml-2">
                      (¥{order.supplierCost.toFixed(2)})
                    </span>
                  </p>
                )}
                {order.userDiscountApplied > 0 && (
                  <p className="text-[#10b981]">
                    <strong>Скидка пользователя:</strong>{' '}
                    <span className="font-medium">
                      -{(order.userDiscountApplied * CNY_TO_BYN_RATE).toFixed(2)} BYN
                    </span>
                    <span className="text-xs text-[#10b981]/70 ml-2">
                      (-¥{order.userDiscountApplied.toFixed(2)})
                    </span>
                  </p>
                )}
                {order.discountValue > 0 && (
                  <p className="text-[#10b981]">
                    <strong>
                      Скидка по промокоду
                      {order.discountType === 'PERCENTAGE' && ` (${order.discountValue}%)`}:
                    </strong>{' '}
                    <span className="font-medium">
                      -{(order.discountType === 'PERCENTAGE'
                        ? (totalItemsPrice * order.discountValue / 100)
                        : order.discountValue) * CNY_TO_BYN_RATE} BYN
                    </span>
                    <span className="text-xs text-[#10b981]/70 ml-2">
                      (-¥{order.discountType === 'PERCENTAGE'
                        ? (totalItemsPrice * order.discountValue / 100).toFixed(2)
                        : order.discountValue.toFixed(2)})
                    </span>
                  </p>
                )}

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[rgba(255,255,255,0.1)]">
                  <p className="text-[#9ca3af] font-semibold mb-1 sm:mb-2 text-xs sm:text-base">
                    <strong className="text-[#e5e7eb]">Итого:</strong>
                  </p>
                  <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-full h-2 sm:h-3">
                    <motion.div
                      className="bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] h-2 sm:h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 1, ease: 'easeInOut' }}
                    />
                  </div>
                  <p className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent mt-1 sm:mt-2">
                    {((order.totalClientPrice + totalChinaDeliveryPrice) * CNY_TO_BYN_RATE).toFixed(2)} BYN
                  </p>
                  <p className="text-xs sm:text-sm text-[#9ca3af] mt-0.5 sm:mt-1">
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
          <div className="p-4 sm:p-6 bg-[rgba(255,255,255,0.02)] rounded-xl sm:rounded-2xl border border-[rgba(255,255,255,0.05)] transition-all duration-300">
            <h3 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
              {isSelfPickup ? 'Трек-номера' : 'Товары'}
            </h3>

            {isSelfPickup ? (
              order.items?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 sm:p-4 bg-[rgba(255,255,255,0.02)] rounded-lg sm:rounded-xl border border-[rgba(255,255,255,0.1)] transition-all duration-300"
                    >
                      <p className="font-medium text-sm sm:text-lg text-[#e5e7eb] break-words">
                        {item.trackingNumber || 'Трек не указан'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#9ca3af] text-sm sm:text-base">
                  Нет трек-номеров.
                </p>
              )
            ) : order.items?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-6">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 sm:p-4 bg-[rgba(255,255,255,0.02)] rounded-lg sm:rounded-xl border border-[rgba(255,255,255,0.1)] hover:border-[rgba(0,240,255,0.5)] transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/product/${item.productId}`)}
                  >
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="w-12 h-12 sm:w-20 sm:h-20 bg-[rgba(255,255,255,0.02)] rounded-md border border-[rgba(255,255,255,0.1)] flex items-center justify-center p-1 sm:p-2 overflow-hidden flex-shrink-0">
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
                          <div className="w-full h-full bg-[rgba(255,255,255,0.02)] flex items-center justify-center text-xs text-[#9ca3af]">
                            Нет фото
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-lg text-[#e5e7eb] break-words line-clamp-2">
                          {item.productName || 'Без названия'}
                        </p>
                        <p className="text-[#9ca3af] mt-0.5 text-xs sm:text-base">
                          x{item.quantity} • ¥{item.priceAtTime?.toFixed(2)}
                        </p>
                        {item.chinaDeliveryPrice > 0 && (
                          <p className="text-[#9ca3af] text-xs sm:text-base">Китай: ¥{item.chinaDeliveryPrice.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[#9ca3af] text-sm sm:text-base">
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
          <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center justify-center gap-2 text-sm sm:text-base py-2.5 sm:py-3 w-full sm:w-auto">
            <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            Назад
          </Button>

          {order.status === 'VERIFIED' && order.totalClientPrice > 0 && !loadingPay && (
            <Button variant="primary" onClick={handlePayClick} className="flex items-center justify-center gap-2 text-sm sm:text-base py-2.5 sm:py-3 w-full sm:w-auto">
              <CreditCardIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Оплатить
            </Button>
          )}

          {loadingPay && (
            <Button variant="primary" disabled className="flex items-center justify-center gap-2 text-sm py-2.5 w-full sm:w-auto">
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-white" />
              Оплата...
            </Button>
          )}
        </motion.section>
      </div>
    </div>
  );
}

export default OrderDetails;