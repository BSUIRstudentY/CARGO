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
    gap: 32px;
    padding: 0 16px;
  }
  .circle-left, .circle-right {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  @media (max-width: 1024px) {
    .circle-container {
      flex-direction: column;
      height: auto;
      padding: 32px 0;
    }
    .circle-left, .circle-right {
      width: 100%;
    }
  }
  .circle-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1px;
    border-radius: 9999px;
    position: relative;
    overflow: hidden;
  }
  .circle-wrap:before {
    content: "";
    position: absolute;
    display: block;
    background: linear-gradient(340deg, var(--bg-primary, rgb(8, 8, 8)) 0%, var(--accent-primary, rgb(255, 37, 73)) 50%, var(--bg-primary, rgb(8, 8, 8)) 80%);
    width: 100%;
    height: 110%;
    z-index: 1;
  }
  .circle-wrap:nth-child(3n):before {
    background: linear-gradient(-45deg, var(--bg-primary, rgb(8, 8, 8)) 20%, var(--accent-primary, rgb(255, 37, 73)) 50%, var(--bg-primary, rgb(8, 8, 8)) 80%);
  }
  .circle-wrap:hover:before {
    animation: rotate-gradient linear 5s normal infinite;
  }
  @keyframes rotate-gradient {
    0% { transform: rotate(0deg); width: 100%; }
    50% { transform: rotate(180deg); width: 200%; }
    100% { transform: rotate(360deg); width: 100%; }
  }
  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

/**
 * HeroSection component for the Rates page
 */
const HeroSection = () => {
  const title = 'Курс и стоимость доставки';
  const subtitle = 'Актуальные данные для ваших заказов из Китая в Беларусь';

  return (
    <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000}>
      <div className="relative bg-black p-6 sm:p-8 md:p-12 mb-8 sm:mb-12 rounded-2xl border border-accent-primary/30 shadow-card hover:shadow-card-hover mx-auto max-w-4xl">
        <div className="relative text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-accent-primary tracking-tight animate-fade-in-down">
            {title}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-text-secondary mt-2">{subtitle}</p>
        </div>
      </div>
    </Tilt>
  );
};

/**
 * CircularRateDisplay component for displaying rates in circular design
 * @param {string} title - Circle title
 * @param {string} rateText - Rate text to display in circle
 */
const CircularRateDisplay = ({ title, rateText }) => (
  <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000}>
    <div className="flex flex-col items-center">
      <div className="circle-wrap w-48 h-48 sm:w-64 sm:h-64">
        <div className="relative w-full h-full rounded-full bg-black border-2 border-border-primary shadow-card hover:shadow-card-hover flex items-center justify-center z-10">
          <p className="text-text-primary font-bold text-xl sm:text-2xl md:text-3xl text-shadow text-center px-4">
            {rateText}
          </p>
        </div>
      </div>
      <h3 className="mt-4 text-base sm:text-lg md:text-xl font-semibold text-text-primary">{title}</h3>
    </div>
  </Tilt>
);

/**
 * InfoCard component for additional information
 * @param {string} title - Card title
 * @param {string} content - Card content
 */
const InfoCard = ({ title, content }) => (
  <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000}>
    <div className="bg-black p-5 sm:p-6 rounded-2xl border border-accent-primary/30 shadow-card hover:shadow-card-hover transition-shadow duration-300">
      <h4 className="text-lg sm:text-xl font-semibold text-accent-primary mb-3">{title}</h4>
      <p className="text-text-secondary text-sm sm:text-base">{content}</p>
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
    <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000}>
      <div className="bg-black p-4 sm:p-5 rounded-2xl border border-accent-primary/30 shadow-card hover:shadow-card-hover transition-shadow duration-300">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left flex items-center justify-between"
        >
          <h4 className="text-base sm:text-lg font-medium text-accent-primary">{question}</h4>
          <ChevronDownIcon
            className={`w-5 h-5 text-accent-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 text-sm sm:text-base text-text-secondary"
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
    <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000}>
      <div className="bg-black p-8 rounded-2xl border border-accent-primary/30 shadow-card hover:shadow-card-hover transition-shadow duration-300 text-center mx-auto max-w-4xl">
        <h2 className="text-3xl font-bold text-accent-primary mb-4">Готовы начать?</h2>
        <p className="text-text-secondary mb-6 text-base">
          Оформите заказ, проверьте актуальные курсы или отслеживайте доставку в профиле.
        </p>
        <div className="flex flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/catalog')}
            className={`animate-pulse w-1/2 bg-accent-primary text-text-primary px-6 py-3 rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 ${isActive('/catalog') ? 'ring-2 ring-offset-2 ring-accent-primary' : ''}`}
            aria-label="Перейти в Каталог"
          >
            <ShoppingCartIcon className="w-6 h-6" />
            Каталог
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/terminal')}
            className={`animate-pulse w-1/2 bg-accent-primary text-text-primary px-6 py-3 rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 ${isActive('/terminal') ? 'ring-2 ring-offset-2 ring-accent-primary' : ''}`}
            aria-label="Перейти в Терминал"
          >
            <DocumentCheckIcon className="w-6 h-6" />
            Терминал
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/profile')}
            className={`animate-pulse w-1/2 bg-accent-primary text-text-primary px-6 py-3 rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 ${isActive('/profile') ? 'ring-2 ring-offset-2 ring-accent-primary' : ''}`}
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
  <div className="mt-12 sm:mt-16 text-center text-text-secondary">
    <p className="text-sm sm:text-base mb-4">
      Fluvion — ваш надежный партнер для доставки из Китая
    </p>
    <div className="flex justify-center gap-4">
      <a href="/contact" className="text-accent-primary hover:text-accent-primary/80 transition-colors duration-300">
        <EnvelopeIcon className="w-6 h-6" />
      </a>
      <a href="/contact" className="text-accent-primary hover:text-accent-primary/80 transition-colors duration-300">
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
    <div className="min-h-screen bg-gradient-to-b from-bg-primary to-bg-secondary text-text-primary py-12 px-4 sm:px-6 lg:px-8 w-full max-w-none relative overflow-hidden">
      <div className="w-full relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 mx-auto max-w-4xl"
        >
          <div className="flex items-center justify-center gap-3">
            <CurrencyDollarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-accent-primary" />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-accent-primary tracking-tight animate-fade-in-down">
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
          className="circle-container mb-12 mx-auto max-w-4xl"
        >
          <div className="circle-left">
            <CircularRateDisplay
              title="Текущий курс обмена"
              rateText="1 CNY = 0.45 BYN"
            />
          </div>
          <div className="circle-right">
            <CircularRateDisplay
              title="Стоимость доставки"
              rateText="$6 за 1 кг"
            />
          </div>
        </motion.section>

        {/* Info Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12 w-full flex justify-center"
        >
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="mb-6 text-center">
              <h3 className="text-2xl sm:text-3xl font-bold text-accent-primary">Почему выбирают нас?</h3>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 px-4">
              <InfoCard
                title="Конкурентные курсы"
                content="Наши курсы обмена CNY/BYN основаны на актуальных рыночных данных, обеспечивая вам лучшие условия."
              />
              <InfoCard
                title="Прозрачная доставка"
                content="Фиксированная стоимость доставки без скрытых комиссий помогает легко планировать расходы."
              />
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-12 mx-auto max-w-4xl"
        >
          <div className="mb-6 flex items-center justify-center">
            <QuestionMarkCircleIcon className="w-6 h-6 mr-2 text-accent-primary" />
            <h3 className="text-2xl sm:text-3xl font-bold text-accent-primary">Часто задаваемые вопросы</h3>
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