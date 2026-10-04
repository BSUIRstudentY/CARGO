// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import nonCacheApi from '../api/nonCacheApi';
import { useNavigate } from 'react-router-dom';
import { authStorage } from '../utils/authStorage';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Надёжное чтение из localStorage с защитой от битого JSON
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('Повреждены данные корзины в localStorage — очищаем', err);
      
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Синхронизация с localStorage при КАЖДОМ изменении cart
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Не удалось записать корзину в localStorage', e);
    }
  }, [cart]);

  // Загрузка с сервера (опционально, для синхронизации)
  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await nonCacheApi.get('/cart');
      const normalized = res.data.map(item => ({
        id: item.productId || item.id,
        productId: item.productId || item.id, // Дублируем для совместимости
        name: item.productName || item.name || 'Без названия',
        price: item.price || 0,
        quantity: item.quantity || 1,
        imageUrl: item.imageUrl || '',
        url: item.url || '',
        description: item.description || '',
      }));
      setCart(normalized); // ← автоматически запишется в localStorage
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        authStorage.removeToken();
        navigate('/login');
      }
      // Даже если сервер упал — у пользователя остаётся локальная корзина
    } finally {
      setLoading(false);
    }
  };

  // === ОСНОВНЫЕ ФУНКЦИИ С МГНОВЕННЫМ СОХРАНЕНИЕМ В LOCALSTORAGE ===

  const addToCart = async (productsToAdd) => {
    const items = Array.isArray(productsToAdd) ? productsToAdd : (productsToAdd ? [productsToAdd] : []);
    if (items.length === 0) return;
    productsToAdd = items;

    // Мгновенно добавляем в состояние (и автоматически в localStorage)
    setCart(prev => {
      const newCart = [...prev];
      productsToAdd.forEach(p => {
        const productId = p.id || p.productId;
        const existing = newCart.find(i => (i.id === productId) || (i.productId === productId));
        if (existing) {
          existing.quantity += 1;
        } else {
          newCart.push({
            id: productId,
            productId: productId, // Дублируем для совместимости
            name: p.name || 'Без названия',
            price: p.price || 0,
            quantity: 1,
            imageUrl: p.imageUrl || '',
            url: p.url || '',
            description: p.description || '',
          });
        }
      });
      return newCart;
    });

    // Отправляем на сервер в фоне
    try {
      await nonCacheApi.post('/cart/bulk-add', productsToAdd.map(p => ({ ...p, status: 'PENDING' })));
      await fetchCart(); // точная синхронизация после успеха
    } catch (err) {
      setError('Добавлено локально. Сервер временно недоступен.');
      if (err.response?.status === 401 || err.response?.status === 403) navigate('/login');
    }
  };

  const addSingleToCart = async (product) => {
    const productId = product?.id || product?.productId;
    if (!productId) return;

    // Мгновенно обновляем состояние → сразу в localStorage
    setCart(prev => {
      const existing = prev.find(i => (i.id === productId) || (i.productId === productId));
      if (existing) {
        return prev.map(i => 
          ((i.id === productId) || (i.productId === productId)) 
            ? { ...i, quantity: i.quantity + 1, id: productId, productId: productId } 
            : i
        );
      }
      return [...prev, {
        id: productId,
        productId: productId, // Дублируем для совместимости
        name: product.name || 'Без названия',
        price: product.price || 0,
        quantity: 1,
        imageUrl: product.imageUrl || '',
        url: product.url || '',
        description: product.description || '',
      }];
    });

    try {
      const currentCartItem = cart.find(i => (i.id === productId) || (i.productId === productId));
      const newQuantity = (currentCartItem?.quantity || 0) + 1;
      await nonCacheApi.put('/cart', [{
        productId: productId,
        quantity: newQuantity,
        imageUrl: product.imageUrl || '',
        productName: product.name || 'Без названия',
        price: product.price || 0,
      }]);
      await fetchCart();
    } catch  {
      setError('Добавлено локально. Ошибка связи с сервером.');
    }
  };
                   
  const removeFromCart = async (productId) => {
    // Мгновенно удаляем из состояния → сразу в localStorage
    setCart(prev => prev.filter(i => (i.id !== productId) && (i.productId !== productId)));

    try {
      await nonCacheApi.delete(`/cart/remove/${productId}`);
      await fetchCart(); // Синхронизируем после удаления
    } catch (err) {
      // Ничего страшного — при следующем fetchCart синхронизируем
      console.error('Ошибка удаления на сервере', err);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    // Мгновенно обновляем → сразу в localStorage
    setCart(prev => prev.map(i => 
      ((i.id === productId) || (i.productId === productId)) 
        ? { ...i, quantity: newQuantity, id: productId, productId: productId } 
        : i
    ));

    try {
      const item = cart.find(i => (i.id === productId) || (i.productId === productId));
      await nonCacheApi.put('/cart', [{
        productId: productId,
        quantity: newQuantity,
        imageUrl: item?.imageUrl || '',
        productName: item?.name || '',
        price: item?.price || 0,
      }]);
      await fetchCart(); // Синхронизируем после обновления
    } catch (err) {
      console.error('Не удалось обновить количество на сервере', err);
    }
  };

  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem('cart');
    try {
      await nonCacheApi.delete('/cart/clear');
    } catch  {
      console.error('Ошибка очистки корзины на сервере');
    }
  };

  const syncCartWithServer = async () => {
    setLoading(true);
    try {
      const items = cart
        .filter(i => (i.id || i.productId) && i.quantity > 0)
        .map(i => ({ productId: i.id || i.productId, quantity: i.quantity }));
      await nonCacheApi.put('/cart', items);
      await fetchCart();
    } catch  {
      setError('Ошибка синхронизации с сервером');
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = async (deliveryAddress, phone, lastName, firstName, middleName = null, promocode = null, insurance = false, discountType = null, discountValue = null, packaging = 'standard') => {
    if (!deliveryAddress?.trim()) {
      setError('Укажите адрес доставки');
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
      setError('Укажите тип упаковки');
      return;
    }
    
    setLoading(true);
    try {
      const res = await nonCacheApi.post('/cart/submit-order', {
        deliveryAddress,
        phone,
        lastName,
        firstName,
        middleName,
        promocode, 
        insurance, 
        discountType, 
        discountValue,
        packaging
      });
      await clearCart();
      navigate(`/order-details/${res.data.orderId}`);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при оформлении заказа');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      addSingleToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      confirmOrder,
      syncCartWithServer,
      fetchCart,
      loading,
      error,
      setCart,
      setError,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};