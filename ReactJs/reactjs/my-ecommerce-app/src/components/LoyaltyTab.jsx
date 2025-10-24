import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from './AuthProvider';
import { GiftIcon, CheckCircleIcon, ArrowPathIcon, ShareIcon, InformationCircleIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import confetti from 'canvas-confetti';

// Utility function to format expiration date in Russian locale
const formatExpirationDate = (date) => {
  if (!date) return 'Не завершено';
  const [year, month, day, hour, minute] = date;
  return new Date(year, month - 1, day, hour, minute).toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Utility function to calculate time remaining for temporary discount
const getTimeRemaining = (expirationDate) => {
  if (!expirationDate) return '0 мин.';
  const [year, month, day, hour, minute, second, nano] = expirationDate;
  const expirationUTC = new Date(Date.UTC(year, month - 1, day, hour - 3, minute, second, Math.floor(nano / 1000000)));
  const currentUTC = new Date();
  const diffMs = expirationUTC - currentUTC;
  if (diffMs <= 0) return '0 мин.';
  const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
  const weeks = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24 * 7));
  const days = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return [
    months > 0 ? `${months} мес.` : '',
    weeks > 0 ? `${weeks} нед.` : '',
    days > 0 ? `${days} дн.` : '',
    hours > 0 ? `${hours} ч.` : '',
    minutes >= 0 ? `${minutes} мин.` : '',
  ].filter(Boolean).join(' ') || '0 мин.';
};

// FAQ data for accordion
const faqData = [
  { question: 'Что такое система лояльности?', answer: 'Система лояльности позволяет получать скидки и бонусы за выполнение квестов и приглашение друзей.' },
  { question: 'Как активировать реферальный код?', answer: 'Введите код в поле и нажмите "Активировать". Если код верный, вы получите бонус.' },
  { question: 'Почему моя временная скидка истекла?', answer: 'Временные скидки имеют срок действия. Выполняйте квесты, чтобы получить новые.' },
  { question: 'Как повысить уровень лояльности?', answer: 'Повышайте скидку, выполняя квесты и приглашая друзей.' },
  { question: 'Можно ли поделиться реферальным кодом в соцсетях?', answer: 'Да, используйте кнопку "Поделиться" для удобного распространения!' },
];

// Component for individual stat cards
const StatCard = ({ children, className }) => (
  <motion.div
    className={`flex-1 min-w-[250px] bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl p-8 text-center shadow-lg border border-cyan-500/30 transition-shadow duration-300 hover:shadow-cyan-500/40 relative overflow-hidden ${className}`}
    whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
    whileTap={{ scale: 0.97 }}
  >
    <div
      className="absolute inset-0 opacity-10 pointer-events-none"
      style={{
        backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
        backgroundRepeat: 'repeat',
      }}
    />
    {children}
  </motion.div>
);

// Component for individual quest cards
const QuestCard = ({ quest, onClaim, onShowDetails }) => {
  const playClickSound = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    oscillator.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  };

  return (
    <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
      <motion.div
        onClick={() => onShowDetails(quest)}
        className={`w-full max-w-md h-20 bg-gradient-to-br ${quest.completed ? 'from-cyan-500 to-emerald-500' : 'from-gray-800/90 to-gray-700/90'} rounded-lg border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/40 p-4 transition-all duration-300 relative cursor-pointer`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
        whileTap={{ scale: 0.97 }}
      >
        <div className="flex flex-row items-center h-full gap-4">
          <GiftIcon className="w-6 h-6 text-white" />
          <div className="flex-1">
            <p className="text-sm text-gray-300">
              Прогресс: <span className="font-medium">{quest.currentValue}/{quest.targetValue}</span>
            </p>
          </div>
          <div className="w-24 bg-gray-600 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(quest.currentValue / quest.targetValue) * 100}%` }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />
          </div>
          {quest.completed && <CheckCircleIcon className="absolute top-3 right-12 w-6 h-6 text-white" />}
          <button
            onClick={(e) => {
              e.stopPropagation();
              playClickSound();
              onClaim(quest.id);
            }}
            disabled={!quest.completed}
            className={`px-4 py-1 rounded-lg text-sm transition ${quest.completed ? 'bg-cyan-500 text-white hover:bg-cyan-600' : 'bg-gray-700/80 text-gray-300 cursor-not-allowed'}`}
          >
            {quest.completed ? 'Забрать' : 'Не завершено'}
          </button>
        </div>
      </motion.div>
    </Tilt>
  );
};

