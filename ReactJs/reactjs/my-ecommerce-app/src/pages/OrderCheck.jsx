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
      [name]: value,
    }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setSelectedItem((prev) => ({
      ...prev,
      [name]: name === 'priceAtTime' ? parseFloat(value) || 0 : name === 'quantity' ? parseInt(value) || 1 : value,
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
        return 'text-white';
      case 'VERIFIED':
        return 'text-green-500';
      case 'RECEIVED':
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) return <p className="text-center text-gray-400 animate-pulse">Загрузка...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!order) return <p className="text-center text-gray-400">Заказ не найден</p>;

  return (
    <div className="p-6 bg-gray-800 min-h-screen text-white">
      <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">
        Проверка заказа #{editedOrder.orderNumber}
      </h2>
      <div className="flex items-center mb-4">
        <p className={`text-lg font-semibold ${getStatusColor(editedOrder.status)}`}>
          Статус: {editedOrder.status === 'REFUSED' ? `Отклонён (${editedOrder.reasonRefusal})` : editedOrder.status}
        </p>
        {isOrderFullyProcessed() && (
          <svg
            className="ml-2 w-6 h-6 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Дата создания</label>
            <input
              type="text"
              name="dateCreated"
              value={editedOrder.dateCreated ? new Date(editedOrder.dateCreated).toLocaleString() : ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Статус</label>
            <input
              type="text"
              name="status"
              value={editedOrder.status || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Общая цена для клиента (¥)</label>
            <input
              type="number"
              name="totalClientPrice"
              value={editedOrder.totalClientPrice || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Адрес доставки</label>
            <input
              type="text"
              name="deliveryAddress"
              value={editedOrder.deliveryAddress || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Трек-номер</label>
            <input
              type="text"
              name="trackingNumber"
              value={editedOrder.trackingNumber || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Email клиента</label>
            <input
              type="text"
              name="userEmail"
              value={editedOrder.userEmail || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
              disabled
            />
          </div>
        </div>
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Товары в заказе</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {editedOrder.items.map((item, index) => (
              <div
                key={`${item.productId}-${index}`}
                className="bg-gray-600 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => handleItemEdit(item)}
              >
                <div className="w-full h-32 overflow-hidden rounded-md mb-2">
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
                    <div className="w-full h-full bg-gray-500 flex items-center justify-center text-sm text-gray-300">
                      Нет фото
                    </div>
                  )}
                </div>
                <h4 className="text-md font-medium">{item.productName || 'Без названия'}</h4>
                <p className="text-sm text-gray-400">¥{(typeof item.priceAtTime === 'number' ? item.priceAtTime : 0).toFixed(2)} x {item.quantity}</p>
                <p className={`text-sm ${item.purchaseStatus === 'PURCHASED' ? 'text-green-500' : item.purchaseStatus === 'NOT_PURCHASED' ? 'text-red-500' : 'text-gray-400'}`}>
                  Статус: {item.purchaseStatus === 'NOT_PURCHASED' ? `Невыкуплен (${item.purchaseRefusalReason || 'Причина не указана'})` : item.purchaseStatus}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Редактирование товара</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">ID товара</label>
                <input
                  type="text"
                  name="productId"
                  value={selectedItem.productId || ''}
                  onChange={handleItemChange}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Название товара</label>
                <input
                  type="text"
                  name="productName"
                  value={selectedItem.productName || ''}
                  onChange={handleItemChange}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">URL товара</label>
                <input
                  type="text"
                  name="url"
                  value={selectedItem.url || ''}
                  onChange={handleItemChange}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">URL изображения</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={selectedItem.imageUrl || ''}
                  onChange={handleItemChange}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Цена на момент заказа (¥)</label>
                <input
                  type="number"
                  name="priceAtTime"
                  value={selectedItem.priceAtTime || ''}
                  onChange={handleItemChange}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Количество</label>
                <input
                  type="number"
                  name="quantity"
                  value={selectedItem.quantity || ''}
                  onChange={handleItemChange}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Описание</label>
                <input
                  type="text"
                  name="description"
                  value={selectedItem.description || ''}
                  onChange={handleItemChange}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                />
              </div>
              <div className="flex justify-between gap-2">
                <button
                  onClick={handleItemPurchased}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Выкуплен
                </button>
                <button
                  onClick={() => setShowItemRefusalModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                >
                  Не выкуплен
                </button>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleItemSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Сохранить
                </button>
                <button
                  onClick={handleItemCancel}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showRefusalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Причина отказа</h3>
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
                className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
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
                className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                rows="4"
                placeholder="Опишите причину отказа (можно добавить детали)..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleRefuse}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                >
                  Отказать
                </button>
                <button
                  onClick={() => setShowRefusalModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showItemRefusalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Причина невыкупа товара</h3>
            <div className="space-y-4">
              <select
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'Другое') {
                    setItemRefusalReason('');
                  } else {
                    setItemRefusalReason(value);
                  }
                }}
                className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
              >
                <option value="">Выберите базовую причину</option>
                {basicReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              <textarea
                value={itemRefusalReason}
                onChange={(e) => setItemRefusalReason(e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                rows="4"
                placeholder="Опишите причину невыкупа (можно добавить детали)..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleItemNotPurchased}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                >
                  Подтвердить
                </button>
                <button
                  onClick={() => setShowItemRefusalModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Отправить сообщение</h3>
            <div className="space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                rows="4"
                placeholder="Введите сообщение для пользователя..."
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Отправить
                </button>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={handleConfirm}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
          disabled={editedOrder.status !== 'PENDING'}
        >
          Подтвердить
        </button>
        {editedOrder.status === 'VERIFIED' && (
          <button
            onClick={() => setShowMessageModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Связаться
          </button>
        )}
        <button
          onClick={() => setShowRefusalModal(true)}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
          disabled={editedOrder.status !== 'PENDING'}
        >
          Отказать
        </button>
        <button
          onClick={() => navigate('/admin/orders')}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Назад
        </button>
      </div>
      {error && <p className="text-center text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default OrderCheck;