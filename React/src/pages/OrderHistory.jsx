import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import { PageHeader } from '../components/ui/PageHeader';
import { Alert } from '../components/ui/Alert';
import { Loading } from '../components/ui/Loading';
import { Button } from '../components/ui/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';

function OrderHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/orders/${id}`);
      if (response?.data) {
        setOrder(response.data);
      } else {
        setError('Данные заказа не найдены');
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
      let errorMessage = 'Ошибка загрузки заказа';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Доступ запрещён. У вас нет прав для просмотра этого заказа.';
        } else if (error.response.status === 404) {
          errorMessage = 'Заказ не найден.';
        } else {
          errorMessage = error.response.data?.message || error.message || 'Неизвестная ошибка';
        }
      } else {
        errorMessage = error.message || 'Ошибка сети';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleItemView = (item) => {
    setSelectedItem({ ...item });
  };

  const handleItemClose = () => {
    setSelectedItem(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'REFUSED':
        return 'text-[#ef4444]';
      case 'PENDING':
        return 'text-[#a78bfa]';
      case 'VERIFIED':
        return 'text-[#00f0ff]';
      case 'RECEIVED':
        return 'text-[#10b981]';
      case 'COMPLETED':
        return 'text-[#10b981]';
      case 'PAID':
        return 'text-[#00f0ff]';
      case 'PROCESSED':
        return 'text-[#a78bfa]';
      default:
        return 'text-[#9ca3af]';
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'REFUSED': 'Отклонён',
      'PENDING': 'Ожидает',
      'VERIFIED': 'Подтверждён',
      'RECEIVED': 'Получен',
      'COMPLETED': 'Завершён',
      'PAID': 'Оплачен',
      'PROCESSED': 'Обработан'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Loading message="Загрузка заказа..." />
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert type="error" message={error} />
          <div className="mt-4">
            <Button onClick={() => navigate('/admin/orderHistory')} variant="primary">
              Вернуться к списку заказов
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert type="error" message="Заказ не найден" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <PageHeader 
            title={`Заказ #${order.orderNumber || order.id}`}
            subtitle={`Статус: ${getStatusLabel(order.status)}`}
          />
          <Button 
            onClick={() => navigate('/admin/orderHistory')} 
            variant="ghost"
          >
            Назад к списку
          </Button>
        </div>

        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')}
            className="mb-6"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Информация о заказе */}
            <div className="p-6 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                Информация о заказе
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                    Дата создания
                  </label>
                  <div className="px-4 py-2.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb]">
                    {formatDate(order.dateCreated)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                    Статус
                  </label>
                  <div className={`px-4 py-2.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-xl ${getStatusColor(order.status)} font-medium`}>
                    {getStatusLabel(order.status)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                    Общая цена (¥)
                  </label>
                  <div className="px-4 py-2.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] font-medium">
                    {order.totalClientPrice?.toFixed(2) || '0.00'}
                  </div>
                </div>
                {order.trackingNumber && (
                  <div>
                    <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                      Трек-номер
                    </label>
                    <div className="px-4 py-2.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb]">
                      {order.trackingNumber}
                    </div>
                  </div>
                )}
                {order.deliveryAddress && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#9ca3af] mb-2">
                      Адрес доставки
                    </label>
                    <div className="px-4 py-2.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb]">
                      {order.deliveryAddress}
                    </div>
                  </div>
                )}
                {order.status === 'REFUSED' && order.reasonRefusal && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#ef4444] mb-2">
                      Причина отказа
                    </label>
                    <div className="px-4 py-2.5 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-xl text-[#ef4444]">
                      {order.reasonRefusal}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Товары */}
            <div className="p-6 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                Товары в заказе ({order.items?.length || 0})
              </h3>
              {!order.items || order.items.length === 0 ? (
                <p className="text-[#9ca3af] text-center py-8">Товары не найдены</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {order.items.map((item, index) => (
                    <motion.div
                      key={`${item.productId || item.id}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 cursor-pointer"
                      onClick={() => handleItemView(item)}
                    >
                      <div className="w-full h-32 bg-[rgba(255,255,255,0.02)] rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName || 'Товар'}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (!e.target.nextSibling) {
                                const fallbackDiv = document.createElement('div');
                                fallbackDiv.className = 'w-full h-full flex items-center justify-center text-sm text-[#9ca3af]';
                                fallbackDiv.textContent = 'Нет фото';
                                e.target.parentNode.appendChild(fallbackDiv);
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm text-[#9ca3af]">
                            Нет фото
                          </div>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-[#e5e7eb] mb-2 line-clamp-2">
                        {item.productName || 'Без названия'}
                      </h4>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#9ca3af]">
                          ¥{(item.priceAtTime || 0).toFixed(2)} × {item.quantity || 0}
                        </span>
                        <span className="text-[#e5e7eb] font-medium">
                          ¥{((item.priceAtTime || 0) * (item.quantity || 0)).toFixed(2)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Клиент */}
            <div className="p-6 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <h3 className="text-lg font-semibold mb-4 text-[#e5e7eb]">Клиент</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-[#9ca3af] mb-1">
                    Email
                  </label>
                  <div className="px-3 py-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-lg text-[#e5e7eb] text-sm break-all">
                    {order.userEmail || 'Не указан'}
                  </div>
                </div>
              </div>
            </div>

            {/* Финансовая информация */}
            {(order.supplierCost || order.customsDuty || order.shippingCost || order.insuranceCost || order.userDiscountApplied) && (
              <div className="p-6 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-semibold mb-4 text-[#e5e7eb]">Финансы</h3>
                <div className="space-y-2 text-sm">
                  {order.supplierCost !== null && order.supplierCost !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-[#9ca3af]">Стоимость поставщика:</span>
                      <span className="text-[#e5e7eb]">¥{order.supplierCost.toFixed(2)}</span>
                    </div>
                  )}
                  {order.customsDuty !== null && order.customsDuty !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-[#9ca3af]">Таможенная пошлина:</span>
                      <span className="text-[#e5e7eb]">¥{order.customsDuty.toFixed(2)}</span>
                    </div>
                  )}
                  {order.shippingCost !== null && order.shippingCost !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-[#9ca3af]">Доставка:</span>
                      <span className="text-[#e5e7eb]">¥{order.shippingCost.toFixed(2)}</span>
                    </div>
                  )}
                  {order.insurance && order.insuranceCost !== null && order.insuranceCost !== undefined && order.insuranceCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[#9ca3af]">Страховка:</span>
                      <span className="text-[#e5e7eb]">¥{order.insuranceCost.toFixed(2)}</span>
                    </div>
                  )}
                  {order.userDiscountApplied !== null && order.userDiscountApplied !== undefined && order.userDiscountApplied > 0 && (
                    <div className="flex justify-between pt-2 border-t border-[rgba(255,255,255,0.1)]">
                      <span className="text-[#10b981]">Скидка применена:</span>
                      <span className="text-[#10b981] font-medium">-¥{order.userDiscountApplied.toFixed(2)}</span>
                    </div>
                  )}
                  {order.promocode && (
                    <div className="flex justify-between pt-2 border-t border-[rgba(255,255,255,0.1)]">
                      <span className="text-[#9ca3af]">Промокод:</span>
                      <span className="text-[#00f0ff]">{order.promocode}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Модальное окно деталей товара */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={handleItemClose}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[rgba(31,41,55,0.95)] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                    Детали товара
                  </h3>
                  <button
                    onClick={handleItemClose}
                    className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-[#9ca3af]" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedItem.imageUrl && (
                    <div className="md:col-span-2">
                      <img
                        src={selectedItem.imageUrl}
                        alt={selectedItem.productName || 'Товар'}
                        className="w-full max-h-64 object-contain rounded-lg bg-[rgba(255,255,255,0.02)] p-4"
                      />
                    </div>
                  )}
                  {['productId', 'productName', 'url', 'imageUrl', 'description', 'quantity', 'priceAtTime', 'supplierPrice', 'purchaseStatus', 'purchaseRefusalReason', 'trackingNumber', 'chinaDeliveryPrice'].map((key) => {
                    const value = selectedItem[key];
                    if (value === null || value === undefined || value === '') return null;
                    const labels = {
                      productId: 'ID товара',
                      productName: 'Название',
                      url: 'URL товара',
                      imageUrl: 'URL изображения',
                      description: 'Описание',
                      quantity: 'Количество',
                      priceAtTime: 'Цена на момент заказа (¥)',
                      supplierPrice: 'Цена поставщика (¥)',
                      purchaseStatus: 'Статус покупки',
                      purchaseRefusalReason: 'Причина отказа в покупке',
                      trackingNumber: 'Трек-номер',
                      chinaDeliveryPrice: 'Доставка из Китая (¥)'
                    };
                    return (
                      <div key={key} className={key === 'description' || key === 'url' ? 'md:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-[#9ca3af] mb-1">
                          {labels[key] || key}
                        </label>
                        <div className="px-3 py-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-lg text-[#e5e7eb] text-sm break-words">
                          {typeof value === 'number' ? value.toFixed(2) : String(value)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default OrderHistory;
