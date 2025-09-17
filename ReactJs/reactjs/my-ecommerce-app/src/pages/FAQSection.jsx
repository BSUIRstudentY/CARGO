import React, { useState, useEffect } from 'react';

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
        <div className="text-center text-red-400 p-6">
          Произошла ошибка. Пожалуйста, попробуйте позже или свяжитесь с поддержкой.
        </div>
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

  const faqs = [
    {
      question: 'Что такое карго-доставка на Fluvion?',
      answer: 'Карго-доставка — это объединение заказов в сборный груз для транспортировки из Китая в Беларусь через транспортную компанию Карго. Это позволяет снизить стоимость доставки и упростить таможенные процедуры. Подробности в <a href="/public-offer" className="text-[var(--accent-color)] underline">Публичной оферте</a>.',
    },
    {
      question: 'Как рассчитывается стоимость доставки из Китая?',
      answer: 'Стоимость доставки складывается из $6 за каждый килограмм товара (минимальный вес — 1 кг) плюс услуги Европочты, зависящие от региона и типа доставки. Итоговая стоимость отображается в <span className="font-bold text-[var(--accent-color)]">Терминале</span> после проверки заказа. Подробности в <a href="/public-offer" className="text-[var(--accent-color)] underline">Публичной оферте</a>.',
    },
    {
      question: 'Сколько времени занимает доставка заказа?',
      answer: 'Сроки зависят от этапов доставки: транспортировка из Китая в Беларусь занимает 18–35 дней, доставка Европочтой — 2–5 дней в зависимости от региона. Вы получите трек-номер для отслеживания. Подробности в <a href="/public-offer" className="text-[var(--accent-color)] underline">Публичной оферте</a>.',
    },
    {
      question: 'Как отправить товар на ваш склад в Китае?',
      answer: 'После оформления заказа в <span className="font-bold text-[var(--accent-color)]">Терминале</span> мы предоставим адрес нашего склада в Китае, имя получателя и контактный номер для китайского курьера. Передайте эти данные продавцу. Подробности в <a href="/public-offer" className="text-[var(--accent-color)] underline">Публичной оферте</a>.',
    },
    {
      question: 'Можно ли отправить товары, купленные мной самостоятельно?',
      answer: 'Да, вы можете отправить купленные товары на наш склад в Китае. После оформления заказа в <span className="font-bold text-[var(--accent-color)]">Терминале</span> предоставьте трек-номера посылок, и мы объединим их в сборный груз. Подробности в <a href="/public-offer" className="text-[var(--accent-color)] underline">Публичной оферте</a>.',
    },
    {
      question: 'Какие товары нельзя отправлять через карго?',
      answer: 'Запрещены к отправке оружие, наркотики, скоропортящиеся продукты, жидкости без согласования, аккумуляторы без специальной упаковки, драгоценности и наличные. Полный список в <a href="/public-offer" className="text-[var(--accent-color)] underline">Публичной оферте</a>.',
    },
    {
      question: 'Как оплатить заказ и доставку?',
      answer: 'Оплата заказа производится через эквайринг Альфа-Банка (Visa, Mastercard) после подтверждения заказа. Полная стоимость доставки ($6/кг + услуги Европочты) оплачивается при получении в отделении Европочты. Все транзакции защищены 256-битным SSL-шифрованием. Подробности в <a href="/public-offer" className="text-[var(--accent-color)] underline">Публичной оферте</a>.',
    },
    {
      question: 'Как узнать, что мой заказ прибыл?',
      answer: 'После прибытия заказа на склад в Минске и передачи в Европочту вы получите уведомление по email, SMS или в разделе <span className="font-bold text-[var(--accent-color)]">Отправления</span> в вашем профиле с трек-номером для отслеживания. Подробности в <a href="/public-offer" className="text-[var(--accent-color)] underline">Публичной оферте</a>.',
    },
    {
      question: 'Проверяете ли вы товары на складе?',
      answer: 'Мы проверяем целостность упаковки. За дополнительную плату (от $5) возможна проверка качества, количества или тестирование техники. Укажите это при оформлении заказа в <span className="font-bold text-[var(--accent-color)]">Терминале</span>. Подробности в <a href="/public-offer" className="text-[var(--accent-color)] underline">Публичной оферте</a>.',
    },
    {
      question: 'Что делать, если товар повреждён?',
      answer: 'Если товар повреждён по нашей вине и вы выбрали страховку груза, мы компенсируем стоимость. Если виноват поставщик, мы поможем составить претензию. Ответственность за качество товаров из <span className="font-bold text-[var(--accent-color)]">Терминала</span> лежит на покупателе, для <span className="font-bold text-[var(--accent-color)]">Каталога</span> ориентируйтесь на отзывы. Подробности в <a href="/public-offer" className="text-[var(--accent-color)] underline">Публичной оферте</a>.',
    },
    {
      question: 'Можно ли вернуть товар?',
      answer: 'Возврат невозможен, так как оплата производится после подтверждения полной стоимости, и вы должны быть уверены в товаре. Если товар заказан через <span className="font-bold text-[var(--accent-color)]">Каталог</span>, ориентируйтесь на отзывы и дату последней покупки. Подробности в <a href="/public-offer" className="text-[var(--accent-color)] underline">Публичной оферте</a>.',
    },
  ];

  useEffect(() => {
    localStorage.setItem('recentlyViewedFAQs', JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
    if (activeIndex !== index) {
      setRecentlyViewed((prev) => {
        const newViewed = [index, ...prev.filter((i) => i !== index)].slice(0, 3);
        return newViewed;
      });
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const validateFeedback = () => {
    const newErrors = {};
    if (!feedback.name.trim()) newErrors.name = 'Имя обязательно';
    if (!feedback.email.trim()) newErrors.email = 'Email обязателен';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(feedback.email)) newErrors.email = 'Неверный формат email';
    if (!feedback.message.trim()) newErrors.message = 'Сообщение обязательно';
    setFeedbackErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (validateFeedback()) {
      alert(`Спасибо, ${feedback.name}! Ваше сообщение отправлено: ${feedback.message}`);
      setFeedback({ name: '', email: '', message: '' });
      setFeedbackVisible(false);
      setFeedbackErrors({});
    }
  };

  const filteredFAQs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ErrorBoundary>
      <div className="mx-auto min-h-screen max-w-7xl bg-gradient-to-b from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="none"%3E%3Crect width="100" height="100" fill="url(%23pattern0)" /%3E%3Cdefs%3E%3Cpattern id="pattern0" patternUnits="userSpaceOnUse" width="50" height="50"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.5"/%3E%3C/pattern%3E%3C/defs%3E%3C/svg%3E')`,
            backgroundRepeat: 'repeat',
            zIndex: 0,
          }}
        ></div>
        <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 w-full lg:sticky lg:top-16 bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-700/50 transition-all duration-300">
            <h3 className="text-lg font-semibold text-[var(--accent-color)] mb-4">Навигация по FAQ</h3>
            <div className="text-gray-300 mb-4">
              Полные условия в <a href="/public-offer" className="text-[var(--accent-color)] underline">Публичной оферте</a>.
            </div>
            <ul className="space-y-2">
              {faqs.map((faq, index) => (
                <li key={index}>
                  <button
                    onClick={() => toggleFAQ(index)}
                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 text-gray-300 hover:text-white ${activeIndex === index ? 'bg-gray-700 text-white' : ''}`}
                  >
                    {faq.question}
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setFeedbackVisible(true)}
              className="mt-6 w-full bg-[var(--accent-color)] text-white py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300"
            >
              Оставить отзыв
            </button>
          </aside>
          <main className="flex-1">
            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Поиск по вопросам..."
                className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300"
              />
            </div>
            <div className="space-y-4">
              {filteredFAQs.length > 0 ? (
                filteredFAQs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700/50 hover:border-[var(--accent-color)] transition-all duration-300"
                  >
                    <h2
                      className="text-xl font-semibold text-[var(--accent-color)] mb-3 flex items-center cursor-pointer"
                      onClick={() => toggleFAQ(index)}
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                      </svg>
                      {faq.question}
                      <span className="ml-auto transform transition-transform duration-300">
                        {activeIndex === index ? '▲' : '▼'}
                      </span>
                    </h2>
                    {activeIndex === index && (
                      <div className="text-gray-300 text-sm leading-relaxed animate-fade-in" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center">Ничего не найдено. Попробуйте другой запрос!</div>
              )}
            </div>
            {recentlyViewed.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-[var(--accent-color)] mb-4">Недавно просматриваемые</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentlyViewed.map((index) => (
                    <div
                      key={index}
                      className="bg-gray-700 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                      onClick={() => toggleFAQ(index)}
                    >
                      <p className="text-gray-200 truncate">{faqs[index].question}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
        {feedbackVisible && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-full max-w-md">
              <h2 className="text-xl font-semibold text-gray-200 mb-4">Оставить отзыв</h2>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div>
                  <label className="block text-md font-medium text-gray-300 mb-2">Имя *</label>
                  <input
                    type="text"
                    value={feedback.name}
                    onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                    className={`w-full px-3 py-2 bg-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] ${feedbackErrors.name ? 'border-red-500' : 'border-gray-500'}`}
                  />
                  {feedbackErrors.name && <p className="text-red-400 text-xs mt-1">{feedbackErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    value={feedback.email}
                    onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                    className={`w-full px-3 py-2 bg-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] ${feedbackErrors.email ? 'border-red-500' : 'border-gray-500'}`}
                  />
                  {feedbackErrors.email && <p className="text-red-400 text-xs mt-1">{feedbackErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-md font-medium text-gray-300 mb-2">Сообщение *</label>
                  <textarea
                    value={feedback.message}
                    onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                    className={`w-full px-3 py-2 bg-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] ${feedbackErrors.message ? 'border-red-500' : 'border-gray-500'}`}
                    rows="4"
                  />
                  {feedbackErrors.message && <p className="text-red-400 text-xs mt-1">{feedbackErrors.message}</p>}
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setFeedbackVisible(false)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition-all duration-300"
                  >
                    Отправить
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <button
          className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 z-50"
          onClick={() => alert('Чат поддержки открыт!')}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z" />
          </svg>
        </button>
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 Fluvion. Все права защищены.</p>
          <p className="mt-1 animate-pulse text-[var(--accent-color)]">Обновлено: 17.09.2025 19:06 CEST</p>
        </div>
      </div>
    </ErrorBoundary>
  );
}

const styles = `
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.animate-pulse {
  animation: pulse 1.5s infinite;
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default FAQSection;