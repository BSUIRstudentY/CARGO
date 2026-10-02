import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { PageHeader } from '../components/ui/PageHeader';
import { 
  ShoppingBagIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';

function OrderProcessing() {
  const { batchId, orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRefusalModal, setShowRefusalModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [refusalReason, setRefusalReason] = useState('');

  const basicReasons = [
    'Неверная ссылка',
    'Товар закончился',
    'Не понятно какую комплектацию выбирать',
    'Аномальный товар',
    'Товар продается только в составе набора/опта',
    'Ограниченные способы оплаты у поставщика',
    'Запрещено к пересылке',
    'Другое',
  ];

  useEffect(() => {
    setLoading(true);
    api.get(`/batch-cargos/${batchId}`)
      .then((response) => {
        const targetOrder = response.data.orders.find((o) => o.id === parseInt(orderId));
        if (targetOrder) {
          console.log('Order data:', targetOrder);
          setOrder(targetOrder);
        } else {
          setError('Заказ не найден');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching batch:', error);
        setError('Ошибка загрузки заказа');
        setLoading(false);
      });
  }, [batchId, orderId]);

  const handleMarkPurchased = async (itemId) => {
    setLoading(true);
    try {
      await api.put(`/items/${itemId}`, { status: 'PURCHASED' });
      const response = await api.get(`/batch-cargos/${batchId}`);
      const updatedOrder = response.data.orders.find((o) => o.id === parseInt(orderId));
      if (updatedOrder) {
        setOrder(updatedOrder);
        console.log('Updated order:', updatedOrder);
      }
    } catch (error) {
      console.error('Error marking item as purchased:', error);
      setError('Ошибка при пометке товара как выкупленного');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotPurchased = async () => {
    if (!refusalReason) {
      return;
    }
    setLoading(true);
    try {
      await api.put(`/items/${selectedItemId}`, { status: 'NOT_PURCHASED' });
      const response = await api.get(`/batch-cargos/${batchId}`);
      const updatedOrder = response.data.orders.find((o) => o.id === parseInt(orderId));
      if (updatedOrder) {
        setOrder(updatedOrder);
        console.log('Updated order:', updatedOrder);
      }
    } catch (error) {
      console.error('Error marking item as not purchased:', error);
      setError('Ошибка при пометке товара как невыкупленного');
    } finally {
      setLoading(false);
      setShowRefusalModal(false);
      setRefusalReason('');
      setSelectedItemId(null);
    }
  };

  const openRefusalModal = (itemId) => {
    setSelectedItemId(itemId);
    setShowRefusalModal(true);
  };

  const getPurchaseStatusDisplay = (status) => {
    const statuses = {
      PURCHASED: { 
        text: 'Выкуплен', 
        color: 'text-emerald-300', 
        bgColor: 'bg-emerald-500/20',
        borderColor: 'border-emerald-500',
        icon: <CheckCircleIcon className="w-4 h-4" />
      },
      NOT_PURCHASED: { 
        text: 'Не выкуплен', 
        color: 'text-red-300', 
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500',
        icon: <XCircleIcon className="w-4 h-4" />
      },
      PENDING: { 
        text: 'Ожидает', 
        color: 'text-yellow-300', 
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500',
        icon: <ClockIcon className="w-4 h-4" />
      }
    };
    return statuses[status] || statuses.PENDING;
  };

  if (loading && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <Loading message="Загрузка заказа..." />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <Card className="p-8 bg-red-500/20 border-red-500/50">
          <p className="text-red-300 text-center">{error}</p>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <Card className="p-8">
          <p className="text-[#cdcdcd] text-center">Заказ не найден</p>
        </Card>
      </div>
    );
  }

  const sortedItems = [...order.items].sort((a, b) => {
    if (order.status === 'PROCESSED') return 1;
    return a.purchaseStatus === 'PENDING' ? -1 : 1;
  });

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          kicker="Заказ"
          title={`Обработка заказа #${order.orderNumber}`}
          subtitle={`Клиент: ${order.userEmail}`}
        />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-4 bg-red-500/20 border-red-500/50">
              <p className="text-red-300">{error}</p>
            </Card>
          </motion.div>
        )}

        {/* Информация о заказе */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-[#cdcdcd]">
                <span className="text-[#808080]">Статус заказа:</span>{' '}
                <span className="text-white font-medium">{order.status}</span>
              </div>
              <div className="text-[#cdcdcd]">
                <span className="text-[#808080]">Сумма:</span>{' '}
                <span className="text-white font-medium">¥{order.totalClientPrice?.toFixed(2) || '0.00'}</span>
              </div>
              {order.deliveryAddress && (
                <div className="text-[#cdcdcd]">
                  <span className="text-[#808080]">Адрес доставки:</span>{' '}
                  <span className="text-white font-medium">{order.deliveryAddress}</span>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Список товаров */}
        <div className="space-y-4">
          {sortedItems.map((item, index) => {
            const purchaseStatusDisplay = getPurchaseStatusDisplay(item.purchaseStatus);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className={`p-6 ${order.status === 'PROCESSED' ? 'opacity-70' : ''}`}>
                  <div className="flex gap-6">
                    {/* Изображение товара */}
                    {item.imageUrl && (
                      <div className="flex-shrink-0 w-32 h-32 bg-[#0a0a0a] border border-[#333] rounded-lg flex items-center justify-center p-2 overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Информация о товаре */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold text-[#407CFF]">{item.productName}</h3>
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${purchaseStatusDisplay.bgColor} ${purchaseStatusDisplay.borderColor} ${purchaseStatusDisplay.color}`}>
                          {purchaseStatusDisplay.icon}
                          <span className="font-semibold">{purchaseStatusDisplay.text}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-[#cdcdcd] mb-4">
                        <div>
                          <span className="text-[#808080]">Количество:</span>{' '}
                          <span className="text-white font-medium">{item.quantity}</span>
                        </div>
                        <div>
                          <span className="text-[#808080]">Цена:</span>{' '}
                          <span className="text-white font-medium">¥{item.priceAtTime?.toFixed(2) || '0.00'}</span>
                        </div>
                        {item.supplierPrice && (
                          <div>
                            <span className="text-[#808080]">Цена поставщика:</span>{' '}
                            <span className="text-white font-medium">¥{item.supplierPrice.toFixed(2)}</span>
                          </div>
                        )}
                        {item.trackingNumber && (
                          <div>
                            <span className="text-[#808080]">Трек-номер:</span>{' '}
                            <span className="text-white font-mono">{item.trackingNumber}</span>
                          </div>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-sm text-[#cdcdcd] mb-4">
                          <span className="text-[#808080]">Описание:</span> {item.description}
                        </p>
                      )}

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#407CFF] hover:text-[#5a8fff] transition-colors block mb-4"
                        >
                          Открыть ссылку на товар →
                        </a>
                      )}

                      {item.purchaseRefusalReason && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded">
                          <p className="text-sm text-red-300">
                            <span className="font-semibold">Причина отказа:</span> {item.purchaseRefusalReason}
                          </p>
                        </div>
                      )}

                      {/* Кнопки действий */}
                      {item.purchaseStatus === 'PENDING' && (
                        <div className="flex gap-3 mt-4">
                          <Button
                            onClick={() => handleMarkPurchased(item.id)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                            Выкуплен
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => openRefusalModal(item.id)}
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          >
                            <XCircleIcon className="w-5 h-5 mr-2" />
                            Не выкуплен
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Кнопка назад */}
        <div className="mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/admin/upcoming-purchases/${batchId}`)}
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Назад к выкупу
          </Button>
        </div>

        {/* Модальное окно отказа */}
        <AnimatePresence>
          {showRefusalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowRefusalModal(false);
                setRefusalReason('');
                setSelectedItemId(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 max-w-md w-full"
              >
                <h3 className="text-2xl font-bold text-white mb-4">
                  Причина отказа
                </h3>
                <div className="space-y-4">
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'Другое') {
                        setRefusalReason('');
                      } else {
                        setRefusalReason(value);
                      }
                    }}
                    className="select-dark w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#407CFF] focus:outline-none"
                  >
                    <option value="">Выберите базовую причину</option>
                    {basicReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={refusalReason}
                    onChange={(e) => setRefusalReason(e.target.value)}
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:border-[#407CFF] focus:outline-none resize-none"
                    rows="4"
                    placeholder="Опишите причину отказа (можно добавить детали)..."
                  />
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowRefusalModal(false);
                        setRefusalReason('');
                        setSelectedItemId(null);
                      }}
                    >
                      Отмена
                    </Button>
                    <Button
                      onClick={handleMarkNotPurchased}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                      Подтвердить
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default OrderProcessing;
