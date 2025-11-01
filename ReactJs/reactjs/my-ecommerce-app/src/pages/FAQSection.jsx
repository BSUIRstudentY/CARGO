import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionMarkCircleIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center text-red-400 p-8 bg-red-500/20 border-red-500/50 rounded-2xl shadow-card"
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
              Карго-доставка — это объединение заказов в сборный груз для транспортировки из Китая в Беларусь через транспортную компанию Карго (18–35 дней). Это снижает стоимость доставки и упрощает таможенные процедуры. Подробности в <a href="/public-offer" className="text-accent-primary underline">Публичной оферте</a>.
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
              Вы можете заказать товары двумя способами: через <span className="font-bold text-accent-primary">Каталог</span>, выбрав проверенные товары и добавив их в корзину, или через <span className="font-bold text-accent-primary">Терминал</span>, указав ссылку на товар (например, с AliExpress, Taobao), описание, количество, цвет и размер. Подробности в <a href="/public-offer" className="text-accent-primary underline">Публичной оферте</a>.
            </>
          ),
        },
        {
          question: 'Как оформить корзину?',
          answer: (
            <>
              В <span className="font-bold text-accent-primary">Корзине</span> укажите отделение Европочты для доставки по РБ, примените промокод (если есть) и выберите страховку груза. После проверки нажмите "Оформить заказ". Итоговая стоимость включает цену товара, упаковку, доставку по Китаю, таможенные сборы и комиссию. Подробности в <a href="/public-offer" className="text-accent-primary underline">Публичной оферте</a>.
            </>
          ),
        },
        {
          question: 'Что происходит после оформления заказа?',
          answer: (
            <>
              Заказ отправляется на проверку администраторам (1–2 рабочих дня). Вы получите уведомление по email или в <span className="font-bold text-accent-primary">Профиле</span> о статусе проверки. Подробности в <a href="/public-offer" className="text-accent-primary underline">Публичной оферте</a>.
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
              Да, вы можете купить товары на китайских площадках (например, AliExpress, Taobao) и отправить их на наш склад в Китае. В <span className="font-bold text-accent-primary">Профиле</span> во вкладке <span className="font-bold text-accent-primary">Отправления</span> укажите трек-номер, вес, габариты, выберите отделение Европочты и добавьте страховку, если нужно. Подробности в <a href="/public-offer" className="text-accent-primary underline">Публичной оферте</a>.
            </>
          ),
        },
        {
          question: 'Как отправить товар на ваш склад в Китае?',
          answer: (
            <>
              После оформления заказа в <span className="font-bold text-accent-primary">Терминале</span> или <span className="font-bold text-accent-primary">Профиле</span> вы получите адрес нашего склада в Китае, имя получателя и контактный номер для китайского курьера. Передайте эти данные продавцу. Убедитесь, что товары правильно упакованы. Подробности в <a href="/public-offer" className="text-accent-primary underline">Публичной оферте</a>.
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
              Для заказов под ключ оплатите полную стоимость (товар, доставка из Китая $6/кг, упаковка, таможенные сборы, комиссия) через эквайринг Альфа-Банка (Visa, Mastercard) в <span className="font-bold text-accent-primary">Профиле</span> в течение 3 дней после проверки. Для самовыкупа оплатите доставку ($6/кг). Оплата местной доставки по РБ производится в отделении Европочты. Все транзакции защищены 256-битным SSL-шифрованием. Подробности в <a href="/public-offer" className="text-accent-primary underline">Публичной оферте</a>.
            </>
          ),
        },
        {
          question: 'Как рассчитывается стоимость доставки?',
          answer: (
            <>
              Стоимость доставки из Китая — $6 за каждый килограмм (минимальный вес — 1 кг). Дополнительно оплачивается доставка Европочтой по РБ по их тарифам при получении. Итоговая стоимость отображается в <span className="font-bold text-accent-primary">Профиле</span> после проверки. Подробности в <a href="/public-offer" className="text-accent-primary underline">Публичной оферте</a>.
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
              Транспортировка из Китая в Беларусь через Карго занимает 18–35 дней. Доставка Европочтой по РБ — 2–5 дней. Отслеживайте статус в <span className="font-bold text-accent-primary">Отправления</span> в вашем профиле. Вы получите трек-номер. Подробности в <a href="/public-offer" className="text-accent-primary underline">Публичной оферте</a>.
            </>
          ),
        },
        {
          question: 'Как узнать, что мой заказ прибыл?',
          answer: (
            <>
              После прибытия заказа на склад в Минске и передачи в Европочту вы получите уведомление по email, SMS или в <span className="font-bold text-accent-primary">Отправления</span> в профиле с трек-номером. Подробности в <a href="/public-offer" className="text-accent-primary underline">Публичной оферте</a>.
            </>
          ),
        },
        {
          question: 'Как забрать заказ?',
          answer: (
            <>
              После оплаты доставки по РБ в отделении Европочты заберите товары. Убедитесь, что товары соответствуют заказу, и оставьте отзыв в <span className="font-bold text-accent-primary">Профиле</span>. Подробности в <a href="/public-offer" className="text-accent-primary underline">Публичной оферте</a>.
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
              Мы проверяем целостность упаковки. За дополнительную плату (от $5) возможна проверка качества, количества или тестирование техники. Укажите это в <span className="font-bold text-accent-primary">Терминале</span> при оформлении. Подробности в <a href="/public-offer" className="text-accent-primary underline">Публичной оферте</a>.
            </>
          ),
        },
        {
          question: 'Что делать, если товар повреждён?',
          answer: (
            <>
              Если товар повреждён по нашей вине и выбрана страховка, мы компенсируем стоимость. Если виноват поставщик, поможем составить претензию. Для товаров из <span className="font-bold text-accent-primary">Терминала</span> ответственность за качество лежит на покупателе, для <span className="font-bold text-accent-primary">Каталога</span> ориентируйтесь на отзывы. Подробности в <a href="/public-offer" className="text-accent-primary underline">Публичной оферте</a>.
            </>
          ),
        },
        {
          question: 'Можно ли вернуть товар?',
          answer: (
            <>
              Возврат невозможен, так как оплата производится после подтверждения полной стоимости. Для товаров из <span className="font-bold text-accent-primary">Каталога</span> ориентируйтесь на отзывы и дату последней покупки. Подробности в <a href="/public-offer" className="text-accent-primary underline">Публичной оферте</a>.
            </>
          ),
        },
        {
          question: 'Какие товары нельзя отправлять через карго?',
          answer: (
            <>
              Запрещены оружие, наркотики, скоропортящиеся продукты, жидкости без согласования, аккумуляторы без специальной упаковки, драгоценности и наличные. Полный список в <a href="/public-offer" className="text-accent-primary underline">Публичной оферте</a>.
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
      alert(`Спасибо, ${feedback.name}! Ваше сообщение отправлено: ${feedback.message}`);
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

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-primary text-secondary py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
            backgroundRepeat: 'repeat',
          }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.header
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-6 border-b border-primary/50 shadow-card text-center"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <QuestionMarkCircleIcon className="w-10 h-10 text-accent-primary" />
                <h1 className="text-4xl md:text-5xl font-extrabold font-display text-accent-primary tracking-tight break-words" style={{
                  '@media (max-width: 640px)': {
                    fontSize: '28px',
                    fontWeight: '800',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                  }
                }}>
                  Часто задаваемые вопросы
                </h1>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/support')}
                className="bg-accent-primary text-primary px-6 py-3 rounded-xl hover:bg-accent-primary/90 transition shadow-sm font-medium"
                aria-label="Создать запрос в поддержку"
                style={{
                  '@media (max-width: 640px)': {
                    padding: '10px 16px',
                    fontSize: '14px',
                    borderRadius: '6px',
                  }
                }}
              >
                Создать запрос
              </motion.button>
            </div>
          </motion.header>

          <main className="py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8 text-lg text-secondary text-center font-sans"
              style={{
                '@media (max-width: 640px)': {
                  fontSize: '14px',
                  marginBottom: '16px',
                }
              }}
            >
              Найдите ответы на вопросы о заказах, доставке, самовыкупе и оплате.{' '}
              <a href="/public-offer" className="text-accent-primary hover:underline">
                Публичная оферта
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <div className="relative max-w-lg mx-auto">
                <QuestionMarkCircleIcon className="absolute top-4 left-4 w-6 h-6 text-accent-primary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Поиск по вопросам..."
                  className="w-full pl-12 pr-4 py-4 bg-tertiary text-secondary border border-accent-primary/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-primary transition duration-300 shadow-card"
                  style={{
                    '@media (max-width: 640px)': {
                      padding: '10px 14px',
                      fontSize: '14px',
                    }
                  }}
                />
              </div>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-8">
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="lg:w-1/4 w-full bg-tertiary p-4 rounded-xl border border-accent-primary/30 shadow-card"
                style={{
                  '@media (max-width: 640px)': {
                    padding: '12px',
                    borderRadius: '12px',
                  }
                }}
              >
                <h3 className="text-xl font-semibold text-accent-primary mb-4 font-display" style={{
                  '@media (max-width: 640px)': {
                    fontSize: '18px',
                  }
                }}>
                  Навигация по FAQ
                </h3>
                <ul className="space-y-2 max-h-[70vh] overflow-y-auto">
                  {faqs.map((category, catIndex) => (
                    <li key={catIndex}>
                      <h4 className="text-lg font-semibold text-secondary mt-4 mb-2 font-sans">{category.category}</h4>
                      {category.questions.map((faq, qIndex) => {
                        const globalIndex = faqs.slice(0, catIndex).reduce((acc, c) => acc + c.questions.length, 0) + qIndex;
                        return (
                          <motion.button
                            key={qIndex}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleFAQ(globalIndex)}
                            className={`w-full text-left px-2 py-2 rounded-lg hover:bg-accent-primary/10 transition duration-200 text-secondary hover:text-accent-primary text-sm ${activeIndex === globalIndex ? 'bg-accent-primary/20 text-accent-primary' : ''}`}
                            style={{
                              '@media (max-width: 640px)': {
                                fontSize: '13px',
                                padding: '6px',
                              }
                            }}
                          >
                            {faq.question}
                          </motion.button>
                        );
                      })}
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFeedbackVisible(true)}
                  className="mt-6 w-full py-3 bg-accent-primary text-primary rounded-xl hover:bg-accent-primary/90 transition duration-300 font-medium shadow-card"
                  aria-label="Оставить отзыв"
                  style={{
                    '@media (max-width: 640px)': {
                      padding: '10px',
                      fontSize: '14px',
                    }
                  }}
                >
                  Оставить отзыв
                </motion.button>
              </motion.aside>

              <motion.main
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="lg:w-3/4 w-full"
              >
                <div className="space-y-6">
                  {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((faq, index) => (
                      <motion.div
                        key={`${faq.category}-${faq.originalIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="bg-tertiary p-8 rounded-2xl border border-accent-primary/30 shadow-card hover:shadow-accent-primary/40 transition-all duration-300 w-full"
                        style={{
                          '@media (max-width: 640px)': {
                            padding: '16px',
                            borderRadius: '12px',
                          }
                        }}
                      >
                        <h2
                          className="text-xl font-semibold text-accent-primary mb-3 flex items-center cursor-pointer font-display"
                          onClick={() => toggleFAQ(faq.originalIndex + faqs.slice(0, faqs.findIndex(c => c.category === faq.category)).reduce((acc, c) => acc + c.questions.length, 0))}
                          style={{
                            '@media (max-width: 640px)': {
                              fontSize: '18px',
                            }
                          }}
                        >
                          <QuestionMarkCircleIcon className="w-6 h-6 mr-2" />
                          {faq.question}
                          <span className="ml-auto transform transition-transform duration-300">
                            {activeIndex === faq.originalIndex + faqs.slice(0, faqs.findIndex(c => c.category === faq.category)).reduce((acc, c) => acc + c.questions.length, 0) ? '▲' : '▼'}
                          </span>
                        </h2>
                        {activeIndex === faq.originalIndex + faqs.slice(0, faqs.findIndex(c => c.category === faq.category)).reduce((acc, c) => acc + c.questions.length, 0) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ duration: 0.3 }}
                            className="text-secondary text-base leading-relaxed font-sans"
                          >
                            {faq.answer}
                          </motion.div>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-secondary text-center text-lg font-sans"
                      style={{
                        '@media (max-width: 640px)': {
                          fontSize: '14px',
                        }
                      }}
                    >
                      Ничего не найдено. Попробуйте другой запрос!
                    </motion.div>
                  )}
                </div>

                {recentlyViewed.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-8"
                  >
                    <h3 className="text-xl font-semibold text-accent-primary mb-4 font-display" style={{
                      '@media (max-width: 640px)': {
                        fontSize: '18px',
                      }
                    }}>
                      Недавно просматриваемые
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {recentlyViewed.map((index) => {
                        const categoryIndex = faqs.findIndex(cat => index < cat.questions.length + (faqs.slice(0, faqs.indexOf(cat)).reduce((acc, c) => acc + c.questions.length, 0)));
                        const localIndex = index - faqs.slice(0, categoryIndex).reduce((acc, c) => acc + c.questions.length, 0);
                        const faq = faqs[categoryIndex].questions[localIndex];
                        return (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-tertiary p-4 rounded-xl border border-accent-primary/30 shadow-card hover:shadow-accent-primary/40 transition-all duration-300 cursor-pointer"
                            onClick={() => toggleFAQ(index)}
                            style={{
                              '@media (max-width: 640px)': {
                                padding: '12px',
                                borderRadius: '8px',
                              }
                            }}
                          >
                            <p className="text-secondary truncate font-sans">{faq.question}</p>
                          </motion.div>
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
                className="fixed inset-0 bg-primary/75 flex items-center justify-center z-50"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-tertiary p-8 rounded-2xl shadow-card max-w-md w-full border border-accent-primary/30"
                  style={{
                    '@media (max-width: 640px)': {
                      padding: '16px',
                      borderRadius: '12px',
                    }
                  }}
                >
                  <h2 className="text-2xl font-semibold text-accent-primary mb-4 font-display" style={{
                    '@media (max-width: 640px)': {
                      fontSize: '20px',
                    }
                  }}>
                    Оставить отзыв
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2 font-sans">Имя *</label>
                      <input
                        type="text"
                        value={feedback.name}
                        onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                        className={`w-full px-4 py-2 bg-tertiary text-secondary border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition duration-300 ${feedbackErrors.name ? 'border-red-500' : 'border-accent-primary/30'}`}
                        style={{
                          '@media (max-width: 640px)': {
                            padding: '8px',
                            fontSize: '14px',
                          }
                        }}
                      />
                      {feedbackErrors.name && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-red-400 text-xs mt-1 font-sans"
                        >
                          {feedbackErrors.name}
                        </motion.p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2 font-sans">Email *</label>
                      <input
                        type="email"
                        value={feedback.email}
                        onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                        className={`w-full px-4 py-2 bg-tertiary text-secondary border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition duration-300 ${feedbackErrors.email ? 'border-red-500' : 'border-accent-primary/30'}`}
                        style={{
                          '@media (max-width: 640px)': {
                            padding: '8px',
                            fontSize: '14px',
                          }
                        }}
                      />
                      {feedbackErrors.email && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-red-400 text-xs mt-1 font-sans"
                        >
                          {feedbackErrors.email}
                        </motion.p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2 font-sans">Сообщение *</label>
                      <textarea
                        value={feedback.message}
                        onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                        className={`w-full px-4 py-2 bg-tertiary text-secondary border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition duration-300 ${feedbackErrors.message ? 'border-red-500' : 'border-accent-primary/30'}`}
                        rows="4"
                        style={{
                          '@media (max-width: 640px)': {
                            padding: '8px',
                            fontSize: '14px',
                          }
                        }}
                      />
                      {feedbackErrors.message && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-red-400 text-xs mt-1 font-sans"
                        >
                          {feedbackErrors.message}
                        </motion.p>
                      )}
                    </div>
                    <div className="flex justify-end space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setFeedbackVisible(false)}
                        className="px-6 py-3 bg-tertiary text-secondary border border-accent-primary/30 rounded-lg hover:bg-tertiary/80 transition font-medium shadow-card"
                        aria-label="Отменить отзыв"
                        style={{
                          '@media (max-width: 640px)': {
                            padding: '8px 12px',
                            fontSize: '14px',
                          }
                        }}
                      >
                        Отмена
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleFeedbackSubmit}
                        className="px-6 py-3 bg-accent-primary text-primary rounded-lg hover:bg-accent-primary/90 transition font-medium shadow-card"
                        aria-label="Отправить отзыв"
                        style={{
                          '@media (max-width: 640px)': {
                            padding: '8px 12px',
                            fontSize: '14px',
                          }
                        }}
                      >
                        Отправить
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-accent-primary text-primary p-4 rounded-full shadow-card hover:bg-accent-primary/90 transition duration-300 z-50"
            onClick={() => navigate('/support')}
            aria-label="Открыть поддержку"
            style={{
              '@media (max-width: 640px)': {
                padding: '10px',
                bottom: '16px',
                right: '16px',
              }
            }}
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6" style={{
              '@media (max-width: 640px)': {
                width: '20px',
                height: '20px',
              }
            }} />
          </motion.button>

          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="py-6 border-t border-primary/50 text-center text-secondary text-sm font-sans"
          >
            <p>© 2025 Fluvion. Все права защищены.</p>
            <p className="mt-1 text-accent-primary">Обновлено: 20.10.2025</p>
          </motion.footer>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default FAQSection;