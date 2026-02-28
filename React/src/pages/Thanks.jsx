import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import nonCacheApi from '../api/nonCacheApi';

/**
 * Страница благодарности после успешной оплаты
 */
const Thanks = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const orderId = searchParams.get('order');
  const status = searchParams.get('status');

  useEffect(() => {
    // Проверяем статус оплаты, если есть orderId
    if (orderId && status === 'success') {
      setCheckingPayment(true);
      // Проверяем статус оплаты на сервере
      nonCacheApi.get(`/payment/check?orderId=${orderId}`)
        .then(response => {
          if (response.data.success && response.data.status === 'PAID') {
            // Платеж подтвержден
            setCheckingPayment(false);
            setLoading(false);
          } else {
            // Платеж еще обрабатывается, но пользователь видит страницу успеха
            setCheckingPayment(false);
            setLoading(false);
          }
        })
        .catch(error => {
          console.error('Error checking payment status:', error);
          setCheckingPayment(false);
          setLoading(false);
        });
    } else {
      // Небольшая задержка для плавной анимации
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [orderId, status]);

  if (loading || checkingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <Loading message={checkingPayment ? "Проверка статуса оплаты..." : "Загрузка..."} />
      </div>
    );
  }

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 sm:p-12 text-center bg-[#1a1a1a] border border-[#333]">
            {/* Иконка успеха */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-green-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                <CheckCircleIcon className="relative w-24 h-24 text-green-500" />
              </div>
            </motion.div>

            {/* Заголовок */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl font-bold mb-4 text-white"
            >
              {isSuccess ? 'Оплата успешно выполнена!' : 'Спасибо за ваш заказ!'}
            </motion.h1>

            {/* Описание */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-[#cdcdcd] mb-8"
            >
              {isSuccess ? (
                <>
                  Ваш заказ #{orderId || 'обрабатывается'} успешно оплачен и принят в обработку.
                  <br />
                  Заказ будет автоматически обработан по указанным данным. Вы получите уведомление о статусе заказа.
                </>
              ) : (
                <>
                  Ваш заказ принят в обработку.
                  <br />
                  Заказ будет автоматически обработан по указанным данным.
                </>
              )}
            </motion.p>

            {/* Информация о заказе */}
            {orderId && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-[#2a2a2a] border border-[#444] rounded-lg p-4 mb-8"
              >
                <p className="text-sm text-[#999] mb-1">Номер заказа</p>
                <p className="text-xl font-semibold text-white">{orderId}</p>
              </motion.div>
            )}

            {/* Кнопки действий */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {orderId && (
                <Button
                  onClick={() => navigate(`/order-details/${orderId}`)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Посмотреть заказ
                  <ArrowRightIcon className="w-5 h-5" />
                </Button>
              )}
              <Button
                onClick={() => navigate('/')}
                className="px-8 py-3 rounded-lg font-semibold border-2 border-[#444] hover:border-[#666] bg-[#2a2a2a] hover:bg-[#333] text-white transition-all duration-200"
              >
                На главную
              </Button>
            </motion.div>

            {/* Дополнительная информация */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-12 pt-8 border-t border-[#333]"
            >
              <p className="text-sm text-[#999]">
                Если у вас возникли вопросы, пожалуйста,{' '}
                <button
                  onClick={() => navigate('/support')}
                  className="text-[#407CFF] hover:text-[#5a8fff] font-medium underline transition-colors"
                >
                  свяжитесь с нами
                </button>
              </p>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Thanks;

