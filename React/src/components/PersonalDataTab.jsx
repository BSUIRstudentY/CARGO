import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import {
  UserIcon,
  BellIcon,
  CurrencyDollarIcon,
  UsersIcon,
  TagIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid';
import { Button } from './ui/Button';

const PersonalDataTab = ({ setError }) => {
  const [userData, setUserData] = useState({
    email: '',
    username: '',
    role: '',
    referralCode: '',
    referralCount: 0,
    moneySpent: 0,
    notificationsEnabled: false,
    avatarUrl: 'https://placehold.co/150x150',
    emailVerified: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isVerificationLoading, setIsVerificationLoading] = useState({ email: false });
  const [statusMessage, setStatusMessage] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/users/me');
        setUserData(response.data);
      } catch (error) {
        const errorMsg = `Ошибка загрузки данных пользователя: ${error.response?.data?.message || error.message}`;
        setStatusMessage(errorMsg);
        setError(errorMsg);
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [setError]);

  const handleNotificationToggle = useCallback(async () => {
    const newValue = !userData.notificationsEnabled;
    setIsLoading(true);
    try {
      const updates = { notificationsEnabled: newValue };
      const response = await api.put('/users', updates);
      if (response.data && response.data.notificationsEnabled !== undefined) {
        setUserData((prev) => ({
          ...prev,
          notificationsEnabled: response.data.notificationsEnabled
        }));
      } else {
        setUserData((prev) => ({
          ...prev,
          notificationsEnabled: newValue
        }));
      }
      setStatusMessage('Настройки уведомлений обновлены!');
    } catch (error) {
      const errorMsg = `Ошибка обновления настроек: ${error.response?.data?.message || error.message}`;
      setStatusMessage(errorMsg);
      setError(errorMsg);
      console.error('Error updating settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userData.notificationsEnabled, setError]);

  const handleRequestVerification = useCallback(async (type) => {
    setIsVerificationLoading((prev) => ({ ...prev, [type]: true }));
    try {
      if (type === 'email' && !userData.email) {
        throw new Error('Email не указан');
      }
      await api.post(`/verification/request-${type}`, { email: userData.email });
      setShowVerificationModal(type);
      setStatusMessage(`Код верификации отправлен на email!`);
    } catch (error) {
      const errorMsg = `Ошибка запроса верификации email: ${error.response?.data?.message || error.message}`;
      setStatusMessage(errorMsg);
      setError(errorMsg);
      console.error(`Error requesting ${type} verification:`, error);
    } finally {
      setIsVerificationLoading((prev) => ({ ...prev, [type]: false }));
    }
  }, [userData.email, setError]);

  const handleConfirmVerification = useCallback(async (type) => {
    if (!verificationCode) {
      setStatusMessage('Введите код верификации');
      setError('Введите код верификации');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post(`/verification/confirm-${type}`, null, { params: { code: verificationCode } });
      if (response?.data) {
        setStatusMessage(response.data);
        setUserData((prev) => ({
          ...prev,
          emailVerified: true,
        }));
        setVerificationCode('');
        setShowVerificationModal(null);
      } else {
        throw new Error('Ответ сервера не содержит данных');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || `Ошибка подтверждения email`;
      setStatusMessage(errorMsg);
      setError(errorMsg);
      console.error(`Error confirming ${type} verification:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [verificationCode, setError]);

  return (
    <div className="space-y-6">
      {/* Заголовок — теперь с тем же градиентом, что и в ShipmentsTab */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-semibold text-[var(--ev-text)] flex items-center gap-3">
          <UserIcon className="w-7 h-7 text-[var(--ev-gold)]" />
          Личные данные
        </h2>
      </motion.div>

      {/* Сообщение о статусе */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`p-4 rounded-xl text-center ${
              statusMessage.includes('Ошибка')
                ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
            }`}
          >
            {statusMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Основная информация пользователя */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 hover:bg-[var(--ev-gold)]/5 transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-[var(--ev-gold)]" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[var(--ev-text)]">{userData.username || 'Гость'}</h3>
            <p className="text-sm text-[var(--ev-text-muted)]">{userData.email || 'user@example.com'}</p>
          </div>
        </div>
      </motion.div>

      {/* Контактная информация */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 hover:bg-[var(--ev-gold)]/5 transition-all duration-300"
      >
        <h3 className="text-lg font-semibold text-[var(--ev-text)] mb-4 flex items-center gap-2">
          <EnvelopeIcon className="w-5 h-5 text-[var(--ev-gold)]" />
          Контактная информация
        </h3>
        <div className="space-y-4">
          <motion.div
            whileHover={{ y: -3 }}
            className="p-4 rounded-xl bg-[var(--ev-void)]/30 border border-[var(--ev-gold)]/10 hover:border-[var(--ev-gold)]/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/15">
                  <EnvelopeIcon className="w-4 h-4 text-[var(--ev-gold)]" />
                </div>
                <label className="text-sm font-medium text-[var(--ev-text-muted)]">Email</label>
              </div>
              {userData.emailVerified ? (
                <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                  <CheckCircleIcon className="w-4 h-4" />
                  Верифицирован
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[var(--ev-text-muted)] text-xs font-medium px-3 py-1 rounded-full bg-[var(--ev-void)]/50 border border-[var(--ev-gold)]/10">
                  <XCircleIcon className="w-4 h-4" />
                  Не верифицирован
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--ev-text)] ml-11 mb-3">{userData.email || 'user@example.com'}</p>
            {!userData.emailVerified && (
              <Button
                size="sm"
                onClick={() => handleRequestVerification('email')}
                disabled={isVerificationLoading.email}
                className="ml-11 bg-[var(--ev-gold)]/15 border border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/25"
              >
                {isVerificationLoading.email ? 'Отправка...' : 'Верифицировать'}
              </Button>
            )}
          </motion.div>

        </div>
      </motion.div>

      {/* Финансовая информация */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        whileHover={{ y: -5 }}
        className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 hover:bg-[var(--ev-gold)]/5 transition-all duration-300"
      >
        <h3 className="text-lg font-semibold text-[var(--ev-text)] mb-4 flex items-center gap-2">
          <CurrencyDollarIcon className="w-5 h-5 text-[var(--ev-gold)]" />
          Финансовая информация
        </h3>
        <div className="p-5 rounded-xl bg-[var(--ev-void)]/30 border border-[var(--ev-gold)]/10">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-medium text-[var(--ev-text-muted)] mb-1">Потраченные средства</label>
              <p className="text-2xl font-bold text-[var(--ev-text)]">{userData.moneySpent?.toFixed(2) || '0.00'} ¥</p>
            </div>
            <div className="p-3 rounded-lg bg-[var(--ev-gold)]/15 border border-[var(--ev-gold)]/20">
              <CurrencyDollarIcon className="w-6 h-6 text-[var(--ev-gold)]" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Реферальная программа */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        whileHover={{ y: -5 }}
        className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 hover:bg-[var(--ev-gold)]/5 transition-all duration-300"
      >
        <h3 className="text-lg font-semibold text-[var(--ev-text)] mb-4 flex items-center gap-2">
          <UsersIcon className="w-5 h-5 text-[var(--ev-gold)]" />
          Реферальная программа
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ y: -3 }}
            className="p-5 rounded-xl bg-[var(--ev-void)]/30 border border-[var(--ev-gold)]/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <TagIcon className="w-4 h-4 text-[var(--ev-gold)]" />
              <label className="text-xs font-medium text-[var(--ev-text-muted)]">Реферальный код</label>
            </div>
            <p className="text-base text-[var(--ev-text)] font-mono font-semibold">{userData.referralCode || 'Не указан'}</p>
          </motion.div>
          <motion.div
            whileHover={{ y: -3 }}
            className="p-5 rounded-xl bg-[var(--ev-void)]/30 border border-[var(--ev-gold)]/10"
          >
            <div className="flex items-center gap-2 mb-2">
              <UsersIcon className="w-4 h-4 text-[var(--ev-gold)]" />
              <label className="text-xs font-medium text-[var(--ev-text-muted)]">Количество рефералов</label>
            </div>
            <p className="text-2xl font-bold text-[var(--ev-text)]">{userData.referralCount || 0}</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Настройки уведомлений */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        whileHover={{ y: -5 }}
        className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 hover:bg-[var(--ev-gold)]/5 transition-all duration-300"
      >
        <h3 className="text-lg font-semibold text-[var(--ev-text)] mb-4 flex items-center gap-2">
          <BellIcon className="w-5 h-5 text-[var(--ev-gold)]" />
          Настройки уведомлений
        </h3>
        <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--ev-void)]/30 border border-[var(--ev-gold)]/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/15">
              <BellIcon className="w-5 h-5 text-[var(--ev-gold)]" />
            </div>
            <div>
              <label className="text-sm font-medium text-[var(--ev-text)] block">Уведомления</label>
              <p className="text-xs text-[var(--ev-text-muted)]">Получать уведомления о заказах и акциях</p>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative inline-flex items-center cursor-pointer"
            onClick={!isLoading ? handleNotificationToggle : undefined}
          >
            <input
              type="checkbox"
              checked={userData.notificationsEnabled || false}
              onChange={handleNotificationToggle}
              className="sr-only peer"
              disabled={isLoading}
            />
            <div className={`w-12 h-6 rounded-full transition duration-300 ${userData.notificationsEnabled ? 'bg-[var(--ev-gold)]/30' : 'bg-[var(--ev-void)]'}`}></div>
            <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition duration-300 shadow-lg ${userData.notificationsEnabled ? 'translate-x-6' : ''}`}></div>
          </motion.div>
        </div>
      </motion.div>

      {/* Модальное окно верификации — адаптировано под акцентные цвета */}
      <AnimatePresence>
        {showVerificationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6 w-full max-w-xs rounded-2xl bg-[var(--ev-glass)] backdrop-blur-xl border border-[var(--ev-gold)]/20">
                <h3 className="text-lg font-semibold text-[var(--ev-text)] mb-4">
                  Верификация Email
                </h3>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full p-3 bg-[var(--ev-void)]/50 text-[var(--ev-text)] border border-[var(--ev-gold)]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ev-gold)]/40 mb-4"
                  placeholder="Введите код"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleConfirmVerification(showVerificationModal)}
                    disabled={isLoading}
                    className="flex-1 bg-[var(--ev-gold)]/15 border border-[var(--ev-gold)]/40 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/25"
                  >
                    Подтвердить
                  </Button>
                  <Button
                    onClick={() => setShowVerificationModal(null)}
                    disabled={isLoading}
                    variant="secondary"
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonalDataTab;