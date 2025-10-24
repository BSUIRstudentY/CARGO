import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import api from '../api/axiosInstance';
import { UserIcon, BellIcon, KeyIcon, CurrencyDollarIcon, UsersIcon, TagIcon } from '@heroicons/react/24/solid';

// Append global styles for consistency with DeliveryPayment.jsx
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
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

const PersonalDataTab = ({ setError }) => {
  const [userData, setUserData] = useState({
    email: '',
    username: '',
    phone: '',
    company: '',
    role: '',
    referralCode: '',
    referralCount: 0,
    balance: 0,
    moneySpent: 0,
    notificationsEnabled: false,
    twoFactorEnabled: false,
    avatarUrl: 'https://placehold.co/150x150',
    emailVerified: false,
    phoneVerified: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isVerificationLoading, setIsVerificationLoading] = useState({ email: false, phone: false });
  const [statusMessage, setStatusMessage] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');

  // Fetch user data on mount
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

  // Memoized handler for notification toggles
  const handleNotificationToggle = useCallback(async (type) => {
    setIsLoading(true);
    try {
      const updates = {};
      if (type === 'email') {
        updates.notificationsEnabled = !userData.notificationsEnabled;
      } else if (type === '2fa') {
        updates.twoFactorEnabled = !userData.twoFactorEnabled;
      }
      const response = await api.put('/users', updates);
      setUserData((prev) => ({ ...prev, ...updates }));
      setStatusMessage(
        type === 'email'
          ? 'Настройки уведомлений по email обновлены!'
          : 'Настройки двухфакторной аутентификации обновлены!'
      );
    } catch (error) {
      const errorMsg = `Ошибка обновления настроек: ${error.response?.data?.message || error.message}`;
      setStatusMessage(errorMsg);
      setError(errorMsg);
      console.error('Error updating settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userData, setError]);

  // Memoized handler for requesting verification
  const handleRequestVerification = useCallback(async (type) => {
    setIsVerificationLoading((prev) => ({ ...prev, [type]: true }));
    try {
      if (type === 'email' && !userData.email) {
        throw new Error('Email не указан');
      }
      console.log('Sending verification request:', `/verification/request-${type}`, { email: userData.email });
      await api.post(`/verification/request-${type}`, { email: userData.email });
      setShowVerificationModal(type);
      setStatusMessage(`Код верификации отправлен на ${type === 'email' ? 'email' : 'телефон'}!`);
    } catch (error) {
      const errorMsg = `Ошибка запроса верификации ${type === 'email' ? 'email' : 'телефона'}: ${error.response?.data?.message || error.message}`;
      setStatusMessage(errorMsg);
      setError(errorMsg);
      console.error(`Error requesting ${type} verification:`, error);
    } finally {
      setIsVerificationLoading((prev) => ({ ...prev, [type]: false }));
    }
  }, [userData.email, setError]);

  // Handler for confirming verification
  const handleConfirmVerification = useCallback(async (type) => {
    if (!verificationCode) {
      setStatusMessage('Введите код верификации');
      setError('Введите код верификации');
      return;
    }
    setIsLoading(true);
    try {
      console.log('Confirming verification:', `/verification/confirm-${type}`, { code: verificationCode });
      const response = await api.post(`/verification/confirm-${type}`, null, { params: { code: verificationCode } });
      if (response?.data) {
        setStatusMessage(response.data);
        setUserData((prev) => ({
          ...prev,
          [type === 'email' ? 'emailVerified' : 'phoneVerified']: true,
        }));
        setVerificationCode('');
        setShowVerificationModal(null);
      } else {
        throw new Error('Ответ сервера не содержит данных');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || `Ошибка подтверждения ${type === 'email' ? 'email' : 'телефона'}`;
      setStatusMessage(errorMsg);
      setError(errorMsg);
      console.error(`Error confirming ${type} verification:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [verificationCode, setError]);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 bg-primary rounded-xl shadow-card border border-primary/50 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,37,73,0.3)_0%,transparent_70%)] pointer-events-none" />
      {/* Status Message */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`mb-6 p-4 rounded-lg text-center text-base font-medium font-sans relative z-10 ${
              statusMessage.includes('Ошибка')
                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                : 'bg-green-500/20 border-green-500/50 text-green-400'
            }`}
          >
            {statusMessage}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
        >
          <div className="animate-spin rounded-full h-10 w-10 border-t-3 border-accent-primary" />
        </motion.div>
      )}
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex items-center gap-3 relative z-10 animate-fade-in-down"
      >
        <UserIcon className="w-8 h-8 text-accent-primary" />
        <h2 className="text-2xl font-bold font-display text-accent-primary tracking-tight">Личный кабинет</h2>
      </motion.div>
      {/* User Card */}
      <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
          whileTap={{ scale: 0.97 }}
          className="bg-tertiary backdrop-blur-lg rounded-xl p-4 mb-4 border border-primary/50 shadow-card hover:shadow-accent-primary/40 transition-shadow duration-300 relative z-10"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <img
                src={userData.avatarUrl}
                alt="User Avatar"
                className="w-24 h-24 rounded-full border-4 border-accent-primary/30 shadow-lg object-cover ring-2 ring-accent-primary/50"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent-primary/20 to-emerald-400/20 opacity-50" />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-xl font-semibold font-sans text-accent-primary">{userData.username || 'Гость'}</h3>
              <p className="text-sm text-secondary font-sans">{userData.company || 'Компания не указана'}</p>
              <p className="text-xs text-accent-primary font-sans">Роль: {userData.role || 'Не указана'}</p>
            </div>
          </div>
        </motion.div>
      </Tilt>
      {/* Contact Info Card */}
      <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
          whileTap={{ scale: 0.97 }}
          className="bg-tertiary backdrop-blur-lg rounded-xl p-4 mb-4 border border-primary/50 shadow-card hover:shadow-accent-primary/40 transition-shadow duration-300 relative z-10"
        >
          <h3 className="text-base font-semibold font-sans text-accent-primary mb-3">Контактная информация</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-secondary font-sans">Email</label>
              <div className="flex items-center justify-between">
                <p className="text-sm text-secondary font-sans">{userData.email || 'user@example.com'}</p>
                <div className="flex items-center gap-2">
                  <p className={`text-xs font-sans ${userData.emailVerified ? 'text-green-400' : 'text-red-400'}`}>
                    {userData.emailVerified ? 'Верифицирован' : 'Не верифицирован'}
                  </p>
                  {!userData.emailVerified && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRequestVerification('email')}
                      disabled={isVerificationLoading.email}
                      className={`px-2 py-1 rounded-lg text-xs text-primary font-sans transition duration-300 ${
                        isVerificationLoading.email ? 'bg-gray-500' : 'bg-accent-primary hover:bg-accent-primary/90'
                      }`}
                    >
                      {isVerificationLoading.email ? 'Отправка...' : 'Верифицировать'}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary font-sans">Телефон</label>
              <div className="flex items-center justify-between">
                <p className="text-sm text-secondary font-sans">{userData.phone || 'Не указан'}</p>
                <div className="flex items-center gap-2">
                  <p className={`text-xs font-sans ${userData.phoneVerified ? 'text-green-400' : 'text-red-400'}`}>
                    {userData.phoneVerified ? 'Верифицирован' : 'Не верифицирован'}
                  </p>
                  {!userData.phoneVerified && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRequestVerification('phone')}
                      disabled={isVerificationLoading.phone}
                      className={`px-2 py-1 rounded-lg text-xs text-primary font-sans transition duration-300 ${
                        isVerificationLoading.phone ? 'bg-gray-500' : 'bg-accent-primary hover:bg-accent-primary/90'
                      }`}
                    >
                      {isVerificationLoading.phone ? 'Отправка...' : 'Верифицировать'}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Tilt>
      {/* Financial Info Card */}
      <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
          whileTap={{ scale: 0.97 }}
          className="bg-tertiary backdrop-blur-lg rounded-xl p-4 mb-4 border border-primary/50 shadow-card hover:shadow-accent-primary/40 transition-shadow duration-300 relative z-10"
        >
          <h3 className="text-base font-semibold font-sans text-accent-primary mb-3">Финансовая информация</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-secondary font-sans">Баланс</label>
              <div className="flex items-center gap-2">
                <CurrencyDollarIcon className="w-4 h-4 text-accent-primary" />
                <p className="text-sm text-secondary font-sans">{userData.balance?.toFixed(2) || '0.00'} BYN</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary font-sans">Потрачено</label>
              <div className="flex items-center gap-2">
                <CurrencyDollarIcon className="w-4 h-4 text-accent-primary" />
                <p className="text-sm text-secondary font-sans">{userData.moneySpent?.toFixed(2) || '0.00'} BYN</p>
              </div>
            </div>
          </div>
        </motion.div>
      </Tilt>
      {/* Referral Info Card */}
      <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
          whileTap={{ scale: 0.97 }}
          className="bg-tertiary backdrop-blur-lg rounded-xl p-4 mb-4 border border-primary/50 shadow-card hover:shadow-accent-primary/40 transition-shadow duration-300 relative z-10"
        >
          <h3 className="text-base font-semibold font-sans text-accent-primary mb-3">Реферальная программа</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-secondary font-sans">Реферальный код</label>
              <div className="flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-accent-primary" />
                <p className="text-sm text-secondary font-sans">{userData.referralCode || 'Не указан'}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary font-sans">Количество рефералов</label>
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-accent-primary" />
                <p className="text-sm text-secondary font-sans">{userData.referralCount || 0}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </Tilt>
      {/* Security Settings Card */}
      <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
          whileTap={{ scale: 0.97 }}
          className="bg-tertiary backdrop-blur-lg rounded-xl p-4 border border-primary/50 shadow-card hover:shadow-accent-primary/40 transition-shadow duration-300 relative z-10"
        >
          <h3 className="text-base font-semibold font-sans text-accent-primary mb-3">Настройки безопасности и уведомлений</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellIcon className="w-4 h-4 text-accent-primary" />
                <label className="text-xs text-secondary font-sans">Уведомления по email</label>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative inline-flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={userData.notificationsEnabled}
                  onChange={() => handleNotificationToggle('email')}
                  className="sr-only peer"
                  disabled={isLoading}
                />
                <div className="w-10 h-5 bg-gray-700 rounded-full peer-checked:bg-accent-primary/50 transition duration-300"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-primary rounded-full peer-checked:translate-x-5 transition duration-300"></div>
              </motion.div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyIcon className="w-4 h-4 text-accent-primary" />
                <label className="text-xs text-secondary font-sans">Двухфакторная аутентификация</label>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative inline-flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={userData.twoFactorEnabled}
                  onChange={() => handleNotificationToggle('2fa')}
                  className="sr-only peer"
                  disabled={isLoading}
                />
                <div className="w-10 h-5 bg-gray-700 rounded-full peer-checked:bg-accent-primary/50 transition duration-300"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-primary rounded-full peer-checked:translate-x-5 transition duration-300"></div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Tilt>
      {/* Verification Modal */}
      <AnimatePresence>
        {showVerificationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-tertiary backdrop-blur-lg rounded-xl p-4 w-full max-w-xs border border-primary/50 shadow-card"
            >
              <h3 className="text-base font-semibold font-sans text-accent-primary mb-3">
                Верификация {showVerificationModal === 'email' ? 'Email' : 'Телефона'}
              </h3>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full p-2 bg-tertiary text-secondary border border-primary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition duration-300 text-sm font-sans"
                placeholder="Введите код"
              />
              <div className="flex gap-2 mt-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleConfirmVerification(showVerificationModal)}
                  disabled={isLoading}
                  className="flex-1 py-1 bg-accent-primary text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-xs font-sans"
                >
                  Подтвердить
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowVerificationModal(null)}
                  disabled={isLoading}
                  className="flex-1 py-1 bg-gray-700 text-secondary rounded-lg hover:bg-gray-600 transition duration-300 text-xs font-sans"
                >
                  Отмена
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonalDataTab;