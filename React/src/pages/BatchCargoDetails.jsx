import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeftIcon, 
  TruckIcon, 
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/solid';
import { useAuth } from '../components/AuthProvider';
import Tilt from 'react-parallax-tilt';
import api from '../api/axiosInstance';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Loading } from '../components/ui/Loading';

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
      try {
        const response = await api.get(`/batch-cargos/usr/${batchId}`);
        if (response?.data) {
          const sanitizedBatchCargo = {
            ...response.data,
            orders: Array.isArray(response.data.orders)
              ? response.data.orders.map((order) => ({
                  ...order,
                  items: Array.isArray(order.items) ? order.items : [],
                }))
              : [],
          };
          setBatchCargo(sanitizedBatchCargo);
        } else {
          setError('Данные груза не найдены');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching batch cargo:', error);
        let errorMessage = 'Ошибка загрузки груза';
        if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Не удалось подключиться к серверу.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Доступ запрещён (403). Проверьте токен.';
        } else {
          errorMessage = error.response?.data?.message || error.message || 'Неизвестная ошибка';
        }
        setError(errorMessage);
        setLoading(false);
      }
    };
    if (user?.email) {
      fetchBatchCargo();
    }
  }, [batchId, user?.email]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <Loading message="Загрузка деталей сборного груза..." />
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

  if (!batchCargo || batchCargo.orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <Card className="p-12 text-center">
          <TruckIcon className="w-16 h-16 text-[#808080] mx-auto mb-4" />
          <p className="text-xl text-[#cdcdcd]">Ваших заказов нет в данном сборном грузе</p>
        </Card>
      </div>
    );
  }

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

  const getOrderStatusDisplay = (status) => {
    switch (status) {
      case 'PENDING':
        return {
          text: getOrderStatusText(status),
          color: 'text-yellow-300',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/50'
        };
      case 'VERIFIED':
        return {
          text: getOrderStatusText(status),
          color: 'text-blue-300',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/50'
        };
      case 'PAID':
        return {
          text: getOrderStatusText(status),
          color: 'text-green-300',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/50'
        };
      case 'PROCESSED':
        return {
          text: getOrderStatusText(status),
          color: 'text-purple-300',
          bgColor: 'bg-purple-500/20',
          borderColor: 'border-purple-500/50'
        };
      case 'COMPLETED':
        return {
          text: getOrderStatusText(status),
          color: 'text-emerald-300',
          bgColor: 'bg-emerald-500/20',
          borderColor: 'border-emerald-500/50'
        };
      default:
        return {
          text: getOrderStatusText(status),
          color: 'text-gray-300',
          bgColor: 'bg-gray-500/20',
          borderColor: 'border-gray-500/50'
        };
    }
  };

  const getPurchaseStatusDisplay = (status) => {
    switch (status) {
      case 'PURCHASED':
        return { 
          text: 'Выкуплен', 
          color: 'text-emerald-300',
          bgColor: 'bg-emerald-500/20',
          borderColor: 'border-emerald-500/50'
        };
      case 'NOT_PURCHASED':
        return { 
          text: 'Не выкуплен', 
          color: 'text-red-300',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/50'
        };
      case 'PENDING':
      default:
        return { 
          text: 'Ожидает', 
          color: 'text-yellow-300',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/50'
        };
    }
  };

  const statusDisplay = getStatusDisplay(batchCargo.status);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto relative z-10">
        <PageHeader
          kicker="Логистика"
          title={`Сборный груз #${batchCargo.id}`}
          subtitle="Детальная информация о вашем сборном грузе"
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

        {/* Информация о грузе */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <Card className="p-6 bg-[#1a1a1a] border border-[#333]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#e81e2d] to-[#ff4757] rounded-xl flex items-center justify-center">
                <TruckIcon className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">Информация о грузе</h3>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusDisplay.bgColor} ${statusDisplay.borderColor} ${statusDisplay.color} flex items-center gap-2`}>
                    {statusDisplay.icon}
                    {statusDisplay.text}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-6 h-6 text-[#407CFF]" />
                <div>
                  <p className="text-xs text-[#808080] mb-1">Дата создания</p>
                  <p className="text-[#cdcdcd] font-medium">{formatDate(batchCargo.creationDate)}</p>
                </div>
              </div>
              {batchCargo.purchaseDate && (
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-6 h-6 text-[#407CFF]" />
                  <div>
                    <p className="text-xs text-[#808080] mb-1">Дата закупки</p>
                    <p className="text-[#cdcdcd] font-medium">{formatDate(batchCargo.purchaseDate)}</p>
                  </div>
                </div>
              )}
            </div>

            {batchCargo.description && (
              <div className="mt-6 pt-6 border-t border-[#333]">
                <p className="text-xs text-[#808080] mb-2">Описание</p>
                <p className="text-[#cdcdcd]">{batchCargo.description}</p>
              </div>
            )}
          </Card>
        </motion.section>

        {/* Заказы в грузе */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#e81e2d] to-[#ff4757] bg-clip-text text-transparent">
            Ваши заказы в этом грузе
          </h3>
          
          <div className="space-y-6">
            {batchCargo.orders.map((order, orderIndex) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: orderIndex * 0.1 }}
              >
                <Card className="p-6 bg-[#1a1a1a] border border-[#333] hover:border-[#407CFF]/50 transition-all duration-300">
                  {/* Заголовок заказа */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">
                        Заказ #{order.orderNumber}
                      </h4>
                      <div className="flex items-center gap-4 flex-wrap">
                        {(() => {
                          const orderStatusDisplay = getOrderStatusDisplay(order.status);
                          return (
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${orderStatusDisplay.bgColor} ${orderStatusDisplay.borderColor} ${orderStatusDisplay.color}`}>
                              {orderStatusDisplay.text}
                            </span>
                          );
                        })()}
                        {order.totalClientPrice > 0 && (
                          <span className="text-sm text-[#cdcdcd]">
                            Сумма: <span className="text-[#407CFF] font-medium">¥{order.totalClientPrice.toFixed(2)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/batch-cargos/${batchId}/order/${order.id}`)}
                      className="px-4 py-2 bg-[#407CFF] hover:bg-[#5a8fff] text-white rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                    >
                      <ShoppingBagIcon className="w-4 h-4" />
                      Детали
                    </motion.button>
                  </div>

                  {/* Товары в заказе */}
                  {order.items && order.items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {order.items.map((item, itemIndex) => {
                        const purchaseStatus = getPurchaseStatusDisplay(item.purchaseStatus || 'PENDING');
                        const isSelfPickup = order.totalClientPrice === 0;

                        return (
                          <Tilt key={item.id || `item-${itemIndex}`} tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1200}>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: itemIndex * 0.05 }}
                              whileHover={{ y: -5, transition: { duration: 0.2 } }}
                              className="bg-[#2a2a2a] border border-[#333] rounded-lg p-4 hover:border-[#407CFF]/50 transition-all duration-300"
                            >
                              {!isSelfPickup && item.imageUrl && (
                                <div className="w-full h-32 bg-[#1a1a1a] rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.productName || 'Товар'}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/150?text=Нет+фото';
                                    }}
                                  />
                                </div>
                              )}

                              <h5 className="text-sm font-semibold text-white mb-2 line-clamp-2">
                                {isSelfPickup 
                                  ? (item.trackingNumber || 'Самовыкуп')
                                  : (item.productName || 'Без названия')
                                }
                              </h5>

                              {!isSelfPickup && (
                                <div className="space-y-1 mb-3">
                                  <p className="text-xs text-[#808080]">
                                    Количество: <span className="text-[#cdcdcd]">{item.quantity || 1}</span>
                                  </p>
                                  <p className="text-xs text-[#808080]">
                                    Цена: <span className="text-[#cdcdcd]">¥{(item.priceAtTime || 0).toFixed(2)}</span>
                                  </p>
                                </div>
                              )}

                              {item.trackingNumber && (
                                <p className="text-xs text-[#808080] mb-3">
                                  Трек: <span className="text-[#cdcdcd] font-mono">{item.trackingNumber}</span>
                                </p>
                              )}

                              {/* Статус выкупа */}
                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-1 rounded text-xs font-semibold border ${purchaseStatus.bgColor} ${purchaseStatus.borderColor} ${purchaseStatus.color}`}>
                                  {purchaseStatus.text}
                                </span>
                              </div>

                              {item.purchaseStatus === 'NOT_PURCHASED' && item.purchaseRefusalReason && (
                                <div className="mt-2 pt-2 border-t border-[#333]">
                                  <p className="text-xs text-red-300">
                                    {item.purchaseRefusalReason}
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          </Tilt>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-[#808080] text-center py-4">Нет товаров в заказе</p>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Кнопка назад */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-lg border border-[#333] hover:border-[#407CFF]/50 transition-all duration-200 flex items-center justify-center gap-2 font-semibold"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Назад
          </motion.button>
        </motion.section>
      </div>
    </div>
  );
};

export default BatchCargoDetails;
