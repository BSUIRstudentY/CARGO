import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import api from '../api/axiosInstance';

function LoginRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isReferralValid, setIsReferralValid] = useState(false);
  const [referralMessage, setReferralMessage] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleApplyReferral = async () => {
    if (!referralCode) {
      setReferralMessage('Введите реферальный код');
      return;
    }
    try {
      const res = await api.get('/auth/validate-referral', { params: { code: referralCode } });
      if (res.data === true) {
        setIsReferralValid(true);
        setReferralMessage('Реферальный код действителен!');
      } else {
        setIsReferralValid(false);
        setReferralMessage('Неверный реферальный код');
      }
    } catch (err) {
      setIsReferralValid(false);
      setReferralMessage('Ошибка при проверке кода');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }
    if (!isLogin && referralCode && !isReferralValid) {
      alert('Пожалуйста, примените действительный реферальный код или оставьте поле пустым');
      return;
    }
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password, referralCode);
      }
      // Навигация не требуется, так как App.jsx обработает маршруты
    } catch (error) {
      console.error('Authentication error:', error);
      alert(error.message || 'Ошибка аутентификации');
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[var(--background-color)] p-4">
      <div className="max-w-md w-full bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-[var(--accent-color)] mb-4">
          {isLogin ? 'Вход' : 'Регистрация'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Логин"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                required
              />
            </>
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            required
          />
          {!isLogin && (
            <>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Подтвердите пароль"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                required
              />
              <div className="flex">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Реферальный код (опционально)"
                  className="flex-grow px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                />
                <button
                  type="button"
                  onClick={handleApplyReferral}
                  className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
                >
                  Применить
                </button>
              </div>
              {referralMessage && (
                <p className={isReferralValid ? 'text-green-500' : 'text-red-500'}>{referralMessage}</p>
              )}
            </>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white hover:bg-opacity-80 transition duration-300"
          >
            {isLogin ? 'Войти' : 'Зарегистрироваться'}
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition duration-300"
          >
            {isLogin ? 'Перейти к регистрации' : 'Перейти к входу'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default LoginRegister;