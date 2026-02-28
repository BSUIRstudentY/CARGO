/**
 * Безопасное хранение токена и данных пользователя.
 * На iOS/Android — токен в Secure Store (Keychain/Keystore), на web — AsyncStorage.
 * Данные user/userRole не секретные, храним в AsyncStorage для совместимости.
 */
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';
const USER_ROLE_KEY = 'userRole';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

export const authStorage = {
  async getToken() {
    try {
      if (isNative) {
        return await SecureStore.getItemAsync(TOKEN_KEY);
      }
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
      console.warn('authStorage.getToken error:', e?.message);
      return null;
    }
  },

  async setToken(token) {
    try {
      if (isNative) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      } else {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }
    } catch (e) {
      console.warn('authStorage.setToken error:', e?.message);
    }
  },

  async removeToken() {
    try {
      if (isNative) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      }
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.warn('authStorage.removeToken error:', e?.message);
    }
  },

  async getUser() {
    try {
      const raw = await AsyncStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  async setUser(userData) {
    try {
      if (userData != null) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem(USER_KEY);
      }
    } catch (e) {
      console.warn('authStorage.setUser error:', e?.message);
    }
  },

  async getUserRole() {
    try {
      return await AsyncStorage.getItem(USER_ROLE_KEY);
    } catch (e) {
      return null;
    }
  },

  async setUserRole(role) {
    try {
      if (role != null) {
        await AsyncStorage.setItem(USER_ROLE_KEY, role);
      } else {
        await AsyncStorage.removeItem(USER_ROLE_KEY);
      }
    } catch (e) {
      console.warn('authStorage.setUserRole error:', e?.message);
    }
  },

  async clear() {
    await Promise.all([
      this.removeToken(),
      this.setUser(null),
      this.setUserRole(null),
    ]);
  },
};
