import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

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
          console.log('Order data:', targetOrder); // Debug log
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
      // Refresh order data
      const response = await api.get(`/batch-cargos/${batchId}`);
      const updatedOrder = response.data.orders.find((o) => o.id === parseInt(orderId));
      if (updatedOrder) {
        setOrder(updatedOrder);
        console.log('Updated order:', updatedOrder); // Debug log
      }
      alert('Товар помечен как выкупленный');
    } catch (error) {
      console.error('Error marking item as purchased:', error);
      setError('Ошибка при пометке товара как выкупленного');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotPurchased = async () => {
    if (!refusalReason) {
      alert('Укажите причину отказа');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/items/${selectedItemId}`, { status: 'NOT_PURCHASED' });
      // Optionally, send notification (handled by backend)
      const response = await api.get(`/batch-cargos/${batchId}`);
      const updatedOrder = response.data.orders.find((o) => o.id === parseInt(orderId));
      if (updatedOrder) {
        setOrder(updatedOrder);
        console.log('Updated order:', updatedOrder); // Debug log
      }
      alert(`Товар помечен как невыкупленный. Причина: ${refusalReason}`);
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

  if (loading) return <p className="text-center text-gray-400 animate-pulse">Загрузка...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!order) return <p className="text-center text-gray-400">Заказ не найден</p>;

  // Sort items: PROCESSED orders go to the bottom
  const sortedItems = [...order.items].sort((a, b) => {
    if (order.status === 'PROCESSED') return 1; // Move PROCESSED orders to bottom
    return a.purchaseStatus === 'PENDING' ? -1 : 1;
  });

  return (
    <div className="p-6 bg-gray-800 min-h-screen text-white">
      <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">
        Обработка заказа #{order.orderNumber}
      </h2>
      <p className="text-lg mb-4">Статус: {order.status}</p>
      <p className="text-lg mb-4">Клиент: {order.userEmail}</p>
      <div className="grid grid-cols-1 gap-4">
        {sortedItems.map((item) => (
          <div
            key={item.id}
            className={`bg-gray-700 p-4 rounded-lg shadow-md ${
              order.status === 'PROCESSED' ? 'line-through opacity-70' : ''
            }`}
          >
            <h3 className="text-lg font-semibold text-[var(--accent-color)]">
              {item.productName}
            </h3>
            <p className="text-sm text-gray-400">Количество: {item.quantity}</p>
            <p className="text-sm text-gray-400">Цена: ¥{item.priceAtTime.toFixed(2)}</p>
            <p className="text-sm text-gray-400">
              Статус закупки: {item.purchaseStatus || 'PENDING'}
            </p>
            {item.purchaseStatus === 'PENDING' && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleMarkPurchased(item.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Выкуплен
                </button>
                <button
                  onClick={() => openRefusalModal(item.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                >
                  Не выкуплен
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate(`/admin/upcoming-purchases/${batchId}`)}
        className="mt-6 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
      >
        Назад
      </button>
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
                  onClick={handleMarkNotPurchased}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
                >
                  Подтвердить
                </button>
                <button
                  onClick={() => {
                    setShowRefusalModal(false);
                    setRefusalReason('');
                    setSelectedItemId(null);
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

export default OrderProcessing;