import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axiosInstance';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCart([]);
        return;
      }
      const response = await api.get('/cart');
      // Map response to match frontend cart structure
      setCart(response.data.map(item => ({
        id: item.productId,
        name: item.productName,
        price: item.price,
        quantity: item.quantity
      })));
    } catch (error) {
      setError('Ошибка загрузки корзины: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const syncCartWithServer = async (newCart) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Необходима авторизация');
      }
      const validCartItems = newCart
        .filter(item => item.id && item.quantity > 0)
        .map(item => ({
          productId: item.id,
          quantity: item.quantity
        }));
      const response = await api.put('/cart', validCartItems);
      setCart(response.data.map(item => ({
        id: item.productId,
        name: item.productName,
        price: item.price,
        quantity: item.quantity
      })));
    } catch (error) {
      if (error.response?.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new Error('Ошибка синхронизации корзины: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product) => {
    if (!product || !product.id) {
      setError('Недействительный товар');
      return;
    }
    try {
      const newCart = [...cart];
      const existingItem = newCart.find((item) => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        newCart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
      }
      await syncCartWithServer(newCart);
    } catch (error) {
      setError(error.message);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await api.delete(`/cart/remove/${productId}`);
      setCart(response.data.map(item => ({
        id: item.productId,
        name: item.productName,
        price: item.price,
        quantity: item.quantity
      })));
    } catch (error) {
      if (error.response?.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      setError('Ошибка удаления из корзины: ' + (error.response?.data?.message || error.message));
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const newCart = cart.map((item) =>
        item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      );
      await syncCartWithServer(newCart);
    } catch (error) {
      setError(error.message);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setCart([]);
    } catch (error) {
      if (error.response?.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      setError('Ошибка очистки корзины: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, loading, error }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);