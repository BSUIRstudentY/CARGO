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

  const handleForgotPassword = () => {
    // Placeholder for future implementation
    console.log('Forgot password clicked');
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <style>
        {`
          .shimmer-border {
            position: relative;
            border: 2px solid transparent;
            animation: shimmer 2s infinite linear;
          }
          .shimmer-border::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            width: calc(100% + 4px);
            height: calc(100% + 4px);
            background: linear-gradient(45deg, transparent, var(--accent-primary), transparent);
            background-size: 200% 200%;
            animation: shimmer-gradient 2s infinite linear;
            z-index: -1;
            border-radius: inherit;
          }
          @keyframes shimmer {
            0% { border-color: rgba(232, 30, 45, 0.5); }
            50% { border-color: var(--accent-primary); }
            100% { border-color: rgba(232, 30, 45, 0.5); }
          }
          @keyframes shimmer-gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-lg w-full bg-bg-secondary/90 backdrop-blur-lg rounded-xl p-8 border border-accent-primary/20 shadow-modal hover:shadow-accent-primary/20 transition-shadow duration-300 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <UserIcon className="w-10 h-10 text-accent-primary" />
          </motion.div>
          <h2 className="text-4xl font-display font-bold text-text-primary tracking-tight">
            {isLogin ? 'Вход в FLUVION' : 'Регистрация в FLUVION'}
          </h2>
        </div>
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-4 rounded-lg text-center text-base font-medium bg-bg-accent/20 border border-accent-primary/50 text-accent-primary"
          >
            {error}
          </motion.div>
        )}
        {/* Loading Overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-bg-primary/70 flex items-center justify-center z-50 rounded-xl"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-accent-primary" />
          </motion.div>
        )}
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Логин</label>
              <div className="relative">
                <UserIcon className="absolute top-3 left-3 w-6 h-6 text-accent-primary" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите ваш логин"
                  className="w-full pl-12 pr-4 py-3 bg-white text-black border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition duration-300 text-base"
                  required
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
            <div className="relative">
              <UserIcon className="absolute top-3 left-3 w-6 h-6 text-accent-primary" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите ваш email"
                className="w-full pl-12 pr-4 py-3 bg-white text-black border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition duration-300 text-base"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Пароль</label>
            <div className="relative">
              <LockClosedIcon className="absolute top-3 left-3 w-6 h-6 text-accent-primary" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                className="w-full pl-12 pr-4 py-3 bg-white text-black border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition duration-300 text-base"
                required
              />
            </div>
            {!isLogin && password && (
              <div className="mt-2 flex items-center gap-2">
                <div className="w-full h-2 bg-border-primary rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      passwordStrength.score === 0 ? 'w-0' :
                      passwordStrength.score === 1 ? 'w-1/4 bg-accent-primary' :
                      passwordStrength.score === 2 ? 'w-2/4 bg-accent-muted' :
                      passwordStrength.score === 3 ? 'w-3/4 bg-accent-secondary' :
                      'w-full bg-green-500'
                    }`}
                  ></div>
                </div>
                <span className="text-sm text-text-secondary">{passwordStrength.message}</span>
              </div>
            )}
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Подтвердите пароль</label>
              <div className="relative">
                <LockClosedIcon className="absolute top-3 left-3 w-6 h-6 text-accent-primary" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите пароль"
                  className="w-full pl-12 pr-4 py-3 bg-white text-black border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition duration-300 text-base"
                  required
                />
              </div>
            </div>
          )}
          {isLogin && (
            <div className="text-right">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-accent-primary hover:underline"
              >
                Забыл пароль?
              </motion.button>
            </div>
          )}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Реферальный код (опционально)</label>
              <div className="flex gap-3">
                <div className="relative flex-grow">
                  <TagIcon className="absolute top-3 left-3 w-6 h-6 text-accent-primary" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Введите реферальный код"
                    className="w-full pl-12 pr-4 py-3 bg-white text-black border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition duration-300 text-base"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleApplyReferral}
                  disabled={isLoading}
                  className="px-6 py-3 bg-accent-primary text-text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-sm font-medium disabled:bg-text-muted shimmer-border"
                >
                  Применить
                </motion.button>
              </div>
              {referralMessage && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`mt-2 text-sm ${isReferralValid ? 'text-green-500' : 'text-accent-primary'}`}
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
                className="w-5 h-5 bg-bg-tertiary/50 border-border-primary text-accent-primary focus:ring-accent-primary rounded"
              />
              <label className="text-sm text-text-secondary">
                Я принимаю <a href="/user-agreement" className="text-accent-primary hover:underline">условия использования</a> и{' '}
                <a href="/privacy-policy" className="text-accent-primary hover:underline">политику конфиденциальности</a>
              </label>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-accent-primary text-text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-medium disabled:bg-text-muted shimmer-border"
          >
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full py-3 bg-bg-tertiary text-text-primary rounded-lg hover:bg-bg-tertiary/90 transition duration-300 text-base font-medium shimmer-border"
          >
            {isLogin ? 'Перейти к регистрации' : 'Перейти к входу'}
          </motion.button>
        </form>
        {/* Additional Info */}
        <div className="mt-6 text-center text-text-secondary text-sm">
          <p className="mb-2">Добро пожаловать в FLUVION!</p>
          <p>
            {isLogin
              ? 'Нет аккаунта? Зарегистрируйтесь, чтобы начать покупки.'
              : 'Уже есть аккаунт? Войдите для доступа к вашему профилю.'}
          </p>
        </div>
        {/* Social Login Placeholder */}
        <div className="mt-6 border-t border-border-primary pt-4">
          <p className="text-center text-sm text-text-secondary mb-3">Или войдите через:</p>
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-bg-tertiary/50 rounded-full hover:bg-bg-tertiary/70 transition duration-300"
              disabled
            >
              <img src="/google-icon.svg" alt="Google" className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-bg-tertiary/50 rounded-full hover:bg-bg-tertiary/70 transition duration-300"
              disabled
            >
              <img src="/facebook-icon.svg" alt="Facebook" className="w-6 h-6" />
            </motion.button>
          </div>
          <p className="text-center text-xs text-text-muted mt-2">Социальный вход скоро будет доступен</p>
        </div>
      </motion.div>
    </section>
  );
}

export default LoginRegister;