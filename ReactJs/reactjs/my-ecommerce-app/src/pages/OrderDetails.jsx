import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { ArrowLeftIcon, CreditCardIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import confetti from 'canvas-confetti';

const CNY_TO_BYN_RATE = 0.45;

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading: loading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    },
    retry: 3,
    retryDelay: (attempt) => attempt * 1000,
    onError: (err) => {
      console.error('Error fetching order details:', err);
    },
  });

  const handlePayClick = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#0ea5e9', '#38bdf8'],
    });
    navigate('/payment');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-cyan-400 text-2xl bg-gray-800/80 p-6 rounded-lg border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/30"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-cyan-500 mx-auto mb-4" />
          Загрузка деталей заказа...
        </motion.div>
      </div>
    );
  }

  if (error) {
    const errorMsg =
      error.response?.status === 403
        ? 'Доступ запрещён. Обратитесь к администратору.'
        : 'Ошибка загрузки деталей заказа: ' + (error.response?.data?.errorMessage || error.message);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-red-300 text-2xl bg-red-500/30 p-6 rounded-lg border border-red-500/50 shadow-lg"
        >
          {errorMsg}
        </motion.div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-cyan-400 text-2xl bg-gray-800/80 p-6 rounded-lg border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/30"
        >
          Заказ не найден
        </motion.div>
      </div>
    );
  }

  const isSelfPickup = order.totalClientPrice === 0;
  const totalItemsPrice = order.items?.reduce((sum, item) => {
    return sum + ((item.priceAtTime || 0) * (item.quantity || 1));
  }, 0) || 0;
  const totalChinaDeliveryPrice = order.items?.reduce((sum, item) => {
    return sum + (item.chinaDeliveryPrice || 0);
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500 tracking-tight">
            Детали заказа #{order.orderNumber}
          </h2>
          <p className="text-lg text-gray-300 mt-2">Просмотрите информацию о вашем заказе</p>
        </motion.header>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-4 bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 text-center text-base font-medium shadow-md"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
        >
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl p-6 shadow-lg border border-cyan-500/30 transition-shadow duration-300 hover:shadow-cyan-500/40 relative overflow-hidden"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                  backgroundRepeat: 'repeat',
                }}
              />
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">Информация о заказе</h3>
              <p className="text-gray-300 mb-3"><strong>Дата создания:</strong> {new Date(order.dateCreated).toLocaleString('ru-RU')}</p>
              <p className="text-gray-300 mb-3">
                <strong>Статус:</strong>{' '}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm ${
                    order.status === 'PENDING'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {order.status}
                </span>
                {order.status === 'PENDING' && (
                  <p className="text-yellow-300 text-sm mt-2">Заказ ждёт одобрения администратора.</p>
                )}
              </p>
              <p className="text-gray-300"><strong>Адрес доставки:</strong> {order.deliveryAddress || 'Не указан'}</p>
              {order.trackingNumber && (
                <p className="text-gray-300"><strong>Трек-номер:</strong> {order.trackingNumber}</p>
              )}
            </motion.div>
          </Tilt>
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl p-6 shadow-lg border border-cyan-500/30 transition-shadow duration-300 hover:shadow-cyan-500/40 relative overflow-hidden"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                  backgroundRepeat: 'repeat',
                }}
              />
              <h3 className="text-2xl font-bold text-cyan-400 mb-4">Финансовые детали</h3>
              {isSelfPickup ? (
                <p className="text-yellow-300 bg-yellow-500/20 p-3 rounded-lg mb-3">
                  <strong>Примечание:</strong> Для самовыкупа оплата требуется только за доставку.
                </p>
              ) : (
                <>
                  <p className="text-gray-300 mb-3"><strong>Сумма товаров:</strong> ¥{totalItemsPrice.toFixed(2)}</p>
                  {totalChinaDeliveryPrice > 0 && (
                    <p className="text-gray-300 mb-3"><strong>Доставка по Китаю:</strong> ¥{totalChinaDeliveryPrice.toFixed(2)}</p>
                  )}
                  {order.insuranceCost > 0 && (
                    <p className="text-gray-300 mb-3"><strong>Стоимость страховки:</strong> ¥{order.insuranceCost.toFixed(2)}</p>
                  )}
                  {order.supplierCost > 0 && (
                    <p className="text-gray-300 mb-3"><strong>Стоимость поставщика:</strong> ¥{order.supplierCost.toFixed(2)}</p>
                  )}
                  {order.userDiscountApplied > 0 && (
                    <p className="text-green-400 mb-3"><strong>Скидка пользователя:</strong> -¥{order.userDiscountApplied.toFixed(2)}</p>
                  )}
                  {order.discountValue > 0 && (
                    <p className="text-green-400 mb-3">
                      <strong>Скидка по промокоду({order.discountType === "PERCENTAGE" && order.discountValue}%):</strong> -¥
                      {order.discountType === "PERCENTAGE" ? (totalItemsPrice * order.discountValue / 100).toFixed(2) : order.discountValue}
                    </p>
                  )}
                  <div className="mt-6 pt-4 border-t border-gray-600">
                    <p className="text-gray-300 font-semibold mb-2"><strong>Итоговая сумма:</strong></p>
                    <div className="w-full bg-gray-600 rounded-full h-3">
                      <motion.div
                        className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                      />
                    </div>
                    <p className="text-3xl font-bold text-cyan-400 mt-2">¥{(order.totalClientPrice + totalChinaDeliveryPrice).toFixed(2)}</p>
                  </div>
                </>
              )}
            </motion.div>
          </Tilt>
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl p-6 shadow-lg border border-cyan-500/30 mb-12 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
              backgroundRepeat: 'repeat',
            }}
          />
          <h3 className="text-2xl font-bold text-cyan-400 mb-6">
            {isSelfPickup ? 'Трек-номера' : 'Товары в заказе'}
          </h3>
          {isSelfPickup ? (
            order.items && order.items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {order.items.map((item, index) => (
                  <Tilt key={index} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
                    <motion.div
                      className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-lg border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/40 p-4 transition-all duration-300 text-gray-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <p className="font-medium text-lg">{item.trackingNumber || 'Трек-номер не указан'}</p>
                    </motion.div>
                  </Tilt>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-300 text-base">Нет трек-номеров в заказе.</p>
            )
          ) : (
            order.items && order.items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {order.items.map((item, index) => (
                  <Tilt key={index} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
                    <motion.div
                      className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-lg border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/40 p-4 transition-all duration-300 cursor-pointer text-gray-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(`/product/${item.productId}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 overflow-hidden rounded-md">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName || 'Товар'}
                              className="w-full h-full object-cover transform hover:scale-105 transition duration-300"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/80x80?text=Нет+фото';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-700/50 flex items-center justify-center text-xs text-gray-300">
                              Нет фото
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-lg">{item.productName || 'Без названия'}</p>
                          <p className="text-gray-300 mt-1">x{item.quantity} • ¥{item.priceAtTime.toFixed(2)}</p>
                          {item.chinaDeliveryPrice > 0 && (
                            <p className="text-gray-300 mt-1">Доставка по Китаю: ¥{item.chinaDeliveryPrice.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2 mt-3">
                        <motion.div
                          className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.quantity / Math.max(...order.items.map(i => i.quantity), 1)) * 100}%` }}
                          transition={{ duration: 1, ease: 'easeInOut' }}
                        />
                      </div>
                    </motion.div>
                  </Tilt>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-300 text-base">Нет товаров в заказе.</p>
            )
          )}
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600/80 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 shadow-sm"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Вернуться назад
          </motion.button>
          {order.status === 'VERIFIED' && order.totalClientPrice > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePayClick}
              className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 shadow-sm"
            >
              <CreditCardIcon className="w-5 h-5" />
              Оплатить
            </motion.button>
          )}
        </motion.section>
      </div>
    </div>
  );
}

export default OrderDetails;