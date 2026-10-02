import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../components/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../components/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCartIcon, XMarkIcon, ArrowRightIcon, CreditCardIcon, PlusIcon, MinusIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import Tilt from 'react-parallax-tilt';
import PostOfficeSelect from '../components/PostOfficeSelect';
import nonCacheApi from '../api/nonCacheApi';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Loading } from '../components/ui/Loading';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';
import { StyledSelect } from '../components/ui/StyledSelect';
import { authStorage } from '../utils/authStorage';

function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, confirmOrder, loading, error, setError, setCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountType, setDiscountType] = useState(null);
  const [discountValue, setDiscountValue] = useState(0);
  const [promoError, setPromoError] = useState(null);
  const [insurance, setInsurance] = useState(false);
  const [packaging, setPackaging] = useState('standard');
  const [localQuantities, setLocalQuantities] = useState({});
  const [userDiscountPercent, setUserDiscountPercent] = useState(0);
  const [phone, setPhone] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  
  // Packaging options
  const packagingOptions = {
    standard: { label: 'Стандартная упаковка', cost: 3 },
    premium: { label: 'Водонепроницаемая упаковка', cost: 5 },
  };

  // Fetch cart data and user discount
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        console.log('Fetching cart data...');
        const response = await nonCacheApi.get('/cart');
        console.log('fetchCartData response:', response.data);
        if (!response.data || !Array.isArray(response.data)) {
          console.warn('fetchCartData: No valid cart data received');
          setError('Корзина пуста');
          return;
        }
        const cartData = response.data.map(item => {
          const productId = item.productId || item.id;
          return {
            id: productId,
            productId: productId,
            imageUrl: item.imageUrl || 'https://via.placeholder.com/128x128?text=Нет+фото',
            name: item.productName || item.name || 'Unnamed Product',
            price: item.price || 0,
            quantity: item.quantity || 1,
            url: item.url || '',
            description: item.description || '',
          };
        });
        console.log('Parsed cart data:', cartData);
        setCart(cartData);
        const initialQuantities = cartData.reduce((acc, item) => {
          const id = item.id || item.productId;
          return {
            ...acc,
            [id]: item.quantity || 1,
          };
        }, {});
        setLocalQuantities(initialQuantities);
      } catch (err) {
        console.error('Ошибка при загрузке корзины:', err.response || err);
        setError('Ошибка при загрузке корзины: ' + (err.response?.data?.message || err.message));
        if (err.response?.status === 403) {
          authStorage.removeToken();
          navigate('/login');
        }
      }
    };

    const fetchUserData = async () => {
      try {
        const response = await api.get('/users/me');
        if (response?.data) {
          setUserDiscountPercent(response.data.totalDiscount || 0);
        } else {
          setUserDiscountPercent(0);
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных пользователя:', err);
        setUserDiscountPercent(0);
        if (err.response?.status === 403) {
          console.warn('Пользователь не аутентифицирован, перенаправление на логин');
        }
      }
    };

    fetchCartData();
    if (user) fetchUserData();
  }, [setCart, user, navigate]);

  // Validate promocode
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

  const handlePromoCodeChange = async (e) => {
    const newCode = e.target.value;
    setDiscountValue(0);
    setPromoError(null);
    setPromoApplied(false);
    setPromoCode(newCode);
    if (newCode) {
      await validatePromocode(newCode);
    }
  };

  // Calculate totals
  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      const id = item.id || item.productId;
      return sum + (item.price * (localQuantities[id] || item.quantity));
    }, 0);
  }, [cart, localQuantities]);

  const userDiscount = useMemo(() => total * (userDiscountPercent / 100), [total, userDiscountPercent]);
  const promocodeDiscount = useMemo(() => 
    discountType === 'PERCENTAGE' ? total * (discountValue / 100) : discountValue, 
    [discountType, discountValue, total]
  );
  const totalDiscount = useMemo(() => userDiscount + promocodeDiscount, [userDiscount, promocodeDiscount]);
  const insuranceCost = useMemo(() => insurance ? total * 0.05 : 0, [insurance, total]);
  const finalTotal = useMemo(() => Math.max(0, total - totalDiscount + insuranceCost), [total, totalDiscount, insuranceCost]);

  // Confirm order
  const handleConfirmOrder = async () => {
    console.log('Cart state in handleConfirmOrder:', cart);
    if (!deliveryAddress) {
      setError('Пожалуйста, выберите отделение почты');
      return;
    }
    if (!cart || cart.length === 0) {
      setError('Корзина пуста');
      return;
    }
    if (!phone?.trim()) {
      setError('Укажите номер телефона');
      return;
    }
    if (!lastName?.trim()) {
      setError('Укажите фамилию');
      return;
    }
    if (!firstName?.trim()) {
      setError('Укажите имя');
      return;
    }
    if (!packaging) {
      setError('Пожалуйста, выберите тип упаковки');
      return;
    }

    try {
      const response = await confirmOrder(
        deliveryAddress,
        phone,
        lastName,
        firstName,
        middleName,
        promoApplied ? promoCode : null, 
        insurance, 
        discountType, 
        discountValue,
        packaging
      );
      setDeliveryAddress('');
      setPromoCode('');
      setPromoApplied(false);
      setDiscountType(null);
      setDiscountValue(0);
      setInsurance(false);
      setPackaging('standard');
      setPhone('');
      setLastName('');
      setFirstName('');
      setMiddleName('');
      console.log('Order response:', response);
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      setError(error.response?.data?.message || error.message || 'Ошибка при создании заказа');
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
    const cartItem = cart.find(item => (item.id === productId) || (item.productId === productId));
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

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] relative overflow-hidden pb-24 sm:pb-0">
      <div className="relative z-10">
        <PageHeader kicker="Заказ" title="Корзина" subtitle="Проверьте и оформите заказ" />

        <AnimatePresence>
          {loading && <Loading message="Загрузка корзины..." />}
          {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-8" />}
        </AnimatePresence>

        {/* Пустая корзина */}
        {!loading && !error && (!cart || cart.length === 0) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-20">
            <div className="p-6 sm:p-12 text-center max-w-md rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <ShoppingCartIcon className="w-16 h-16 sm:w-24 sm:h-24 mx-auto text-[#9ca3af] mb-4 sm:mb-6" />
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-[#e5e7eb]">Корзина пуста</h2>
              <p className="text-xs sm:text-base text-[#9ca3af] mb-6 sm:mb-8">Добавьте товары через «Заказать товар» или выберите из примеров</p>
              <button onClick={() => navigate('/terminal')} className="w-full px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] transition-all duration-300 font-medium flex items-center justify-center mb-2">
                Заказать товар <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2" />
              </button>
              <button onClick={() => navigate('/catalog')} className="w-full px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#9ca3af] hover:bg-[rgba(255,255,255,0.05)] transition-all duration-300 font-medium flex items-center justify-center">
                Примеры товаров <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 ml-1.5 sm:ml-2" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Основное содержимое */}
        {cart && cart.length > 0 && (
          <>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Левая колонка — товары */}
              <div className="flex-1 max-w-2xl space-y-3">
                {cart.map((item, index) => {
                  const productId = item.id || item.productId;
                  const currentQty = localQuantities[productId] || item.quantity;
                  const itemTotal = item.price * currentQty;

                  return (
                    <motion.div
                      key={productId}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="glass sheet flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4">
                        <div className="flex gap-3 sm:gap-4 w-full sm:w-auto">
                          {/* Фото */}
                          <div className="relative w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] lg:w-[100px] lg:h-[100px] flex-shrink-0 rounded-[14px] overflow-hidden" style={{ background: 'rgba(255,255,255,0.62)' }}>
                            <img
                              src={item.imageUrl || 'https://via.placeholder.com/128x128?text=Нет+фото'}
                              alt={item.name}
                              className="w-full h-full object-contain"
                              onError={(e) => (e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото')}
                            />
                          </div>

                          {/* Инфо */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base lg:text-lg font-medium text-[#111] mb-1 leading-tight line-clamp-2">{item.name}</h3>
                            
                            {/* Количество */}
                            <div className="flex items-center gap-2 sm:gap-3 mt-2">
                              <button
                                onClick={() => {
                                  const newQty = Math.max(1, currentQty - 1);
                                  handleQuantityChange(productId, newQty.toString());
                                  handleQuantityBlur(productId);
                                }}
                                disabled={currentQty <= 1}
                                className="cart-step"
                              >
                                <MinusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <span className="text-sm sm:text-base text-[#111] font-medium min-w-[18px] sm:min-w-[20px] text-center">
                                {currentQty}
                              </span>
                              <button
                                onClick={() => {
                                  const newQty = currentQty + 1;
                                  handleQuantityChange(productId, newQty.toString());
                                  handleQuantityBlur(productId);
                                }}
                                className="cart-step"
                              >
                                <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Цена и удаление */}
                        <div className="flex justify-between items-center sm:flex-col sm:items-end gap-2 sm:gap-3 mt-3 sm:mt-0 sm:ml-auto">
                          <div className="flex flex-col items-end">
                            <div className="text-sm sm:text-base lg:text-lg font-semibold text-[#111]">¥{itemTotal.toFixed(2)}</div>
                          </div>
                          <button
                            onClick={() => removeFromCart(productId)}
                            className="cart-remove"
                            aria-label="Удалить товар"
                          >
                            <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Сумма товаров */}
                <div className="p-4 sm:p-5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                  <div className="flex justify-between items-center text-base sm:text-lg">
                    <span className="font-semibold text-[#9ca3af]">Сумма товаров</span>
                    <span className="text-xl sm:text-2xl font-bold text-[#e5e7eb]">¥{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

    {/* Правая колонка — оформление заказа (Desktop) */}
    <div className="hidden lg:block w-[650px] flex-shrink-0">
              <div className="sticky top-8">
                <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Оформление заказа</h3>

                  {/* Все поля в один столбец */}
                  <div className="space-y-4">
                        {/* Доставка */}
                        <div className="pb-4 border-b border-[rgba(255,255,255,0.1)]">
                          <h4 className="font-semibold text-sm mb-2 text-[#00f0ff]">
                            <span className="flex items-center gap-2">
                              Доставка
                              <span className="text-[#00f0ff] text-xs">*</span>
                            </span>
                          </h4>
                          <PostOfficeSelect deliveryAddress={deliveryAddress} setDeliveryAddress={setDeliveryAddress} setError={setError} />
                              </div>

                        {/* Номер телефона */}
                        <div className="pb-4 border-b border-[rgba(255,255,255,0.1)]">
                          <h4 className="font-semibold text-sm mb-2 text-[#00f0ff]">
                            <span className="flex items-center gap-2">
                              Номер телефона
                              <span className="text-[#00f0ff] text-xs">*</span>
                            </span>
                          </h4>
                          <Input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+375 (XX) XXX-XX-XX"
                            className="text-sm"
                          />
                          <p className="text-xs text-gray-400 mt-2">
                            Номер телефона необходим для связи с вами по поводу заказа
                          </p>
                        </div>

                        {/* ФИО */}
                        <div className="pb-4 border-b border-[rgba(255,255,255,0.1)]">
                          <h4 className="font-semibold text-sm mb-2 text-[#00f0ff]">
                            <span className="flex items-center gap-2">
                              ФИО
                              <span className="text-[#00f0ff] text-xs">*</span>
                            </span>
                          </h4>
                          <div className="space-y-3">
                            <Input
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="Фамилия *"
                              className="text-sm"
                              required
                            />
                            <Input
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="Имя *"
                              className="text-sm"
                              required
                            />
                            <Input
                              type="text"
                              value={middleName}
                              onChange={(e) => setMiddleName(e.target.value)}
                              placeholder="Отчество (необязательно)"
                              className="text-sm"
                            />
                          </div>
                        </div>

                        {/* Упаковка */}
                        <div className="pb-4 border-b border-[rgba(255,255,255,0.1)]">
                          <h4 className="font-semibold text-sm mb-2 text-[#00f0ff]">
                            <span className="flex items-center gap-2">
                              Тип упаковки
                              <span className="text-[#00f0ff] text-xs">*</span>
                            </span>
                          </h4>
                          <StyledSelect
                            value={packaging}
                            onChange={setPackaging}
                            options={Object.entries(packagingOptions).map(([key, { label, cost }]) => ({
                              value: key,
                              label: `${label} ($${cost})`,
                            }))}
                            placeholder="Выберите тип упаковки"
                            className="text-sm"
                          />
                          <p className="text-xs text-gray-400 mt-2">
                            Цена за упаковку включается в общую цену доставки и уплачивается вместе с доставкой.{' '}
                            <a 
                              href="/order-instructions" 
                              onClick={(e) => { e.preventDefault(); navigate('/order-instructions'); }}
                              className="text-[#00f0ff] hover:underline font-medium"
                            >
                              Подробнее
                            </a>
                          </p>
                          </div>

                          {/* Страховка */}
                        <div className="pb-4 border-b border-[rgba(255,255,255,0.1)]">
                          <div className="flex items-center gap-3 p-3 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[rgba(255,255,255,0.1)] hover:border-[#00f0ff]/50 transition-colors cursor-pointer" onClick={() => setInsurance(!insurance)}>
                            <input 
                              type="checkbox" 
                              checked={insurance} 
                              onChange={(e) => setInsurance(e.target.checked)} 
                              className="w-5 h-5 text-[#00f0ff] bg-[rgba(107,114,128,0.15)] border border-[rgba(255,255,255,0.1)] rounded focus:ring-[#00f0ff] focus:ring-2 cursor-pointer" 
                            />
                            <label className="flex-1 cursor-pointer">
                              <span className="font-semibold text-sm text-white">Страховка</span>
                              <span className="block text-xs text-gray-400 mt-0.5">+5% от стоимости товаров</span>
                            </label>
                          </div>
                          </div>

                          {/* Промокод */}
                          <div>
                          <h4 className="font-semibold text-sm mb-2 text-gray-400">Промокод</h4>
                          <Input value={promoCode} onChange={handlePromoCodeChange} placeholder="Введите промокод (необязательно)" error={promoError} className="text-sm" />
                            {promoApplied && <Alert type="success" message="Промокод применён!" className="mt-2 text-xs" />}
                        </div>
                    </div>

                    {/* Итоговая сумма */}
                    <div className="mt-4 pt-4 border-t-2 border-[rgba(255,255,255,0.1)] space-y-2">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-300">Товары:</span>
                          <span className="font-semibold text-white">¥{total.toFixed(2)}</span>
                        </div>
                        {userDiscount > 0 && (
                          <div className="flex justify-between items-center py-1 text-green-400">
                            <span>Скидка:</span>
                            <span className="font-semibold">-¥{userDiscount.toFixed(2)}</span>
                          </div>
                        )}
                        {promoApplied && (
                          <div className="flex justify-between items-center py-1 text-green-400">
                            <span>Промокод:</span>
                            <span className="font-semibold">-¥{promocodeDiscount.toFixed(2)}</span>
                          </div>
                        )}
                        {insuranceCost > 0 && (
                          <div className="flex justify-between items-center py-1">
                            <span className="text-gray-300">Страховка:</span>
                            <span className="font-semibold text-white">+¥{insuranceCost.toFixed(2)}</span>
                          </div>
                        )}
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t-2 border-[#00f0ff]">
                          <span className="text-lg font-bold">К оплате:</span>
                          <span className="text-2xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                          ¥{finalTotal.toFixed(2)}
                          </span>
                        </div>
                      <p className="text-xs text-gray-400 text-right mt-1">Оплата через эквайринг BePaid</p>
                  <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.1)] flex items-start gap-2">
                    <InformationCircleIcon className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-300/90 flex-1">
                      Оплата взимается не в момент оформления, а после проверки заказа администратором
                    </p>
                  </div>

                    {/* Кнопки действий */}
                    <div className="mt-4 space-y-2">
                        <Button
                          variant="primary"
                          size="lg"
                        onClick={handleConfirmOrder}
                        disabled={!deliveryAddress || !packaging || !phone?.trim() || !lastName?.trim() || !firstName?.trim() || loading}
                          className="w-full text-base"
                        >
                          Оформить заказ
                        </Button>
                        <Button variant="outline" onClick={clearCart} disabled={loading} className="w-full text-sm">
                          Очистить корзину
                        </Button>
                      </div>
                </div>
              </div>
            </div>
            </div>

    {/* Мобильная версия оформления заказа */}
    <div className="lg:hidden w-full">
              <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-[#e5e7eb]">Оформление заказа</h3>

                {/* Доставка */}
                <div className="mb-4 pb-4 border-b border-[rgba(255,255,255,0.1)]">
                  <h4 className="font-semibold text-sm mb-2 text-[#00f0ff]">
                    <span className="flex items-center gap-2">
                      Доставка
                      <span className="text-[#00f0ff] text-xs">*</span>
                    </span>
                  </h4>
                  <PostOfficeSelect deliveryAddress={deliveryAddress} setDeliveryAddress={setDeliveryAddress} setError={setError} />
                </div>

                {/* Номер телефона */}
                <div className="mb-4 pb-4 border-b border-[rgba(255,255,255,0.1)]">
                  <h4 className="font-semibold text-sm mb-2 text-[#00f0ff]">
                    <span className="flex items-center gap-2">
                      Номер телефона
                      <span className="text-[#00f0ff] text-xs">*</span>
                    </span>
                  </h4>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+375 (XX) XXX-XX-XX"
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Номер телефона необходим для связи с вами по поводу заказа
                  </p>
                </div>

                {/* ФИО */}
                <div className="mb-4 pb-4 border-b border-[rgba(255,255,255,0.1)]">
                  <h4 className="font-semibold text-sm mb-2 text-[#00f0ff]">
                    <span className="flex items-center gap-2">
                      ФИО
                      <span className="text-[#00f0ff] text-xs">*</span>
                    </span>
                  </h4>
                  <div className="space-y-3">
                    <Input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Фамилия *"
                      className="text-sm"
                      required
                    />
                    <Input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Имя *"
                      className="text-sm"
                      required
                    />
                    <Input
                      type="text"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="Отчество (необязательно)"
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Упаковка */}
                <div className="mb-4 pb-4 border-b border-[rgba(255,255,255,0.1)]">
                  <h4 className="font-semibold text-sm mb-2 text-[#00f0ff]">
                    <span className="flex items-center gap-2">
                      Тип упаковки
                      <span className="text-[#00f0ff] text-xs">*</span>
                    </span>
                  </h4>
                  <StyledSelect
                    value={packaging}
                    onChange={setPackaging}
                    options={Object.entries(packagingOptions).map(([key, { label, cost }]) => ({
                      value: key,
                      label: `${label} ($${cost})`,
                    }))}
                    placeholder="Выберите тип упаковки"
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Цена за упаковку включается в общую цену доставки и уплачивается вместе с доставкой.{' '}
                    <a 
                      href="/order-instructions" 
                      onClick={(e) => { e.preventDefault(); navigate('/order-instructions'); }}
                      className="text-[#00f0ff] hover:underline font-medium"
                    >
                      Подробнее
                    </a>
                  </p>
                </div>

                {/* Страховка */}
                <div className="mb-4 pb-4 border-b border-[rgba(255,255,255,0.1)]">
                  <div className="flex items-center gap-3 p-3 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[rgba(255,255,255,0.1)] hover:border-[#00f0ff]/50 transition-colors cursor-pointer" onClick={() => setInsurance(!insurance)}>
                    <input 
                      type="checkbox" 
                      checked={insurance} 
                      onChange={(e) => setInsurance(e.target.checked)} 
                      className="w-5 h-5 text-[#00f0ff] bg-[rgba(107,114,128,0.15)] border border-[rgba(255,255,255,0.1)] rounded focus:ring-[#00f0ff] focus:ring-2 cursor-pointer" 
                    />
                    <label className="flex-1 cursor-pointer">
                      <span className="font-semibold text-sm text-white">Страховка</span>
                      <span className="block text-xs text-gray-400 mt-0.5">+5% от стоимости товаров</span>
                    </label>
                  </div>
                </div>

                {/* Промокод */}
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2 text-gray-400">Промокод</h4>
                  <Input value={promoCode} onChange={handlePromoCodeChange} placeholder="Введите промокод (необязательно)" error={promoError} className="text-sm" />
                  {promoApplied && <Alert type="success" message="Промокод применён!" className="mt-2 text-xs" />}
                </div>

                {/* Итоговая сумма */}
                <div className="pt-4 border-t-2 border-[rgba(255,255,255,0.1)] space-y-2 mb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-300">Товары:</span>
                      <span className="font-semibold text-white">¥{total.toFixed(2)}</span>
                    </div>
                    {userDiscount > 0 && (
                      <div className="flex justify-between items-center py-1 text-green-400">
                        <span>Скидка:</span>
                        <span className="font-semibold">-¥{userDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    {promoApplied && (
                      <div className="flex justify-between items-center py-1 text-green-400">
                        <span>Промокод:</span>
                        <span className="font-semibold">-¥{promocodeDiscount.toFixed(2)}</span>
                            </div>
                    )}
                    {insuranceCost > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-300">Страховка:</span>
                        <span className="font-semibold text-white">+¥{insuranceCost.toFixed(2)}</span>
                              </div>
                            )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t-2 border-[#00f0ff]">
                    <span className="text-lg font-bold">К оплате:</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                      ¥{finalTotal.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 text-right mt-1">Оплата через эквайринг BePaid</p>
                  <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.1)] flex items-start gap-2">
                    <InformationCircleIcon className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-300/90 flex-1">
                      Оплата взимается не в момент оформления, а после проверки заказа администратором
                    </p>
                            </div>
                          </div>

                {/* Кнопки действий */}
                          <div className="space-y-2">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleConfirmOrder}
                    disabled={!deliveryAddress || !packaging || !phone?.trim() || !lastName?.trim() || !firstName?.trim() || loading}
                    className="w-full text-base"
                  >
                    Оформить заказ
                  </Button>
                  <Button variant="outline" onClick={clearCart} disabled={loading} className="w-full text-sm">
                    Очистить корзину
                  </Button>
                </div>
              </div>
            </div>
            </div>
          </>
          
        )}

      </div>
    </div>
  );
}

export default CartPage;
