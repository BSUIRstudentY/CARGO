import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../components/CartContext';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../components/AuthProvider';

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
    }, [setCart, user]);

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
        setPromoError(true);
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
        <div className="container mx-auto p-6 text-gray-200 bg-gradient-to-br from-gray-900 to-gray-800">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-[var(--accent-color)] to-[var(--accent-color)]">
                Ваша корзина
            </h2>

            {loading && <div className="text-center mt-10 text-white animate-pulse">Загрузка корзины...</div>}
            {error && <div className="text-center mt-10 text-red-500">Ошибка: {error}</div>}
            {!loading && !error && (!cart || cart.length === 0) && (
                <div className="text-center mt-10 text-gray-400">Корзина пуста</div>
            )}

            {cart.length > 0 && (
                <div className="space-y-6 border-t border-gray-700 pt-6">
                    {cart.map((item) => (
                        <div
                            key={item.productId}
                            className="flex items-center p-5 bg-gray-800 rounded-xl border-l-4 border-[var(--accent-color)] hover:bg-gray-700 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="w-28 h-28 md:w-32 md:h-32 mr-6 overflow-hidden rounded-lg shadow-lg">
                                {item.imageUrl ? (
                                    <img
                                        src={item.imageUrl}
                                        alt={item.productName || item.name}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            console.log('Image load error for URL:', item.imageUrl);
                                            e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-600 flex items-center justify-center text-sm text-gray-500">
                                        Нет фото
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl md:text-2xl font-semibold text-gray-100">{item.productName || item.name}</h3>
                                <p className="text-sm md:text-base text-gray-400">Цена: ¥{item.price.toFixed(2)} x {localQuantities[item.productId] || item.quantity}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <input
                                    type="number"
                                    min="1"
                                    value={localQuantities[item.productId] || 1}
                                    onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                                    onBlur={() => handleQuantityBlur(item.productId)}
                                    onKeyPress={(e) => handleQuantityKeyPress(e, item.productId)}
                                    className="w-16 md:w-20 p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                                    disabled={loading}
                                />
                                <button
                                    onClick={() => removeFromCart(item.productId)}
                                    className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 hover:shadow-lg transition-all duration-300"
                                    disabled={loading}
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {cart.length > 0 && (
                <div className="mt-8 p-6 bg-gray-800 rounded-xl border-l-4 border-[var(--accent-color)] shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <input
                                type="text"
                                value={deliveryAddress}
                                onChange={(e) => setDeliveryAddress(e.target.value)}
                                placeholder="Введите адрес доставки"
                                className="w-full p-3 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] placeholder-gray-400 mb-4 transition-all"
                            />
                            <div className="mb-4">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={handlePromoCodeChange}
                                    placeholder="Введите промокод"
                                    className={`w-full p-2 rounded-lg bg-gray-700 text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] placeholder-gray-400 transition-all ${
                                        promoError ? 'bg-gradient-to-r from-red-500/20 via-transparent to-transparent' :
                                        promoApplied ? 'bg-gradient-to-r from-green-500/20 via-transparent to-transparent' : ''
                                    }`}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="flex items-center space-x-3 p-2 bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-600 transition-all duration-300">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={insurance}
                                            onChange={(e) => setInsurance(e.target.checked)}
                                            className="absolute w-0 h-0 opacity-0"
                                        />
                                        <span
                                            className={`w-5 h-5 bg-gray-600 rounded flex items-center justify-center transition-all duration-300 ${
                                                insurance ? 'bg-[var(--accent-color)]' : ''
                                            }`}
                                        >
                                            {insurance && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-200">Страховка груза (5%): +¥{insuranceCost.toFixed(2)}</span>
                                </label>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">
                                * Оплата товаров производится в профиле. Заказ отправляется на подтверждение администратору.
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)]">
                                Итого: ¥{finalTotal.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-400 mb-2">Сумма товаров: ¥{total.toFixed(2)}</p>
                            {userDiscount > 0 && (
                                <p className="text-sm text-green-500 mb-2">Скидка пользователя ({userDiscountPercent}%): -¥{userDiscount.toFixed(2)}</p>
                            )}
                            {promoApplied && !promoError && (
                                <p className="text-sm text-green-500 mb-2">
                                    Скидка по промокоду {promoCode} ({discountType === 'PERCENTAGE' ? `${discountValue}%` : `¥${discountValue.toFixed(2)}`}): -¥{promocodeDiscount.toFixed(2)}
                                </p>
                            )}
                            {totalDiscount > 0 && (
                                <p className="text-sm text-green-500 mb-2">Общая скидка: -¥{totalDiscount.toFixed(2)}</p>
                            )}
                            {insuranceCost > 0 && <p className="text-sm text-gray-400 mb-2">Страховка: +¥{insuranceCost.toFixed(2)}</p>}
                            <div className="flex space-x-3 justify-end">
                                <button
                                    onClick={clearCart}
                                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 hover:shadow-lg transition-all duration-300"
                                    disabled={loading}
                                >
                                    Очистить
                                </button>
                               <button
    onClick={() => setShowConfirm(true)}
    className="px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white hover:bg-[var(--accent-color)]-dark hover:shadow-lg transition-all duration-300"
    style={{ '--accent-color-dark': `${(parseInt(getComputedStyle(document.documentElement).getPropertyValue('--accent-color').replace('#', ''), 16) - 0x101010).toString(16).padStart(6, '0')}` }}
    disabled={loading || !deliveryAddress || cart.length === 0}
>
    Оформить
</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
                    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl max-w-md w-full border-l-4 border-[var(--accent-color)]">
                        <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)]">
                            Подтверждение заказа
                        </h3>
                        <p className="mb-2 text-lg">Сумма товаров: ¥{total.toFixed(2)}</p>
                        {userDiscount > 0 && (
                            <p className="mb-2 text-lg">Скидка пользователя ({userDiscountPercent}%): -¥{userDiscount.toFixed(2)}</p>
                        )}
                        {promoApplied && (
                            <p className="mb-2 text-lg">
                                Скидка по промокоду {promoCode} ({discountType === 'PERCENTAGE' ? `${discountValue}%` : `¥${discountValue.toFixed(2)}`}): -¥{promocodeDiscount.toFixed(2)}
                            </p>
                        )}
                        {totalDiscount > 0 && (
                            <p className="mb-2 text-lg">Общая скидка: -¥{totalDiscount.toFixed(2)}</p>
                        )}
                        {insuranceCost > 0 && (
                            <p className="mb-2 text-lg">Страховка (5%): +¥{insuranceCost.toFixed(2)}</p>
                        )}
                        <p className="mb-2 text-lg">Итого: ¥{finalTotal.toFixed(2)}</p>
                        <p className="mb-2 text-lg">Адрес: {deliveryAddress}</p>
                        <div className="flex justify-between space-x-3">
                            <button
                                onClick={handleConfirmOrder}
                                className="flex-1 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 hover:shadow-lg transition-all duration-300"
                                disabled={loading}
                            >
                                Подтвердить
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 hover:shadow-lg transition-all duration-300"
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