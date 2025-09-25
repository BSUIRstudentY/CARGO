import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../components/AuthProvider';
import api from '../api/axiosInstance';
import { UserIcon, LockClosedIcon, TagIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

function LoginRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isReferralValid, setIsReferralValid] = useState(false);
  const [referralMessage, setReferralMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = '';
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 0:
      case 1:
        message = 'Слабый пароль';
        break;
      case 2:
        message = 'Средний пароль';
        break;
      case 3:
        message = 'Хороший пароль';
        break;
      case 4:
        message = 'Отличный пароль';
        break;
      default:
        message = '';
    }
    return { score, message };
  };

  useEffect(() => {
    if (password && !isLogin) {
      setPasswordStrength(checkPasswordStrength(password));
    } else {
      setPasswordStrength({ score: 0, message: '' });
    }
  }, [password, isLogin]);

  const handleApplyReferral = async () => {
    if (!referralCode) {
      setReferralMessage('Введите реферальный код');
      setError('Введите реферальный код');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get('/auth/validate-referral', { params: { code: referralCode } });
      if (res.data === true) {
        setIsReferralValid(true);
        setReferralMessage('Реферальный код действителен!');
        setError('');
      } else {
        setIsReferralValid(false);
        setReferralMessage('Неверный реферальный код');
        setError('Неверный реферальный код');
      }
    } catch (err) {
      setIsReferralValid(false);
      setReferralMessage('Ошибка при проверке кода');
      setError('Ошибка при проверке кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Введите действительный email');
      return;
    }
    if (!password) {
      setError('Введите пароль');
      return;
    }
    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('Пароли не совпадают');
        return;
      }
      if (passwordStrength.score < 2) {
        setError('Пароль слишком слабый. Используйте минимум 8 символов, включая заглавные буквы и цифры.');
        return;
      }
      if (!username) {
        setError('Введите логин');
        return;
      }
      if (referralCode && !isReferralValid) {
        setError('Пожалуйста, примените действительный реферальный код или оставьте поле пустым');
        return;
      }
      if (!termsAccepted) {
        setError('Пожалуйста, примите условия использования');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password, referralCode);
      }
      setError('');
      // Navigation handled by App.jsx
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Ошибка аутентификации';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-lg w-full bg-gray-800/90 backdrop-blur-lg rounded-xl p-8 border border-cyan-400/20 shadow-lg hover:shadow-cyan-400/20 transition-shadow duration-300 overflow-hidden"
      >
        {/* Decorative Background Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.5"/%3E%3C/svg%3E')`,
            backgroundRepeat: 'repeat',
          }}
        ></div>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <UserIcon className="w-10 h-10 text-cyan-400" />
          </motion.div>
          <h2 className="text-4xl font-bold text-white tracking-tight">
            {isLogin ? 'Вход в FLUVION' : 'Регистрация в FLUVION'}
          </h2>
        </div>
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-4 rounded-lg text-center text-base font-medium bg-red-500/20 border-red-500/50 text-red-400"
          >
            {error}
          </motion.div>
        )}
        {/* Loading Overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 rounded-xl"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-cyan-400" />
          </motion.div>
        )}
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Логин</label>
              <div className="relative">
                <UserIcon className="absolute top-3 left-3 w-6 h-6 text-cyan-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите ваш логин"
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/50 text-white border border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-300 text-base"
                  required
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <div className="relative">
              <UserIcon className="absolute top-3 left-3 w-6 h-6 text-cyan-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите ваш email"
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 text-white border border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-300 text-base"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Пароль</label>
            <div className="relative">
              <LockClosedIcon className="absolute top-3 left-3 w-6 h-6 text-cyan-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 text-white border border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-300 text-base"
                required
              />
            </div>
            {!isLogin && password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      passwordStrength.score === 0 ? 'w-0' :
                      passwordStrength.score === 1 ? 'w-1/4 bg-red-500' :
                      passwordStrength.score === 2 ? 'w-2/4 bg-yellow-500' :
                      passwordStrength.score === 3 ? 'w-3/4 bg-cyan-500' :
                      'w-full bg-green-500'
                    }`}
                  ></div>
                </div>
                <span className="text-sm text-gray-300">{passwordStrength.message}</span>
              </div>
            )}
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Подтвердите пароль</label>
              <div className="relative">
                <LockClosedIcon className="absolute top-3 left-3 w-6 h-6 text-cyan-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/50 text-white border border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-300 text-base"
                  required
                />
              </div>
            </div>
          )}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Реферальный код (опционально)</label>
              <div className="flex gap-3">
                <div className="relative flex-grow">
                  <TagIcon className="absolute top-3 left-3 w-6 h-6 text-cyan-400" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Введите реферальный код"
                    className="w-full pl-12 pr-4 py-3 bg-gray-900/50 text-white border border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-300 text-base"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleApplyReferral}
                  disabled={isLoading}
                  className="px-6 py-3 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 transition duration-300 text-sm font-medium"
                >
                  Применить
                </motion.button>
              </div>
              {referralMessage && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`mt-2 text-sm ${isReferralValid ? 'text-green-400' : 'text-red-400'}`}
                >
                  {referralMessage}
                </motion.p>
              )}
            </div>
          )}
          {!isLogin && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="w-5 h-5 bg-gray-900/50 border-gray-700/20 text-cyan-400 focus:ring-cyan-400 rounded"
              />
              <label className="text-sm text-gray-300">
                Я принимаю <a href="/user-agreement" className="text-cyan-400 hover:underline">условия использования</a> и{' '}
                <a href="/privacy-policy" className="text-cyan-400 hover:underline">политику конфиденциальности</a>
              </label>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 transition duration-300 text-base font-medium disabled:bg-gray-500"
          >
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300 text-base font-medium"
          >
            {isLogin ? 'Перейти к регистрации' : 'Перейти к входу'}
          </motion.button>
        </form>
        {/* Additional Info */}
        <div className="mt-6 text-center text-gray-300 text-sm">
          <p className="mb-2">Добро пожаловать в FLUVION!</p>
          <p>
            {isLogin
              ? 'Нет аккаунта? Зарегистрируйтесь, чтобы начать покупки.'
              : 'Уже есть аккаунт? Войдите для доступа к вашему профилю.'}
          </p>
        </div>
        {/* Social Login Placeholder */}
        <div className="mt-6 border-t border-gray-700/20 pt-4">
          <p className="text-center text-sm text-gray-300 mb-3">Или войдите через:</p>
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-gray-900/50 rounded-full hover:bg-gray-700/50 transition duration-300"
              disabled
            >
              <img src="/google-icon.svg" alt="Google" className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-gray-900/50 rounded-full hover:bg-gray-700/50 transition duration-300"
              disabled
            >
              <img src="/facebook-icon.svg" alt="Facebook" className="w-6 h-6" />
            </motion.button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">Социальный вход скоро будет доступен</p>
        </div>
      </motion.div>
    </section>
  );
}

export default LoginRegister;