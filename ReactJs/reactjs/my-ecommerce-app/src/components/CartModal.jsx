import React, { useState } from 'react';
import api from '../api/axiosInstance';
import { useCart } from './CartContext'; // Обновлен путь

function CartModal({ isOpen, onClose }) {
  const { cart, removeFromCart, updateQuantity, clearCart, loading, error } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.price * 3.5 * item.quantity), 0).toFixed(2);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Необходима авторизация');
      }

      const orderData = {
        totalClientPrice: parseFloat(total),
        deliveryAddress,
      };

      await api.post('/orders', orderData);
      await clearCart();
      onClose();
      alert('Заказ успешно оформлен!');
    } catch (error) {
      alert('Ошибка при оформлении заказа: ' + (error.response?.data?.message || error.message));
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-white">Корзина</h2>
        {error && <div className="mb-4 p-2 bg-red-600 text-white rounded">{error}</div>}
        {loading ? (
          <p className="text-gray-400">Загрузка...</p>
        ) : cart.length === 0 ? (
          <p className="text-gray-400">Корзина пуста</p>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center mb-4 border-b border-gray-600 pb-2">
                <div>
                  <h3 className="text-lg">{item.name}</h3>
                  <p className="text-gray-400">BYN {(item.price * 3.5).toFixed(2)} x {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    className="w-16 p-1 rounded bg-gray-700 text-white border border-gray-600"
                  />
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="px-2 py-1 bg-red-600 rounded hover:bg-red-700 text-white"
                    disabled={loading}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-4">
              <input
                type="text"
                placeholder="Адрес доставки..."
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full p-2 mb-4 rounded-lg bg-gray-700 text-white border border-gray-600"
              />
              <p className="text-lg font-bold text-white text-right">Итого: {total} BYN</p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 text-white"
                disabled={loading}
              >
                Закрыть
              </button>
              <button
                onClick={handleCheckout}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 text-white"
                disabled={checkoutLoading || !deliveryAddress || loading}
              >
                {checkoutLoading ? 'Оформление...' : 'Оформить заказ'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartModal;