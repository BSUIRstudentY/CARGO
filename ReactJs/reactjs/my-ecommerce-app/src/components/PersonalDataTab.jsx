import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { useAuth } from './AuthProvider';
import api from '../api/axiosInstance';
import { UserIcon, PencilIcon, CheckIcon, XMarkIcon, KeyIcon, BellIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

// Utility function to format expiration date in Russian and Chinese
const formatExpirationDate = (date) => {
  if (!date) return { ru: 'Не завершено', zh: '未完成' };
  const [year, month, day, hour, minute] = date;
  const formattedDate = new Date(year, month - 1, day, hour, minute);
  return {
    ru: formattedDate.toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    zh: formattedDate.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
};

// Utility function to calculate time remaining for temporary discount
const getTimeRemaining = (expirationDate) => {
  if (!expirationDate) return { ru: '0 мин.', zh: '0 分钟' };
  const [year, month, day, hour, minute, second, nano] = expirationDate;
  const expirationUTC = new Date(Date.UTC(year, month - 1, day, hour - 3, minute, second, Math.floor(nano / 1000000)));
  const currentUTC = new Date();
  const diffMs = expirationUTC - currentUTC;
  if (diffMs <= 0) return { ru: '0 мин.', zh: '0 分钟' };
  const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
  const weeks = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24 * 7));
  const days = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return {
    ru: [
      months > 0 ? `${months} мес.` : '',
      weeks > 0 ? `${weeks} нед.` : '',
      days > 0 ? `${days} дн.` : '',
      hours > 0 ? `${hours} ч.` : '',
      minutes >= 0 ? `${minutes} мин.` : '',
    ].filter(Boolean).join(' ') || '0 мин.',
    zh: [
      months > 0 ? `${months} 月` : '',
      weeks > 0 ? `${weeks} 周` : '',
      days > 0 ? `${days} 天` : '',
      hours > 0 ? `${hours} 小时` : '',
      minutes >= 0 ? `${minutes} 分钟` : '',
    ].filter(Boolean).join(' ') || '0 分钟',
  };
};

// Utility function to verify temporary discount
const verifyDiscount = (temporaryDiscountExpired) => {
  if (!temporaryDiscountExpired) return 0;
  const [year, month, day, hour, minute, second, nano] = temporaryDiscountExpired;
  const expirationUTC = new Date(Date.UTC(year, month - 1, day, hour - 3, minute, second, Math.floor(nano / 1000000)));
  const currentUTC = new Date();
  return expirationUTC > currentUTC ? 1 : 0;
};

