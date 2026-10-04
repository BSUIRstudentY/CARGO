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
import { Button } from './ui/Button';

// Utility function to format expiration date in Russian locale
const _formatExpirationDate = (date) => {
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
  <div className={`flex-1 min-w-[250px] p-8 text-center rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 ${className}`}>
    {children}
  </div>
);

// Component for individual quest cards
const QuestCard = ({ quest, onShowDetails }) => {
  const _playClickSound = () => {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    oscillator.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
  };

  const isPermanent = quest.rewardType === 'PERMANENT';
  const _rewardIcon = isPermanent ? StarIcon : ClockIcon;

  return (
    <motion.div
      onClick={() => onShowDetails(quest)}
      className={`w-full max-w-md h-20 rounded-2xl bg-[rgba(255,255,255,0.02)] border ${isPermanent ? 'border-[rgba(234,179,8,0.3)]' : 'border-[rgba(255,255,255,0.1)]'} hover:border-[#00f0ff]/50 hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 relative overflow-hidden cursor-pointer ${isPermanent ? 'ring-2 ring-[rgba(234,179,8,0.2)]' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
        <div className="flex flex-row items-center h-full gap-4 p-4">
          <GiftIcon className={`w-6 h-6 ${isPermanent ? 'text-yellow-400' : 'text-[#00f0ff]'}`} />
          <div className="flex-1">
            <p className="text-sm text-[#9ca3af]">
              Прогресс: <span className="font-medium text-[#e5e7eb]">{quest.currentValue}/{quest.targetValue}</span>
            </p>
          </div>
          <div className="w-24 bg-[rgba(255,255,255,0.1)] rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(quest.currentValue / quest.targetValue) * 100}%` }}
              transition={{ duration: 1, ease: 'easeInOut' }}
            />
          </div>
          {quest.completed && <CheckCircleIcon className="absolute top-3 right-12 w-6 h-6 text-[#10b981]" />}
          <div
            className={`px-4 py-1 rounded-lg text-sm ${quest.completed ? 'bg-[rgba(16,185,129,0.15)] text-[#10b981] border border-[rgba(16,185,129,0.3)]' : 'bg-[rgba(255,255,255,0.1)] text-[#9ca3af]'} ${isPermanent ? 'ring-1 ring-yellow-400/30' : ''}`}
          >
            {quest.completed ? 'Забрано автоматически' : 'Не завершено'}
          </div>
        </div>
        {isPermanent && (
          <div className="absolute top-2 left-2 bg-[rgba(234,179,8,0.9)] text-[#1f2937] px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            Редкий
          </div>
        )}
      </motion.div>
  );
};

