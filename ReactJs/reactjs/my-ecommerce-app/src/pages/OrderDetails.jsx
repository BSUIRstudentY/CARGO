import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

// Примерный курс конверсии (оставляем для возможных будущих изменений)
const CNY_TO_BYN_RATE = 0.45;

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        if (response.status === 200) {
          setOrder(response.data);
        } else {
          setError('Не удалось загрузить заказ. Проверьте права доступа.');
        }
      } catch (error) {
        setError(
          'Ошибка загрузки деталей заказа: ' +
          (error.response?.status === 403
            ? 'Доступ запрещён. Обратитесь к администратору.'
            : error.response?.data?.message || error.message)
        );
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  if (loading) return <div className="text-center mt-10 text-white animate-pulse">Загрузка деталей заказа...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!order) return <div className="text-center mt-10 text-gray-400">Заказ не найден</div>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-purple-600">
        Детали заказа #{order.orderNumber}
      </h2>
      <div className="bg-gray-900/80 p-8 rounded-xl shadow-2xl border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <p className="text-gray-300"><strong>Дата создания:</strong> {new Date(order.dateCreated).toLocaleString()}</p>
              <p className="text-gray-300"><strong>Статус:</strong> <span className={`inline-block px-2 py-1 rounded-full text-sm ${order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-300' : order.status === 'VERIFIED' ? 'bg-green-500/20 text-green-300' : 'bg-green-500/20 text-green-300'}`}>{order.status}</span></p>
              <p className="text-gray-300"><strong>Адрес доставки:</strong> {order.deliveryAddress || 'Не указан'}</p>
              {order.status === 'PENDING' && (
                <p className="text-yellow-300 mt-2">Заказ ждёт одобрения администратора.</p>
              )}
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
              {order.supplierCost && <p className="text-gray-300"><strong>Стоимость поставщика:</strong> ¥{order.supplierCost.toFixed(2)}</p>}
              {order.shippingCost && <p className="text-gray-300"><strong>Стоимость доставки:</strong> ¥{order.shippingCost.toFixed(2)}</p>}
              {order.customsDuty && <p className="text-gray-300"><strong>Пошлина:</strong> ¥{order.customsDuty.toFixed(2)}</p>}
              {order.trackingNumber && <p className="text-gray-300"><strong>Трек-номер:</strong> {order.trackingNumber}</p>}
              <div className="mt-4 p-2 bg-gray-700 rounded-lg flex justify-between items-center">
                <p className="text-gray-300 font-semibold"><strong>Итоговая сумма:</strong></p>
                <p className="text-xl text-[var(--accent-color)]">¥{order.totalClientPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-[var(--accent-color)]">Товары:</h3>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                    onClick={() => navigate(`/product/${item.productId}`)}
                  >
                    <div className="w-20 h-20 mr-4 overflow-hidden rounded-md">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName || 'Товар'}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80?text=Нет+фото'; }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-600 flex items-center justify-center text-xs text-gray-400">
                          Нет фото
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{item.productName || 'Без названия'}</p>
                      {item.description && <p className="text-sm text-gray-400 mt-1">{item.description}</p>}
                      <p className="text-gray-300">x{item.quantity} • ¥{item.priceAtTime.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center">Нет товаров в заказе.</p>
            )}
          </div>
        </div>
        <div className="mt-8">
          <div className="flex justify-between items-center">
          <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-300 font-semibold"
            >
              Вернуться назад
            </button>
            {order.status === 'VERIFIED' && (
              <button
                onClick={() => navigate('/payment')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 font-semibold"
              >
                Оплатить
              </button>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;