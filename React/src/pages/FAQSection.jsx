import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QuestionMarkCircleIcon,
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
  UserIcon,
  CreditCardIcon,
  TruckIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Helmet } from 'react-helmet-async';

const linkClass = 'text-[var(--ev-gold)] hover:underline';
const strongClass = 'font-medium text-[var(--ev-text)]';

function getAnswerWithEvStyles(answer) {
  if (typeof answer === 'string') return answer;
  if (answer?.props?.children) return answer;
  return answer;
}

const CATEGORY_ICONS = {
  general: QuestionMarkCircleIcon,
  order: ShoppingCartIcon,
  self: UserIcon,
  payment: CreditCardIcon,
  delivery: TruckIcon,
  returns: ShieldCheckIcon,
};

const FAQ_DATA = [
  {
    id: 'general',
    category: 'Общие вопросы',
    questions: [
      {
        question: 'Что такое карго-доставка на Fluvion?',
        answer: <>Карго-доставка — это объединение заказов в сборный груз из Китая в Беларусь (18–35 дней). Подробности в <a href="/public-offer" className={linkClass}>Публичной оферте</a>.</>,
      },
    ],
  },
  {
    id: 'order',
    category: 'Оформление заказа',
    questions: [
      { question: 'Как заказать товары через Fluvion?', answer: <>Через <span className={strongClass}>Примеры товаров</span> (готовые товары) или <span className={strongClass}>Терминал</span> (по ссылке). Подробности в <a href="/public-offer" className={linkClass}>Публичной оферте</a>.</> },
      { question: 'Как оформить корзину?', answer: <>В <span className={strongClass}>Корзине</span> укажите отделение Европочты, промокод и страховку, затем «Оформить заказ». Подробности в <a href="/public-offer" className={linkClass}>Публичной оферте</a>.</> },
      { question: 'Что после оформления заказа?', answer: <>Проверка 1–2 рабочих дня. Уведомление по email или в <span className={linkClass}>Профиле</span>. Подробности в <a href="/public-offer" className={linkClass}>Публичной оферте</a>.</> },
    ],
  },
  {
    id: 'self',
    category: 'Самовыкуп',
    questions: [
      { question: 'Можно ли отправить товары, купленные самостоятельно?', answer: <>Да. В <span className={linkClass}>Профиле</span> → «Отправления» укажите трек, вес, отделение Европочты и страховку. Подробности в <a href="/public-offer" className={linkClass}>Публичной оферте</a>.</> },
      { question: 'Как отправить товар на ваш склад в Китае?', answer: <>После оформления получите адрес склада в <span className={linkClass}>Терминале</span> или <span className={linkClass}>Профиле</span>. Передайте данные продавцу. Подробности в <a href="/public-offer" className={linkClass}>Публичной оферте</a>.</> },
    ],
  },
  {
    id: 'payment',
    category: 'Оплата',
    questions: [
      { question: 'Как оплатить заказ и доставку?', answer: <>В <span className={linkClass}>Профиле</span> в течение 3 дней после проверки (Visa, Mastercard, BePaid). Для самовыкупа — доставка $7/кг. В отделении Европочты — местная доставка. Подробности в <a href="/public-offer" className={linkClass}>Публичной оферте</a>.</> },
      { question: 'Как рассчитывается стоимость доставки?', answer: <>Из Китая — $7/кг (мин. 1 кг). По РБ — по тарифам Европочты при получении. Итог в <span className={linkClass}>Профиле</span>. Подробности в <a href="/public-offer" className={linkClass}>Публичной оферте</a>.</> },
    ],
  },
  {
    id: 'delivery',
    category: 'Доставка',
    questions: [
      { question: 'Сколько времени занимает доставка?', answer: <>Из Китая 18–35 дней, по РБ 2–5 дней. Статус в <span className={linkClass}>Отправления</span> в профиле. Подробности в <a href="/public-offer" className={linkClass}>Публичной оферте</a>.</> },
      { question: 'Как узнать, что заказ прибыл?', answer: <>Уведомление по email, SMS или в <span className={linkClass}>Отправления</span> с трек-номером. Подробности в <a href="/public-offer" className={linkClass}>Публичной оферте</a>.</> },
      { question: 'Как забрать заказ?', answer: <>Оплатите доставку в отделении Европочты и заберите товары. Отзыв — в <span className={linkClass}>Профиле</span>. Подробности в <a href="/public-offer" className={linkClass}>Публичной оферте</a>.</> },
    ],
  },
  {
    id: 'returns',
    category: 'Проверки и возвраты',
    questions: [
      { question: 'Проверяете ли вы товары на складе?', answer: <>Проверяем упаковку. Проверка качества — от 6 юаней, укажите в <span className={linkClass}>Терминале</span>. Подробности в <a href="/public-offer" className={linkClass}>Публичной оферте</a>.</> },
      { question: 'Что делать, если товар повреждён?', answer: <>Страховка — при утрате и наличии видео распаковки. Поможем с претензией к поставщику. Подробности в <a href="/public-offer" className={linkClass}>Публичной оферте</a>.</> },
      { question: 'Можно ли вернуть товар?', answer: <>Возврат после подтверждения стоимости невозможен. По <span className={linkClass}>примерам товаров</span> — смотрите отзывы. Подробности в <a href="/public-offer" className={linkClass}>Публичной оферте</a>.</> },
      { question: 'Какие товары нельзя отправлять?', answer: <>Оружие, наркотики, скоропорт, жидкости без согласования, аккумуляторы без упаковки, драгоценности, наличные. Полный список в <a href="/public-offer" className={linkClass}>Публичной оферте</a>.</> },
    ],
  },
];