// Component for quest details modal — С КНОПКОЙ TELEGRAM
const QuestDetailsModal = ({ quest, getQuestName, getRewardTypeLabel, onClose }) => {
  const isPermanent = quest.rewardType === 'PERMANENT';
  const RewardIcon = isPermanent ? StarIcon : ClockIcon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
        className="bg-[rgba(31,41,55,0.95)] backdrop-blur-xl rounded-3xl p-4 sm:p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar border border-[rgba(255,255,255,0.1)] shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative z-10">
          {/* Заголовок с кнопкой закрытия */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent flex-1 break-words pr-2">
              {getQuestName(quest.questConditionType, quest.targetValue)}
            </h3>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className={`p-2 rounded-full bg-[rgba(255,255,255,0.1)] backdrop-blur-sm ${isPermanent ? 'ring-2 ring-yellow-400/30' : 'ring-2 ring-[#00f0ff]/30'}`}>
                <RewardIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${isPermanent ? 'text-yellow-400' : 'text-[#00f0ff]'}`} />
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] transition-colors"
                aria-label="Закрыть"
              >
                <svg className="w-5 h-5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6 text-[#9ca3af] text-sm sm:text-base">
            {/* Описание */}
            <div className="bg-[rgba(255,255,255,0.02)] rounded-2xl p-3 sm:p-4 border border-[rgba(255,255,255,0.1)] backdrop-blur-sm">
              <p className="font-medium mb-2 sm:mb-3 text-[#e5e7eb] flex items-center gap-2 text-sm sm:text-base">
                <GiftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#00f0ff] flex-shrink-0" />
                Описание
              </p>
              <p className="leading-relaxed whitespace-pre-wrap break-words text-sm sm:text-base">
                {quest.description || 'Описание отсутствует.'}
              </p>
            </div>

            {/* КНОПКА ПОДПИСКИ НА БОТА */}
            {quest.questConditionType === 'TELEGRAM' && (
              <motion.a
                href="https://web.telegram.org/k/#@fluvion_bot"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-base font-semibold font-sans shadow-lg transition-all duration-300"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.037.472 0 .161-.003.36-.01.565l-.156 2.5c-.132.71-.48 1.37-1.088 1.91-.67.59-1.55.93-2.43.93-.822 0-1.61-.21-2.33-.63-.74-.42-1.32-1.04-1.63-1.79-.31-.75-.42-1.6-.31-2.4.11-.8.5-1.5 1.12-1.97.37-.29.82-.45 1.28-.48.92-.06 1.52.05 1.85.33.3.27.53.63.66.99.13.36.17.75.17 1.15 0 .39-.04.77-.12 1.13-.08.36-.23.7-.42 1-.19.3-.43.55-.7.76-.27.21-.58.37-.91.48-.33.11-.68.15-1.03.12-.35-.03-.68-.15-.97-.34-.29-.19-.52-.45-.67-.77-.15-.32-.22-.68-.22-1.05 0-.38.07-.75.21-1.1.14-.35.36-.66.64-.92.28-.26.61-.46 1-.59.39-.13.81-.19 1.25-.19.44 0 .86.06 1.25.18.39.12.73.3 1.02.54.29.24.51.54.65.88.14.34.21.7.21 1.07 0 .37-.07.73-.21 1.07-.14.34-.36.64-.65.88-.29.24-.64.42-1.04.54-.4.12-.82.18-1.26.18-.44 0-.86-.06-1.25-.18-.39-.12-.73-.3-1.02-.54-.29-.24-.51-.54-.65-.88-.14-.34-.21-.7-.21-1.07 0-.37.07-.73.21-1.07.14-.34.36-.64.65-.88.29-.24.64-.42 1.04-.54.4-.12.82-.18 1.26-.18z"/>
                </svg>
                <span className="truncate">Подписаться на @fluvion_bot</span>
              </motion.a>
            )}

            {/* Информация о квесте */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 p-3 sm:p-4 bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[rgba(255,255,255,0.1)] backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 py-2">
                <span className="font-medium text-[#e5e7eb] text-sm sm:text-base">Награда:</span>
                <span className={`text-base sm:text-lg font-bold break-words ${isPermanent ? 'text-yellow-400' : 'text-[#00f0ff]'}`}>
                  +{quest.reward}% {getRewardTypeLabel(quest.rewardType)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 py-2">
                <span className="font-medium text-[#e5e7eb] text-sm sm:text-base">Прогресс:</span>
                <span className="text-base sm:text-lg text-[#00f0ff] font-bold">{quest.currentValue}/{quest.targetValue}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 py-2">
                <span className="font-medium text-[#e5e7eb] text-sm sm:text-base">Статус:</span>
                <span className={`text-sm sm:text-base font-medium break-words ${quest.completed ? 'text-[#10b981] font-bold' : 'text-yellow-400'}`}>
                  {quest.completed ? 'Выполнен (автоматически забрано)' : 'В процессе'}
                </span>
              </div>
              {isPermanent && (
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 py-2 pt-3 border-t border-[rgba(255,255,255,0.1)]">
                  <span className="font-medium text-yellow-400 text-sm sm:text-base">Особенность:</span>
                  <span className="text-sm sm:text-base text-yellow-400 font-bold italic break-words text-right sm:text-left">
                    Постоянная скидка — действует бессрочно!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Кнопка закрытия */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full mt-6 sm:mt-8 py-2.5 sm:py-3 bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] text-white rounded-2xl hover:opacity-90 transition-all duration-300 text-sm sm:text-base font-semibold shadow-xl"
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
  <motion.div
    className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 relative overflow-hidden"
    whileHover={{ y: -5, scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
  >
    <motion.button
      animate={{ backgroundColor: isOpen ? 'rgba(255,255,255,0.04)' : 'rgba(0, 0, 0, 0)' }}
      transition={{ duration: 0.3 }}
      onClick={() => toggle(index)}
      className="flex justify-between items-center w-full p-4 rounded-lg cursor-pointer transition-colors"
    >
      <span className="text-lg text-[#e5e7eb] font-medium">{faq.question}</span>
      <ChevronDownIcon className={`w-5 h-5 text-[#9ca3af] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
          <p className="text-[#9ca3af] text-base">{faq.answer}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
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
        if (error.response?.status === 401 || error.response?.status === 403) {
          setError('Пожалуйста, войдите в систему для просмотра статуса лояльности');
        } else if (error.response?.status === 500) {
          setError('Сервер временно недоступен. Пожалуйста, попробуйте позже.');
        } else {
          setError(error.response?.data?.message || 'Ошибка загрузки данных');
        }
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) fetchData();
  }, [user?.email, getQuestName]);

  // Handle referral code activation
  const handleActivateReferral = async () => {
    try {
      const _response = await api.post('/loyalty/activate-referral', null, { params: { referralCode: referralCodeActivate } });
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
      <div className="flex items-center justify-center h-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-[#00f0ff] text-2xl bg-[rgba(255,255,255,0.02)] p-6 rounded-2xl border border-[rgba(255,255,255,0.1)] animate-pulse"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-[#00f0ff] mx-auto mb-4" />
          Загрузка...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent flex items-center gap-3">
          <GiftIcon className="w-8 h-8 text-[#00f0ff]" />
          Система лояльности
        </h2>
        <Button
          onClick={() => setShowTutorial(true)}
          className="bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] flex items-center gap-2"
        >
          <InformationCircleIcon className="w-5 h-5" />
          Обучение
        </Button>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} transition={{ duration: 0.3 }}
              className="mb-8 p-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-2xl text-[#ef4444] text-center text-base font-medium"
            >
              {error}
            </motion.div>
          )}
      </AnimatePresence>

      {/* Discounts Section */}
      <motion.section initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-6">
          <motion.div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 relative overflow-hidden p-8"
            whileHover={{ y: -5, scale: 1.01 }} whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center mb-4">
              <GiftIcon className="w-8 h-8 text-[#00f0ff] mr-2" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">Ваши скидки</h3>
            </div>
              <StatCard className="relative">
                <div className="relative w-64 h-64 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <motion.path strokeDasharray={`${userData.discountPercent}, 100`} strokeDashoffset={0}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="#00f0ff" strokeWidth="3"
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
                    <p className="text-5xl font-extrabold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent drop-shadow-md">{userData.totalDiscount}%</p>
                    <p className="text-base font-medium text-[#9ca3af] mt-2">Общая скидка</p>
                  </div>
                </div>
                <div className="mt-6 flex flex-col items-center gap-2">
                  <p className="text-sm font-medium text-[#9ca3af] tracking-wide">
                    Постоянная: {userData.discountPercent}% (Действует бессрочно)
                  </p>
                  <p className="text-sm font-medium text-[#9ca3af] tracking-wide">
                    Временная: {userData.temporaryDiscountPercent || 0}%
                    {userData.temporaryDiscountExpired ? '' : ' (Нет активной скидки)'}
                  </p>
                </div>
              </StatCard>
              {userData.temporaryDiscountPercent > 0 && userData.temporaryDiscountExpired && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                  className="w-full max-w-md bg-[rgba(239,68,68,0.1)] rounded-2xl p-4 text-center border border-[rgba(239,68,68,0.3)] hover:border-[rgba(239,68,68,0.5)] mt-6"
                >
                  <p className="text-[#e5e7eb] font-semibold text-sm">
                    Временная скидка истекает через: {getTimeRemaining(userData.temporaryDiscountExpired)}
                  </p>
                  <p className="text-[#9ca3af] text-xs mt-2">
                    Внимание: все достижения в квестах обнулятся при истечении временной скидки!
                  </p>
                </motion.div>
              )}
            </motion.div>
      </motion.section>

      {/* Quests Section */}
      <motion.section initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="mb-6">
          <motion.div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 relative overflow-hidden p-8"
            whileHover={{ y: -5, scale: 1.01 }} whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center mb-4">
              <GiftIcon className="w-8 h-8 text-[#00f0ff] mr-2" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">Квесты</h3>
            </div>
            <div className="flex justify-end mb-6">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowIncompleteOnly(!showIncompleteOnly)}
                className="px-4 py-2 bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] rounded-lg hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] transition duration-300 text-base font-semibold"
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
                    <h4 className="text-xl font-semibold text-[#00f0ff] mb-4 flex items-center gap-2">
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
                  <p className="text-center text-[#9ca3af] text-lg">Нет доступных квестов</p>
                )}
              </div>
            </motion.div>
      </motion.section>

      {/* Referral Section */}
      <motion.section initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="mb-6">
          <motion.div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 relative overflow-hidden p-8"
            whileHover={{ y: -5, scale: 1.01 }} whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center mb-4">
              <ShareIcon className="w-8 h-8 text-[#00f0ff] mr-2" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">Приглашайте друзей</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input type="text" value={referralCodeActivate} onChange={e => setReferralCodeActivate(e.target.value)}
                placeholder="Введите реферальный код"
                className="flex-grow p-3 bg-[rgba(107,114,128,0.15)] text-[#e5e7eb] border border-[rgba(255,255,255,0.1)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/30 transition duration-300"
              />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleActivateReferral}
                className="px-6 py-3 bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] rounded-lg hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] transition duration-300 text-base font-semibold"
              >
                Активировать
              </motion.button>
            </div>
            {userData.referralCode && (
              <div className="text-center">
                <p className="text-lg text-[#9ca3af] mb-2">Ваш реферальный код:</p>
                <div className="flex items-center justify-center gap-4">
                  <p className="text-xl font-mono text-[#00f0ff] bg-[rgba(255,255,255,0.02)] px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.1)]">
                    {userData.referralCode}
                  </p>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={copyReferralCode}
                    className="px-4 py-2 bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] rounded-lg hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] transition duration-300 text-base font-semibold"
                  >
                    {copied ? 'Скопировано!' : 'Копировать'}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={shareReferralCode}
                    className="px-4 py-2 bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] rounded-lg hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] transition duration-300 text-base font-semibold flex items-center justify-center gap-2"
                  >
                    <ShareIcon className="w-5 h-5" /> Поделиться
                  </motion.button>
                </div>
                <p className="text-sm text-[#9ca3af] mt-2">Поделитесь кодом с друзьями, чтобы они получили бонусы при регистрации!</p>
              </div>
            )}
          </motion.div>
      </motion.section>

      {/* Rewards History Section */}
      <motion.section initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="mb-6">
          <motion.div className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 relative overflow-hidden p-8"
            whileHover={{ y: -5, scale: 1.01 }} whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center mb-4">
              <ArrowPathIcon className="w-8 h-8 text-[#00f0ff] mr-2" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">История наград</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-[rgba(255,255,255,0.02)]">
                    <th className="px-4 py-2 text-left text-[#9ca3af] font-semibold">Квест</th>
                    <th className="px-4 py-2 text-left text-[#9ca3af] font-semibold">Награда</th>
                  </tr>
                </thead>
                <tbody>
                  {quests.filter(quest => quest.completed).map(quest => (
                    <tr key={quest.id} className="border-b border-[rgba(255,255,255,0.1)]">
                      <td className="px-4 py-2 text-[#e5e7eb]">{quest.name}</td>
                      <td className="px-4 py-2 text-[#e5e7eb]">+{quest.reward}% ({getRewardTypeLabel(quest.rewardType)})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {quests.filter(quest => quest.completed).length === 0 && (
                <p className="text-center text-[#9ca3af] mt-4 text-base">Нет выполненных квестов.</p>
              )}
            </div>
          </motion.div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.0 }} className="mb-6">
          <div className="space-y-4 bg-primary">
            <div className="flex items-center mb-4">
              <InformationCircleIcon className="w-8 h-8 text-[#00f0ff] mr-2" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">Часто задаваемые вопросы</h3>
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
                className="bg-[rgba(31,41,55,0.95)] backdrop-blur-xl rounded-2xl p-8 max-w-lg w-[90%] max-h-[80vh] overflow-y-auto no-scrollbar border border-[rgba(255,255,255,0.1)]"
              >
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent mb-4">Добро пожаловать в систему лояльности!</h3>
                <p className="text-[#9ca3af] mb-4 text-base">1. <strong className="text-[#e5e7eb]">Скидки:</strong> Просматривайте свои текущие постоянные и временные скидки.</p>
                <p className="text-[#9ca3af] mb-4 text-base">2. <strong className="text-[#e5e7eb]">Квесты:</strong> Выполняйте задания, чтобы получить постоянные или временные скидки.</p>
                <p className="text-[#9ca3af] mb-4 text-base">3. <strong className="text-[#e5e7eb]">Рефералы:</strong> Приглашайте друзей с помощью вашего уникального кода и получайте бонусы.</p>
                <p className="text-[#9ca3af] mb-4 text-base">4. <strong className="text-[#e5e7eb]">История:</strong> Следите за своими наградами в разделе истории.</p>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowTutorial(false)}
                  className="w-full py-3 bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] rounded-lg hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] transition duration-300 text-base font-semibold"
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
  );
};

export default LoyaltyTab;