import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center text-red-400 p-6 bg-red-500/20 border-red-500/50 rounded-lg"
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

  // FAQ data
  const faqs = [
    {
      question: 'Что такое карго-доставка на Fluvion?',
      answer: 'Карго-доставка — это объединение заказов в сборный груз для транспортировки из Китая в Беларусь через транспортную компанию Карго. Это позволяет снизить стоимость доставки и упростить таможенные процедуры. Подробности в <a href="/public-offer" className="text-cyan-400 underline">Публичной оферте</a>.',
    },
    {
      question: 'Как рассчитывается стоимость доставки из Китая?',
      answer: 'Стоимость доставки складывается из $6 за каждый килограмм товара (минимальный вес — 1 кг) плюс услуги Европочты, зависящие от региона и типа доставки. Итоговая стоимость отображается в <span className="font-bold text-cyan-400">Терминале</span> после проверки заказа. Подробности в <a href="/public-offer" className="text-cyan-400 underline">Публичной оферте</a>.',
    },
    {
      question: 'Сколько времени занимает доставка заказа?',
      answer: 'Сроки зависят от этапов доставки: транспортировка из Китая в Беларусь занимает 18–35 дней, доставка Европочтой — 2–5 дней в зависимости от региона. Вы получите трек-номер для отслеживания. Подробности в <a href="/public-offer" className="text-cyan-400 underline">Публичной оферте</a>.',
    },
    {
      question: 'Как отправить товар на ваш склад в Китае?',
      answer: 'После оформления заказа в <span className="font-bold text-cyan-400">Терминале</span> мы предоставим адрес нашего склада в Китае, имя получателя и контактный номер для китайского курьера. Передайте эти данные продавцу. Подробности в <a href="/public-offer" className="text-cyan-400 underline">Публичной оферте</a>.',
    },
    {
      question: 'Можно ли отправить товары, купленные мной самостоятельно?',
      answer: 'Да, вы можете отправить купленные товары на наш склад в Китае. После оформления заказа в <span className="font-bold text-cyan-400">Терминале</span> предоставьте трек-номера посылок, и мы объединим их в сборный груз. Подробности в <a href="/public-offer" className="text-cyan-400 underline">Публичной оферте</a>.',
    },
    {
      question: 'Какие товары нельзя отправлять через карго?',
      answer: 'Запрещены к отправке оружие, наркотики, скоропортящиеся продукты, жидкости без согласования, аккумуляторы без специальной упаковки, драгоценности и наличные. Полный список в <a href="/public-offer" className="text-cyan-400 underline">Публичной оферте</a>.',
    },
    {
      question: 'Как оплатить заказ и доставку?',
      answer: 'Оплата заказа производится через эквайринг Альфа-Банка (Visa, Mastercard) после подтверждения заказа. Полная стоимость доставки ($6/кг + услуги Европочты) оплачивается при получении в отделении Европочты. Все транзакции защищены 256-битным SSL-шифрованием. Подробности в <a href="/public-offer" className="text-cyan-400 underline">Публичной оферте</a>.',
    },
    {
      question: 'Как узнать, что мой заказ прибыл?',
      answer: 'После прибытия заказа на склад в Минске и передачи в Европочту вы получите уведомление по email, SMS или в разделе <span className="font-bold text-cyan-400">Отправления</span> в вашем профиле с трек-номером для отслеживания. Подробности в <a href="/public-offer" className="text-cyan-400 underline">Публичной оферте</a>.',
    },
    {
      question: 'Проверяете ли вы товары на складе?',
      answer: 'Мы проверяем целостность упаковки. За дополнительную плату (от $5) возможна проверка качества, количества или тестирование техники. Укажите это при оформлении заказа в <span className="font-bold text-cyan-400">Терминале</span>. Подробности в <a href="/public-offer" className="text-cyan-400 underline">Публичной оферте</a>.',
    },
    {
      question: 'Что делать, если товар повреждён?',
      answer: 'Если товар повреждён по нашей вине и вы выбрали страховку груза, мы компенсируем стоимость. Если виноват поставщик, мы поможем составить претензию. Ответственность за качество товаров из <span className="font-bold text-cyan-400">Терминала</span> лежит на покупателе, для <span className="font-bold text-cyan-400">Каталога</span> ориентируйтесь на отзывы. Подробности в <a href="/public-offer" className="text-cyan-400 underline">Публичной оферте</a>.',
    },
    {
      question: 'Можно ли вернуть товар?',
      answer: 'Возврат невозможен, так как оплата производится после подтверждения полной стоимости, и вы должны быть уверены в товаре. Если товар заказан через <span className="font-bold text-cyan-400">Каталог</span>, ориентируйтесь на отзывы и дату последней покупки. Подробности в <a href="/public-offer" className="text-cyan-400 underline">Публичной оферте</a>.',
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
  const filteredFAQs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ErrorBoundary>
      <section className="min-h-screen flex items-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative max-w-7xl w-full mx-auto bg-gray-800/90 backdrop-blur-lg rounded-xl p-8 border border-cyan-400/20 shadow-lg hover:shadow-cyan-400/20 transition-shadow duration-300 overflow-hidden"
        >
          {/* Decorative Background Pattern */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.5"/%3E%3C/svg%3E')`,
              backgroundRepeat: 'repeat',
            }}
          ></div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <QuestionMarkCircleIcon className="w-10 h-10 text-cyan-400" />
            </motion.div>
            <h2 className="text-4xl font-bold text-white tracking-tight">Часто задаваемые вопросы</h2>
          </div>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-6 text-sm text-gray-300 text-center"
          >
            Найдите ответы на популярные вопросы о доставке, оплате и заказах. <br />
            Подробности в <a href="/public-offer" className="text-cyan-400 hover:underline">Публичной оферте</a>.
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-6"
          >
            <div className="relative">
              <QuestionMarkCircleIcon className="absolute top-3 left-3 w-6 h-6 text-cyan-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Поиск по вопросам..."
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 text-white border border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-300 text-base"
              />
            </div>
          </motion.div>

          {/* FAQ Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="lg:w-64 w-full bg-gray-900/50 p-4 rounded-lg border border-gray-700/20"
            >
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">Навигация по FAQ</h3>
              <ul className="space-y-2">
                {faqs.map((faq, index) => (
                  <li key={index}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleFAQ(index)}
                      className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 text-gray-300 hover:text-white ${activeIndex === index ? 'bg-gray-700 text-white' : ''}`}
                    >
                      {faq.question}
                    </motion.button>
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFeedbackVisible(true)}
                className="mt-6 w-full py-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 transition duration-300 text-base font-medium"
              >
                Оставить отзыв
              </motion.button>
            </motion.aside>

            {/* Main Content */}
            <motion.main
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex-1"
            >
              <div className="space-y-4">
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((faq, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="bg-gray-900/50 p-6 rounded-lg border border-gray-700/20 shadow-lg hover:shadow-cyan-400/20 transition-shadow duration-300"
                    >
                      <h2
                        className="text-xl font-semibold text-cyan-400 mb-3 flex items-center cursor-pointer"
                        onClick={() => toggleFAQ(index)}
                      >
                        <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                        {faq.question}
                        <span className="ml-auto transform transition-transform duration-300">
                          {activeIndex === index ? '▲' : '▼'}
                        </span>
                      </h2>
                      {activeIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                          className="text-gray-300 text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: faq.answer }}
                        />
                      )}
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-400 text-center"
                  >
                    Ничего не найдено. Попробуйте другой запрос!
                  </motion.div>
                )}
              </div>

              {/* Recently Viewed FAQs */}
              {recentlyViewed.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="mt-8"
                >
                  <h3 className="text-lg font-semibold text-cyan-400 mb-4">Недавно просматриваемые</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentlyViewed.map((index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/20 shadow-lg hover:shadow-cyan-400/20 transition-shadow duration-300 cursor-pointer"
                        onClick={() => toggleFAQ(index)}
                      >
                        <p className="text-gray-200 truncate">{faqs[index].question}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.main>
          </div>

          {/* Feedback Modal */}
          {feedbackVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-gray-900/75 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800/90 backdrop-blur-lg p-6 rounded-lg w-full max-w-md border border-cyan-400/20 shadow-lg"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Оставить отзыв</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Имя *</label>
                    <input
                      type="text"
                      value={feedback.name}
                      onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                      className={`w-full px-3 py-2 bg-gray-900/50 text-white border ${feedbackErrors.name ? 'border-red-500' : 'border-gray-700/20'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-300 text-base`}
                    />
                    {feedbackErrors.name && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-red-400 text-xs mt-1"
                      >
                        {feedbackErrors.name}
                      </motion.p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                    <input
                      type="email"
                      value={feedback.email}
                      onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                      className={`w-full px-3 py-2 bg-gray-900/50 text-white border ${feedbackErrors.email ? 'border-red-500' : 'border-gray-700/20'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-300 text-base`}
                    />
                    {feedbackErrors.email && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-red-400 text-xs mt-1"
                      >
                        {feedbackErrors.email}
                      </motion.p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Сообщение *</label>
                    <textarea
                      value={feedback.message}
                      onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                      className={`w-full px-3 py-2 bg-gray-900/50 text-white border ${feedbackErrors.message ? 'border-red-500' : 'border-gray-700/20'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-300 text-base`}
                      rows="4"
                    />
                    {feedbackErrors.message && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="text-red-400 text-xs mt-1"
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
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300 text-base font-medium"
                    >
                      Отмена
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFeedbackSubmit}
                      className="px-4 py-2 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 transition duration-300 text-base font-medium"
                    >
                      Отправить
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Support Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-6 right-6 bg-cyan-400 text-white p-4 rounded-full shadow-lg hover:bg-cyan-500 transition duration-300 z-50"
            onClick={() => navigate('/login')}
          >
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
          </motion.button>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mt-12 text-center text-gray-400 text-sm"
          >
            <p>© 2025 Fluvion. Все права защищены.</p>
            <p className="mt-1 text-cyan-400">Обновлено: 17.09.2025 19:06 CEST</p>
          </motion.div>
        </motion.div>
      </section>
    </ErrorBoundary>
  );
}

export default FAQSection;