import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from './AuthProvider';
import {
  GiftIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ShareIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  StarIcon,
  ClockIcon,
} from '@heroicons/react/24/solid';
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
  <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
    <motion.div
      className={`flex-1 min-w-[250px] bg-tertiary rounded-2xl p-8 text-center shadow-card border border-primary hover:shadow-accent-primary/40 transition-shadow duration-300 relative overflow-hidden ${className}`}
      whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.div>
  </Tilt>
);

// Component for individual quest cards
const QuestCard = ({ quest, onShowDetails }) => {
  const playClickSound = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    oscillator.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  };

  const isPermanent = quest.rewardType === 'PERMANENT';
  const rewardIcon = isPermanent ? StarIcon : ClockIcon;

  return (
    <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
      <motion.div
        onClick={() => onShowDetails(quest)}
        className={`w-full max-w-md h-20 bg-tertiary rounded-2xl border ${isPermanent ? 'border-yellow-500/50' : 'border-primary'} shadow-card hover:shadow-accent-primary/40 transition-shadow duration-300 relative overflow-hidden cursor-pointer ${isPermanent ? 'ring-2 ring-yellow-500/20' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
        whileTap={{ scale: 0.97 }}
      >
        <div className="flex flex-row items-center h-full gap-4 p-4">
          <GiftIcon className={`w-6 h-6 ${isPermanent ? 'text-yellow-500' : 'text-accent-primary'}`} />
          <div className="flex-1">
            <p className="text-sm text-secondary">
              Прогресс: <span className="font-medium">{quest.currentValue}/{quest.targetValue}</span>
            </p>
          </div>
          <div className="w-24 bg-gray-300/50 rounded-full h-2">
            <motion.div
              className="bg-accent-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(quest.currentValue / quest.targetValue) * 100}%` }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />
          </div>
          {quest.completed && <CheckCircleIcon className="absolute top-3 right-12 w-6 h-6 text-accent-primary" />}
          <div
            className={`px-4 py-1 rounded-lg text-sm font-sans ${quest.completed ? 'bg-accent-primary text-primary' : 'bg-gray-300/50 text-secondary'} ${isPermanent ? 'ring-1 ring-yellow-500/30' : ''}`}
          >
            {quest.completed ? 'Забрано автоматически' : 'Не завершено'}
          </div>
        </div>
        {isPermanent && (
          <div className="absolute top-2 left-2 bg-yellow-500/90 text-primary px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            Редкий
          </div>
        )}
      </motion.div>
    </Tilt>
  );
};

