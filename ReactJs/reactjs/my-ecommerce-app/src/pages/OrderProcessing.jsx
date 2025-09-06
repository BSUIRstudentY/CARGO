import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

function OrderProcessing() {
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
          // Check if items have IDs
          const hasMissingIds = response.data.items.some(item => !item.id);
          if (hasMissingIds) {
            setError('Некоторые товары не имеют ID. Проверьте данные заказа в базе данных.');
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
          errorMessage = 'Не удалось подключиться к серверу. Проверьте, работает ли сервер на http://localhost:8080';
        } else if (error.response?.status === 403) {
          errorMessage = 'Доступ запрещён (403). Проверьте токен авторизации или права доступа.';
        } else {
          errorMessage = error.response?.data?.message || error.message || 'Неизвестная ошибка';
        }
        setError(errorMessage);
        setLoading(false);
      });
  }, [orderId]);

  const handleMarkItem = async (itemId, status) => {
    console.log('Attempting to mark item:', { itemId, status }); // Debug log
    if (!itemId) {
      setError('ID товара не определён. Проверьте данные заказа в базе данных.');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/batch-cargos/items/${itemId}`, { status });
      console.log('Item status updated successfully:', { itemId, status }); // Debug log
      const response = await api.get(`/orders/${orderId}`);
      if (response?.data) {
        setOrder(response.data);
      } else {
        setError('Не удалось обновить данные заказа');
      }
    } catch (error) {
      console.error('Error marking item:', error);
      let errorMessage = 'Ошибка обновления статуса товара';
      if (error.response?.status === 403) {
        errorMessage = 'Доступ запрещён (403). Проверьте токен авторизации или права доступа.';
      } else {
        errorMessage = error.response?.data?.message || error.message || 'Неизвестная ошибка';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center text-gray-400 animate-pulse">Загрузка...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!order) return <p className="text-center text-gray-400">Заказ не найден</p>;

  return (
    <div className="p-6 bg-gray-800 min-h-screen text-white">
      <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6">
        Обработка заказа #{order.orderNumber}
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {order.items.map((item, index) => (
          <div
            key={item.id || `item-${index}`}
            className="bg-gray-700 p-4 rounded-lg shadow-md flex justify-between items-center"
          >
            <div>
              <h3 className="text-lg font-semibold text-[var(--accent-color)]">{item.productName || 'Без названия'}</h3>
              <p className="text-sm text-gray-400">¥{(item.priceAtTime || 0).toFixed(2)} x {item.quantity || 1}</p>
              <p className="text-sm text-gray-400">
                Статус: {item.purchaseStatus || 'Не определён'}
              </p>
              <p className="text-sm text-gray-400">ID товара: {item.id || 'Не определён'}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleMarkItem(item.id, 'PURCHASED')}
                className={`p-2 text-white rounded transition duration-200 ${
                  !item.id ? 'bg-gray-600 cursor-not-allowed' :
                  (!item.purchaseStatus || item.purchaseStatus === 'PENDING')
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
                disabled={!item.id || (item.purchaseStatus && item.purchaseStatus !== 'PENDING')}
              >
                ✔ Выкуплен
              </button>
              <button
                onClick={() => handleMarkItem(item.id, 'NOT_PURCHASED')}
                className={`p-2 text-white rounded transition duration-200 ${
                  !item.id ? 'bg-gray-600 cursor-not-allowed' :
                  (!item.purchaseStatus || item.purchaseStatus === 'PENDING')
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
                disabled={!item.id || (item.purchaseStatus && item.purchaseStatus !== 'PENDING')}
              >
                ✘ Не выкуплен
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate(`/admin/upcoming-purchases/${batchId}`)}
        className="mt-6 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200"
      >
        Назад к сборному грузу
      </button>
      {error && <p className="text-center text-red-500 mt-4">{error}</p>}
    </div>
  );
}

export default OrderProcessing;