// Component for quest details modal
const QuestDetailsModal = ({ quest, getQuestName, getRewardTypeLabel, onClose }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl p-8 max-w-lg w-[90%] max-h-[80vh] overflow-y-auto border border-cyan-500/30 shadow-lg"
    >
      <h3 className="text-2xl font-semibold text-cyan-400 mb-4">{getQuestName(quest.questConditionType, quest.targetValue)}</h3>
      <p className="text-gray-300 mb-4">
        <strong>Тип квеста:</strong> {quest.questConditionType}
      </p>
      <p className="text-gray-300 mb-4">
        <strong>Награда:</strong> +{quest.reward}% ({getRewardTypeLabel(quest.rewardType)})
      </p>
      <p className="text-gray-300 mb-4">
        <strong>Прогресс:</strong> {quest.currentValue}/{quest.targetValue}
      </p>
      <p className="text-gray-300 mb-4">
        <strong>Статус:</strong> {quest.completed ? 'Выполнен' : 'Не выполнен'}
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClose}
        className="w-full py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold shadow-sm"
      >
        Закрыть
      </motion.button>
    </motion.div>
  </motion.div>
);

// Component for FAQ items
const FaqItem = ({ faq, index, isOpen, toggle }) => (
  <div>
    <motion.button
      animate={{ backgroundColor: isOpen ? '#374151' : '#1f2937' }}
      transition={{ duration: 0.3 }}
      onClick={() => toggle(index)}
      className="flex justify-between items-center w-full p-4 rounded-lg cursor-pointer transition-colors bg-gradient-to-br from-gray-800/90 to-gray-700/90 border border-cyan-500/30"
    >
      <span className="text-lg text-white font-medium">{faq.question}</span>
      <ChevronDownIcon className={`w-5 h-5 text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </motion.button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-lg mt-2 border border-cyan-500/30"
        >
          <p className="text-gray-300">{faq.answer}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Main LoyaltyTab component
const LoyaltyTab = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState({
    totalDiscount: 0,
    discountPercent: 0,
    temporaryDiscountPercent: null,
    temporaryDiscountExpired: null,
    referralCode: '',
  });
  const [quests, setQuests] = useState([]);
  const [referralCodeActivate, setReferralCodeActivate] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);

  // Memoized quest name generator
  const getQuestName = useCallback((questConditionType, targetValue) => {
    switch (questConditionType) {
      case 'INVITE': return `Пригласи ${targetValue} ${targetValue === 1 ? 'друга' : 'друзей'}`;
      case 'PURCHASE': return `Соверши ${targetValue} ${targetValue === 1 ? 'покупку' : 'покупок'}`;
      case 'REVIEW': return `Оставь ${targetValue} ${targetValue === 1 ? 'отзыв' : 'отзывов'}`;
      case 'SPENT': return `Потрать ${targetValue} бонусов`;
      case 'QUANTITY_ORDER': return `Соверши ${targetValue} ${targetValue === 1 ? 'заказ' : 'заказов'}`;
      default: return 'Выполни задание';
    }
  }, []);

  // Memoized reward type label
  const getRewardTypeLabel = useCallback((rewardType) => {
    return rewardType === 'TEMPORARY' ? 'Временная скидка' : 'Постоянная скидка';
  }, []);

  // Fetch user data and quests
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userResponse = await api.get('/loyalty/user');
        setUserData(userResponse.data);
        const questsResponse = await api.get('/loyalty/quests');
        setQuests(questsResponse.data.map(quest => ({
          ...quest,
          name: getQuestName(quest.questConditionType, quest.targetValue),
        })));
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(
          error.response?.status === 401 || error.response?.status === 403
            ? 'Пожалуйста, войдите в систему для просмотра статуса лояльности'
            : error.response?.data?.message || 'Ошибка загрузки данных'
        );
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) fetchData();
  }, [user?.email, getQuestName]);

  // Handle referral code activation
  const handleActivateReferral = async () => {
    try {
      const response = await api.post('/loyalty/activate-referral', null, { params: { referralCode: referralCodeActivate } });
      alert(response.data);
      setReferralCodeActivate('');
      const userResponse = await api.get('/loyalty/user');
      setUserData(userResponse.data);
      const questsResponse = await api.get('/loyalty/quests');
      setQuests(questsResponse.data.map(quest => ({
        ...quest,
        name: getQuestName(quest.questConditionType, quest.targetValue),
      })));
    } catch (error) {
      console.error('Error activating referral:', error);
      setError(error.response?.data?.message || 'Ошибка активации реферального кода');
    }
  };

  // Copy referral code
  const copyReferralCode = () => {
    navigator.clipboard.writeText(userData.referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Share referral code
  const shareReferralCode = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Присоединяйтесь к нашей системе лояльности!',
        text: `Используйте мой реферальный код ${userData.referralCode} для бонусов!`,
        url: window.location.origin,
      }).catch(error => console.error('Error sharing:', error));
    } else {
      alert('Поделитесь кодом вручную: ' + userData.referralCode);
    }
  };

  // Handle claim reward with confetti
  const handleClaimReward = (questId) => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#0ea5e9', '#38bdf8'],
    });
    alert(`Награда за квест ${questId} успешно забрана! (Симуляция)`);
  };

  // Handle showing quest details
  const handleShowQuestDetails = (quest) => {
    setSelectedQuest(quest);
  };

  // Handle closing quest details modal
  const handleCloseQuestDetails = () => {
    setSelectedQuest(null);
  };

  // Memoized quest list rendering with filter
  const questList = useMemo(() => {
    const filteredQuests = showIncompleteOnly ? quests.filter(quest => !quest.completed) : quests;
    return filteredQuests.map(quest => (
      <QuestCard
        key={quest.id}
        quest={quest}
        onClaim={handleClaimReward}
        onShowDetails={handleShowQuestDetails}
      />
    ));
  }, [quests, showIncompleteOnly]);

  // Toggle FAQ item
  const toggleFaq = (index) => setFaqOpenIndex(faqOpenIndex === index ? null : index);

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-cyan-400 text-2xl bg-gray-800/80 p-6 rounded-lg border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/30"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-cyan-500 mx-auto mb-4" />
          Загрузка...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
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
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500 tracking-tight">
            Система лояльности
          </h2>
          <p className="text-lg text-gray-300 mt-2">Получайте скидки и бонусы за выполнение квестов и приглашение друзей!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTutorial(true)}
            className="mt-4 px-4 py-2 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600/80 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 shadow-sm mx-auto"
          >
            <InformationCircleIcon className="w-5 h-5" />
            Пройти обучение
          </motion.button>
        </motion.header>
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-4 bg-red-500/30 border border-red-500/50 rounded-lg text-red-300 text-center text-base font-medium shadow-md"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Discounts Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl shadow-lg border border-cyan-500/30 p-8 flex flex-wrap gap-8 justify-center relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
              backgroundRepeat: 'repeat',
            }}
          />
          {/* Total Discount with Breakdown */}
          <StatCard className="relative">
            <div className="relative w-64 h-64 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#444"
                  strokeWidth="3"
                />
                <motion.path
                  strokeDasharray={`${userData.discountPercent}, 100`}
                  strokeDashoffset={0}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: userData.discountPercent / 100 }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                />
                <motion.path
                  strokeDasharray={`${userData.temporaryDiscountPercent || 0}, 100`}
                  strokeDashoffset={-userData.discountPercent}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: (userData.temporaryDiscountPercent || 0) / 100 }}
                  transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-5xl font-extrabold text-white drop-shadow-md">{userData.totalDiscount}%</p>
                <p className="text-base font-medium text-gray-300 mt-2">Общая скидка</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col items-center gap-2">
              <p className="text-sm font-medium text-gray-300 tracking-wide">
                Постоянная: {userData.discountPercent}% (Действует бессрочно)
              </p>
              <p className="text-sm font-medium text-gray-300 tracking-wide">
                Временная: {userData.temporaryDiscountPercent || 0}%
                {userData.temporaryDiscountExpired ? '' : ' (Нет активной скидки)'}
              </p>
            </div>
          </StatCard>
          {/* Warning Message for Temporary Discount Expiration */}
          {userData.temporaryDiscountPercent > 0 && userData.temporaryDiscountExpired && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="w-full max-w-md bg-gradient-to-r from-red-600/80 to-orange-600/80 rounded-lg p-4 text-center border border-red-500/50 shadow-lg hover:shadow-red-500/50"
            >
              <p className="text-white font-semibold text-sm">
                Временная скидка истекает через: {getTimeRemaining(userData.temporaryDiscountExpired)}
              </p>
              <p className="text-white text-xs mt-2">
                Внимание: все достижения в квестах обнулятся при истечении временной скидки!
              </p>
            </motion.div>
          )}
        </motion.section>
        {/* Quests Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12 bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl shadow-lg border border-cyan-500/30 p-8 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
              backgroundRepeat: 'repeat',
            }}
          />
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-cyan-400">Квесты</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowIncompleteOnly(!showIncompleteOnly)}
              className="px-4 py-2 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600/80 transition duration-300 text-base font-semibold shadow-sm"
            >
              {showIncompleteOnly ? 'Показать все' : 'Только незавершенные'}
            </motion.button>
          </div>
          <div className="flex flex-col space-y-4 pt-6">
            {questList}
          </div>
        </motion.section>
        {/* Referral Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-12 bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl shadow-lg border border-cyan-500/30 p-8 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
              backgroundRepeat: 'repeat',
            }}
          />
          <h3 className="text-2xl font-bold text-cyan-400 mb-6">Приглашайте друзей</h3>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              value={referralCodeActivate}
              onChange={e => setReferralCodeActivate(e.target.value)}
              placeholder="Введите реферальный код"
              className="flex-grow p-3 bg-gray-800/80 text-white border border-cyan-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleActivateReferral}
              className="px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold shadow-sm"
            >
              Активировать
            </motion.button>
          </div>
          {userData.referralCode && (
            <div className="text-center">
              <p className="text-lg text-gray-300 mb-2">Ваш реферальный код:</p>
              <div className="flex items-center justify-center gap-4">
                <p className="text-xl font-mono text-cyan-400 bg-gray-800/80 px-4 py-2 rounded-lg border border-cyan-500/30">
                  {userData.referralCode}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyReferralCode}
                  className="px-4 py-2 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600/80 transition duration-300 text-base font-semibold shadow-sm"
                >
                  {copied ? 'Скопировано!' : 'Копировать'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={shareReferralCode}
                  className="px-4 py-2 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600/80 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShareIcon className="w-5 h-5" />
                  Поделиться
                </motion.button>
              </div>
              <p className="text-sm text-gray-300 mt-2">
                Поделитесь кодом с друзьями, чтобы они получили бонусы при регистрации!
              </p>
            </div>
          )}
        </motion.section>
        {/* Rewards History Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mb-12 bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl shadow-lg border border-cyan-500/30 p-8 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
              backgroundRepeat: 'repeat',
            }}
          />
          <h3 className="text-2xl font-bold text-cyan-400 mb-6">История наград</h3>
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-800/80">
                  <th className="px-4 py-2 text-left text-gray-300">Квест</th>
                  <th className="px-4 py-2 text-left text-gray-300">Награда</th>
                </tr>
              </thead>
              <tbody>
                {quests.filter(quest => quest.completed).map(quest => (
                  <tr key={quest.id} className="border-b border-gray-600">
                    <td className="px-4 py-2 text-gray-300">{quest.name}</td>
                    <td className="px-4 py-2 text-gray-300">+{quest.reward}% ({getRewardTypeLabel(quest.rewardType)})</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {quests.filter(quest => quest.completed).length === 0 && (
              <p className="text-center text-gray-300 mt-4">Нет выполненных квестов.</p>
            )}
          </div>
        </motion.section>
        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="mb-12 bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl shadow-lg border border-cyan-500/30 p-8 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
              backgroundRepeat: 'repeat',
            }}
          />
          <h3 className="text-2xl font-bold text-cyan-400 mb-6">Часто задаваемые вопросы</h3>
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <FaqItem
                key={index}
                faq={faq}
                index={index}
                isOpen={faqOpenIndex === index}
                toggle={toggleFaq}
              />
            ))}
          </div>
        </motion.section>
        {/* Tutorial Modal */}
        <AnimatePresence>
          {showTutorial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 rounded-2xl p-8 max-w-lg w-[90%] max-h-[80vh] overflow-y-auto border border-cyan-500/30 shadow-lg"
              >
                <h3 className="text-2xl font-semibold text-cyan-400 mb-4">Добро пожаловать в систему лояльности!</h3>
                <p className="text-gray-300 mb-4">1. <strong>Скидки:</strong> Просматривайте свои текущие постоянные и временные скидки.</p>
                <p className="text-gray-300 mb-4">2. <strong>Квесты:</strong> Выполняйте задания, чтобы получить постоянные или временные скидки.</p>
                <p className="text-gray-300 mb-4">3. <strong>Рефералы:</strong> Приглашайте друзей с помощью вашего уникального кода и получайте бонусы.</p>
                <p className="text-gray-300 mb-4">4. <strong>История:</strong> Следите за своими наградами в разделе истории.</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTutorial(false)}
                  className="w-full py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold shadow-sm"
                >
                  Понятно
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Quest Details Modal */}
        <AnimatePresence>
          {selectedQuest && (
            <QuestDetailsModal
              quest={selectedQuest}
              getQuestName={getQuestName}
              getRewardTypeLabel={getRewardTypeLabel}
              onClose={handleCloseQuestDetails}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoyaltyTab;