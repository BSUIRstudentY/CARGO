import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import { UserIcon, BellIcon, KeyIcon, CheckIcon, XMarkIcon, CurrencyDollarIcon, UsersIcon, TagIcon } from '@heroicons/react/24/solid';

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
    avatarUrl: 'https://via.placeholder.com/150',
    emailVerified: false,
    phoneVerified: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(null); // 'email' or 'phone'
  const [verificationCode, setVerificationCode] = useState('');

  // Fetch user data from /api/users/me
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/users/me');
        setUserData(response.data);
      } catch (error) {
        const errorMsg = `Ошибка загрузки данных пользователя: ${error.response?.data?.message || error.message}`;
        setErrorMessage(errorMsg);
        setError(errorMsg);
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [setError]);

  const handleNotificationToggle = async (type) => {
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
      alert(
        type === 'email'
          ? 'Настройки уведомлений по email обновлены!'
          : 'Настройки двухфакторной аутентификации обновлены!'
      );
    } catch (error) {
      const errorMsg = `Ошибка обновления настроек: ${error.response?.data?.message || error.message}`;
      setErrorMessage(errorMsg);
      setError(errorMsg);
      console.error('Error updating settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestVerification = async (type) => {
    setIsLoading(true);
    try {
      await api.post(`/verification/request-${type}`);
      setShowVerificationModal(type);
      alert(`Код верификации отправлен на ${type === 'email' ? 'email' : 'телефон'}!`);
    } catch (error) {
      const errorMsg = `Ошибка запроса верификации ${type === 'email' ? 'email' : 'телефона'}: ${error.response?.data?.message || error.message}`;
      setErrorMessage(errorMsg);
      setError(errorMsg);
      console.error(`Error requesting ${type} verification:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmVerification = async (type) => {
    if (!verificationCode) {
      setErrorMessage('Введите код верификации');
      setError('Введите код верификации');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post(`/verification/confirm-${type}`, null, { params: { code: verificationCode } });
      alert(response.data);
      setUserData((prev) => ({
        ...prev,
        [type === 'email' ? 'emailVerified' : 'phoneVerified']: true,
      }));
      setVerificationCode('');
      setShowVerificationModal(null);
    } catch (error) {
      const errorMsg = `Ошибка подтверждения ${type === 'email' ? 'email' : 'телефона'}: ${error.response?.data?.message || error.message}`;
      setErrorMessage(errorMsg);
      setError(errorMsg);
      console.error(`Error confirming ${type} verification:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl min-h-screen">
      {/* Error Message */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center text-base font-medium"
          >
            {errorMessage}
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
          <div className="animate-spin rounded-full h-10 w-10 border-t-3 border-cyan-400" />
        </motion.div>
      )}
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 flex items-center gap-3"
      >
        <UserIcon className="w-8 h-8 text-cyan-400" />
        <h2 className="text-3xl font-bold text-white tracking-tight">Личный кабинет</h2>
      </motion.div>
      {/* User Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 mb-6 border border-gray-700/20 shadow-lg hover:shadow-cyan-400/20 transition-shadow duration-300"
      >
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <img
              src={userData.avatarUrl}
              alt="User Avatar"
              className="w-32 h-32 rounded-full border-4 border-cyan-400/30 shadow-lg object-cover ring-2 ring-cyan-400/50"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-emerald-400/20 opacity-50" />
          </div>
          <div className="text-center sm:text-left space-y-2">
            <h3 className="text-2xl font-semibold text-white">{userData.username || 'Гость'}</h3>
            <p className="text-gray-300 text-base">{userData.company || 'Компания не указана'}</p>
            <p className="text-sm text-cyan-400">Роль: {userData.role || 'Не указана'}</p>
          </div>
        </div>
      </motion.div>
      {/* Contact Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 mb-6 border border-gray-700/20 shadow-lg hover:shadow-cyan-400/20 transition-shadow duration-300"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Контактная информация</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <div className="flex items-center justify-between">
              <p className="text-base text-white">{userData.email || 'user@example.com'}</p>
              <div className="flex items-center gap-2">
                <p className={`text-sm ${userData.emailVerified ? 'text-green-400' : 'text-red-400'}`}>
                  {userData.emailVerified ? 'Верифицирован' : 'Не верифицирован'}
                </p>
                {!userData.emailVerified && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRequestVerification('email')}
                    disabled={isLoading}
                    className="px-3 py-1 bg-cyan-400 text-white rounded-lg text-sm hover:bg-cyan-500 transition duration-300"
                  >
                    Верифицировать
                  </motion.button>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Телефон</label>
            <div className="flex items-center justify-between">
              <p className="text-base text-white">{userData.phone || 'Не указан'}</p>
              <div className="flex items-center gap-2">
                <p className={`text-sm ${userData.phoneVerified ? 'text-green-400' : 'text-red-400'}`}>
                  {userData.phoneVerified ? 'Верифицирован' : 'Не верифицирован'}
                </p>
                {!userData.phoneVerified && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleRequestVerification('phone')}
                    disabled={isLoading}
                    className="px-3 py-1 bg-cyan-400 text-white rounded-lg text-sm hover:bg-cyan-500 transition duration-300"
                  >
                    Верифицировать
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Financial Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 mb-6 border border-gray-700/20 shadow-lg hover:shadow-cyan-400/20 transition-shadow duration-300"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Финансовая информация</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Баланс</label>
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-cyan-400" />
              <p className="text-base text-white">{userData.balance?.toFixed(2) || '0.00'} BYN</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Потрачено</label>
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-cyan-400" />
              <p className="text-base text-white">{userData.moneySpent?.toFixed(2) || '0.00'} BYN</p>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Referral Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 mb-6 border border-gray-700/20 shadow-lg hover:shadow-cyan-400/20 transition-shadow duration-300"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Реферальная программа</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Реферальный код</label>
            <div className="flex items-center gap-2">
              <TagIcon className="w-5 h-5 text-cyan-400" />
              <p className="text-base text-white">{userData.referralCode || 'Не указан'}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Количество рефералов</label>
            <div className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-cyan-400" />
              <p className="text-base text-white">{userData.referralCount || 0}</p>
            </div>
          </div>
        </div>
      </motion.div>
      {/* Security Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-gray-800/30 backdrop-blur-lg rounded-xl p-6 border border-gray-700/20 shadow-lg hover:shadow-cyan-400/20 transition-shadow duration-300"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Настройки безопасности и уведомлений</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellIcon className="w-5 h-5 text-cyan-400" />
              <label className="text-sm text-gray-300">Уведомления по email</label>
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
              <div className="w-11 h-6 bg-gray-700 rounded-full peer-checked:bg-cyan-400/50 transition duration-300"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition duration-300"></div>
            </motion.div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyIcon className="w-5 h-5 text-cyan-400" />
              <label className="text-sm text-gray-300">Двухфакторная аутентификация</label>
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
              <div className="w-11 h-6 bg-gray-700 rounded-full peer-checked:bg-cyan-400/50 transition duration-300"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition duration-300"></div>
            </motion.div>
          </div>
        </div>
      </motion.div>
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
              className="bg-gray-800/90 backdrop-blur-lg rounded-xl p-6 w-full max-w-xs border border-cyan-400/20 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                Верификация {showVerificationModal === 'email' ? 'Email' : 'Телефона'}
              </h3>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full p-3 bg-gray-900/50 text-white border border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-300"
                placeholder="Введите код"
              />
              <div className="flex gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleConfirmVerification(showVerificationModal)}
                  disabled={isLoading}
                  className="flex-1 py-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 transition duration-300 text-sm"
                >
                  Подтвердить
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowVerificationModal(null)}
                  disabled={isLoading}
                  className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300 text-sm"
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