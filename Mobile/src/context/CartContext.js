import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axiosInstance';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      loadLocalCart();
    }
  }, [isAuthenticated]);

  const loadLocalCart = async () => {
    try {
      if (!AsyncStorage || typeof AsyncStorage.getItem !== 'function') {
        console.warn('AsyncStorage not available');
        return;
      }
      
      const localCart = await AsyncStorage.getItem('localCart');
      if (localCart) {
        setCartItems(JSON.parse(localCart));
      }
    } catch (error) {
      console.error('Error loading local cart:', error);
    }
  };

  const loadCart = async () => {
    if (!isAuthenticated) {
      loadLocalCart();
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/cart');
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error('Error loading cart:', error);
      loadLocalCart();
    } finally {
      setLoading(false);
    }
  };

  const saveLocalCart = async (items) => {
    try {
      if (!AsyncStorage || typeof AsyncStorage.setItem !== 'function') {
        console.warn('AsyncStorage not available');
        return;
      }
      
      await AsyncStorage.setItem('localCart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving local cart:', error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    const newItems = [...cartItems];
    const existingItem = newItems.find(item => item.product?.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      newItems.push({ product, quantity });
    }

    setCartItems(newItems);
    await saveLocalCart(newItems);

    if (isAuthenticated) {
      try {
        await api.post('/cart/add', {
          productId: product.id,
          quantity: existingItem ? existingItem.quantity : quantity,
        });
      } catch (error) {
        console.error('Error syncing cart:', error);
      }
    }
  };

  const removeFromCart = async (productId) => {
    const newItems = cartItems.filter(item => item.product?.id !== productId);
    setCartItems(newItems);
    await saveLocalCart(newItems);

    if (isAuthenticated) {
      try {
        await api.delete(`/cart/remove/${productId}`);
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const newItems = cartItems.map(item =>
      item.product?.id === productId ? { ...item, quantity } : item
    );
    setCartItems(newItems);
    await saveLocalCart(newItems);

    if (isAuthenticated) {
      try {
        await api.put(`/cart/update`, {
          productId,
          quantity,
        });
      } catch (error) {
        console.error('Error updating cart:', error);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    await AsyncStorage.removeItem('localCart');

    if (isAuthenticated) {
      try {
        await api.delete('/cart/clear');
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product?.price || 0) * (item.quantity || 0);
    }, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const confirmOrder = async (
    deliveryAddress,
    phone,
    lastName,
    firstName,
    middleName = null,
    promocode = null,
    insurance = false,
    discountType = null,
    discountValue = null,
    packaging = 'standard'
  ) => {
    if (!deliveryAddress?.trim()) {
      throw new Error('Укажите адрес доставки');
    }
    if (!phone?.trim()) {
      throw new Error('Укажите номер телефона');
    }
    if (!lastName?.trim()) {
      throw new Error('Укажите фамилию');
    }
    if (!firstName?.trim()) {
      throw new Error('Укажите имя');
    }
    if (!packaging) {
      throw new Error('Укажите тип упаковки');
    }

    setLoading(true);
    try {
      const res = await api.post('/cart/submit-order', {
        deliveryAddress,
        phone,
        lastName,
        firstName,
        middleName,
        promocode,
        insurance,
        discountType,
        discountValue,
        packaging,
      });
      await clearCart();
      return res.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Ошибка при оформлении заказа';
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loadCart,
    getTotalPrice,
    getTotalItems,
    confirmOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

