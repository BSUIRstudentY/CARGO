import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from './AuthProvider';
import { ShareIcon, ClipboardIcon, ArrowPathIcon, UsersIcon, TagIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from './ui/Button';

const ReferralTab = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState({ referralCode: '' });
  const [referrals, setReferrals] = useState([]);
  const [referralCodeActivate, setReferralCodeActivate] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState(false);

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

  const handleActivateReferral = async () => {
    if (!referralCodeActivate.trim()) {
      setError('Введите реферальный код');
      return;
    }
    setActivating(true);
    try {
      const response = await api.post('/referrals/activate', null, { params: { referralCode: referralCodeActivate } });
      setReferralCodeActivate('');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#407CFF', '#5a8fff', '#FECACA'],
      });
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
        colors: ['#407CFF', '#5a8fff', '#FECACA'],
      });
    }).catch(() => setError('Ошибка при копировании текста'));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-[#00f0ff] mx-auto mb-4" />
          <p className="text-[#808080]">Загрузка...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent flex items-center gap-3">
          <UsersIcon className="w-8 h-8 text-[#00f0ff]" />
          Реферальная программа
        </h2>
      </motion.div>

      {/* Ошибка */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="p-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-xl text-[#ef4444] text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ваш реферальный код */}
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
        <h3 className="text-xl font-bold text-[#e5e7eb] mb-4 flex items-center gap-2">
          <TagIcon className="w-6 h-6 text-[#00f0ff]" />
          Ваш реферальный код
        </h3>
          {userData.referralCode ? (
            <div className="space-y-4">
              <p className="text-[#cdcdcd]">Поделитесь этим кодом с друзьями:</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full p-4 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[rgba(255,255,255,0.1)]">
                  <p className="text-xl font-mono text-[#00f0ff] text-center">{userData.referralCode}</p>
                </div>
                <Button
                  onClick={copyReferralText}
                  className="bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] flex items-center gap-2"
                >
                  <ClipboardIcon className="w-5 h-5" />
                  {copied ? 'Скопировано!' : 'Пригласить друга'}
                </Button>
              </div>
              <p className="text-sm text-[#808080] text-center">
                Нажмите "Пригласить друга" для копирования текста с вашим кодом и ссылкой на регистрацию.
              </p>
            </div>
          ) : (
            <p className="text-center text-[#9ca3af]">Реферальный код отсутствует. Выполните квесты, чтобы получить код!</p>
          )}
        </div>

      {/* Активировать реферальный код */}
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
        <h3 className="text-xl font-bold text-[#e5e7eb] mb-4 flex items-center gap-2">
          <ArrowPathIcon className="w-6 h-6 text-[#00f0ff]" />
          Активировать реферальный код
        </h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={referralCodeActivate}
                onChange={e => setReferralCodeActivate(e.target.value)}
                placeholder="Введите реферальный код друга"
                className="flex-1 p-3 bg-[rgba(107,114,128,0.15)] text-[#e5e7eb] border border-[rgba(255,255,255,0.1)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/30 transition duration-300"
              />
              <Button
                onClick={handleActivateReferral}
                disabled={activating}
                className="bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)]"
              >
                {activating ? 'Активация...' : 'Активировать'}
              </Button>
            </div>
            <p className="text-sm text-[#808080] text-center">
              Введите код друга, чтобы получить бонусы за регистрацию.
            </p>
          </div>
        </div>

      {/* Ваши рефералы */}
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
        <h3 className="text-xl font-bold text-[#e5e7eb] mb-4 flex items-center gap-2">
          <UsersIcon className="w-6 h-6 text-[#00f0ff]" />
          Ваши рефералы
        </h3>
          {referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.1)]">
                    <th className="px-4 py-3 text-left text-[#9ca3af] font-semibold">Имя пользователя</th>
                    <th className="px-4 py-3 text-left text-[#9ca3af] font-semibold">Дата регистрации</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral, index) => (
                    <tr key={index} className="border-b border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="px-4 py-3 text-[#e5e7eb]">{referral.username || 'Аноним'}</td>
                      <td className="px-4 py-3 text-[#9ca3af]">{new Date(referral.createdAt).toLocaleDateString('ru-RU')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <UsersIcon className="w-16 h-16 text-[#9ca3af] mx-auto mb-4" />
              <p className="text-[#e5e7eb] mb-2">У вас пока нет рефералов</p>
              <p className="text-[#9ca3af]">Приглашайте друзей, чтобы они появились!</p>
            </div>
          )}
        </div>
    </div>
  );
};

export default ReferralTab;
