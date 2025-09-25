
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cart');
      const updatedCart = response.data.map(item => ({
        id: item.productId || item.id,
        imageUrl: item.imageUrl || '',
        name: item.productName || item.name || 'Unnamed Product',
        price: item.price || 0,
        quantity: item.quantity || 1,
      }));
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Fetch cart error:', error.response?.data?.message || error.message);
      if (error.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      setError('Не удалось загрузить корзину: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productsToAdd) => {
    if (!Array.isArray(productsToAdd) || productsToAdd.length === 0) {
      console.error('Invalid products list');
      setError('Недопустимый список продуктов');
      return;
    }
    setLoading(true);
    try {
      await api.post('/cart/bulk-add', productsToAdd.map(p => ({ ...p, status: 'PENDING' })));
      await fetchCart();
      const savedProducts = JSON.parse(localStorage.getItem('savedProducts') || '[]');
      const newProducts = productsToAdd.filter(p => !savedProducts.some(sp => sp.id === p.id));
      if (newProducts.length > 0) {
        localStorage.setItem('savedProducts', JSON.stringify([...savedProducts, ...newProducts]));
      }
    } catch (error) {
      console.error('Add to cart error:', error.response?.data?.message || error.message);
      if (error.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      setError('Не удалось добавить продукты в корзину: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const addSingleToCart = async (product) => {
    if (!product || !product.id) {
      console.error('Invalid product: missing ID');
      setError('Недопустимый продукт: отсутствует ID');
      return;
    }
    setLoading(true);
    try {
      const existingItem = cart.find(item => item.id === product.id);
      let updatedCart;
      if (existingItem) {
        updatedCart = cart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedCart = [...cart, { ...product, quantity: 1 }];
      }

      const cartItemToAdd = updatedCart.find(item => item.id === product.id);
      await api.put('/cart', [{
        productId: cartItemToAdd.id,
        quantity: cartItemToAdd.quantity,
        imageUrl: cartItemToAdd.imageUrl,
        productName: cartItemToAdd.name,
        price: cartItemToAdd.price,
      }]);

      const response = await api.get('/cart');
      const newCart = response.data.map(item => ({
        id: item.productId || item.id,
        imageUrl: item.imageUrl || '',
        name: item.productName || item.name || 'Unnamed Product',
        price: item.price || 0,
        quantity: item.quantity || 1,
      }));
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Add single to cart error:', error.response?.data?.message || error.message);
      if (error.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 400) {
        console.error('Bad request:', error.response?.data?.message || 'Invalid data format');
        setError('Недопустимый формат данных: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const newCart = cart.filter((item) => item.id !== productId);
      setCart(newCart);
      await api.delete(`/cart/remove/${productId}`);
      await fetchCart();
    } catch (error) {
      console.error('Remove from cart error:', error.response?.data?.message || error.message);
      setError('Не удалось удалить продукт из корзины: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    setLoading(true);
    try {
      const updatedItem = cart.find((item) => item.productId === productId);
      if (updatedItem) {
        console.log('Updating quantity, productId:', productId, 'quantity:', quantity);
        const newCart = cart.map((item) =>
          item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item
        );
        setCart(newCart);

        await api.put('/cart', [{
          productId: productId,
          quantity: Math.max(1, quantity),
          imageUrl: updatedItem.imageUrl,
          productName: updatedItem.name,
          price: updatedItem.price,
        }]);
      }
    } catch (error) {
      console.error('Update quantity error:', error.response?.data?.message || error.message);
      setError('Не удалось обновить количество: ' + (error.response?.data?.message || error.message));
      setCart(cart); // Revert on error
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      setCart([]);
      localStorage.removeItem('cart');
      await api.delete('/cart/clear');
    } catch (error) {
      console.error('Clear cart error:', error.response?.data?.message || error.message);
      setError('Не удалось очистить корзину: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const syncCartWithServer = async () => {
    setLoading(true);
    try {
      const validCartItems = cart
        .filter(item => item.id && item.quantity > 0)
        .map(item => ({
          productId: item.id,
          quantity: item.quantity,
        }));
      console.log('Syncing cart, data:', validCartItems);
      const response = await api.put('/cart', validCartItems);
      const updatedCart = response.data.map(item => ({
        id: item.productId || item.id,
        name: item.productName || item.name || 'Unnamed Product',
        price: item.price || 0,
        quantity: item.quantity || 1,
        imageUrl: item.imageUrl || '',
      }));
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      alert('Корзина успешно синхронизирована с сервером!');
    } catch (error) {
      if (error.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      console.error('Sync cart error:', error.response?.data?.message || error.message);
      setError('Не удалось синхронизировать корзину: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = async (deliveryAddress, promocode, insurance, discountType, discountValue) => {
    setLoading(true);
    try {
      if (!deliveryAddress) {
        throw new Error('Укажите адрес доставки');
      }

      const orderData = {
        deliveryAddress,
        promocode: promocode || null,
        insurance,
        discountType,
        discountValue,
      };

      console.log('Sending order to /cart/submit-order:', orderData);
      const response = await api.post('/cart/submit-order', orderData, {
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('Order submission response:', response.data); // Log for debugging

      await clearCart();
      alert(`Заказ успешно отправлен на проверку администратору! ID заказа: ${response.data.orderId}\n` +
            `Сумма: ¥${response.data.totalClientPrice.toFixed(2)}\n` +
            `Скидка пользователя: ${response.data.userDiscountApplied > 0 ? `-¥${response.data.userDiscountApplied.toFixed(2)}` : 'Нет'}\n` +
            `Скидка по промокоду: ${response.data.discountApplied > 0 ? `-¥${response.data.discountApplied.toFixed(2)}` : 'Нет'}\n` +
            `Страховка: ${response.data.insuranceCost > 0 ? `¥${response.data.insuranceCost.toFixed(2)}` : 'Нет'}`);
      navigate(`/order-details/${response.data.orderId}`); // Redirect to order details
      return response.data;
    } catch (error) {
      console.error('Error confirming order:', error.response?.data?.message || error.message);
      setError('Ошибка при создании заказа: ' + (error.response?.data?.message || error.message));
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, addSingleToCart, removeFromCart, updateQuantity, clearCart, confirmOrder, syncCartWithServer, loading, error, setCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);