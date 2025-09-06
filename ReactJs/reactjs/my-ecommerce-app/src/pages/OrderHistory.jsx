
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

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
      const response = await api.get(`/order-history/${id}`);
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
          errorMessage = 'Доступ запрещён (403). У вас нет прав для просмотра этого заказа.';
        } else if (error.response.status === 404) {
          errorMessage = 'Заказ не найден (404).';
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
        История заказа #{order.orderNumber}
      </h2>
      <p className={`text-lg font-semibold ${getStatusColor(order.status)} mb-4`}>
        Статус: {order.status === 'REFUSED' ? `Отклонён (${order.reasonRefusal})` : order.status}
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Дата создания</label>
            <input
              type="text"
              value={order.dateCreated ? new Date(order.dateCreated).toLocaleString() : ''}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Статус</label>
            <input
              type="text"
              value={order.status || ''}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Общая цена для клиента (¥)</label>
            <input
              type="number"
              value={order.totalClientPrice || ''}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Адрес доставки</label>
            <input
              type="text"
              value={order.deliveryAddress || ''}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Трек-номер</label>
            <input
              type="text"
              value={order.trackingNumber || ''}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Email клиента</label>
            <input
              type="text"
              value={order.userEmail || ''}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
              disabled
            />
          </div>
        </div>
        <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Товары в заказе</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {order.items.map((item, index) => (
              <div
                key={`${item.productId}-${index}`}
                className="bg-gray-600 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => handleItemView(item)}
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
              </div>
            ))}
          </div>
        </div>
      </div>
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-700 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Детали товара</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">ID товара</label>
                <input
                  type="text"
                  value={selectedItem.productId || ''}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Название товара</label>
                <input
                  type="text"
                  value={selectedItem.productName || ''}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">URL товара</label>
                <input
                  type="text"
                  value={selectedItem.url || ''}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">URL изображения</label>
                <input
                  type="text"
                  value={selectedItem.imageUrl || ''}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Цена на момент заказа (¥)</label>
                <input
                  type="number"
                  value={selectedItem.priceAtTime || ''}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Количество</label>
                <input
                  type="number"
                  value={selectedItem.quantity || ''}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Описание</label>
                <input
                  type="text"
                  value={selectedItem.description || ''}
                  className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-75"
                  disabled
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleItemClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => navigate('/admin/orderHistory')}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
        >
          Назад
        </button>
      </div>
      {error && <p className="text-center text-red-500 mt-2">{error}</p>}
    </div>
  );
}

export default OrderHistory;