import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

function OrderCheck() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [editedOrder, setEditedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showRefusalModal, setShowRefusalModal] = useState(false);
  const [refusalReason, setRefusalReason] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [showItemRefusalModal, setShowItemRefusalModal] = useState(false);
  const [itemRefusalReason, setItemRefusalReason] = useState('');
  const [activeTab, setActiveTab] = useState('orderDetails');

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

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/orders/${id}`);
      if (response?.data) {
        setOrder(response.data);
        setEditedOrder(response.data);
      } else {
        setError('Данные заказа не найдены');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      let errorMessage = 'Ошибка загрузки заказа';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Доступ запрещён (403). Проверьте, что вы авторизованы как ADMIN и токен действителен.';
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

  const isOrderFullyProcessed = () => {
    return editedOrder?.items?.every(
      (item) => item.purchaseStatus === 'PURCHASED' || item.purchaseStatus === 'NOT_PURCHASED'
    );
  };

  const handleConfirm = async () => {
    if (!editedOrder?.deliveryAddress || !editedOrder?.totalClientPrice) {
      setError('Укажите адрес доставки и общую цену');
      return;
    }
    setLoading(true);
    try {
      const updatedOrder = {
        ...editedOrder,
        status: 'VERIFIED',
      };
      const response = await api.put(`/orders/${id}`, updatedOrder);
      if (response?.data) {
        setOrder(response.data);
        setEditedOrder(response.data);
        alert('Заказ подтверждён!');
        navigate('/admin/orders');
      } else {
        throw new Error('Ответ сервера не содержит данных');
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      let errorMessage = 'Ошибка подтверждения заказа';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Доступ запрещён (403). Проверьте права доступа или токен авторизации.';
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
  };

  const handleRefuse = async () => {
    if (!refusalReason) {
      alert('Укажите причину отказа');
      return;
    }
    if (!editedOrder?.totalClientPrice || !editedOrder?.deliveryAddress) {
      alert('Заполните все обязательные поля заказа (сумма и адрес доставки)');
      return;
    }
    setLoading(true);
    try {
      const updatedOrder = {
        ...editedOrder,
        status: 'REFUSED',
        reasonRefusal: refusalReason,
      };
      const response = await api.put(`/orders/${id}`, updatedOrder);
      if (response?.data) {
        setOrder(response.data);
        setEditedOrder(response.data);
        try {
          await api.post('/notifications', {
            userEmail: editedOrder.userEmail,
            message: `Ваш заказ #${editedOrder.orderNumber || id} был отклонён. Причина: ${refusalReason}`,
            relatedId: id,
            category: 'ORDER_UPDATE',
          });
        } catch (notificationError) {
          console.error('Ошибка при отправке уведомления:', notificationError);
          alert('Заказ отклонён, но уведомление не отправлено: ' + (notificationError.response?.data?.message || notificationError.message));
        }
        alert('Заказ отклонён и перемещён в историю заказов!');
        navigate('/admin/orders');
      } else {
        throw new Error('Ответ сервера не содержит данных');
      }
    } catch (error) {
      console.error('Ошибка при отклонении заказа:', error);
      let errorMessage = 'Ошибка отклонения заказа';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Доступ запрещён (403). Проверьте права доступа или токен авторизации.';
        } else {
          errorMessage = error.response.data?.message || error.message || 'Неизвестная ошибка';
        }
      } else {
        errorMessage = error.message || 'Ошибка сети';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      setShowRefusalModal(false);
      setRefusalReason('');
    }
  };

  const handleItemNotPurchased = async () => {
    if (!itemRefusalReason) {
      alert('Укажите причину невыкупа');
      return;
    }
    setLoading(true);
    try {
      const updatedOrder = {
        ...editedOrder,
        items: editedOrder.items.map((item) =>
          item.productId === selectedItem.productId
            ? { ...item, purchaseStatus: 'NOT_PURCHASED', purchaseRefusalReason: itemRefusalReason }
            : item
        ),
      };
      console.log('Sending updated order:', updatedOrder); // Debugging
      const response = await api.put(`/orders/${id}`, updatedOrder);
      if (response?.data) {
        setOrder(response.data);
        setEditedOrder(response.data);
        alert('Товар помечен как невыкупленный!');
      } else {
        throw new Error('Ответ сервера не содержит данных');
      }
    } catch (error) {
      console.error('Ошибка при обновлении статуса товара:', error);
      let errorMessage = 'Ошибка обновления статуса товара';
      if (error.response) {
        errorMessage = error.response.data?.message || error.message || 'Неизвестная ошибка';
      } else {
        errorMessage = error.message || 'Ошибка сети';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      setShowItemRefusalModal(false);
      setItemRefusalReason('');
      setSelectedItem(null);
    }
  };

  const handleItemPurchased = async () => {
    setLoading(true);
    try {
      const updatedOrder = {
        ...editedOrder,
        items: editedOrder.items.map((item) =>
          item.productId === selectedItem.productId
            ? { ...item, purchaseStatus: 'PURCHASED', purchaseRefusalReason: null }
            : item
        ),
      };
      console.log('Sending updated order:', updatedOrder); // Debugging
      const response = await api.put(`/orders/${id}`, updatedOrder);
      if (response?.data) {
        setOrder(response.data);
        setEditedOrder(response.data);
        alert('Товар помечен как выкупленный!');
      } else {
        throw new Error('Ответ сервера не содержит данных');
      }
    } catch (error) {
      console.error('Ошибка при обновлении статуса товара:', error);
      let errorMessage = 'Ошибка обновления статуса товара';
      if (error.response) {
        errorMessage = error.response.data?.message || error.message || 'Неизвестная ошибка';
      } else {
        errorMessage = error.message || 'Ошибка сети';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      setSelectedItem(null);
    }
  };

  const handleSendMessage = async () => {
    if (!message) {
      alert('Введите сообщение');
      return;
    }
    try {
      await api.post('/notifications', {
        userEmail: editedOrder.userEmail,
        message: message,
        relatedId: id,
        category: 'ADMIN_MESSAGE',
      });
      alert('Сообщение отправлено!');
      setShowMessageModal(false);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      let errorMessage = 'Ошибка отправки сообщения';
      if (error.response) {
        errorMessage = error.response.data?.message || error.message || 'Неизвестная ошибка';
      } else {
        errorMessage = error.message || 'Ошибка сети';
      }
      setError(errorMessage);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedOrder((prev) => ({
      ...prev,
      [name]: name.includes('Price') || name.includes('Cost') || name.includes('Duty') ? parseFloat(value) || 0 : value,
    }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setSelectedItem((prev) => ({
      ...prev,
      [name]: name === 'priceAtTime' || name === 'quantity' || name === 'chinaDeliveryPrice' || name === 'supplierPrice' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleItemEdit = (item) => {
    setSelectedItem({ ...item });
  };

  const handleItemSave = () => {
    if (selectedItem) {
      setEditedOrder((prev) => {
        const newItems = [...prev.items];
        const itemIndex = newItems.findIndex((item) => item.productId === selectedItem.productId);
        if (itemIndex !== -1) {
          newItems[itemIndex] = { ...selectedItem };
        }
        return { ...prev, items: newItems };
      });
      setSelectedItem(null);
    }
  };

  const handleItemCancel = () => {
    setSelectedItem(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'REFUSED':
        return 'text-red-500';
      case 'PENDING':
        return 'text-yellow-500';
      case 'VERIFIED':
        return 'text-green-500';
      case 'RECEIVED':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="text-center text-white text-2xl bg-gray-700/90 p-6 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)]">
        Загрузка...
      </div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="text-center text-red-500 text-2xl bg-gray-700/90 p-6 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.3)]">
        {error}
      </div>
    </div>
  );
  if (!order) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="text-center text-gray-400 text-2xl bg-gray-700/90 p-6 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)]">
        Заказ не найден
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-emerald-500">
            Проверка заказа #{editedOrder.orderNumber}
          </h2>
          <p className="text-lg text-gray-400 mt-2">Управление заказом и товарами</p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-center mb-8">
          <span className={`text-lg font-semibold px-4 py-2 rounded-full ${getStatusColor(editedOrder.status)} bg-opacity-20 bg-current`}>
            Статус: {editedOrder.status === 'REFUSED' ? `Отклонён (${editedOrder.reasonRefusal})` : editedOrder.status}
          </span>
          {isOrderFullyProcessed() && (
            <svg className="ml-2 w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-center">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-600 mb-6 overflow-x-auto">
          {['orderDetails', 'items'].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-3 text-lg font-medium whitespace-nowrap ${
                activeTab === tab
                  ? 'border-b-2 border-[var(--accent-color)] text-[var(--accent-color)]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'orderDetails' ? 'Детали заказа' : 'Товары'}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Order Details Tab */}
          {activeTab === 'orderDetails' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'dateCreated', label: 'Дата создания', type: 'datetime', disabled: true },
                { key: 'status', label: 'Статус', type: 'text', disabled: true },
                { key: 'totalClientPrice', label: 'Общая цена для клиента (¥)', type: 'number', step: '0.01' },
                { key: 'supplierCost', label: 'Стоимость поставщика (¥)', type: 'number', step: '0.01' },
                { key: 'customsDuty', label: 'Таможенная пошлина (¥)', type: 'number', step: '0.01' },
                { key: 'shippingCost', label: 'Стоимость доставки (¥)', type: 'number', step: '0.01' },
                { key: 'insuranceCost', label: 'Стоимость страхования (¥)', type: 'number', step: '0.01' },
                { key: 'discountApplied', label: 'Применённая скидка (¥)', type: 'number', step: '0.01' },
                { key: 'userDiscountApplied', label: 'Скидка пользователя (¥)', type: 'number', step: '0.01' },
                { key: 'deliveryAddress', label: 'Адрес доставки', type: 'text', required: true },
                { key: 'trackingNumber', label: 'Трек-номер', type: 'text' },
                { key: 'userEmail', label: 'Email клиента', type: 'email', disabled: true },
                { key: 'reasonRefusal', label: 'Причина отказа', type: 'textarea' },
                { key: 'promocode', label: 'Промокод', type: 'text' },
                { key: 'batchCargo', label: 'Пакетный груз', type: 'text' },
              ].map((field) => (
                <div key={field.key} className="bg-gray-700/90 rounded-xl p-6 shadow-lg border border-gray-600/50">
                  <label className="block text-sm font-medium text-gray-300 mb-2">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.key}
                      value={editedOrder[field.key] || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                      rows="3"
                      disabled={field.disabled}
                    />
                  ) : field.type === 'datetime' ? (
                    <input
                      type="text"
                      name={field.key}
                      value={editedOrder[field.key] ? new Date(editedOrder[field.key]).toLocaleString() : ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
                      disabled
                    />
                  ) : (
                    <input
                      type={field.type}
                      name={field.key}
                      value={editedOrder[field.key] || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] disabled:opacity-75"
                      step={field.step}
                      disabled={field.disabled}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div>
              <h3 className="text-2xl font-semibold text-[var(--accent-color)] mb-6">Товары в заказе</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {editedOrder.items.map((item, index) => (
                  <div
                    key={`${item.productId}-${index}`}
                    className="bg-gray-700/90 rounded-xl p-6 shadow-lg border border-gray-600/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-shadow cursor-pointer"
                    onClick={() => handleItemEdit(item)}
                  >
                    <div className="w-full h-32 overflow-hidden rounded-lg mb-4 bg-gray-600">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName || 'Товар'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const parent = e.target.parentNode;
                            const fallbackDiv = document.createElement('div');
                            fallbackDiv.className = 'w-full h-full bg-gray-500 flex items-center justify-center text-sm text-gray-300';
                            fallbackDiv.textContent = 'Нет фото';
                            parent.appendChild(fallbackDiv);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-gray-300">
                          Нет фото
                        </div>
                      )}
                    </div>
                    <h4 className="text-md font-medium mb-2">{item.productName || 'Без названия'}</h4>
                    <p className="text-sm text-gray-400 mb-2">¥{(item.priceAtTime || 0).toFixed(2)} x {item.quantity}</p>
                    <p className="text-sm mb-2">Доставка из Китая: ¥{(item.chinaDeliveryPrice || 0).toFixed(2)}</p>
                    <p className="text-sm mb-2">Цена поставщика: ¥{(item.supplierPrice || 0).toFixed(2)}</p>
                    <p className={`text-sm ${item.purchaseStatus === 'PURCHASED' ? 'text-green-500' : item.purchaseStatus === 'NOT_PURCHASED' ? 'text-red-500' : 'text-gray-400'}`}>
                      Статус: {item.purchaseStatus === 'NOT_PURCHASED' ? `Невыкуплен (${item.purchaseRefusalReason || 'Причина не указана'})` : item.purchaseStatus}
                    </p>
                    {item.trackingNumber && (
                      <p className="text-xs text-gray-500 mt-1">Трек: {item.trackingNumber}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Item Edit Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-700/90 rounded-xl p-6 shadow-2xl border border-gray-600/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-semibold text-[var(--accent-color)] mb-6">Редактирование товара</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ID товара</label>
                  <input type="text" name="productId" value={selectedItem.productId || ''} onChange={handleItemChange} className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75" disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Название товара</label>
                  <input type="text" name="productName" value={selectedItem.productName || ''} onChange={handleItemChange} className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">URL товара</label>
                  <input type="url" name="url" value={selectedItem.url || ''} onChange={handleItemChange} className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">URL изображения</label>
                  <input type="url" name="imageUrl" value={selectedItem.imageUrl || ''} onChange={handleItemChange} className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Цена на момент заказа (¥)</label>
                  <input type="number" name="priceAtTime" value={selectedItem.priceAtTime || ''} onChange={handleItemChange} className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Количество</label>
                  <input type="number" name="quantity" value={selectedItem.quantity || ''} onChange={handleItemChange} className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg" min="1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Цена за доставку ($)</label>
                  <input type="number" name="supplierPrice" value={selectedItem.supplierPrice || ''} onChange={handleItemChange} className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Доставка по Китаю (¥)</label>
                  <input type="number" name="chinaDeliveryPrice" value={selectedItem.chinaDeliveryPrice || ''} onChange={handleItemChange} className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg" step="0.01" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Описание</label>
                  <textarea name="description" value={selectedItem.description || ''} onChange={handleItemChange} className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg" rows="3" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Трек-номер товара</label>
                  <input type="text" name="trackingNumber" value={selectedItem.trackingNumber || ''} onChange={handleItemChange} className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg" />
                </div>
              </div>
              <div className="flex flex-wrap justify-between gap-4 mb-4">
                <button onClick={handleItemPurchased} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Выкуплен</button>
                <button onClick={() => setShowItemRefusalModal(true)} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Не выкуплен</button>
              </div>
              <div className="flex justify-end gap-4">
                <button onClick={handleItemSave} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Сохранить</button>
                <button onClick={handleItemCancel} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">Отмена</button>
              </div>
            </div>
          </div>
        )}

        {/* Refusal Modals - Keep existing modals with updated styling */}
        {showRefusalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-700/90 rounded-xl p-6 shadow-2xl border border-gray-600/50 max-w-md w-full">
              <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Причина отказа</h3>
              <select
                onChange={(e) => setRefusalReason(e.target.value === 'Другое' ? '' : e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg mb-4"
                value={refusalReason}
              >
                <option value="">Выберите базовую причину</option>
                {basicReasons.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
              <textarea
                value={refusalReason}
                onChange={(e) => setRefusalReason(e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg mb-4"
                rows="4"
                placeholder="Опишите причину отказа..."
              />
              <div className="flex justify-end gap-4">
                <button onClick={handleRefuse} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Отказать</button>
                <button onClick={() => setShowRefusalModal(false)} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">Отмена</button>
              </div>
            </div>
          </div>
        )}

        {showItemRefusalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-700/90 rounded-xl p-6 shadow-2xl border border-gray-600/50 max-w-md w-full">
              <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Причина невыкупа товара</h3>
              <select
                onChange={(e) => setItemRefusalReason(e.target.value === 'Другое' ? '' : e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg mb-4"
              >
                <option value="">Выберите базовую причину</option>
                {basicReasons.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
              <textarea
                value={itemRefusalReason}
                onChange={(e) => setItemRefusalReason(e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg mb-4"
                rows="4"
                placeholder="Опишите причину невыкупа..."
              />
              <div className="flex justify-end gap-4">
                <button onClick={handleItemNotPurchased} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Подтвердить</button>
                <button onClick={() => setShowItemRefusalModal(false)} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">Отмена</button>
              </div>
            </div>
          </div>
        )}

        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-700/90 rounded-xl p-6 shadow-2xl border border-gray-600/50 max-w-md w-full">
              <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Отправить сообщение</h3>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg mb-4"
                rows="4"
                placeholder="Введите сообщение для пользователя..."
              />
              <div className="flex justify-end gap-4">
                <button onClick={handleSendMessage} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">Отправить</button>
                <button onClick={() => setShowMessageModal(false)} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">Отмена</button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-12">
          <button
            onClick={handleConfirm}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 transition text-lg font-semibold disabled:opacity-50"
            disabled={editedOrder.status !== 'PENDING' || loading}
          >
            Подтвердить
          </button>
          {editedOrder.status === 'VERIFIED' && (
            <button
              onClick={() => setShowMessageModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 transition text-lg font-semibold"
            >
              Связаться
            </button>
          )}
          <button
            onClick={() => setShowRefusalModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 transition text-lg font-semibold disabled:opacity-50"
            disabled={editedOrder.status !== 'PENDING' || loading}
          >
            Отказать
          </button>
          <button
            onClick={() => navigate('/admin/orders')}
            className="px-8 py-4 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition text-lg font-semibold"
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderCheck;