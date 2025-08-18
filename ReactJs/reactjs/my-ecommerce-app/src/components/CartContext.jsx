import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productsToAdd) => {
    if (!Array.isArray(productsToAdd) || productsToAdd.length === 0) {
      console.error('Invalid products list');
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
      console.error('Add to cart error:', error.message);
      if (error.response?.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const addSingleToCart = async (product) => {
    if (!product || !product.id) {
      console.error('Invalid product: missing ID');
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
        window.location.href = '/login';
      } else if (error.response?.status === 400) {
        console.error('Bad request:', error.response?.data?.message || 'Invalid data format');
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
      console.error('Remove from cart error:', error.message);
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
      setError('Не удалось обновить количество. Проверьте доступ или наличие продукта.');
      setCart(cart); // Откат при ошибке
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
      console.error('Clear cart error:', error.message);
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
        window.location.href = '/login';
      }
      console.error('Sync cart error:', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmOrder = async (deliveryAddress) => {
    setLoading(true);
    try {
      if (!deliveryAddress) {
        throw new Error('Укажите адрес доставки');
      }

      const orderData = {
        deliveryAddress: deliveryAddress,
      };

      console.log('Sending order to /cart/submit-order:', orderData);
      const response = await api.post('/cart/submit-order', orderData);

      const productIdsToUpdate = cart.map(item => item.id);
      await api.put('/products/bulk-status', { ids: productIdsToUpdate, status: 'VERIFIED' });

      await clearCart();
      alert('Заказ успешно отправлен на проверку администратору! ' + (response.data.orderId ? `ID заказа: ${response.data.orderId}` : ''));
    } catch (error) {
      console.error('Error confirming order:', error.response?.data?.message || error.message);
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