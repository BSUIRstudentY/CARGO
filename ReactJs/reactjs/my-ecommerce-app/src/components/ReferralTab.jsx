import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from './AuthProvider';
import { ShareIcon, ClipboardIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

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
        colors: ['#10b981', '#34d399', '#6ee7b7'],
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
        colors: ['#10b981', '#34d399'],
      });
    }).catch(() => setError('Ошибка при копировании текста'));
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <ArrowPathIcon className="w-12 h-12 text-[var(--accent-color)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[70vh] overflow-y-auto scrollbar-hide bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 sm:p-12">
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-[var(--accent-color)] mb-2">Реферальная программа</h2>
          <p className="text-lg text-gray-400">Приглашайте друзей и получайте бонусы за их регистрацию!</p>
        </motion.header>
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500"
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
          className="mb-12 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl shadow-2xl p-8"
        >
          <h3 className="text-2xl font-semibold text-white mb-6">Ваш реферальный код</h3>
          {userData.referralCode ? (
            <div className="text-center">
              <p className="text-lg text-white mb-4">Поделитесь этим кодом с друзьями:</p>
              <div className="flex items-center justify-center gap-4 mb-4">
                <p className="text-xl font-mono text-[var(--accent-color)] bg-gray-700 px-4 py-2 rounded-lg">
                  {userData.referralCode}
                </p>
                <button
                  onClick={copyReferralText}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition flex items-center"
                >
                  <ClipboardIcon className="w-5 h-5 mr-2" />
                  {copied ? 'Скопировано!' : 'Пригласить друга'}
                </button>
              </div>
              <p className="text-sm text-gray-400">
                Нажмите "Пригласить друга" для копирования текста с вашим кодом и ссылкой на регистрацию.
              </p>
            </div>
          ) : (
            <p className="text-center text-gray-400">Реферальный код отсутствует. Выполните квесты, чтобы получить код!</p>
          )}
        </motion.section>
        {/* Activate Referral Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl shadow-2xl p-8"
        >
          <h3 className="text-2xl font-semibold text-white mb-6">Активировать реферальный код</h3>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              value={referralCodeActivate}
              onChange={e => setReferralCodeActivate(e.target.value)}
              placeholder="Введите реферальный код друга"
              className="flex-grow p-3 bg-gray-900 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition"
            />
            <button
              onClick={handleActivateReferral}
              disabled={activating}
              className={`px-6 py-3 rounded-lg text-white ${activating ? 'bg-gray-600' : 'bg-[var(--accent-color)] hover:bg-opacity-90'} transition transform hover:scale-105`}
            >
              {activating ? 'Активация...' : 'Активировать'}
            </button>
          </div>
          <p className="text-sm text-gray-400 text-center">
            Введите код друга, чтобы получить бонусы за регистрацию.
          </p>
        </motion.section>
        {/* Referrals List Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-12 bg-gradient-to-r from-gray-700 to-gray-600 rounded-xl shadow-2xl p-8"
        >
          <h3 className="text-2xl font-semibold text-white mb-6">Ваши рефералы</h3>
          {referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-4 py-2 text-left text-gray-300">Имя пользователя</th>
                    <th className="px-4 py-2 text-left text-gray-300">Дата регистрации</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral, index) => (
                    <tr key={index} className="border-b border-gray-600">
                      <td className="px-4 py-2 text-white">{referral.username || 'Аноним'}</td>
                      <td className="px-4 py-2 text-white">{new Date(referral.createdAt).toLocaleDateString('ru-RU')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-400">У вас пока нет рефералов. Приглашайте друзей, чтобы они появились!</p>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default ReferralTab;