import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CurrencyDollarIcon, QuestionMarkCircleIcon, ChevronDownIcon, EnvelopeIcon, PhoneIcon, ShoppingCartIcon, DocumentCheckIcon, UserIcon } from '@heroicons/react/24/solid';
import Tilt from 'react-parallax-tilt';

// Append global styles
const styles = `
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-down {
    animation: fadeInDown 0.6s ease-out;
  }
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  .animate-pulse {
    animation: pulse 2s infinite;
  }
  .circle-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 500px;
    position: relative;
  }
  .circle-left, .circle-right {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }
  .circle-left {
    left: 0;
    right: 50%;
    display: flex;
    justify-content: center;
  }
  .circle-right {
    left: 50%;
    right: 0;
    display: flex;
    justify-content: center;
  }
  @media (max-width: 767px) {
    .circle-container {
      flex-direction: column;
      height: auto;
      gap: 32px;
      padding: 32px 0;
    }
    .circle-left, .circle-right {
      position: static;
      transform: none;
      width: 100%;
      display: flex;
      justify-content: center;
    }
  }
  .text-shadow-[0_2px_4px_rgba(0,0,0,0.5)] {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }
  .filter {
    filter: drop-shadow(0 0 10px rgba(6, 182, 212, 0.5));
  }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

/**
 * HeroSection component for the Rates page
 * Displays a glassmorphism banner with SVG overlay
 */
const HeroSection = () => {
  const title = 'Курс и стоимость доставки';
  const subtitle = 'Актуальные данные для ваших заказов из Китая в Беларусь';

  return (
    <div className="relative bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 sm:p-8 md:p-12 mb-8 sm:mb-12 rounded-2xl shadow-lg border border-cyan-500/30">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
          backgroundRepeat: 'repeat',
        }}
      />
      <div className="relative text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500 tracking-tight animate-fade-in-down">
          {title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-300 mt-2">{subtitle}</p>
      </div>
    </div>
  );
};

/**
 * CircularRateDisplay component for displaying rates in circular design
 * @param {string} title - Circle title
 * @param {string} rateText - Rate text to display in circle
 * @param {string} borderColor - Tailwind border color class
 * @param {string} bgGradient - Tailwind gradient classes
 */
const CircularRateDisplay = ({ title, rateText, borderColor, bgGradient }) => (
  <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
    <div className="flex flex-col items-center">
      <div
        className={`w-48 h-48 sm:w-64 sm:h-64 rounded-full ${bgGradient} border-2 ${borderColor} shadow-2xl filter drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] flex items-center justify-center relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[10px]"></div>
        <p className="relative text-white font-bold text-xl sm:text-2xl md:text-3xl text-shadow-[0_2px_4px_rgba(0,0,0,0.5)] text-center px-4">
          {rateText}
        </p>
      </div>
      <h3 className="mt-4 text-base sm:text-lg md:text-xl font-semibold text-white">{title}</h3>
    </div>
  </Tilt>
);

/**
 * InfoCard component for additional information
 * @param {string} title - Card title
 * @param {string} content - Card content
 * @param {string} color - Tailwind text color class
 */
const InfoCard = ({ title, content, color }) => (
  <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
    <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-5 sm:p-6 rounded-2xl border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/40 transition-shadow duration-300">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
          backgroundRepeat: 'repeat',
        }}
      />
      <h4 className={`text-lg sm:text-xl font-semibold ${color} mb-3`}>{title}</h4>
      <p className="text-gray-300 text-sm sm:text-base">{content}</p>
    </div>
  </Tilt>
);

/**
 * FAQItem component for collapsible FAQ entries
 * @param {string} question - FAQ question
 * @param {string} answer - FAQ answer
 * @param {number} index - Index for unique keys
 */
const FAQItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-4 sm:p-5 rounded-2xl border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/40 transition-shadow duration-300">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
            backgroundRepeat: 'repeat',
          }}
        />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left flex items-center justify-between"
        >
          <h4 className="text-base sm:text-lg font-medium text-cyan-400">{question}</h4>
          <ChevronDownIcon
            className={`w-5 h-5 text-cyan-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 text-sm sm:text-base text-gray-300"
            >
              {answer}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Tilt>
  );
};

/**
 * CallToAction component for navigation buttons
 */
const CallToAction = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-8 rounded-2xl shadow-lg border border-cyan-500/30 hover:shadow-cyan-500/40 transition-shadow duration-300 text-center">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
            backgroundRepeat: 'repeat',
          }}
        />
        <h2 className="text-3xl font-bold text-cyan-400 mb-4">Готовы начать?</h2>
        <p className="text-gray-300 mb-6 text-base">
          Оформите заказ, проверьте актуальные курсы или отслеживайте доставку в профиле.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/catalog')}
            className={`animate-pulse bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 ${isActive('/catalog') ? 'ring-2 ring-offset-2 ring-cyan-500' : ''}`}
            aria-label="Перейти в Каталог"
          >
            <ShoppingCartIcon className="w-6 h-6" />
            Каталог
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/terminal')}
            className={`animate-pulse bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 ${isActive('/terminal') ? 'ring-2 ring-offset-2 ring-cyan-500' : ''}`}
            aria-label="Перейти в Терминал"
          >
            <DocumentCheckIcon className="w-6 h-6" />
            Терминал
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile')}
            className={`animate-pulse bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 ${isActive('/profile') ? 'ring-2 ring-offset-2 ring-cyan-500' : ''}`}
            aria-label="Перейти в Профиль"
          >
            <UserIcon className="w-6 h-6" />
            Профиль
          </motion.button>
        </div>
      </div>
    </Tilt>
  );
};

/**
 * Footer component for the Rates page
 */
const Footer = () => (
  <div className="mt-12 sm:mt-16 text-center text-gray-300">
    <div
      className="absolute inset-0 opacity-10 pointer-events-none"
      style={{
        backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
        backgroundRepeat: 'repeat',
      }}
    />
    <p className="text-sm sm:text-base mb-4">
      Fluvion — ваш надежный партнер для доставки из Китая
    </p>
    <div className="flex justify-center gap-4">
      <a href="/contact" className="text-cyan-400 hover:text-cyan-200 transition-colors duration-300">
        <EnvelopeIcon className="w-6 h-6" />
      </a>
      <a href="/contact" className="text-cyan-400 hover:text-cyan-200 transition-colors duration-300">
        <PhoneIcon className="w-6 h-6" />
      </a>
    </div>
  </div>
);

/**
 * Main Rate component as a full page
 */
function Rate() {
  const faqs = [
    {
      question: 'Как часто обновляется курс обмена?',
      answer: 'Курс обмена обновляется ежедневно на основе рыночных данных. Проверяйте страницу для актуальной информации.',
    },
    {
      question: 'Почему ваш курс конкурентный?',
      answer: 'Мы сотрудничаем с надежными партнерами и оптимизируем процессы, чтобы предложить вам лучшие условия обмена.',
    },
    {
      question: 'От чего зависит стоимость доставки?',
      answer: 'Стоимость доставки определяется весом груза, типом доставки и дополнительными услугами, такими как страховка.',
    },
    {
      question: 'Могу ли я получить скидку на доставку?',
      answer: 'Скидки доступны через нашу систему лояльности. Подробности в личном кабинете.',
    },
    {
      question: 'Как отслеживать изменения курса?',
      answer: 'Подпишитесь на наши уведомления в личном кабинете, чтобы получать обновления о курсе.',
    },
    {
      question: 'Что делать, если курс изменился после заказа?',
      answer: 'Курс фиксируется на момент оформления заказа, так что изменения не повлияют на ваш заказ.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
          backgroundRepeat: 'repeat',
        }}
      />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3">
            <CurrencyDollarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400 filter" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500 tracking-tight animate-fade-in-down">
              Курс и стоимость
            </h2>
          </div>
        </motion.header>

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <HeroSection />
        </motion.section>

        {/* Circular Rate Displays */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="circle-container mb-12"
        >
          <div className="circle-left">
            <CircularRateDisplay
              title="Текущий курс обмена"
              rateText="1 CNY = 0.45 BYN"
              borderColor="border-cyan-500/30"
              bgGradient="bg-gradient-to-r from-cyan-600/50 to-cyan-900/50"
            />
          </div>
          <div className="circle-right">
            <CircularRateDisplay
              title="Стоимость доставки"
              rateText="$6 за 1 кг"
              borderColor="border-orange-500/30"
              bgGradient="bg-gradient-to-r from-orange-600/50 to-orange-900/50"
            />
          </div>
        </motion.section>

        {/* Info Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <div className="mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500 text-center">
              Почему выбирают нас?
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <InfoCard
              title="Конкурентные курсы"
              content="Наши курсы обмена CNY/BYN основаны на актуальных рыночных данных, обеспечивая вам лучшие условия."
              color="text-cyan-400"
            />
            <InfoCard
              title="Прозрачная доставка"
              content="Фиксированная стоимость доставки без скрытых комиссий помогает легко планировать расходы."
              color="text-orange-400"
            />
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-12"
        >
          <div className="mb-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500 flex items-center justify-center">
              <QuestionMarkCircleIcon className="w-6 h-6 mr-2 filter" />
              Часто задаваемые вопросы
            </h3>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                index={index}
              />
            ))}
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-12"
        >
          <CallToAction />
        </motion.section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default Rate;