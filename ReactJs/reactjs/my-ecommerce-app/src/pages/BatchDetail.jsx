import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRefusalModal, setShowRefusalModal] = useState(false);
  const [refusalReason, setRefusalReason] = useState('');
  const [showItemRefusalModal, setShowItemRefusalModal] = useState(false);
  const [itemRefusalReason, setItemRefusalReason] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

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
    api.get(`/batch-cargos/${id}`)
      .then((response) => {
        console.log('Batch data:', response.data);
        setBatch(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching batch:', error);
        setError('Ошибка загрузки сборного груза');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    console.log('showRefusalModal:', showRefusalModal);
    console.log('showItemRefusalModal:', showItemRefusalModal);
  }, [showRefusalModal, showItemRefusalModal]);

  const handleProcessOrder = (orderId, order) => {
    navigate(`/admin/upcoming-purchases/${id}/order/${orderId}`, { state: { order } });
  };

  const handleRefuse = async () => {
    if (!refusalReason) {
      alert('Укажите причину отказа');
      return;
    }
    setLoading(true);
    try {
      const updatedBatch = {
        status: 'REFUSED',
        reasonRefusal: refusalReason,
        photoUrl: batch.photoUrl || null,
        description: batch.description || null
      };
      const response = await api.put(`/batch-cargos/${id}`, updatedBatch);
      if (response?.data) {
        setBatch(response.data);
        try {
          const notificationPromises = batch.orders.map((order) =>
            api.post('/notifications', {
              userEmail: order.userEmail,
              message: `Сборный груз #${batch.id} был отклонён. Причина: ${refusalReason}`,
              relatedId: id,
              category: 'BATCH_UPDATE',
            })
          );
          await Promise.all(notificationPromises);
          console.log('Notifications sent for batch:', id);
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
          alert('Сборный груз отклонён, но уведомление не отправлено: ' + (notificationError.response?.data?.message || notificationError.message));
        }
        alert('Сборный груз отклонён!');
        navigate('/admin/upcoming-purchases');
      } else {
        throw new Error('Ответ сервера не содержит данных');
      }
    } catch (error) {
      console.error('Error refusing batch:', error);
      let errorMessage = 'Ошибка отклонения сборного груза';
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

  const handleDeleteBatch = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить сборный груз?')) {
      return;
    }
    setLoading(true);
    try {
      await api.delete(`/batch-cargos/${id}`);
      alert('Сборный груз удалён!');
      navigate('/admin/upcoming-purchases');
    } catch (error) {
      console.error('Error deleting batch:', error);
      let errorMessage = 'Ошибка удаления сборного груза';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Доступ запрещён (403). Проверьте права доступа или токен авторизации.';
        } else if (error.response.status === 404) {
          errorMessage = 'Сборный груз не найден';
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
    }
  };

  const handleMarkPurchased = async (orderId, itemId) => {
    setLoading(true);
    try {
      await api.put(`/batch-cargos/items/${itemId}`, { status: 'PURCHASED' });
      const response = await api.get(`/batch-cargos/${id}`);
      setBatch(response.data);
      if (response.data.status === 'FINISHED') {
        alert('Сборный груз завершён и перемещён в ближайшие прибытия!');
        navigate('/admin/upcoming-arrivals');
      } else {
        alert('Товар помечен как выкупленный');
      }
    } catch (error) {
      console.error('Error marking item as purchased:', error);
      setError('Ошибка при пометке товара как выкупленного');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotPurchased = async () => {
    if (!itemRefusalReason) {
      alert('Укажите причину невыкупа');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/batch-cargos/items/${selectedItemId}`, {
        status: 'NOT_PURCHASED',
        purchaseRefusalReason: itemRefusalReason,
      });
      const response = await api.get(`/batch-cargos/${id}`);
      setBatch(response.data);
      if (response.data.status === 'FINISHED') {
        alert('Сборный груз завершён и перемещён в ближайшие прибытия!');
        navigate('/admin/upcoming-arrivals');
      } else {
        alert(`Товар помечен как невыкупленный. Причина: ${itemRefusalReason}`);
      }
    } catch (error) {
      console.error('Error marking item as not purchased:', error);
      setError('Ошибка при пометке товара как невыкупленного');
    } finally {
      setLoading(false);
      setShowItemRefusalModal(false);
      setItemRefusalReason('');
      setSelectedItemId(null);
      setSelectedOrderId(null);
    }
  };

  const openItemRefusalModal = (orderId, itemId) => {
    setSelectedOrderId(orderId);
    setSelectedItemId(itemId);
    setShowItemRefusalModal(true);
  };

  if (loading) return <p className="text-center text-gray-400 animate-pulse">Загрузка...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!batch) return <p className="text-center text-gray-400">Сборный груз не найден</p>;

  return (
    <div className="p-6 bg-gray-800 min-h-screen text-white">
      <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">
        Сборный груз #{batch.id} - Дата выкупа: {new Date(batch.purchaseDate).toLocaleDateString()}
      </h2>
      <p className="text-lg mb-4">
        Статус: {batch.status === 'REFUSED' ? `Отклонён (${batch.reasonRefusal})` : batch.status}
      </p>
      <div className="grid grid-cols-1 gap-4">
        {batch.orders.map((order) => (
          <div
            key={order.id}
            className={`bg-gray-700 p-4 rounded-lg shadow-md ${order.status === 'PROCESSED' ? 'line-through opacity-70' : ''}`}
          >
            <h3
              className="text-lg font-semibold text-[var(--accent-color)] cursor-pointer"
              onClick={() => handleProcessOrder(order.id, order)}
            >
              Заказ #{order.orderNumber}
            </h3>
            <p className="text-sm text-gray-400">Статус: {order.status}</p>
            <p className="text-sm text-gray-400">Сумма: ¥{order.totalClientPrice.toFixed(2)}</p>
            <p className="text-sm text-gray-400">Клиент: {order.userEmail}</p>
            <div className="mt-4 grid grid-cols-1 gap-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className={`bg-gray-600 p-4 rounded-md flex gap-4 ${
                    item.purchaseStatus === 'PURCHASED'
                      ? 'border-l-4 border-green-500'
                      : item.purchaseStatus === 'NOT_PURCHASED'
                      ? 'border-l-4 border-red-500'
                      : 'border-l-4 border-yellow-500'
                  }`}
                >
                  <div className="flex-shrink-0 w-24 h-24">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName || 'Товар'}
                        className="w-full h-full object-cover rounded-md"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const parent = e.target.parentNode;
                          const fallbackDiv = document.createElement('div');
                          fallbackDiv.className = 'w-full h-full bg-gray-500 flex items-center justify-center text-sm text-gray-300 rounded-md';
                          fallbackDiv.textContent = 'Нет фото';
                          parent.appendChild(fallbackDiv);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-500 flex items-center justify-center text-sm text-gray-300 rounded-md">
                        Нет фото
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-md font-medium mb-2">{item.productName}</h4>
                    <p className="text-sm text-gray-300 mb-1">Количество: {item.quantity}</p>
                    <p className="text-sm text-gray-300 mb-1">Цена: ¥{item.priceAtTime.toFixed(2)}</p>
                    {item.supplierPrice && (
                      <p className="text-sm text-gray-300 mb-1">Цена поставщика: ¥{item.supplierPrice.toFixed(2)}</p>
                    )}
                    {item.trackingNumber && (
                      <p className="text-sm text-gray-300 mb-1">Трек-номер: {item.trackingNumber}</p>
                    )}
                    <p
                      className={`text-sm mb-1 ${
                        item.purchaseStatus === 'PURCHASED'
                          ? 'text-green-400'
                          : item.purchaseStatus === 'NOT_PURCHASED'
                          ? 'text-red-400'
                          : 'text-yellow-400'
                      }`}
                    >
                      Статус закупки: {item.purchaseStatus || 'PENDING'}
                    </p>
                    {item.description && (
                      <p className="text-sm text-gray-300 mb-1">Описание: {item.description}</p>
                    )}
                    {item.url && (
                      <p className="text-sm text-gray-300 mb-1">Ссылка: {item.url}</p>
                    )}
                   
                    {item.purchaseRefusalReason && (
                      <p className="text-sm text-red-400">Причина отказа: {item.purchaseRefusalReason}</p>
                    )}
                    {item.purchaseStatus !== 'PURCHASED' && item.purchaseStatus !== 'NOT_PURCHASED' && (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleMarkPurchased(order.id, item.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                        >
                          Выкуплен
                        </button>
                        <button
                          onClick={() => openItemRefusalModal(order.id, item.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                        >
                          Не выкуплен
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={() => {
            console.log('Refuse button clicked');
            setShowRefusalModal(true);
          }}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
          disabled={batch.status !== 'UNFINISHED'}
        >
          Отказать
        </button>
        <button
          onClick={() => navigate('/admin/upcoming-purchases')}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Назад
        </button>
        <button
          onClick={handleDeleteBatch}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
        >
          Удалить сборный груз
        </button>
      </div>
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
                  onClick={() => {
                    setShowRefusalModal(false);
                    setRefusalReason('');
                  }}
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
                  onClick={handleMarkNotPurchased}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                >
                  Подтвердить
                </button>
                <button
                  onClick={() => {
                    setShowItemRefusalModal(false);
                    setItemRefusalReason('');
                    setSelectedItemId(null);
                    setSelectedOrderId(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {error && <p className="text-center text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default BatchDetail;