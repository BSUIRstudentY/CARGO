import React, { useState } from 'react';
import { useCart } from '../components/CartContext';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../components/AuthProvider'; // Для получения email пользователя

function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, loading, error } = useCart();
  const { user } = useAuth(); // Получаем email пользователя
  const [showConfirm, setShowConfirm] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(''); // Поле для адреса доставки

  const handleConfirmOrder = async () => {
    if (!deliveryAddress) {
      alert('Пожалуйста, укажите адрес доставки');
      return;
    }
    try {
      const order = {
        user: { email: user.email }, // Связь с пользователем
        orderNumber: `ORD-${Date.now()}`, // Уникальный номер заказа
        dateCreated: new Date().toISOString(),
        status: 'PENDING', // Статус "Ожидает подтверждения"
        totalClientPrice: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        deliveryAddress,
        items: cart.map((item) => ({
          product: { id: item.id }, // Предполагаем, что item.id — это productId
          quantity: item.quantity,
          priceAtTime: item.price,
        })),
      };
      await api.post('/orders', order);
      await clearCart();
      alert('Заказ успешно отправлен на проверку администратору!');
      setShowConfirm(false);
      setDeliveryAddress(''); // Сброс адреса после успешного заказа
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      alert('Ошибка при создании заказа: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div className="text-center mt-10 text-white">Загрузка корзины...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!cart || cart.length === 0) return <div className="text-center mt-10 text-white">Корзина пуста</div>;

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-white mb-6">Корзина</h2>
      {cart.map((item) => (
        <div key={item.id} className="flex justify-between items-center bg-gray-800 p-4 mb-4 rounded-lg">
          <div>
            <h3 className="text-lg text-white">{item.name}</h3>
            <p className="text-gray-400">Цена: ¥{item.price.toFixed(2)} x {item.quantity}</p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
              className="w-16 p-1 rounded bg-gray-700 text-white"
              disabled={loading}
            />
            <button
              onClick={() => removeFromCart(item.id)}
              className="bg-red-600 p-2 rounded text-white hover:bg-red-700"
              disabled={loading}
            >
              Удалить
            </button>
          </div>
        </div>
      ))}
      <div className="text-right mt-4">
        <p className="text-xl text-white">Итого: ¥{total.toFixed(2)}</p>
        <div className="mt-4">
          <input
            type="text"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="Введите адрес доставки"
            className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
            required
          />
          <div className="flex justify-between">
            <button
              onClick={clearCart}
              className="bg-red-600 p-2 rounded text-white hover:bg-red-700"
              disabled={loading}
            >
              Очистить корзину
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="bg-blue-600 p-2 rounded text-white hover:bg-blue-700"
              disabled={loading || !deliveryAddress}
            >
              Оформить заказ
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full text-white">
            <h3 className="text-lg font-bold mb-4">Подтверждение заказа</h3>
            <p>Вы уверены, что хотите оформить заказ на сумму ¥{total.toFixed(2)}?</p>
            <p>Адрес доставки: {deliveryAddress}</p>
            <div className="flex justify-between mt-4">
              <button
                onClick={handleConfirmOrder}
                className="bg-green-600 p-2 rounded text-white hover:bg-green-700"
                disabled={loading}
              >
                Подтвердить
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-600 p-2 rounded text-white hover:bg-gray-700"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;