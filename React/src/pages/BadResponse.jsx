import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircleIcon, ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';

/**
 * Страница ошибки при неуспешной оплате
 */
const BadResponse = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get('order');

  useEffect(() => {
    // Небольшая задержка для плавной анимации
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <Loading message="Проверка статуса..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 sm:p-12 text-center bg-[#1a1a1a] border border-[#333]">
            {/* Иконка ошибки */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#e81e2d] rounded-full blur-2xl opacity-30 animate-pulse" />
                <XCircleIcon className="relative w-24 h-24 text-[#e81e2d]" />
              </div>
            </motion.div>

            {/* Заголовок */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-[#e81e2d] to-[#ff4757] bg-clip-text text-transparent"
            >
              Ошибка при оплате
            </motion.h1>

            {/* Описание */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-[#cdcdcd] mb-8 space-y-4"
            >
              <p className="text-white">
                К сожалению, оплата не была завершена.
                <br />
                Это может произойти по следующим причинам:
              </p>
              
              <div className="bg-[#2a1a0a] border-l-4 border-[#e81e2d] p-4 text-left rounded">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-6 h-6 text-[#e81e2d] mr-3 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-[#e0e0e0]">
                    <ul className="list-disc list-inside space-y-2">
                      <li>Недостаточно средств на карте</li>
                      <li>Истек срок действия карты</li>
                      <li>Банк отклонил транзакцию</li>
                      <li>Проблемы с подключением к платежной системе</li>
                    </ul>
                  </div>
                </div>
              </div>

              {orderId && (
                <div className="bg-[#2a2a2a] border border-[#444] rounded-lg p-4 mt-4">
                  <p className="text-sm text-[#999] mb-1">Номер заказа</p>
                  <p className="text-xl font-semibold text-white">{orderId}</p>
                  <p className="text-sm text-[#cdcdcd] mt-2">
                    Ваш заказ сохранен и ожидает оплаты
                  </p>
                </div>
              )}
            </motion.div>

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
                  className="bg-gradient-to-r from-[#e81e2d] to-[#ff4757] hover:from-[#d0152a] hover:to-[#e63950] text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Попробовать снова
                  <ArrowLeftIcon className="w-5 h-5 rotate-180" />
                </Button>
              )}
              <Button
                onClick={() => navigate('/cart')}
                className="px-8 py-3 rounded-lg font-semibold border-2 border-[#444] hover:border-[#666] bg-[#2a2a2a] hover:bg-[#333] text-white transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Вернуться в корзину
              </Button>
            </motion.div>

            {/* Дополнительная информация */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-12 pt-8 border-t border-[#333]"
            >
              <p className="text-sm text-[#999] mb-2">
                Если проблема повторяется, пожалуйста:
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <button
                  onClick={() => navigate('/support')}
                  className="text-[#407CFF] hover:text-[#5a8fff] font-medium underline text-sm transition-colors"
                >
                  Свяжитесь с поддержкой
                </button>
                <span className="hidden sm:inline text-[#666]">•</span>
                <button
                  onClick={() => navigate('/delivery-payment')}
                  className="text-[#407CFF] hover:text-[#5a8fff] font-medium underline text-sm transition-colors"
                >
                  Узнайте о способах оплаты
                </button>
              </div>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BadResponse;

