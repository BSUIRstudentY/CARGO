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
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--ev-gold)]/30 border-t-[var(--ev-gold)] mx-auto mb-4" />
          <p className="text-[var(--ev-text-muted)]">Загрузка...</p>
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
        <h2 className="text-2xl font-semibold text-[var(--ev-text)] flex items-center gap-3">
          <UsersIcon className="w-7 h-7 text-[var(--ev-gold)]" />
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
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ваш реферальный код */}
      <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 hover:bg-[var(--ev-gold)]/5 transition-all duration-300">
        <h3 className="text-xl font-semibold text-[var(--ev-text)] mb-4 flex items-center gap-2">
          <TagIcon className="w-6 h-6 text-[var(--ev-gold)]" />
          Ваш реферальный код
        </h3>
          {userData.referralCode ? (
            <div className="space-y-4">
              <p className="text-[var(--ev-text-muted)]">Поделитесь этим кодом с друзьями:</p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full p-4 bg-[var(--ev-gold)]/5 rounded-lg border border-[var(--ev-gold)]/20">
                  <p className="text-xl font-mono text-[var(--ev-gold)] text-center">{userData.referralCode}</p>
                </div>
                <Button
                  onClick={copyReferralText}
                  className="bg-[var(--ev-gold)]/15 border border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/25 hover:border-[var(--ev-gold)]/40 flex items-center gap-2"
                >
                  <ClipboardIcon className="w-5 h-5" />
                  {copied ? 'Скопировано!' : 'Пригласить друга'}
                </Button>
              </div>
              <p className="text-sm text-[var(--ev-text-muted)] text-center">
                Нажмите "Пригласить друга" для копирования текста с вашим кодом и ссылкой на регистрацию.
              </p>
            </div>
          ) : (
            <p className="text-center text-[var(--ev-text-muted)]">Реферальный код отсутствует. Выполните квесты, чтобы получить код!</p>
          )}
        </div>

      {/* Активировать реферальный код */}
      <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 hover:bg-[var(--ev-gold)]/5 transition-all duration-300">
        <h3 className="text-xl font-semibold text-[var(--ev-text)] mb-4 flex items-center gap-2">
          <ArrowPathIcon className="w-6 h-6 text-[var(--ev-gold)]" />
          Активировать реферальный код
        </h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={referralCodeActivate}
                onChange={e => setReferralCodeActivate(e.target.value)}
                placeholder="Введите реферальный код друга"
                className="flex-1 p-3 bg-[var(--ev-gold)]/5 text-[var(--ev-text)] border border-[var(--ev-gold)]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ev-gold)]/30 focus:border-[var(--ev-gold)]/40 transition duration-300"
              />
              <Button
                onClick={handleActivateReferral}
                disabled={activating}
                className="bg-[var(--ev-gold)]/15 border border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/25 hover:border-[var(--ev-gold)]/40"
              >
                {activating ? 'Активация...' : 'Активировать'}
              </Button>
            </div>
            <p className="text-sm text-[var(--ev-text-muted)] text-center">
              Введите код друга, чтобы получить бонусы за регистрацию.
            </p>
          </div>
        </div>

      {/* Ваши рефералы */}
      <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 hover:bg-[var(--ev-gold)]/5 transition-all duration-300">
        <h3 className="text-xl font-semibold text-[var(--ev-text)] mb-4 flex items-center gap-2">
          <UsersIcon className="w-6 h-6 text-[var(--ev-gold)]" />
          Ваши рефералы
        </h3>
          {referrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--ev-gold)]/20">
                    <th className="px-4 py-3 text-left text-[var(--ev-text-muted)] font-semibold">Имя пользователя</th>
                    <th className="px-4 py-3 text-left text-[var(--ev-text-muted)] font-semibold">Дата регистрации</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral, index) => (
                    <tr key={index} className="border-b border-[var(--ev-gold)]/15 hover:bg-[var(--ev-gold)]/5 transition-colors">
                      <td className="px-4 py-3 text-[var(--ev-text)]">{referral.username || 'Аноним'}</td>
                      <td className="px-4 py-3 text-[var(--ev-text-muted)]">{new Date(referral.createdAt).toLocaleDateString('ru-RU')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <UsersIcon className="w-16 h-16 text-[var(--ev-text-muted)]/60 mx-auto mb-4" />
              <p className="text-[var(--ev-text)] mb-2">У вас пока нет рефералов</p>
              <p className="text-[var(--ev-text-muted)]">Приглашайте друзей, чтобы они появились!</p>
            </div>
          )}
        </div>
    </div>
  );
};

export default ReferralTab;
