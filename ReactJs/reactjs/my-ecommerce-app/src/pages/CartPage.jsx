import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../components/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../components/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCartIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Tilt from 'react-parallax-tilt';

// Append global styles
const styles = `
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-down {
    animation: fadeInDown 0.6s ease-out;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-up {
    animation: slideUp 0.5s ease-out;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  .animate-pulse {
    animation: pulse 1.5s infinite;
  }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

function useDebounce(callback, delay) {
  const [timeoutId, setTimeoutId] = useState(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const id = setTimeout(() => {
      callback(...args);
    }, delay);
    setTimeoutId(id);
  }, [callback, delay, timeoutId]);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return debouncedCallback;
}

function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, confirmOrder, loading, error, setError, setCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountType, setDiscountType] = useState(null);
  const [discountValue, setDiscountValue] = useState(0);
  const [promoError, setPromoError] = useState(null);
  const [insurance, setInsurance] = useState(false);
  const [localQuantities, setLocalQuantities] = useState({});
  const [userDiscountPercent, setUserDiscountPercent] = useState(0);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        console.log('Fetching cart data...');
        const response = await api.get('/cart');
        console.log('fetchCartData response:', response.data);
        if (!response.data || !Array.isArray(response.data)) {
          console.warn('fetchCartData: No valid cart data received');
          setCart([]);
          setError('Корзина пуста');
          return;
        }
        const cartData = response.data.map(item => ({
          productId: item.productId || item.id,
          imageUrl: item.imageUrl || 'https://via.placeholder.com/128x128?text=Нет+фото',
          name: item.productName || item.name || 'Unnamed Product',
          price: item.price || 0,
          quantity: item.quantity || 1,
        }));
        console.log('Parsed cart data:', cartData);
        setCart(cartData);
        const initialQuantities = cartData.reduce((acc, item) => ({
          ...acc,
          [item.productId]: item.quantity || 1,
        }), {});
        setLocalQuantities(initialQuantities);
      } catch (err) {
        console.error('Ошибка при загрузке корзины:', err.response || err);
        setError('Ошибка при загрузке корзины: ' + (err.response?.data?.message || err.message));
        setCart([]);
        if (err.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    const fetchUserDiscount = async () => {
      try {
        const response = await api.get('/users/me');
        if (response?.data) {
          setUserDiscountPercent(response.data.totalDiscount || 0);
        } else {
          setUserDiscountPercent(0);
        }
      } catch (err) {
        console.error('Ошибка при загрузке скидки пользователя:', err);
        setUserDiscountPercent(0);
        if (err.response?.status === 403) {
          console.warn('Пользователь не аутентифицирован, перенаправление на логин');
        }
      }
    };

    fetchCartData();
    if (user) fetchUserDiscount();
  }, [setCart, user, navigate]);

  useEffect(() => {
    console.log('Cart contents:', cart);
  }, [cart]);

  const validatePromocode = async (code) => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setPromoError('Введите промокод');
      setPromoApplied(false);
      setDiscountType(null);
      setDiscountValue(0);
      return;
    }
    if (!/^[A-Z0-9]+$/.test(trimmedCode)) {
      setPromoError('Промокод должен содержать только буквы и цифры');
      setPromoApplied(false);
      setDiscountType(null);
      setDiscountValue(0);
      return;
    }
    try {
      const response = await api.post('/promocodes/validate', { code: trimmedCode }, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response?.data) {
        setDiscountType(response.data.discountType);
        setDiscountValue(response.data.discountValue);
        setPromoApplied(true);
        setPromoError(null);
      }
    } catch (error) {
      const errorMessage = error.response?.data || 'Ошибка при проверке промокода';
      setPromoError(errorMessage);
      setDiscountType(null);
      setDiscountValue(0);
      setPromoApplied(false);
      console.error('Error validating promocode:', error, 'Response:', error.response?.data);
    }
  };

  const debouncedValidatePromocode = useDebounce(validatePromocode, 500);

  const handlePromoCodeChange = (e) => {
    const newCode = e.target.value;
    setDiscountValue(0);
    setPromoError(null);
    setPromoApplied(false);
    setPromoCode(newCode);
    debouncedValidatePromocode(newCode);
  };

  const handleConfirmOrder = async () => {
    console.log('Cart state in handleConfirmOrder:', cart);
    if (!deliveryAddress) {
      setError('Пожалуйста, укажите адрес доставки');
      return;
    }
    if (!cart || cart.length === 0) {
      setError('Корзина пуста');
      return;
    }
    try {
      const response = await confirmOrder(deliveryAddress, promoApplied ? promoCode : null, insurance, discountType, discountValue);
      setShowConfirm(false);
      setDeliveryAddress('');
      setPromoCode('');
      setPromoApplied(false);
      setDiscountType(null);
      setDiscountValue(0);
      setInsurance(false);
      console.log('Order response:', response);
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      setError(error.message);
    }
  };

  const handleQuantityChange = (productId, value) => {
    setLocalQuantities(prev => ({
      ...prev,
      [productId]: value === '' ? '' : parseInt(value, 10) || 1,
    }));
  };

  const handleQuantityBlur = async (productId) => {
    const inputValue = localQuantities[productId] || 1;
    const cartItem = cart.find(item => item.productId === productId);
    if (!cartItem) return;

    const originalQuantity = cartItem.quantity;
    let newQuantity = inputValue;

    if (newQuantity !== originalQuantity) {
      console.log('Sending update for productId:', productId, 'quantity:', newQuantity);
      try {
        await updateQuantity(productId, newQuantity);
      } catch (error) {
        console.error('Error updating quantity:', error.response || error);
        setError('Не удалось обновить количество.');
        setLocalQuantities(prev => ({
          ...prev,
          [productId]: originalQuantity,
        }));
      }
    }
  };

  const handleQuantityKeyPress = (event, productId) => {
    if (event.key === 'Enter') {
      event.target.blur();
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * (localQuantities[item.productId] || item.quantity)), 0);
  const userDiscount = total * (userDiscountPercent / 100);
  const promocodeDiscount = discountType === 'PERCENTAGE' ? total * (discountValue / 100) : discountValue;
  const totalDiscount = userDiscount + promocodeDiscount;
  const insuranceCost = insurance ? total * 0.05 : 0;
  const finalTotal = Math.max(0, total - totalDiscount + insuranceCost);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
          backgroundRepeat: 'repeat',
        }}
      />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500 tracking-tight animate-fade-in-down">
            Ваша корзина
          </h2>
        </motion.header>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-4 bg-gray-800/30 border border-cyan-500/50 rounded-lg text-white text-center text-base font-medium shadow-md animate-pulse"
            >
              Загрузка корзины...
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-4 bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 text-center text-base font-medium shadow-md"
            >
              Ошибка: {error}
            </motion.div>
          )}
          {!loading && !error && (!cart || cart.length === 0) && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-4 bg-gray-800/30 border border-cyan-500/50 rounded-lg text-gray-300 text-center text-base font-medium shadow-md"
            >
              Корзина пуста
            </motion.div>
          )}
        </AnimatePresence>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-12"
        >
          {cart.length > 0 && (
            <div className="space-y-6">
              {cart.map((item, index) => (
                <Tilt key={item.productId} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
                  <motion.div
                    className="flex items-center bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 rounded-2xl border border-cyan-500/30 shadow-lg"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div
                      className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{
                        backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                        backgroundRepeat: 'repeat',
                      }}
                    />
                    <div className="w-28 h-28 mr-6 overflow-hidden rounded-lg border border-gray-600/20">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log('Image load error for URL:', item.imageUrl);
                            e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700/50 flex items-center justify-center rounded-lg text-gray-300 text-base">
                          Нет фото
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white truncate">{item.name}</h3>
                      <p className="text-base text-cyan-400 font-medium mt-2">¥{item.price.toFixed(2)} x {localQuantities[item.productId] || item.quantity}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <input
                        type="number"
                        min="1"
                        value={localQuantities[item.productId] || item.quantity}
                        onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                        onBlur={() => handleQuantityBlur(item.productId)}
                        onKeyPress={(e) => handleQuantityKeyPress(e, item.productId)}
                        className="w-16 px-4 py-3 bg-gray-800/80 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        disabled={loading}
                        aria-label={`Количество для ${item.name}`}
                      />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg text-base font-semibold shadow-sm"
                        onClick={() => removeFromCart(item.productId)}
                        disabled={loading}
                        aria-label={`Удалить ${item.name} из корзины`}
                      >
                        Удалить
                      </motion.button>
                    </div>
                  </motion.div>
                </Tilt>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
              <motion.div
                className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-8 rounded-2xl border border-cyan-500/30 shadow-lg animate-slide-up"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileTap={{ scale: 0.97 }}
              >
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                    backgroundRepeat: 'repeat',
                  }}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-medium text-gray-300 mb-2" htmlFor="deliveryAddress">
                      Адрес доставки *
                    </label>
                    <input
                      id="deliveryAddress"
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/80 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Введите адрес доставки"
                      aria-required="true"
                    />
                    <label className="block text-base font-medium text-gray-300 mb-2 mt-4" htmlFor="promoCode">
                      Промокод
                    </label>
                    <input
                      id="promoCode"
                      type="text"
                      value={promoCode}
                      onChange={handlePromoCodeChange}
                      className={`w-full px-4 py-3 bg-gray-800/80 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                        promoError ? 'border-red-500' : promoApplied ? 'border-green-500' : ''
                      }`}
                      placeholder="Введите промокод"
                    />
                    {promoError && <p className="text-red-400 text-sm mt-1 animate-pulse">{promoError}</p>}
                    {promoApplied && !promoError && (
                      <p className="text-green-400 text-sm mt-1">Промокод применён!</p>
                    )}
                    <div className="mt-4">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={insurance}
                          onChange={(e) => setInsurance(e.target.checked)}
                          className="w-5 h-5 bg-gray-800/80 border border-cyan-500/30 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <span className="text-base text-gray-300">Страховка груза (5%): +¥{insuranceCost.toFixed(2)}</span>
                      </label>
                    </div>
                    <p className="text-sm text-gray-300 mt-2">
                      * Оплата товаров производится в профиле. Заказ отправляется на подтверждение администратору.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-cyan-400 mb-4">Итого: ¥{finalTotal.toFixed(2)}</p>
                    <p className="text-base text-gray-300 mb-2">Сумма товаров: ¥{total.toFixed(2)}</p>
                    {userDiscount > 0 && (
                      <p className="text-base text-green-400 mb-2">Скидка пользователя ({userDiscountPercent}%): -¥{userDiscount.toFixed(2)}</p>
                    )}
                    {promoApplied && !promoError && (
                      <p className="text-base text-green-400 mb-2">
                        Скидка по промокоду {promoCode} ({discountType === 'PERCENTAGE' ? `${discountValue}%` : `¥${discountValue.toFixed(2)}`}): -¥{promocodeDiscount.toFixed(2)}
                      </p>
                    )}
                    {totalDiscount > 0 && (
                      <p className="text-base text-green-400 mb-2">Общая скидка: -¥{totalDiscount.toFixed(2)}</p>
                    )}
                    {insuranceCost > 0 && (
                      <p className="text-base text-gray-300 mb-2">Страховка: +¥{insuranceCost.toFixed(2)}</p>
                    )}
                    <div className="flex justify-end space-x-4">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg text-base font-semibold shadow-sm"
                        onClick={clearCart}
                        disabled={loading}
                        aria-label="Очистить корзину"
                      >
                        Очистить
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-cyan-500 text-white rounded-lg text-base font-semibold shadow-sm"
                        onClick={() => setShowConfirm(true)}
                        disabled={loading || !deliveryAddress || cart.length === 0}
                        aria-label="Оформить заказ"
                      >
                        Оформить
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Tilt>
          )}

          {showConfirm && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
                <motion.div
                  className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-8 rounded-2xl border border-cyan-500/30 shadow-lg max-w-md w-full"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                      backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                      backgroundRepeat: 'repeat',
                    }}
                  />
                  <button
                    className="absolute top-4 right-4 text-gray-300"
                    onClick={() => setShowConfirm(false)}
                    aria-label="Закрыть подтверждение"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                  <h3 className="text-2xl font-bold text-cyan-400 mb-6">Подтверждение заказа</h3>
                  <p className="text-base text-gray-300 mb-2">Сумма товаров: ¥{total.toFixed(2)}</p>
                  {userDiscount > 0 && (
                    <p className="text-base text-green-400 mb-2">Скидка пользователя ({userDiscountPercent}%): -¥{userDiscount.toFixed(2)}</p>
                  )}
                  {promoApplied && (
                    <p className="text-base text-green-400 mb-2">
                      Скидка по промокоду {promoCode} ({discountType === 'PERCENTAGE' ? `${discountValue}%` : `¥${discountValue.toFixed(2)}`}): -¥{promocodeDiscount.toFixed(2)}
                    </p>
                  )}
                  {totalDiscount > 0 && (
                    <p className="text-base text-green-400 mb-2">Общая скидка: -¥{totalDiscount.toFixed(2)}</p>
                  )}
                  {insuranceCost > 0 && (
                    <p className="text-base text-gray-300 mb-2">Страховка (5%): +¥{insuranceCost.toFixed(2)}</p>
                  )}
                  <p className="text-base text-cyan-400 font-bold mb-2">Итого: ¥{finalTotal.toFixed(2)}</p>
                  <p className="text-base text-gray-300 mb-2">Адрес: {deliveryAddress}</p>
                  <div className="flex justify-between space-x-4">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 px-6 py-3 bg-cyan-500 text-white rounded-lg text-base font-semibold shadow-sm"
                      onClick={handleConfirmOrder}
                      disabled={loading}
                      aria-label="Подтвердить заказ"
                    >
                      Подтвердить
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg text-base font-semibold shadow-sm"
                      onClick={() => setShowConfirm(false)}
                      aria-label="Отменить подтверждение"
                    >
                      Отмена
                    </motion.button>
                  </div>
                </motion.div>
              </Tilt>
            </motion.div>
          )}
        </motion.section>
      </div>
    </div>
  );
}

export default CartPage;