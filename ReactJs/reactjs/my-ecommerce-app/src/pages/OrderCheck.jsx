import React, { useState, useEffect } from 'react';
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
  const [message, setMessage] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);

  const basicReasons = [
    'Неверная ссылка',
    'Товар закончился',
    'Не понятно какую комплектацию выбирать',
    'Аномальный товар',
    'Товар продается только только в составе набора/опта',
    'Ограниченные способы оплаты у поставщика',
    'Запрещено к пересылке',
    'Другое',
  ];

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/orders/${id}`);
      if (response.data) {
        setOrder(response.data);
        setEditedOrder(response.data);
      } else {
        setError('Данные заказа не найдены');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Ошибка загрузки заказа: ' + (error.response?.status === 403 ? 'Доступ запрещён (403). Убедитесь, что вы авторизованы как ADMIN и токен валиден.' : error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!editedOrder.deliveryAddress || !editedOrder.totalClientPrice) {
      setError('Укажите адрес доставки и общую цену');
      return;
    }
    try {
      const updatedOrder = {
        ...editedOrder,
        status: 'VERIFIED',
      };
      const response = await api.put(`/orders/${id}`, updatedOrder);
      alert('Заказ подтверждён!');
      setOrder(response.data);
      setEditedOrder(response.data);
      navigate('/admin/orders');
    } catch (error) {
      console.error('Error confirming order:', error);
      let errorMessage = 'Неизвестная ошибка';
      if (error.response) {
        errorMessage = error.response.data?.message || error.message;
      } else {
        errorMessage = error.message;
      }
      setError('Ошибка подтверждения заказа: ' + errorMessage);
    }
  };

const handleRefuse = async () => {
  if (!refusalReason) {
    alert('Укажите причину отказа');
    return;
  }

  if (!editedOrder.totalClientPrice || !editedOrder.deliveryAddress) {
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
    } else {
      throw new Error('Ответ сервера не содержит данных');
    }

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
  } catch (error) {
    console.error('Ошибка при отклонении заказа:', error);
    let errorMessage = 'Неизвестная ошибка';
    if (error.response) {
      errorMessage = error.response.data?.message || error.response.statusText || error.message;
      if (error.response.status === 403) {
        errorMessage = 'Доступ запрещён: недостаточно прав или недействительный токен';
      }
    } else {
      errorMessage = error.message;
    }
    setError(`Ошибка отклонения заказа: ${errorMessage}`);
  } finally {
    setLoading(false);
    setShowRefusalModal(false);
    setRefusalReason('');
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
      setError('Ошибка отправки сообщения: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedOrder((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    setEditedOrder((prev) => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [name]: value,
      };
      return { ...prev, items: newItems };
    });
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
      <p className={`text-lg font-semibold ${getStatusColor(editedOrder.status)} mb-4`}>
        Статус: {editedOrder.status === 'REFUSED' ? `Отклонён (${editedOrder.reasonRefusal})` : editedOrder.status}
      </p>
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
                key={index}
                className="bg-gray-600 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => handleItemEdit(item)}
              >
                <div className="w-full h-32 overflow-hidden rounded-md mb-2">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName || 'Товар'}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото'; }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-500 flex items-center justify-center text-sm text-gray-300">
                      Нет фото
                    </div>
                  )}
                </div>
                <h4 className="text-md font-medium">{item.productName || 'Без названия'}</h4>
                <p className="text-sm text-gray-400">¥{(typeof item.priceAtTime === 'number' ? item.priceAtTime : 0).toFixed(2)} x {item.quantity}</p>
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
                  onChange={(e) => setSelectedItem({ ...selectedItem, productId: e.target.value })}
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
                  onChange={(e) => setSelectedItem({ ...selectedItem, productName: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">URL товара</label>
                <input
                  type="text"
                  name="url"
                  value={selectedItem.url || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">URL изображения</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={selectedItem.imageUrl || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Цена на момент заказа (¥)</label>
                <input
                  type="number"
                  name="priceAtTime"
                  value={selectedItem.priceAtTime || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, priceAtTime: parseFloat(e.target.value) || 0 })}
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
                  onChange={(e) => setSelectedItem({ ...selectedItem, quantity: parseInt(e.target.value) || 1 })}
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
                  onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleItemSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Сохранить
                </button>
                <button
                  onClick={handleItemCancel}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
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