// Component for quest details modal — С КНОПКОЙ TELEGRAM
const QuestDetailsModal = ({ quest, getQuestName, getRewardTypeLabel, onClose }) => {
  const isPermanent = quest.rewardType === 'PERMANENT';
  const rewardIcon = isPermanent ? StarIcon : ClockIcon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
        className="bg-gradient-to-br from-tertiary to-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-[90%] max-h-[80vh] overflow-y-auto no-scrollbar border border-primary/50 shadow-2xl relative"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-accent-primary/5 via-transparent to-transparent rounded-3xl" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl sm:text-2xl font-bold font-display text-primary flex-1">
              {getQuestName(quest.questConditionType, quest.targetValue)}
            </h3>
            <div className={`ml-3 p-2 rounded-full bg-white/10 backdrop-blur-sm ${isPermanent ? 'ring-2 ring-yellow-400/30' : 'ring-2 ring-accent-primary/30'}`}>
              <rewardIcon className={`w-6 h-6 ${isPermanent ? 'text-yellow-400' : 'text-accent-primary'}`} />
            </div>
          </div>
          <div className="space-y-6 text-secondary text-sm sm:text-base">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
              <p className="font-medium mb-3 text-primary flex items-center gap-2">
                <GiftIcon className="w-5 h-5 text-accent-primary" />
                Описание
              </p>
              <p className="leading-relaxed whitespace-pre-wrap">
                {quest.description || 'Описание отсутствует.'}
              </p>
            </div>

            {/* КНОПКА ПОДПИСКИ НА БОТА */}
            {quest.questConditionType === 'TELEGRAM' && (
              <motion.a
                href="https://web.telegram.org/k/#@fluvion_bot"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-2 text-base font-semibold font-sans shadow-lg transition-all duration-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.037.472 0 .161-.003.36-.01.565l-.156 2.5c-.132.71-.48 1.37-1.088 1.91-.67.59-1.55.93-2.43.93-.822 0-1.61-.21-2.33-.63-.74-.42-1.32-1.04-1.63-1.79-.31-.75-.42-1.6-.31-2.4.11-.8.5-1.5 1.12-1.97.37-.29.82-.45 1.28-.48.92-.06 1.52.05 1.85.33.3.27.53.63.66.99.13.36.17.75.17 1.15 0 .39-.04.77-.12 1.13-.08.36-.23.7-.42 1-.19.3-.43.55-.7.76-.27.21-.58.37-.91.48-.33.11-.68.15-1.03.12-.35-.03-.68-.15-.97-.34-.29-.19-.52-.45-.67-.77-.15-.32-.22-.68-.22-1.05 0-.38.07-.75.21-1.1.14-.35.36-.66.64-.92.28-.26.61-.46 1-.59.39-.13.81-.19 1.25-.19.44 0 .86.06 1.25.18.39.12.73.3 1.02.54.29.24.51.54.65.88.14.34.21.7.21 1.07 0 .37-.07.73-.21 1.07-.14.34-.36.64-.65.88-.29.24-.64.42-1.04.54-.4.12-.82.18-1.26.18-.44 0-.86-.06-1.25-.18-.39-.12-.73-.3-1.02-.54-.29-.24-.51-.54-.65-.88-.14-.34-.21-.7-.21-1.07 0-.37.07-.73.21-1.07.14-.34.36-.64.65-.88.29-.24.64-.42 1.04-.54.4-.12.82-.18 1.26-.18z"/>
                </svg>
                Подписаться на @fluvion_bot
              </motion.a>
            )}

            <div className="grid grid-cols-1 gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
              <div className="flex justify-between items-center py-2">
                <span className="font-medium text-primary">Награда:</span>
                <span className={`text-lg font-bold ${isPermanent ? 'text-yellow-400' : 'text-accent-primary'}`}>
                  +{quest.reward}% {getRewardTypeLabel(quest.rewardType)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium text-primary">Прогресс:</span>
                <span className="text-accent-primary font-bold">{quest.currentValue}/{quest.targetValue}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium text-primary">Статус:</span>
                <span className={quest.completed ? 'text-green-400 font-bold' : 'text-yellow-400 font-medium'}>
                  {quest.completed ? 'Выполнен (автоматически забрано)' : 'В процессе'}
                </span>
              </div>
              {isPermanent && (
                <div className="flex justify-between items-center py-2 pt-3 border-t border-white/20">
                  <span className="font-medium text-yellow-400">Особенность:</span>
                  <span className="text-yellow-400 font-bold italic">Постоянная скидка — действует бессрочно!</span>
                </div>
              )}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-full mt-8 py-3 bg-gradient-to-r from-accent-primary to-yellow-500 text-primary rounded-2xl hover:from-accent-primary/90 hover:to-yellow-500/90 transition-all duration-300 text-base font-semibold font-sans shadow-xl font-display"
          >
            Закрыть
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Component for FAQ items
const FaqItem = ({ faq, index, isOpen, toggle }) => (
  <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
    <motion.div
      className="bg-primary rounded-2xl shadow-card border border-primary hover:shadow-accent-primary/40 transition-shadow duration-300 relative overflow-hidden"
      whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.button
        animate={{ backgroundColor: isOpen ? '#374151' : 'bg-primary' }}
        transition={{ duration: 0.3 }}
        onClick={() => toggle(index)}
        className="flex justify-between items-center w-full p-4 rounded-lg cursor-pointer transition-colors"
      >
        <span className="text-lg text-primary font-medium font-display">{faq.question}</span>
        <ChevronDownIcon className={`w-5 h-5 text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 rounded-lg mt-2"
          >
            <p className="text-secondary text-base">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  </Tilt>
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
      case 'TELEGRAM': return `Подпишись на Telegram`;
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

  // Handle showing quest details
  const handleShowQuestDetails = (quest) => {
    setSelectedQuest(quest);
  };

  // Handle closing quest details modal
  const handleCloseQuestDetails = () => {
    setSelectedQuest(null);
  };

  // Memoized quest list rendering with filter and grouping
  const questGroups = useMemo(() => {
    const filteredQuests = showIncompleteOnly ? quests.filter(quest => !quest.completed) : quests;
    const permanentQuests = filteredQuests.filter(quest => quest.rewardType === 'PERMANENT');
    const temporaryQuests = filteredQuests.filter(quest => quest.rewardType === 'TEMPORARY');
    return { permanent: permanentQuests, temporary: temporaryQuests };
  }, [quests, showIncompleteOnly]);

  // Toggle FAQ item
  const toggleFaq = (index) => setFaqOpenIndex(faqOpenIndex === index ? null : index);

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-primary">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-accent-primary text-2xl bg-tertiary p-6 rounded-2xl border border-primary shadow-card hover:shadow-accent-primary/40 animate-pulse"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-accent-primary mx-auto mb-4" />
          Загрузка...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-primary text-primary font-sans py-12 px-4 sm:px-6 lg:px-8 h-[70vh] overflow-y-auto no-scrollbar">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 640px) {
          .mobile-tab-bar { display: flex; overflow-x: auto; padding: 8px 0; margin-bottom: 16px; background: var(--bg-tertiary); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border-primary); }
          .mobile-tab-button { flex: 0 0 auto; padding: 8px 12px; display: flex; align-items: center; justify-content: center; position: relative; }
          .mobile-tab-button.active::after { content: ''; position: absolute; bottom: -2px; left: 8px; right: 8px; height: 2px; background-color: var(--accent-primary); }
          .mobile-content { padding-bottom: 80px; }
          .fab { position: fixed; bottom: 20px; right: 20px; z-index: 50; }
        }
        @media (min-width: 641px) { .mobile-tab-bar, .fab { display: none; } }
      `}</style>

      <div className="max-w-7xl mx-auto max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
        {/* Header Section */}
        <motion.header initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <h2 className="text-4xl font-bold font-display text-accent-primary tracking-tight animate-fade-in-down">
            Система лояльности
          </h2>
          <p className="text-lg text-secondary mt-2">Получайте скидки и бонусы за выполнение квестов и приглашение друзей!</p>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowTutorial(true)}
            className="mt-4 px-4 py-2 bg-accent-primary text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold font-sans flex items-center justify-center gap-2 shadow-card"
          >
            <InformationCircleIcon className="w-5 h-5" /> Пройти обучение
          </motion.button>
        </motion.header>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.3 }}
              className="mb-8 p-4 bg-red-500/30 border border-red-500/50 rounded-2xl text-red-300 text-center text-base font-medium font-sans shadow-card"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Discounts Section */}
        <motion.section initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-12">
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div className="bg-tertiary rounded-2xl shadow-card border border-primary hover:shadow-accent-primary/40 transition-shadow duration-300 relative overflow-hidden p-8"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }} whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center mb-4">
                <GiftIcon className="w-8 h-8 text-accent-primary mr-2" />
                <h3 className="text-2xl font-bold font-display text-accent-primary">Ваши скидки</h3>
              </div>
              <StatCard className="relative">
                <div className="relative w-64 h-64 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <motion.path strokeDasharray={`${userData.discountPercent}, 100`} strokeDashoffset={0}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="#ff2549" strokeWidth="3"
                      initial={{ pathLength: 0 }} animate={{ pathLength: userData.discountPercent / 100 }}
                      transition={{ duration: 1.5, ease: 'easeInOut' }}
                    />
                    <motion.path strokeDasharray={`${userData.temporaryDiscountPercent || 0}, 100`} strokeDashoffset={-userData.discountPercent}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="#6b7280" strokeWidth="3"
                      initial={{ pathLength: 0 }} animate={{ pathLength: (userData.temporaryDiscountPercent || 0) / 100 }}
                      transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-5xl font-extrabold text-primary drop-shadow-md">{userData.totalDiscount}%</p>
                    <p className="text-base font-medium text-secondary mt-2">Общая скидка</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col items-center gap-2">
                  <p className="text-sm font-medium text-secondary tracking-wide">
                    Постоянная: {userData.discountPercent}% (Действует бессрочно)
                  </p>
                  <p className="text-sm font-medium text-secondary tracking-wide">
                    Временная: {userData.temporaryDiscountPercent || 0}%
                    {userData.temporaryDiscountExpired ? '' : ' (Нет активной скидки)'}
                  </p>
                </div>
              </StatCard>
              {userData.temporaryDiscountPercent > 0 && userData.temporaryDiscountExpired && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                  className="w-full max-w-md bg-red-500/30 rounded-2xl p-4 text-center border border-red-500/50 shadow-card hover:shadow-red-500/50 mt-6"
                >
                  <p className="text-primary font-semibold text-sm">
                    Временная скидка истекает через: {getTimeRemaining(userData.temporaryDiscountExpired)}
                  </p>
                  <p className="text-secondary text-xs mt-2">
                    Внимание: все достижения в квестах обнулятся при истечении временной скидки!
                  </p>
                </motion.div>
              )}
            </motion.div>
          </Tilt>
        </motion.section>

        {/* Quests Section */}
        <motion.section initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mb-12">
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div className="bg-tertiary rounded-2xl shadow-card border border-primary hover:shadow-accent-primary/40 transition-shadow duration-300 relative overflow-hidden p-8"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }} whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center mb-4">
                <GiftIcon className="w-8 h-8 text-accent-primary mr-2" />
                <h3 className="text-2xl font-bold font-display text-accent-primary">Квесты</h3>
              </div>
              <div className="flex justify-end mb-6">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowIncompleteOnly(!showIncompleteOnly)}
                  className="px-4 py-2 bg-accent-primary text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold font-sans shadow-card"
                >
                  {showIncompleteOnly ? 'Показать все' : 'Только незавершенные'}
                </motion.button>
              </div>
              <div className="space-y-8">
                {questGroups.permanent.length > 0 && (
                  <div>
                    <h4 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                      <StarIcon className="w-5 h-5" /> Редкие квесты (Постоянная скидка)
                    </h4>
                    <div className="flex flex-col space-y-4">
                      {questGroups.permanent.map(quest => (
                        <QuestCard key={quest.id} quest={quest} onShowDetails={handleShowQuestDetails} />
                      ))}
                    </div>
                  </div>
                )}
                {questGroups.temporary.length > 0 && (
                  <div>
                    <h4 className="text-xl font-semibold text-accent-primary mb-4 flex items-center gap-2">
                      <ClockIcon className="w-5 h-5" /> Обычные квесты (Временная скидка)
                    </h4>
                    <div className="flex flex-col space-y-4">
                      {questGroups.temporary.map(quest => (
                        <QuestCard key={quest.id} quest={quest} onShowDetails={handleShowQuestDetails} />
                      ))}
                    </div>
                  </div>
                )}
                {questGroups.permanent.length === 0 && questGroups.temporary.length === 0 && (
                  <p className="text-center text-secondary text-lg">Нет доступных квестов</p>
                )}
              </div>
            </motion.div>
          </Tilt>
        </motion.section>

        {/* Referral Section */}
        <motion.section initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="mb-12">
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div className="bg-tertiary rounded-2xl shadow-card border border-primary hover:shadow-accent-primary/40 transition-shadow duration-300 relative overflow-hidden p-8"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }} whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center mb-4">
                <ShareIcon className="w-8 h-8 text-accent-primary mr-2" />
                <h3 className="text-2xl font-bold font-display text-accent-primary">Приглашайте друзей</h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <input type="text" value={referralCodeActivate} onChange={e => setReferralCodeActivate(e.target.value)}
                  placeholder="Введите реферальный код"
                  className="flex-grow p-3 bg-tertiary text-primary border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition duration-300"
                />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleActivateReferral}
                  className="px-6 py-3 bg-accent-primary text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold font-sans shadow-card"
                >
                  Активировать
                </motion.button>
              </div>
              {userData.referralCode && (
                <div className="text-center">
                  <p className="text-lg text-secondary mb-2">Ваш реферальный код:</p>
                  <div className="flex items-center justify-center gap-4">
                    <p className="text-xl font-mono text-accent-primary bg-tertiary px-4 py-2 rounded-lg border border-primary">
                      {userData.referralCode}
                    </p>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={copyReferralCode}
                      className="px-4 py-2 bg-accent-primary text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold font-sans shadow-card"
                    >
                      {copied ? 'Скопировано!' : 'Копировать'}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={shareReferralCode}
                      className="px-4 py-2 bg-accent-primary text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold font-sans flex items-center justify-center gap-2 shadow-card"
                    >
                      <ShareIcon className="w-5 h-5" /> Поделиться
                    </motion.button>
                  </div>
                  <p className="text-sm text-secondary mt-2">Поделитесь кодом с друзьями, чтобы они получили бонусы при регистрации!</p>
                </div>
              )}
            </motion.div>
          </Tilt>
        </motion.section>

        {/* Rewards History Section */}
        <motion.section initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="mb-12">
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div className="bg-tertiary rounded-2xl shadow-card border border-primary hover:shadow-accent-primary/40 transition-shadow duration-300 relative overflow-hidden p-8"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }} whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center mb-4">
                <ArrowPathIcon className="w-8 h-8 text-accent-primary mr-2" />
                <h3 className="text-2xl font-bold font-display text-accent-primary">История наград</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-tertiary">
                      <th className="px-4 py-2 text-left text-secondary font-display">Квест</th>
                      <th className="px-4 py-2 text-left text-secondary font-display">Награда</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quests.filter(quest => quest.completed).map(quest => (
                      <tr key={quest.id} className="border-b border-primary/50">
                        <td className="px-4 py-2 text-secondary">{quest.name}</td>
                        <td className="px-4 py-2 text-secondary">+{quest.reward}% ({getRewardTypeLabel(quest.rewardType)})</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {quests.filter(quest => quest.completed).length === 0 && (
                  <p className="text-center text-secondary mt-4 text-base">Нет выполненных квестов.</p>
                )}
              </div>
            </motion.div>
          </Tilt>
        </motion.section>

        {/* FAQ Section */}
        <motion.section initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.0 }} className="mb-12">
          <div className="space-y-4 bg-primary">
            <div className="flex items-center mb-4">
              <InformationCircleIcon className="w-8 h-8 text-accent-primary mr-2" />
              <h3 className="text-2xl font-bold font-display text-accent-primary">Часто задаваемые вопросы</h3>
            </div>
            {faqData.map((faq, index) => (
              <FaqItem key={index} faq={faq} index={index} isOpen={faqOpenIndex === index} toggle={toggleFaq} />
            ))}
          </div>
        </motion.section>

        {/* Tutorial Modal */}
        <AnimatePresence>
          {showTutorial && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000]"
            >
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.3 }}
                className="bg-tertiary rounded-2xl p-8 max-w-lg w-[90%] max-h-[80vh] overflow-y-auto no-scrollbar border border-primary shadow-card"
              >
                <h3 className="text-2xl font-bold font-display text-accent-primary mb-4">Добро пожаловать в систему лояльности!</h3>
                <p className="text-secondary mb-4 text-base">1. <strong>Скидки:</strong> Просматривайте свои текущие постоянные и временные скидки.</p>
                <p className="text-secondary mb-4 text-base">2. <strong>Квесты:</strong> Выполняйте задания, чтобы получить постоянные или временные скидки.</p>
                <p className="text-secondary mb-4 text-base">3. <strong>Рефералы:</strong> Приглашайте друзей с помощью вашего уникального кода и получайте бонусы.</p>
                <p className="text-secondary mb-4 text-base">4. <strong>История:</strong> Следите за своими наградами в разделе истории.</p>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowTutorial(false)}
                  className="w-full py-3 bg-accent-primary text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold font-sans shadow-card"
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