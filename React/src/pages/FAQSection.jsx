import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionMarkCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in FAQSection:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center text-[#ef4444] p-8 rounded-2xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)]"
        >
          Произошла ошибка. Пожалуйста, попробуйте позже или свяжитесь с поддержкой.
        </motion.div>
      );
    }
    return this.props.children;
  }
}

function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    const saved = localStorage.getItem('recentlyViewedFAQs');
    return saved ? JSON.parse(saved) : [];
  });
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedback, setFeedback] = useState({ name: '', email: '', message: '' });
  const [feedbackErrors, setFeedbackErrors] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  const navigate = useNavigate();

  // FAQ data organized by categories
  const faqs = [
    {
      category: 'Общие вопросы',
      questions: [
        {
          question: 'Что такое карго-доставка на Fluvion?',
          answer: (
            <>
              Карго-доставка — это объединение заказов в сборный груз для транспортировки из Китая в Беларусь через транспортную компанию Карго (18–35 дней). Это снижает стоимость доставки и упрощает таможенные процедуры. Подробности в <a href="/public-offer" className="text-[#00f0ff] underline">Публичной оферте</a>.
            </>
          ),
        },
      ],
    },
    {
      category: 'Оформление заказа',
      questions: [
        {
          question: 'Как заказать товары через Fluvion?',
          answer: (
            <>
              Вы можете заказать товары двумя способами: через <span className="font-bold text-[#00f0ff]">Каталог</span>, выбрав проверенные товары и добавив их в корзину, или через <span className="font-bold text-[#00f0ff]">Терминал</span>, указав ссылку на товар (например, с AliExpress, Taobao), описание, количество, цвет и размер. Подробности в <a href="/public-offer" className="text-[#00f0ff] underline">Публичной оферте</a>.
            </>
          ),
        },
        {
          question: 'Как оформить корзину?',
          answer: (
            <>
              В <span className="font-bold text-[#00f0ff]">Корзине</span> укажите отделение Европочты для доставки по РБ, примените промокод (если есть) и выберите страховку груза. После проверки нажмите "Оформить заказ". Итоговая стоимость включает цену товара, упаковку, доставку по Китаю, таможенные сборы и комиссию. Подробности в <a href="/public-offer" className="text-[#00f0ff] underline">Публичной оферте</a>.
            </>
          ),
        },
        {
          question: 'Что происходит после оформления заказа?',
          answer: (
            <>
              Заказ отправляется на проверку администраторам (1–2 рабочих дня). Вы получите уведомление по email или в <span className="font-bold text-[#00f0ff]">Профиле</span> о статусе проверки. Подробности в <a href="/public-offer" className="text-[#00f0ff] underline">Публичной оферте</a>.
            </>
          ),
        },
      ],
    },
    {
      category: 'Самовыкуп',
      questions: [
        {
          question: 'Можно ли отправить товары, купленные самостоятельно?',
          answer: (
            <>
              Да, вы можете купить товары на китайских площадках (например, AliExpress, Taobao) и отправить их на наш склад в Китае. В <span className="font-bold text-[#00f0ff]">Профиле</span> во вкладке <span className="font-bold text-[#00f0ff]">Отправления</span> укажите трек-номер, вес, габариты, выберите отделение Европочты и добавьте страховку, если нужно. Подробности в <a href="/public-offer" className="text-[#00f0ff] underline">Публичной оферте</a>.
            </>
          ),
        },
        {
          question: 'Как отправить товар на ваш склад в Китае?',
          answer: (
            <>
              После оформления заказа в <span className="font-bold text-[#00f0ff]">Терминале</span> или <span className="font-bold text-[#00f0ff]">Профиле</span> вы получите адрес нашего склада в Китае, имя получателя и контактный номер для китайского курьера. Передайте эти данные продавцу. Убедитесь, что товары правильно упакованы. Подробности в <a href="/public-offer" className="text-[#00f0ff] underline">Публичной оферте</a>.
            </>
          ),
        },
      ],
    },
    {
      category: 'Оплата',
      questions: [
        {
          question: 'Как оплатить заказ и доставку?',
          answer: (
            <>
              Для заказов под ключ оплатите полную стоимость (товар, доставка из Китая $6/кг, упаковка, таможенные сборы, комиссия) через эквайринг Альфа-Банка (Visa, Mastercard) в <span className="font-bold text-[#00f0ff]">Профиле</span> в течение 3 дней после проверки. Для самовыкупа оплатите доставку ($6/кг). Оплата местной доставки по РБ производится в отделении Европочты. Все транзакции защищены 256-битным SSL-шифрованием. Подробности в <a href="/public-offer" className="text-[#00f0ff] underline">Публичной оферте</a>.
            </>
          ),
        },
        {
          question: 'Как рассчитывается стоимость доставки?',
          answer: (
            <>
              Стоимость доставки из Китая — $6 за каждый килограмм (минимальный вес — 1 кг). Дополнительно оплачивается доставка Европочтой по РБ по их тарифам при получении. Итоговая стоимость отображается в <span className="font-bold text-[#00f0ff]">Профиле</span> после проверки. Подробности в <a href="/public-offer" className="text-[#00f0ff] underline">Публичной оферте</a>.
            </>
          ),
        },
      ],
    },
    {
      category: 'Доставка',
      questions: [
        {
          question: 'Сколько времени занимает доставка?',
          answer: (
            <>
              Транспортировка из Китая в Беларусь через Карго занимает 18–35 дней. Доставка Европочтой по РБ — 2–5 дней. Отслеживайте статус в <span className="font-bold text-[#00f0ff]">Отправления</span> в вашем профиле. Вы получите трек-номер. Подробности в <a href="/public-offer" className="text-[#00f0ff] underline">Публичной оферте</a>.
            </>
          ),
        },
        {
          question: 'Как узнать, что мой заказ прибыл?',
          answer: (
            <>
              После прибытия заказа на склад в Минске и передачи в Европочту вы получите уведомление по email, SMS или в <span className="font-bold text-[#00f0ff]">Отправления</span> в профиле с трек-номером. Подробности в <a href="/public-offer" className="text-[#00f0ff] underline">Публичной оферте</a>.
            </>
          ),
        },
        {
          question: 'Как забрать заказ?',
          answer: (
            <>
              После оплаты доставки по РБ в отделении Европочты заберите товары. Убедитесь, что товары соответствуют заказу, и оставьте отзыв в <span className="font-bold text-[#00f0ff]">Профиле</span>. Подробности в <a href="/public-offer" className="text-[#00f0ff] underline">Публичной оферте</a>.
            </>
          ),
        },
      ],
    },
    {
      category: 'Проверки и возвраты',
      questions: [
        {
          question: 'Проверяете ли вы товары на складе?',
          answer: (
            <>
              Мы проверяем целостность упаковки. За дополнительную плату (от 6 юаней) возможна проверка качества, количества или тестирование техники. Укажите это в <span className="font-bold text-[#00f0ff]">Терминале</span> при оформлении. Подробности в <a href="/public-offer" className="text-[#00f0ff] underline">Публичной оферте</a>.
            </>
          ),
        },
        {
          question: 'Что делать, если товар повреждён?',
          answer: (
            <>
              Страховка работает только если товар утерян и вы полностью засняли процесс распаковки товара на видео без пауз. В таком случае мы вернём полную стоимость груза. Если виноват поставщик, поможем составить претензию. Для товаров из <span className="font-bold text-[#00f0ff]">Терминала</span> ответственность за качество лежит на покупателе, для <span className="font-bold text-[#00f0ff]">Каталога</span> ориентируйтесь на отзывы. Подробности в <a href="/public-offer" className="text-[#00f0ff] underline">Публичной оферте</a>.
            </>
          ),
        },
        {
          question: 'Можно ли вернуть товар?',
          answer: (
            <>
              Возврат невозможен, так как оплата производится после подтверждения полной стоимости. Для товаров из <span className="font-bold text-[#00f0ff]">Каталога</span> ориентируйтесь на отзывы и дату последней покупки. Подробности в <a href="/public-offer" className="text-[#00f0ff] underline">Публичной оферте</a>.
            </>
          ),
        },
        {
          question: 'Какие товары нельзя отправлять через карго?',
          answer: (
            <>
              Запрещены оружие, наркотики, скоропортящиеся продукты, жидкости без согласования, аккумуляторы без специальной упаковки, драгоценности и наличные. Полный список в <a href="/public-offer" className="text-[#00f0ff] underline">Публичной оферте</a>.
            </>
          ),
        },
      ],
    },
  ];

  // Save recently viewed FAQs to localStorage
  useEffect(() => {
    localStorage.setItem('recentlyViewedFAQs', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  // Toggle FAQ accordion
  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
    if (activeIndex !== index) {
      setRecentlyViewed((prev) => {
        const newViewed = [index, ...prev.filter((i) => i !== index)].slice(0, 3);
        return newViewed;
      });
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Validate feedback form
  const validateFeedback = () => {
    const newErrors = {};
    if (!feedback.name.trim()) newErrors.name = 'Имя обязательно';
    if (!feedback.email.trim()) newErrors.email = 'Email обязателен';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(feedback.email)) newErrors.email = 'Неверный формат email';
    if (!feedback.message.trim()) newErrors.message = 'Сообщение обязательно';
    setFeedbackErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle feedback form submission
  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    const userName = localStorage.getItem('userName');
    if (!userName) {
      navigate('/login');
      return;
    }
    if (validateFeedback()) {
      setFeedback({ name: '', email: '', message: '' });
      setFeedbackVisible(false);
      setFeedbackErrors({});
    }
  };

  // Filter FAQs based on search query
  const filteredFAQs = faqs.flatMap((category) =>
    category.questions
      .map((faq, idx) => ({
        ...faq,
        originalIndex: idx,
        category: category.category,
      }))
      .filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof faq.answer === 'string'
            ? faq.answer.toLowerCase()
            : faq.answer.props.children.toString().toLowerCase()
          ).includes(searchQuery.toLowerCase())
      )
  );

  // Toggle category expansion for mobile
  const toggleCategory = (catIndex) => {
    setExpandedCategory(expandedCategory === catIndex ? null : catIndex);
  };

  // Get global index for a question
  const getGlobalIndex = (catIndex, qIndex) => {
    return faqs.slice(0, catIndex).reduce((acc, c) => acc + c.questions.length, 0) + qIndex;
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-transparent text-[#e5e7eb] py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden pb-20 sm:pb-12">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-4">
            <PageHeader 
              title="Часто задаваемые вопросы"
              subtitle="Найдите ответы на вопросы о заказах, доставке, самовыкупе и оплате"
            />
            <Button
              variant="primary"
              onClick={() => navigate('/support')}
              className="flex items-center gap-2 text-sm sm:text-base w-full md:w-auto justify-center lg:flex"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Создать запрос</span>
              <span className="sm:hidden">Запрос</span>
            </Button>
          </div>

          {/* Mobile Design - показывается только на мобильных */}
          <div className="lg:hidden">
            <main className="py-2">
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-4 text-sm text-[#cdcdcd] text-center"
              >
                <a href="/public-offer" className="n-ink-link">
                  Публичная оферта
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-4"
              >
                <div className="relative">
                  <QuestionMarkCircleIcon className="absolute top-3 left-3 w-5 h-5 text-[#00f0ff]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Поиск по вопросам..."
                    className="w-full pl-10 pr-4 py-3 text-sm bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border border-[rgba(255,255,255,0.1)] rounded-lg focus:outline-none focus:border-[#00f0ff] focus:ring-2 focus:ring-[#00f0ff]/30 transition duration-300 placeholder-[#9ca3af]"
                  />
                </div>
              </motion.div>

              {/* Mobile FAQ List */}
              <div className="c-inset c-faq-list">
                {faqs.map((category, catIndex) => {
                  const categoryQuestions = searchQuery
                    ? category.questions.filter(
                        (faq) =>
                          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (typeof faq.answer === 'string'
                            ? faq.answer.toLowerCase()
                            : faq.answer.props.children.toString().toLowerCase()
                          ).includes(searchQuery.toLowerCase())
                      )
                    : category.questions;

                  if (categoryQuestions.length === 0) return null;

                  return (
                    <motion.div
                      key={catIndex}
                      initial={{ opacity: 1, y: 0 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: catIndex * 0.1 }}
                      className="c-inset-row"
                    >
                      <button
                        onClick={() => toggleCategory(catIndex)}
                        className="w-full px-4 py-3 flex items-center justify-between bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                      >
                        <h3 className="text-base font-semibold text-[#00f0ff] text-left">
                          {category.category}
                        </h3>
                        <span className="text-[#9ca3af] text-lg transform transition-transform duration-300">
                          {expandedCategory === catIndex ? '▲' : '▼'}
                        </span>
                      </button>

                      <AnimatePresence>
                        {expandedCategory === catIndex && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 py-2 space-y-2">
                              {categoryQuestions.map((faq, qIndex) => {
                                const globalIndex = getGlobalIndex(catIndex, qIndex);
                                return (
                                  <div
                                    key={qIndex}
                                    className="rounded-lg bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.03)]"
                                  >
                                    <button
                                      onClick={() => toggleFAQ(globalIndex)}
                                      className={`w-full px-3 py-2.5 text-left text-sm text-[#9ca3af] hover:text-[#00f0ff] transition-colors flex items-start justify-between gap-2 ${
                                        activeIndex === globalIndex ? 'text-[#00f0ff]' : ''
                                      }`}
                                    >
                                      <span className="flex-1">{faq.question}</span>
                                      <span className="text-xs flex-shrink-0">
                                        {activeIndex === globalIndex ? '▲' : '▼'}
                                      </span>
                                    </button>
                                    {activeIndex === globalIndex && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="px-3 pb-3 text-xs text-[#9ca3af] leading-relaxed"
                                      >
                                        {faq.answer}
                                      </motion.div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Recently Viewed for Mobile */}
              {recentlyViewed.length > 0 && (
                <motion.div
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="mt-6"
                >
                  <h3 className="text-base font-semibold mb-3 text-[#00f0ff]">
                    Недавно просматриваемые
                  </h3>
                  <div className="space-y-2">
                    {recentlyViewed.map((index) => {
                      const categoryIndex = faqs.findIndex(cat => index < cat.questions.length + (faqs.slice(0, faqs.indexOf(cat)).reduce((acc, c) => acc + c.questions.length, 0)));
                      const localIndex = index - faqs.slice(0, categoryIndex).reduce((acc, c) => acc + c.questions.length, 0);
                      const faq = faqs[categoryIndex].questions[localIndex];
                      return (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] cursor-pointer"
                          onClick={() => {
                            const catIndex = faqs.findIndex(cat => 
                              index < cat.questions.length + faqs.slice(0, faqs.indexOf(cat)).reduce((acc, c) => acc + c.questions.length, 0)
                            );
                            setExpandedCategory(catIndex);
                            setTimeout(() => toggleFAQ(index), 100);
                          }}
                        >
                          <p className="text-[#9ca3af] text-xs truncate">{faq.question}</p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* Feedback Button for Mobile */}
              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => setFeedbackVisible(true)}
                  className="w-full text-sm py-2.5"
                >
                  Оставить отзыв
                </Button>
              </div>
            </main>
          </div>

          {/* Desktop Design - показывается только на больших экранах */}
          <main className="hidden lg:block py-4 sm:py-6 lg:py-12">
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-4 sm:mb-6 lg:mb-8 text-sm sm:text-base lg:text-lg text-[#cdcdcd] text-center"
            >
              <a href="/public-offer" className="n-ink-link">
                Публичная оферта
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-4 sm:mb-6 lg:mb-8"
            >
              <div className="relative max-w-lg mx-auto">
                <QuestionMarkCircleIcon className="absolute top-3 sm:top-4 left-3 sm:left-4 w-5 h-5 sm:w-6 sm:h-6 text-[#00f0ff]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Поиск по вопросам..."
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border border-[rgba(255,255,255,0.1)] rounded-lg sm:rounded-xl focus:outline-none focus:border-[#00f0ff] focus:ring-2 focus:ring-[#00f0ff]/30 transition duration-300 placeholder-[#9ca3af]"
                />
              </div>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
              <motion.aside
                initial={{ opacity: 1, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="lg:w-1/4 w-full order-2 lg:order-1"
              >
                <div className="c-inset c-faq-list p-4">
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-[#00f0ff] mb-3 sm:mb-4 font-display">Часто задаваемые вопросы</h3>
                  <ul className="space-y-1">
                    {faqs.map((category, catIndex) => (
                      <li key={catIndex}>
                        <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-[#e5e7eb] mt-2 sm:mt-3 lg:mt-4 mb-1.5 sm:mb-2 break-words">{category.category}</h4>
                        {category.questions.map((faq, qIndex) => {
                          const globalIndex = faqs.slice(0, catIndex).reduce((acc, c) => acc + c.questions.length, 0) + qIndex;
                          return (
                            <motion.button
                              key={qIndex}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleFAQ(globalIndex)}
                              className={`w-full text-left px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg hover:bg-[rgba(0,240,255,0.1)] transition duration-200 text-[#9ca3af] hover:text-[#00f0ff] text-xs sm:text-sm break-words ${activeIndex === globalIndex ? 'bg-[rgba(0,240,255,0.15)] text-[#00f0ff]' : ''}`}
                            >
                              {faq.question}
                            </motion.button>
                          );
                        })}
                      </li>
                    ))}
                  </ul>
                <Button
                  variant="primary"
                  onClick={() => setFeedbackVisible(true)}
                  className="mt-4 sm:mt-6 w-full text-sm sm:text-base py-2 sm:py-2.5"
                >
                  Оставить отзыв
                </Button>
              </div>
              </motion.aside>

              <motion.main
                initial={{ opacity: 1, x: 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="lg:w-3/4 w-full order-1 lg:order-2"
              >
                <div className="c-inset c-faq-list">
                  {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((faq, index) => (
                      <div
                        key={`${faq.category}-${faq.originalIndex}`}
                        className="c-inset-row"
                      >
                        <h2
                          className="text-base sm:text-lg lg:text-xl font-semibold mb-2 sm:mb-3 flex items-start gap-2 cursor-pointer text-[#00f0ff] break-words"
                          onClick={() => toggleFAQ(faq.originalIndex + faqs.slice(0, faqs.findIndex(c => c.category === faq.category)).reduce((acc, c) => acc + c.questions.length, 0))}
                        >
                          <QuestionMarkCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-[#00f0ff] flex-shrink-0 mt-0.5" />
                          <span className="flex-1 min-w-0 pr-2 sm:pr-3">{faq.question}</span>
                          <span className="flex-shrink-0 transform transition-transform duration-300 text-[#9ca3af] text-xs sm:text-sm lg:text-base">
                            {activeIndex === faq.originalIndex + faqs.slice(0, faqs.findIndex(c => c.category === faq.category)).reduce((acc, c) => acc + c.questions.length, 0) ? '▲' : '▼'}
                          </span>
                        </h2>
                        {activeIndex === faq.originalIndex + faqs.slice(0, faqs.findIndex(c => c.category === faq.category)).reduce((acc, c) => acc + c.questions.length, 0) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                            className="text-[#9ca3af] text-xs sm:text-sm lg:text-base leading-relaxed mt-2 sm:mt-3 break-words overflow-wrap-anywhere"
                          >
                            {faq.answer}
                          </motion.div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                      <p className="text-[#9ca3af] text-lg">
                        Ничего не найдено. Попробуйте другой запрос!
                      </p>
                    </div>
                  )}
                </div>

                {recentlyViewed.length > 0 && (
                  <motion.div
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-6 sm:mt-8 mb-4 sm:mb-0"
                  >
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-[#00f0ff]">
                      Недавно просматриваемые
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                      {recentlyViewed.map((index) => {
                        const categoryIndex = faqs.findIndex(cat => index < cat.questions.length + (faqs.slice(0, faqs.indexOf(cat)).reduce((acc, c) => acc + c.questions.length, 0)));
                        const localIndex = index - faqs.slice(0, categoryIndex).reduce((acc, c) => acc + c.questions.length, 0);
                        const faq = faqs[categoryIndex].questions[localIndex];
                        return (
                          <div
                            key={index}
                            className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 cursor-pointer"
                            onClick={() => toggleFAQ(index)}
                          >
                            <p className="text-[#9ca3af] text-xs sm:text-sm truncate">{faq.question}</p>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.main>
            </div>
          </main>

          <AnimatePresence>
            {feedbackVisible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto"
                onClick={() => setFeedbackVisible(false)}
              >
                <div
                  className="max-w-md w-full p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] mx-4 my-4 sm:my-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-[#00f0ff]">
                    Оставить отзыв
                  </h2>
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[#9ca3af] mb-2">Имя *</label>
                      <input
                        type="text"
                        value={feedback.name}
                        onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                        className={`w-full px-4 py-2 bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border rounded-xl focus:outline-none focus:ring-2 transition duration-300 placeholder-[#9ca3af] ${feedbackErrors.name ? 'border-[#ef4444] focus:ring-[#ef4444]/30' : 'border-[rgba(255,255,255,0.1)] focus:border-[#00f0ff] focus:ring-[#00f0ff]/30'}`}
                      />
                      {feedbackErrors.name && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-[#ef4444] text-xs mt-1"
                        >
                          {feedbackErrors.name}
                        </motion.p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#9ca3af] mb-2">Email *</label>
                      <input
                        type="email"
                        value={feedback.email}
                        onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                        className={`w-full px-4 py-2 bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border rounded-xl focus:outline-none focus:ring-2 transition duration-300 placeholder-[#9ca3af] ${feedbackErrors.email ? 'border-[#ef4444] focus:ring-[#ef4444]/30' : 'border-[rgba(255,255,255,0.1)] focus:border-[#00f0ff] focus:ring-[#00f0ff]/30'}`}
                      />
                      {feedbackErrors.email && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-[#ef4444] text-xs mt-1"
                        >
                          {feedbackErrors.email}
                        </motion.p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#9ca3af] mb-2">Сообщение *</label>
                      <textarea
                        value={feedback.message}
                        onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                        className={`w-full px-4 py-2 bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border rounded-xl focus:outline-none focus:ring-2 transition duration-300 placeholder-[#9ca3af] ${feedbackErrors.message ? 'border-[#ef4444] focus:ring-[#ef4444]/30' : 'border-[rgba(255,255,255,0.1)] focus:border-[#00f0ff] focus:ring-[#00f0ff]/30'}`}
                        rows="4"
                      />
                      {feedbackErrors.message && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-[#ef4444] text-xs mt-1"
                        >
                          {feedbackErrors.message}
                        </motion.p>
                      )}
                    </div>
                    <div className="flex justify-end space-x-4">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setFeedbackVisible(false)}
                      >
                        Отмена
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleFeedbackSubmit}
                      >
                        Отправить
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="n-support-fab"
          >
            <Button
              variant="primary"
              onClick={() => navigate('/support')}
              className="rounded-full p-3 sm:p-4 shadow-lg"
              aria-label="Открыть поддержку"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>
          </motion.div>

          <motion.footer
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="py-4 sm:py-6 mt-8 sm:mt-12 border-t border-[rgba(255,255,255,0.1)] text-center text-[#9ca3af] text-xs sm:text-sm"
          >
            <p>© 2025 Fluvion. Все права защищены.</p>
            <p className="mt-1 text-[#00f0ff]">Обновлено: 20.10.2025</p>
          </motion.footer>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default FAQSection;