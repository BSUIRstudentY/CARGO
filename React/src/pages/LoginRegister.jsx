import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../components/AuthProvider';
import api from '../api/axiosInstance';
import { UserIcon, LockClosedIcon, TagIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Loading } from '../components/ui/Loading';

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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1 - ввод email, 2 - ввод кода и пароля
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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

  // Функция для валидации реферального кода
  const validateReferralCode = async (code) => {
    if (!code || code.trim() === '') {
      setIsReferralValid(false);
      setReferralMessage('');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get('/auth/validate-referral', { params: { code: code.trim() } });
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

  // Читаем параметр ref из URL при загрузке компонента
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferralCode(refParam);
      // Переключаемся на форму регистрации, если есть реферальный код
      setIsLogin(false);
      // Автоматически валидируем код при загрузке с параметром ref
      validateReferralCode(refParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
    await validateReferralCode(referralCode);
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
      const msg = error.response?.data?.message ?? error.response?.data;
      const errorMsg = typeof msg === 'string' ? msg : (error.response?.status === 401 || error.response?.status === 403
        ? 'Неверный email или пароль'
        : error.message || 'Ошибка аутентификации');
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setResetStep(1);
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError('');
    setResetSuccess(false);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setResetStep(1);
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError('');
    setResetSuccess(false);
  };

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!resetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setError('Введите действительный email');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: resetEmail });
      setResetStep(2);
      setError('');
    } catch (error) {
      const errorMsg = error.response?.data || error.message || 'Ошибка отправки кода';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!resetCode || resetCode.length !== 6) {
      setError('Введите код из письма (6 символов)');
      return;
    }
    
    if (!newPassword || newPassword.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { 
        code: resetCode.toUpperCase(),
        newPassword: newPassword 
      });
      setResetSuccess(true);
      setError('');
      setTimeout(() => {
        handleCloseForgotPassword();
        setIsLogin(true);
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data || error.message || 'Ошибка сброса пароля';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-transparent text-[#e5e7eb] p-4 relative overflow-hidden">
      {/* Статичные световые акценты */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.06) 0%, transparent 70%)',
          }}
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-lg w-full z-10"
      >
        <div className="p-5 sm:p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 relative overflow-hidden">
          {/* Header */}
          {!showForgotPassword && (
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <motion.div
                initial={{ scale: 0.8, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5 }}
              >
                <UserIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#00f0ff]" />
              </motion.div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                  {isLogin ? 'Вход' : 'Регистрация'}
                </span>
              </h2>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <Alert 
              type="error" 
              message={error} 
              onClose={() => setError('')}
              className="mb-6"
            />
          )}
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-[#0a0d14]/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
              <Loading message="Обработка..." />
            </div>
          )}
          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-bold">
                  <span className="bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                    Сброс пароля
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={handleCloseForgotPassword}
                  className="text-[#9ca3af] hover:text-[#e5e7eb] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {resetStep === 1 && (
                <form onSubmit={handleRequestResetCode} className="space-y-6">
                  <div className="text-[#9ca3af] text-sm mb-4">
                    Введите email, указанный при регистрации. Мы отправим вам код для сброса пароля.
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Введите ваш email"
                    icon={UserIcon}
                    required
                  />
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCloseForgotPassword}
                      className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(167,139,250,0.4)] hover:text-[#a78bfa] transition-all duration-300 font-medium"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Отправка...' : 'Отправить код'}
                    </button>
                  </div>
                </form>
              )}

              {resetStep === 2 && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  {resetSuccess ? (
                    <div className="p-4 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] rounded-xl text-[#10b981] text-center">
                      <CheckCircleIcon className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-medium">Пароль успешно изменен!</p>
                      <p className="text-sm mt-1">Перенаправление на страницу входа...</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-[#9ca3af] text-sm mb-4">
                        Мы отправили код на {resetEmail}. Введите код из письма и новый пароль.
                      </div>
                      <Input
                        label="Код из письма"
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/\s/g, '').toUpperCase())}
                        placeholder="Введите 6-значный код"
                        maxLength={6}
                        required
                      />
                      <Input
                        label="Новый пароль"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Введите новый пароль"
                        icon={LockClosedIcon}
                        required
                      />
                      <Input
                        label="Подтвердите новый пароль"
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Повторите новый пароль"
                        icon={LockClosedIcon}
                        required
                      />
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setResetStep(1)}
                          disabled={isLoading}
                          className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(167,139,250,0.4)] hover:text-[#a78bfa] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Назад
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Сброс...' : 'Сбросить пароль'}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              )}
            </div>
          )}

          {/* Form */}
          {!showForgotPassword && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <Input
                label="Логин"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите ваш логин"
                icon={UserIcon}
                required
              />
            )}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите ваш email"
              icon={UserIcon}
              required
            />
            <div>
              <Input
                label="Пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                icon={LockClosedIcon}
                required
              />
              {!isLogin && password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-full h-2 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.score === 0 ? 'w-0' :
                        passwordStrength.score === 1 ? 'w-1/4 bg-[#ef4444]' :
                        passwordStrength.score === 2 ? 'w-2/4 bg-[#f59e0b]' :
                        passwordStrength.score === 3 ? 'w-3/4 bg-[#00f0ff]' :
                        'w-full bg-[#10b981]'
                      }`}
                    ></div>
                  </div>
                  <span className="text-sm text-[#9ca3af] whitespace-nowrap">{passwordStrength.message}</span>
                </div>
              )}
            </div>
            {!isLogin && (
              <Input
                label="Подтвердите пароль"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите пароль"
                icon={LockClosedIcon}
                required
              />
            )}
            {isLogin && !showForgotPassword && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-[#00f0ff] hover:underline transition-colors"
                >
                  Забыл пароль?
                </button>
              </div>
            )}
            {!isLogin && (
              <div>
                <div className="flex gap-3">
                  <Input
                    label="Реферальный код (опционально)"
                    type="text"
                    value={referralCode}
                    onChange={(e) => {
                      setReferralCode(e.target.value);
                      // Сбрасываем валидацию при ручном изменении
                      if (e.target.value !== searchParams.get('ref')) {
                        setIsReferralValid(false);
                        setReferralMessage('');
                      }
                    }}
                    placeholder="Введите реферальный код"
                    icon={TagIcon}
                    className="flex-1"
                  />
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleApplyReferral}
                      disabled={isLoading}
                      className="h-[42px] px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(167,139,250,0.4)] hover:text-[#a78bfa] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Применить
                    </button>
                  </div>
                </div>
                {referralMessage && (
                  <Alert
                    type={isReferralValid ? 'success' : 'error'}
                    message={referralMessage}
                    className="mt-2"
                  />
                )}
                {searchParams.get('ref') && isReferralValid && (
                  <div className="mt-2 p-3 bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] rounded-lg">
                    <p className="text-sm text-[#10b981] flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5" />
                      Реферальный код из ссылки успешно применён!
                    </p>
                  </div>
                )}
              </div>
            )}
            {!isLogin && (
              <div className="flex items-center gap-2 p-4 bg-[rgba(255,255,255,0.02)] rounded-lg border-2 border-[rgba(255,255,255,0.1)]">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-5 h-5 bg-[rgba(255,255,255,0.02)] border-2 border-[rgba(255,255,255,0.1)] rounded focus:outline-none focus:ring-2 focus:ring-[#00f0ff] text-[#00f0ff]"
                />
                <label className="text-sm text-[#9ca3af]">
                  Я принимаю <a href="/user-agreement" className="text-[#00f0ff] hover:underline">условия использования</a> и{' '}
                  <a href="/privacy-policy" className="text-[#00f0ff] hover:underline">политику конфиденциальности</a>
                </label>
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLogin ? 'Войти' : 'Зарегистрироваться'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                // Если переключаемся на регистрацию и есть реферальный код в URL, применяем его
                if (isLogin && searchParams.get('ref')) {
                  const refParam = searchParams.get('ref');
                  setReferralCode(refParam);
                  validateReferralCode(refParam);
                }
              }}
              className="w-full px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-sm sm:text-base bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(167,139,250,0.4)] hover:text-[#a78bfa] transition-all duration-300 font-medium"
            >
              {isLogin ? 'Перейти к регистрации' : 'Перейти к входу'}
            </button>
          </form>
          )}
          
          {/* Additional Info */}
          {!showForgotPassword && (
            <div className="mt-6 text-center text-[#9ca3af] text-sm">
              <p className="mb-2">Добро пожаловать!</p>
              <p>
                {isLogin
                  ? 'Нет аккаунта? Зарегистрируйтесь, чтобы начать покупки.'
                  : 'Уже есть аккаунт? Войдите для доступа к вашему профилю.'}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

export default LoginRegister;