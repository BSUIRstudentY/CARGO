import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from './AuthProvider';
import { ShareIcon, ClipboardIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

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

const ReferralTab = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState({ referralCode: '' });
  const [referrals, setReferrals] = useState([]);
  const [referralCodeActivate, setReferralCodeActivate] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState(false);

  // Fetch user data and referrals
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userResponse = await api.get('/referrals/user');
        setUserData({
          referralCode: userResponse.data.referralCode || '',
        });
        const referralsResponse = await api.get('/referrals');
        setReferrals(referralsResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        let errorMessage = 'Ошибка загрузки данных';
        if (error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            errorMessage = 'Пожалуйста, войдите в систему для просмотра рефералов';
          } else if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.request) {
          errorMessage = 'Не удалось подключиться к серверу';
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) fetchData();
  }, [user?.email]);

  // Handle referral code activation
  const handleActivateReferral = async () => {
    if (!referralCodeActivate.trim()) {
      setError('Введите реферальный код');
      return;
    }
    setActivating(true);
    try {
      const response = await api.post('/referrals/activate', null, { params: { referralCode: referralCodeActivate } });
      alert(response.data || 'Реферальный код успешно активирован');
      setReferralCodeActivate('');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF2549', '#F87171', '#FECACA'],
      });
      // Refresh user data and referrals
      const userResponse = await api.get('/referrals/user');
      setUserData({
        referralCode: userResponse.data.referralCode || '',
      });
      const referralsResponse = await api.get('/referrals');
      setReferrals(referralsResponse.data || []);
    } catch (error) {
      console.error('Error activating referral:', error);
      let errorMessage = 'Ошибка активации реферального кода';
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Недействительный реферальный код';
        } else if (error.response.status === 401 || error.response.status === 403) {
          errorMessage = 'Пожалуйста, войдите в систему';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Не удалось подключиться к серверу';
      }
      setError(errorMessage);
    } finally {
      setActivating(false);
    }
  };

  // Copy referral text
  const copyReferralText = () => {
    if (!userData.referralCode) {
      setError('Реферальный код отсутствует');
      return;
    }
    const referralText = `Присоединяйтесь и используйте мой реферальный код ${userData.referralCode}! Регистрация: ${window.location.origin}/register?ref=${userData.referralCode}`;
    navigator.clipboard.writeText(referralText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#FF2549', '#F87171', '#FECACA'],
      });
    }).catch(() => setError('Ошибка при копировании текста'));
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-accent-primary text-2xl bg-tertiary p-6 rounded-lg border border-primary/50 shadow-card hover:shadow-accent-primary/40"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-accent-primary mx-auto mb-4" />
          Загрузка...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary text-secondary py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,37,73,0.3)_0%,transparent_70%)] pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold font-display text-accent-primary tracking-tight animate-fade-in-down">
            Реферальная программа
          </h2>
          <p className="text-lg text-secondary font-sans mt-2">Приглашайте друзей и получайте бонусы за их регистрацию!</p>
        </motion.header>
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center text-base font-medium font-sans shadow-card"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Referral Code Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 bg-tertiary rounded-2xl shadow-card border border-primary/50 p-8 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
              backgroundRepeat: 'repeat',
            }}
          />
          <h3 className="text-2xl font-bold font-display text-accent-primary mb-6">Ваш реферальный код</h3>
          {userData.referralCode ? (
            <div className="text-center">
              <p className="text-lg text-secondary font-sans mb-4">Поделитесь этим кодом с друзьями:</p>
              <div className="flex items-center justify-center gap-4 mb-4">
                <p className="text-xl font-mono text-accent-primary bg-tertiary px-4 py-2 rounded-lg border border-primary/50 shadow-card">
                  {userData.referralCode}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyReferralText}
                  className="px-4 py-2 bg-accent-primary text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold font-sans flex items-center justify-center gap-2 shadow-card"
                >
                  <ClipboardIcon className="w-5 h-5" />
                  {copied ? 'Скопировано!' : 'Пригласить друга'}
                </motion.button>
              </div>
              <p className="text-sm text-secondary font-sans">
                Нажмите "Пригласить друга" для копирования текста с вашим кодом и ссылкой на регистрацию.
              </p>
            </div>
          ) : (
            <p className="text-center text-secondary font-sans">Реферальный код отсутствует. Выполните квесты, чтобы получить код!</p>
          )}
        </motion.section>
        {/* Activate Referral Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12 bg-tertiary rounded-2xl shadow-card border border-primary/50 p-8 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
              backgroundRepeat: 'repeat',
            }}
          />
          <h3 className="text-2xl font-bold font-display text-accent-primary mb-6">Активировать реферальный код</h3>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              value={referralCodeActivate}
              onChange={e => setReferralCodeActivate(e.target.value)}
              placeholder="Введите реферальный код друга"
              className="flex-grow p-3 bg-tertiary text-secondary border border-primary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition duration-300 font-sans"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleActivateReferral}
              disabled={activating}
              className={`px-6 py-3 rounded-lg text-primary text-base font-semibold font-sans shadow-card ${
                activating ? 'bg-gray-600/80' : 'bg-accent-primary hover:bg-accent-primary/90'
              } transition duration-300`}
            >
              {activating ? 'Активация...' : 'Активировать'}
            </motion.button>
          </div>
          <p className="text-sm text-secondary font-sans text-center">
            Введите код друга, чтобы получить бонусы за регистрацию.
          </p>
        </motion.section>
        {/* Referrals List Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-12 bg-tertiary rounded-2xl shadow-card border border-primary/50 p-8 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
              backgroundRepeat: 'repeat',
            }}
          />
          <h3 className="text-2xl font-bold font-display text-accent-primary mb-6">Ваши рефералы</h3>
          {referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-tertiary">
                    <th className="px-4 py-2 text-left text-secondary font-sans">Имя пользователя</th>
                    <th className="px-4 py-2 text-left text-secondary font-sans">Дата регистрации</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral, index) => (
                    <tr key={index} className="border-b border-primary/50">
                      <td className="px-4 py-2 text-secondary font-sans">{referral.username || 'Аноним'}</td>
                      <td className="px-4 py-2 text-secondary font-sans">{new Date(referral.createdAt).toLocaleDateString('ru-RU')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-secondary font-sans">У вас пока нет рефералов. Приглашайте друзей, чтобы они появились!</p>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default ReferralTab;