const PersonalDataTab = ({ setError }) => {
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled || false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [editForm, setEditForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    company: user?.company || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('https://via.placeholder.com/150');
  const [language, setLanguage] = useState('ru'); // Toggle between Russian and Chinese

  // Calculate total discount
  const temporaryDiscountPercent = user?.temporaryDiscountExpired && verifyDiscount(user.temporaryDiscountExpired) ? user.temporaryDiscountPercent : 0;
  const totalDiscount = (user?.discountPercent || 0) + temporaryDiscountPercent;
  const discountProgress = totalDiscount || 0;
  const maxDiscount = 100; // Maximum discount percentage (from User.java: 20% permanent + 80% temporary)
  const timeRemaining = user?.temporaryDiscountExpired ? getTimeRemaining(user.temporaryDiscountExpired) : null;

  // Fetch user data
  useEffect(() => {
    if (user?.email) {
      setEditForm({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
      });
      setNotificationsEnabled(user.notificationsEnabled || false);
      setTwoFactorEnabled(user.twoFactorEnabled || false);
      // Simulate fetching avatar (replace with actual API call if available)
      setAvatarUrl(user.avatarUrl || 'https://via.placeholder.com/150');
    }
  }, [user]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setEditForm({
        username: user?.username || '',
        email: user?.email || '',
        phone: user?.phone || '',
        company: user?.company || '',
      });
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await updateUser({
        username: editForm.username,
        email: editForm.email,
        phone: editForm.phone,
        company: editForm.company,
        notificationsEnabled,
      });
      setEditMode(false);
      setError(null);
      alert(language === 'ru' ? 'Профиль успешно обновлён!' : '个人资料更新成功！');
    } catch (error) {
      const errorMessage =
        language === 'ru'
          ? `Ошибка обновления профиля: ${error.response?.data?.message || error.message}`
          : `更新个人资料失败：${error.response?.data?.message || error.message}`;
      setError(errorMessage);
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(language === 'ru' ? 'Новые пароли не совпадают' : '新密码不匹配');
      return;
    }
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError(language === 'ru' ? 'Все поля обязательны' : '所有字段均为必填项');
      return;
    }
    setIsLoading(true);
    try {
      await api.put('/profile/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordError('');
      alert(language === 'ru' ? 'Пароль успешно изменён!' : '密码更改成功！');
    } catch (error) {
      const errorMessage =
        language === 'ru'
          ? `Ошибка смены пароля: ${error.response?.data?.message || error.message}`
          : `更改密码失败：${error.response?.data?.message || error.message}`;
      setPasswordError(errorMessage);
      console.error('Error changing password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = async () => {
    setIsLoading(true);
    try {
      const newValue = !notificationsEnabled;
      await updateUser({ notificationsEnabled: newValue });
      setNotificationsEnabled(newValue);
      alert(
        language === 'ru'
          ? 'Настройки уведомлений обновлены!'
          : '通知设置已更新！'
      );
    } catch (error) {
      const errorMessage =
        language === 'ru'
          ? `Ошибка обновления уведомлений: ${error.response?.data?.message || error.message}`
          : `更新通知设置失败：${error.response?.data?.message || error.message}`;
      setError(errorMessage);
      console.error('Error updating notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    setIsLoading(true);
    try {
      const newValue = !twoFactorEnabled;
      await updateUser({ twoFactorEnabled: newValue });
      setTwoFactorEnabled(newValue);
      alert(
        language === 'ru'
          ? 'Настройки двухфакторной аутентификации обновлены!'
          : '双因素认证设置已更新！'
      );
    } catch (error) {
      const errorMessage =
        language === 'ru'
          ? `Ошибка обновления двухфакторной аутентификации: ${error.response?.data?.message || error.message}`
          : `更新双因素认证失败：${error.response?.data?.message || error.message}`;
      setError(errorMessage);
      console.error('Error updating two-factor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatarUrl(reader.result);
      reader.readAsDataURL(file);
      // Optionally, upload to backend (not implemented in UserController yet)
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'zh' : 'ru');
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg shadow-2xl p-8 relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.3)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative">
        {/* Header with Language Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <UserIcon className="w-8 h-8 mr-2 text-[var(--accent-color)]" />
            <h2 className="text-3xl font-bold text-[var(--accent-color)]">
              {language === 'ru' ? 'Личные данные' : '个人信息'}
            </h2>
          </div>
          <button
            onClick={toggleLanguage}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300 transform hover:scale-105"
          >
            {language === 'ru' ? '中文' : 'Русский'}
          </button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {setError && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-center"
            >
              {language === 'ru' ? 'Произошла ошибка, попробуйте снова.' : '发生错误，请重试。'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Info Card */}
        <Tilt tiltMaxAngleX={10} tiltMaxAngleY={10} perspective={1000}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-8 mb-8 shadow-xl border border-gray-700/50"
          >
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex-shrink-0">
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="w-32 h-32 rounded-full border-4 border-[var(--accent-color)] shadow-lg object-cover"
                />
                <label className="block mt-4">
                  <span className="text-gray-300 cursor-pointer hover:text-[var(--accent-color)] transition duration-300">
                    {language === 'ru' ? 'Изменить аватар' : '更改头像'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* User Details */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-semibold text-white">
                    {language === 'ru' ? 'Профиль пользователя' : '用户资料'}
                  </h3>
                  <button
                    onClick={handleEditToggle}
                    className="text-[var(--accent-color)] hover:text-opacity-90 transition duration-300 transform hover:scale-110"
                  >
                    <PencilIcon className="w-6 h-6" />
                  </button>
                </div>

                {!editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-lg font-medium text-gray-300">
                        {language === 'ru' ? 'Имя' : '姓名'}
                      </label>
                      <p className="text-xl text-white">{user?.username || (language === 'ru' ? 'Гость' : '访客')}</p>
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-300">
                        {language === 'ru' ? 'Компания' : '公司'}
                      </label>
                      <p className="text-xl text-white">{user?.company || (language === 'ru' ? 'Не указана' : '未填写')}</p>
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-300">
                        {language === 'ru' ? 'Телефон' : '电话'}
                      </label>
                      <p className="text-xl text-white">{user?.phone || (language === 'ru' ? 'Не указан' : '未填写')}</p>
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-300">Email</label>
                      <p className="text-xl text-white">{user?.email || 'user@example.com'}</p>
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-300">
                        {language === 'ru' ? 'Общая скидка' : '总折扣'}
                      </label>
                      <p className="text-xl text-white">{totalDiscount}%</p>
                      {temporaryDiscountPercent > 0 && user?.temporaryDiscountExpired && (
                        <p className="text-sm text-red-400 mt-2">
                          {language === 'ru'
                            ? `Временная скидка истекает через: ${getTimeRemaining(user.temporaryDiscountExpired).ru}`
                            : `临时折扣剩余时间：${getTimeRemaining(user.temporaryDiscountExpired).zh}`}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-lg font-medium text-gray-300">
                        {language === 'ru' ? 'Имя *' : '姓名 *'}
                      </label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300"
                        placeholder={language === 'ru' ? 'Имя' : '姓名'}
                        maxLength="255"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-300">
                        {language === 'ru' ? 'Компания' : '公司'}
                      </label>
                      <input
                        type="text"
                        value={editForm.company}
                        onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                        className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300"
                        placeholder={language === 'ru' ? 'Компания' : '公司'}
                        maxLength="255"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-300">
                        {language === 'ru' ? 'Телефон *' : '电话 *'}
                      </label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300"
                        placeholder={language === 'ru' ? 'Телефон' : '电话'}
                        maxLength="255"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-medium text-gray-300">Email *</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300"
                        placeholder="Email"
                        maxLength="255"
                        required
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="px-6 py-3 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition duration-300 flex items-center justify-center"
                      >
                        <CheckIcon className="w-5 h-5 mr-2" />
                        {language === 'ru' ? 'Сохранить' : '保存'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEditToggle}
                        disabled={isLoading}
                        className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300 flex items-center justify-center"
                      >
                        <XMarkIcon className="w-5 h-5 mr-2" />
                        {language === 'ru' ? 'Отмена' : '取消'}
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Discount Progress Bar */}
            <div className="mt-6">
              <label className="block text-lg font-medium text-gray-300">
                {language === 'ru' ? 'Прогресс скидки' : '折扣进度'}
              </label>
              <div className="w-full bg-gray-600 rounded-full h-4 mt-2">
                <motion.div
                  className="bg-gradient-to-r from-[var(--accent-color)] to-emerald-500 h-4 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(discountProgress / maxDiscount) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {language === 'ru'
                  ? `Общая скидка: ${discountProgress}% (Постоянная: ${user?.discountPercent || 0}%, Временная: ${temporaryDiscountPercent}%)`
                  : `总折扣：${discountProgress}% (固定折扣：${user?.discountPercent || 0}%, 临时折扣：${temporaryDiscountPercent}%)`}
              </p>
            </div>
          </motion.div>
        </Tilt>

        {/* Password Change Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-8 mb-8 shadow-xl border border-gray-700/50"
        >
          <button
            onClick={() => setIsPasswordSectionOpen(!isPasswordSectionOpen)}
            className="flex items-center w-full p-3 text-white rounded-lg hover:bg-gray-700 transition duration-300"
          >
            <KeyIcon className="w-6 h-6 mr-2 text-[var(--accent-color)]" />
            <span className="text-xl font-semibold">
              {language === 'ru' ? 'Смена пароля' : '更改密码'}
            </span>
            <ChevronDownIcon className={`w-5 h-5 ml-auto transition-transform ${isPasswordSectionOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isPasswordSectionOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 space-y-6"
              >
                <div>
                  <label className="block text-lg font-medium text-gray-300">
                    {language === 'ru' ? 'Текущий пароль' : '当前密码'}
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300"
                    placeholder={language === 'ru' ? 'Текущий пароль' : '当前密码'}
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-300">
                    {language === 'ru' ? 'Новый пароль' : '新密码'}
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300"
                    placeholder={language === 'ru' ? 'Новый пароль' : '新密码'}
                  />
                </div>
                <div>
                  <label className="block text-lg font-medium text-gray-300">
                    {language === 'ru' ? 'Подтвердите новый пароль' : '确认新密码'}
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300"
                    placeholder={language === 'ru' ? 'Подтвердите новый пароль' : '确认新密码'}
                  />
                </div>
                {passwordError && (
                  <p className="text-red-500 text-lg">{passwordError}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleChangePassword}
                    disabled={isLoading}
                    className="px-6 py-3 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition duration-300 flex items-center justify-center"
                  >
                    <CheckIcon className="w-5 h-5 mr-2" />
                    {language === 'ru' ? 'Сохранить пароль' : '保存密码'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                    disabled={isLoading}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300 flex items-center justify-center"
                  >
                    <XMarkIcon className="w-5 h-5 mr-2" />
                    {language === 'ru' ? 'Очистить' : '清除'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Notifications and 2FA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-8 shadow-xl border border-gray-700/50"
        >
          <h3 className="text-2xl font-semibold text-white mb-6">
            {language === 'ru' ? 'Настройки безопасности и уведомлений' : '安全与通知设置'}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={handleNotificationToggle}
                className="mr-2 accent-[var(--accent-color)] w-5 h-5"
                disabled={isLoading}
              />
              <label className="text-lg text-gray-300">
                {language === 'ru' ? 'Включить уведомления по email' : '启用电子邮件通知'}
              </label>
              <BellIcon className="w-5 h-5 ml-2 text-[var(--accent-color)]" />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={handleTwoFactorToggle}
                className="mr-2 accent-[var(--accent-color)] w-5 h-5"
                disabled={isLoading}
              />
              <label className="text-lg text-gray-300">
                {language === 'ru' ? 'Включить двухфакторную аутентификацию' : '启用双因素认证'}
              </label>
              <KeyIcon className="w-5 h-5 ml-2 text-[var(--accent-color)]" />
            </div>
          </div>
        </motion.div>

        {/* Loading Overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[var(--accent-color)]" />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PersonalDataTab;