function FAQSection() {
  const [openKey, setOpenKey] = useState(null); // 'catIndex-qIndex'
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });
  const [feedbackErrors, setFeedbackErrors] = useState({});
  const sectionRefs = useRef([]);
  const navigate = useNavigate();

  const answerToString = (answer) => {
    if (typeof answer === 'string') return answer;
    if (answer?.props?.children) {
      const ch = answer.props.children;
      if (Array.isArray(ch)) return ch.map((c) => (typeof c === 'string' ? c : c?.props?.children ?? '')).join(' ');
      return typeof ch === 'string' ? ch : '';
    }
    return '';
  };

  const filteredBlocks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return FAQ_DATA.map((cat, i) => ({ ...cat, questions: cat.questions, index: i }));
    return FAQ_DATA.map((cat, catIndex) => {
      const questions = cat.questions.filter(
        (faq) =>
          faq.question.toLowerCase().includes(q) || answerToString(faq.answer).toLowerCase().includes(q)
      );
      return questions.length ? { ...cat, questions, index: catIndex } : null;
    }).filter(Boolean);
  }, [searchQuery]);

  const scrollToSection = (index) => {
    const el = sectionRefs.current[index];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validateFeedback = () => {
    const err = {};
    if (!feedback.name.trim()) err.name = 'Имя обязательно';
    if (!feedback.email.trim()) err.email = 'Email обязателен';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(feedback.email)) err.email = 'Неверный формат email';
    if (!feedback.message.trim()) err.message = 'Сообщение обязательно';
    setFeedbackErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!localStorage.getItem('userName')) {
      navigate('/login');
      return;
    }
    if (validateFeedback()) {
      setFeedback({ name: '', email: '', message: '' });
      setFeedbackVisible(false);
      setFeedbackErrors({});
    }
  };

  return (
    <div className="min-h-screen bg-[var(--ev-void)] text-[var(--ev-text)] font-[var(--ev-font-body)] overflow-x-hidden">
      <Helmet>
        <title>Часто задаваемые вопросы | Fluvion</title>
        <meta name="description" content="Ответы на вопросы о заказах, доставке, самовыкупе и оплате доставки из Китая." />
      </Helmet>

      {/* Hero — как на остальных страницах */}
      <div className="pt-8 pb-6 md:pt-12 md:pb-8 px-4 text-center">
        <p className="ev-label text-[var(--ev-gold)] mb-2">Помощь</p>
        <h1 className="font-[var(--ev-font-display)] text-2xl md:text-4xl font-light tracking-tight text-[var(--ev-gold)] mb-2">
          Часто задаваемые вопросы
        </h1>
        <p className="text-[var(--ev-text-muted)] text-sm md:text-base max-w-xl mx-auto mb-4">
          Ответы о заказах, доставке и оплате
        </p>
        <a href="/public-offer" className={`text-sm ${linkClass}`}>
          Публичная оферта
        </a>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-20 md:pb-24">
        {/* Поиск */}
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ev-gold)]/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по вопросам..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/20 text-[var(--ev-text)] placeholder-[var(--ev-text-muted)]/60 focus:outline-none focus:border-[var(--ev-gold)]/50 focus:ring-1 focus:ring-[var(--ev-gold)]/30 transition-all"
          />
        </div>

        {/* Быстрая навигация по блокам */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {FAQ_DATA.map((cat, i) => {
            const visible = filteredBlocks.some((b) => b.id === cat.id);
            if (!visible) return null;
            const Icon = CATEGORY_ICONS[cat.id];
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => scrollToSection(filteredBlocks.findIndex((b) => b.id === cat.id))}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--ev-glass)]/80 text-[var(--ev-text-muted)] hover:text-[var(--ev-text)] hover:bg-[var(--ev-gold)]/5 text-sm transition-colors"
              >
                {Icon && <Icon className="w-4 h-4 text-[var(--ev-gold)]/70" />}
                <span>{cat.category}</span>
              </button>
            );
          })}
        </div>

        {/* Блоки-секции (как на Доставка и оплата) */}
        <div className="space-y-6 md:space-y-8">
          {filteredBlocks.length === 0 ? (
            <div className="rounded-2xl bg-[var(--ev-glass)]/80 p-8 text-center">
              <p className="text-[var(--ev-text-muted)]">Ничего не найдено. Попробуйте другой запрос.</p>
            </div>
          ) : (
            filteredBlocks.map((block, blockIdx) => {
              const Icon = CATEGORY_ICONS[block.id];
              return (
                <motion.section
                  key={block.id}
                  ref={(el) => { sectionRefs.current[blockIdx] = el; }}
                  id={`faq-${block.id}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: blockIdx * 0.05 }}
                  className="rounded-2xl bg-[var(--ev-glass)]/80 backdrop-blur-[24px] overflow-hidden"
                >
                  {/* Заголовок блока */}
                  <div className="flex items-center gap-3 p-4 md:p-5">
                    <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10">
                      {Icon && <Icon className="w-5 h-5 md:w-6 md:h-6 text-[var(--ev-gold)]" />}
                    </div>
                    <h2 className="font-[var(--ev-font-display)] text-lg md:text-xl font-medium text-[var(--ev-text)]">
                      {block.category}
                    </h2>
                  </div>
                  {/* Список вопросов — один уровень раскрытия */}
                  <div className="space-y-0">
                    {block.questions.map((faq, qIdx) => {
                      const key = `${block.index}-${qIdx}`;
                      const isOpen = openKey === key;
                      return (
                        <div key={key}>
                          <button
                            type="button"
                            onClick={() => setOpenKey(isOpen ? null : key)}
                            className="ev-faq-question-btn w-full px-4 py-3 md:py-4 flex items-center justify-between gap-3 text-left hover:bg-[var(--ev-gold)]/5 transition-colors outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:bg-transparent border-0 border-transparent"
                          >
                            <span className="text-sm md:text-base flex-1 text-[var(--ev-text)]">
                              {faq.question}
                            </span>
                            <ChevronDownIcon
                              className={`w-5 h-5 flex-shrink-0 text-[var(--ev-text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            />
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 text-[var(--ev-text-muted)] text-sm leading-relaxed">
                                  {getAnswerWithEvStyles(faq.answer)}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              );
            })
          )}
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-2xl bg-[var(--ev-glass)]/80 p-6 text-center">
          <p className="text-[var(--ev-text-muted)] text-sm mb-4">Не нашли ответ? Напишите в поддержку или оставьте отзыв.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="ev-primary" size="md" onClick={() => navigate('/support')} className="flex items-center justify-center gap-2">
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              Создать запрос
            </Button>
            <Button variant="ev-outline" size="md" onClick={() => setFeedbackVisible(true)} className="flex items-center justify-center gap-2">
              Оставить отзыв
            </Button>
          </div>
        </div>
      </div>

      {/* FAB поддержки */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button variant="ev-primary" onClick={() => navigate('/support')} className="rounded-full p-3 shadow-lg" aria-label="Поддержка">
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Модалка отзыва */}
      <AnimatePresence>
        {feedbackVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={() => setFeedbackVisible(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/20 p-6 shadow-xl"
            >
              <h2 className="font-[var(--ev-font-display)] text-xl text-[var(--ev-gold)] mb-4">Оставить отзыв</h2>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="block ev-label text-[var(--ev-text-muted)] mb-1.5">Имя *</label>
                  <input
                    type="text"
                    value={feedback.name}
                    onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl bg-[var(--ev-void)]/80 border text-[var(--ev-text)] placeholder-[var(--ev-text-muted)]/50 focus:outline-none focus:ring-1 ${
                      feedbackErrors.name ? 'border-red-500/50 focus:ring-red-500/30' : 'border-[var(--ev-gold)]/20 focus:ring-[var(--ev-gold)]/30'
                    }`}
                    placeholder="Ваше имя"
                  />
                  {feedbackErrors.name && <p className="text-red-400 text-xs mt-1">{feedbackErrors.name}</p>}
                </div>
                <div>
                  <label className="block ev-label text-[var(--ev-text-muted)] mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={feedback.email}
                    onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl bg-[var(--ev-void)]/80 border text-[var(--ev-text)] placeholder-[var(--ev-text-muted)]/50 focus:outline-none focus:ring-1 ${
                      feedbackErrors.email ? 'border-red-500/50 focus:ring-red-500/30' : 'border-[var(--ev-gold)]/20 focus:ring-[var(--ev-gold)]/30'
                    }`}
                    placeholder="email@example.com"
                  />
                  {feedbackErrors.email && <p className="text-red-400 text-xs mt-1">{feedbackErrors.email}</p>}
                </div>
                <div>
                  <label className="block ev-label text-[var(--ev-text-muted)] mb-1.5">Сообщение *</label>
                  <textarea
                    value={feedback.message}
                    onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                    rows={4}
                    className={`w-full px-4 py-2.5 rounded-xl bg-[var(--ev-void)]/80 border text-[var(--ev-text)] placeholder-[var(--ev-text-muted)]/50 focus:outline-none focus:ring-1 resize-none ${
                      feedbackErrors.message ? 'border-red-500/50 focus:ring-red-500/30' : 'border-[var(--ev-gold)]/20 focus:ring-[var(--ev-gold)]/30'
                    }`}
                    placeholder="Ваш отзыв..."
                  />
                  {feedbackErrors.message && <p className="text-red-400 text-xs mt-1">{feedbackErrors.message}</p>}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="ev-outline" onClick={() => setFeedbackVisible(false)} className="flex-1">
                    Отмена
                  </Button>
                  <Button type="submit" variant="ev-primary" className="flex-1">
                    Отправить
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FAQSection;
