import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/solid';
import api from '../api/axiosInstance';
import Tilt from 'react-parallax-tilt';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Loading } from '../components/ui/Loading';
import { Button } from '../components/ui/Button';

const BatchCargoProcessing = () => {
  const { batchId, orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/orders/${orderId}`)
      .then((response) => {
        if (response?.data) {
          const hasMissingIds = response.data.items.some(item => !item.id);
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
      .catch((error) => {
        console.error('Error fetching order:', error);
        let errorMessage = 'Ошибка загрузки заказа';
        if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Не удалось подключиться к серверу.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Доступ запрещён (403). Проверьте токен.';
        } else {
          errorMessage = error.response?.data?.message || error.message || 'Неизвестная ошибка';
        }
        setError(errorMessage);
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <Loading message="Загрузка деталей заказа..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-red-300 text-xl bg-red-500/20 p-8 rounded-lg border border-red-500/50"
        >
          {error}
        </motion.div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <Card className="p-12 text-center">
          <ShoppingBagIcon className="w-16 h-16 text-[#808080] mx-auto mb-4" />
          <p className="text-xl text-[#cdcdcd]">Заказ не найден</p>
        </Card>
      </div>
    );
  }

  const getPurchaseStatusDisplay = (status) => {
    switch (status) {
      case 'PURCHASED':
        return {
          text: 'Выкуплен',
          color: 'text-emerald-300',
          bgColor: 'bg-emerald-500/20',
          borderColor: 'border-emerald-500/50',
          icon: <CheckCircleIcon className="w-5 h-5" />
        };
      case 'NOT_PURCHASED':
        return {
          text: 'Не выкуплен',
          color: 'text-red-300',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/50',
          icon: <XCircleIcon className="w-5 h-5" />
        };
      case 'PENDING':
      default:
        return {
          text: 'Ожидает',
          color: 'text-yellow-300',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/50',
          icon: <ClockIcon className="w-5 h-5" />
        };
    }
  };

  const isSelfPickup = order.totalClientPrice === 0;

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto relative z-10">
        <PageHeader
          title={`Детали заказа #${order.orderNumber}`}
          subtitle="Просмотр товаров и их статусов выкупа"
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
                <p className="text-red-300 text-center">{error}</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Информация о заказе */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <Card className="p-6 bg-[#1a1a1a] border border-[#333]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#407CFF] to-[#5a8fff] rounded-xl flex items-center justify-center">
                <ShoppingBagIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Заказ #{order.orderNumber}</h3>
                <p className="text-sm text-[#808080] mt-1">
                  Создан: {new Date(order.dateCreated).toLocaleString('ru-RU')}
                </p>
              </div>
            </div>
            {order.deliveryAddress && (
              <div className="mt-4 pt-4 border-t border-[#333]">
                <p className="text-sm text-[#808080] mb-1">Адрес доставки</p>
                <p className="text-[#cdcdcd]">{order.deliveryAddress}</p>
              </div>
            )}
          </Card>
        </motion.section>

        {/* Товары в заказе */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#e81e2d] to-[#ff4757] bg-clip-text text-transparent">
            Товары в заказе
          </h3>

          {order.items && order.items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {order.items.map((item, index) => {
                const purchaseStatus = getPurchaseStatusDisplay(item.purchaseStatus || 'PENDING');
                
                return (
                  <Tilt key={item.id || `item-${index}`} tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1200}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <Card className="p-6 bg-[#1a1a1a] border border-[#333] hover:border-[#407CFF]/50 transition-all duration-300">
                        {/* Изображение товара */}
                        {!isSelfPickup && item.imageUrl && (
                          <div className="w-full h-48 bg-[#0a0a0a] rounded-lg mb-4 overflow-hidden flex items-center justify-center border border-[#333]">
                            <img
                              src={item.imageUrl}
                              alt={item.productName || 'Товар'}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/200?text=Нет+фото';
                              }}
                            />
                          </div>
                        )}

                        {/* Название товара */}
                        <h4 className="text-lg font-bold text-white mb-3 line-clamp-2">
                          {isSelfPickup 
                            ? (item.trackingNumber || 'Самовыкуп')
                            : (item.productName || 'Без названия')
                          }
                        </h4>

                        {/* Детали товара */}
                        {!isSelfPickup && (
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-[#808080]">Количество:</span>
                              <span className="text-[#cdcdcd] font-medium">{item.quantity || 1}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[#808080]">Цена за единицу:</span>
                              <span className="text-[#cdcdcd] font-medium">¥{(item.priceAtTime || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2 border-t border-[#333]">
                              <span className="text-[#808080] font-medium">Итого:</span>
                              <span className="text-[#407CFF] font-bold">
                                ¥{((item.priceAtTime || 0) * (item.quantity || 1)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Трек-номер */}
                        {item.trackingNumber && (
                          <div className="mb-4 p-3 bg-[#0a0a0a] rounded-lg border border-[#333]">
                            <p className="text-xs text-[#808080] mb-1">Трек-номер</p>
                            <p className="text-sm text-[#cdcdcd] font-mono break-all">{item.trackingNumber}</p>
                          </div>
                        )}

                        {/* Статус выкупа */}
                        <div className="flex items-center justify-between pt-4 border-t border-[#333]">
                          <span className={`px-3 py-2 rounded-lg text-sm font-semibold border flex items-center gap-2 ${purchaseStatus.bgColor} ${purchaseStatus.borderColor} ${purchaseStatus.color}`}>
                            {purchaseStatus.icon}
                            {purchaseStatus.text}
                          </span>
                        </div>

                        {/* Причина отказа */}
                        {item.purchaseStatus === 'NOT_PURCHASED' && item.purchaseRefusalReason && (
                          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-xs text-red-400 font-medium mb-1">Причина отказа:</p>
                            <p className="text-sm text-red-300">{item.purchaseRefusalReason}</p>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  </Tilt>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <ShoppingBagIcon className="w-16 h-16 text-[#808080] mx-auto mb-4" />
              <p className="text-xl text-[#cdcdcd] mb-2">Нет товаров в заказе</p>
              <p className="text-[#808080]">Товары отсутствуют</p>
            </Card>
          )}
        </motion.section>

        {/* Кнопка назад */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-center"
        >
          <Button
            onClick={() => navigate(`/batch-cargo-details/${batchId}`)}
            variant="outline"
            className="px-8 py-3 border-[#333] hover:border-[#407CFF] text-white flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Вернуться к сборному грузу
          </Button>
        </motion.section>
      </div>
    </div>
  );
};

export default BatchCargoProcessing;
