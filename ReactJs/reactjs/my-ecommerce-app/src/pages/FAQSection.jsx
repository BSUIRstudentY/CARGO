import React, { useState, useEffect } from 'react';

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
      question: 'Что такое карго-доставка?',
      answer: 'Привет! Карго-доставка — это крутой способ привезти товары из Китая в Беларусь, объединяя заказы разных клиентов в один сборный груз. Это помогает снизить стоимость и упростить таможню. С нами ты получишь выгоду и удобство в одном флаконе! 😊',
    },
    {
      question: 'Сколько стоит доставка из Китая?',
      answer: 'О, это зависит от нескольких моментов! Выбирай способ доставки, вес и объём груза. Вот примеры: авиа — от 8–12 $/кг (7–12 дней), авто/ЖД — от 4–6 $/кг (18–35 дней). Минимальный вес для расчёта — 1 кг. Хочешь точный расчёт? Напиши нам, и мы всё посчитаем! 🚚',
    },
    {
      question: 'Сколько времени занимает доставка?',
      answer: 'Сроки зависят от способа! Авиа доставит твой заказ за 7–12 дней, а авто/ЖД — за 18–35 дней. Учти сезонные распродажи и таможню — иногда это немного растягивает процесс. Но мы всегда держим тебя в курсе! ⏳',
    },
    {
      question: 'Как мне отправить товар на ваш склад в Китае?',
      answer: 'Просто закажи у нас, и мы сразу пришлём тебе точный адрес склада, имя получателя и телефон для китайского курьера. Укажи эти данные продавцу — и готово! Мы сделаем всё, чтобы твои товары приехали без задержек. 📦',
    },
    {
      question: 'Можно ли отправить товары, которые я уже купил сам?',
      answer: 'Конечно, можно! Пришли нам трек-номера своих посылок, отправленных на наш склад, и мы их примем, проверим, а при необходимости объединим в один груз для отправки в Беларусь. Удобно, правда? 😉',
    },
    {
      question: 'Какие товары запрещено отправлять через карго?',
      answer: 'Есть ограничения, чтобы всё было безопасно! Нельзя отправлять оружие, наркотики, скоропортящиеся продукты, жидкости/гели без согласования, аккумуляторы без спецупаковки и драгоценности с наличными. Если сомневаешься, уточни у нас — расскажем всё по делу! 🚫',
    },
    {
      question: 'Как оплатить доставку?',
      answer: 'У нас гибко! Можешь оплатить наличными в офисе, переводом на карту или через расчётный счёт, если ты юрлицо. При самовыкупе международную доставку оплачиваешь при получении груза. Выбирай, что тебе удобнее! 💳',
    },
    {
      question: 'Как я узнаю, что мой груз прибыл?',
      answer: 'Мы тебя обязательно уведомим! Ожидай SMS, сообщение в Telegram/Viber или звонок от менеджера. Плюс ты можешь следить за статусом в личном кабинете или по трек-номеру. Всё под контролем! 📱',
    },
    {
      question: 'Проверяете ли вы товары на складе?',
      answer: 'По умолчанию мы проверяем только целостность упаковки. Но за доплату можем вскрыть, сфотографировать товар, проверить количество и даже протестировать технику. Хочешь уверенности? Доверь это нам! 🔍',
    },
    {
      question: 'Что делать, если товар повреждён?',
      answer: 'Если мы виноваты, компенсируем стоимость или доставим замену — держим слово! Если проблема от поставщика, поможем составить претензию и вернуть деньги. Мы всегда на твоей стороне! 💪',
    },
    {
      question: 'Можно ли заказать срочную доставку?',
      answer: 'Да, если время поджимает! Срочная авиа-доставка доступна с приоритетной обработкой — сроки от 5–7 дней, но стоимость чуть выше (от 12–15 $/кг). Свяжитесь с нами, и мы организуем всё на высшем уровне! ⚡',
    },
    {
      question: 'Как оформить возврат товара?',
      answer: 'Не переживай! Если что-то пошло не так, сообщи нам с трек-номером и фото проблемы. Мы поможем оформить возврат через китайского поставщика или вернём деньги, если это наша ошибка. Всё просто и быстро! 🔙',
    },
    {
      question: 'Предоставляете ли вы страховку груза?',
      answer: 'Конечно, заботимся о твоём спокойствии! Страховка доступна за дополнительную плату (около 1–2% от стоимости груза). Это защитит твой заказ от непредвиденных ситуаций. Хочешь подключить? Напиши нам! 🛡️',
    },
    {
      question: 'Можно ли заказать консультацию с менеджером?',
      answer: 'Да, с радостью поможем! Запишись на бесплатную консультацию через наш сайт или позвони нам. Менеджер ответит на все вопросы и подберёт идеальное решение для твоих покупок. Ждём тебя! 📞',
    },
    {
      question: 'Как часто обновляются цены на доставку?',
      answer: 'Цены могут меняться из-за курсов валют и сезонных факторов, но мы обновляем их раз в месяц. Следи за новостями на сайте или в личном кабинете, чтобы быть в курсе актуальных тарифов! 📅',
    },
    {
      question: 'Что делать, если груз задерживается на таможне?',
      answer: 'Не волнуйся, мы разберёмся! Если груз задерживается, наш менеджер свяжется с таможней и уведомит тебя о причинах. Мы поможем ускорить процесс или предложим альтернативу. Доверься нам! 🌍',
    },
    {
      question: 'Нужно ли специальное оформление документов?',
      answer: 'В большинстве случаев нет! Мы сами подготовим всё необходимое для таможни, но если у тебя есть специфические документы (например, сертификаты), пришли их нам. Сделаем всё гладко! 📑',
    },
    {
      question: 'Как правильно упаковать товар для отправки?',
      answer: 'Хороший вопрос! Используй прочную упаковку, избегая хрупких материалов. Добавь защиту (пузырчатую плёнку, пенопласт) и укажи "Хрупкое", если нужно. Мы дадим советы, если сомневаешься! 📦',
    },
    {
      question: 'Можно ли отследить груз в реальном времени?',
      answer: 'Да, это просто! После отправки ты получишь трек-номер, по которому можешь следить за перемещением в реальном времени на нашем сайте или через логистическую службу. Всё под контролем! ⏱️',
    },
    {
      question: 'Что включает стоимость доставки?',
      answer: 'Стоимость включает транспортировку, базовую таможенную очистку и обработку на складе. Дополнительно оплачиваются страховка, срочность или проверка товаров. Хочешь подробности? Спроси у нас! 💸',
    },
    {
      question: 'Можно ли отправить груз в выходные дни?',
      answer: 'К сожалению, отправка возможна только в рабочие дни, но мы принимаем грузы на складе и готовим их к отправке. В выходные можно отслеживать статус или связаться с нами по срочным вопросам! 🌞',
    },
    {
      question: 'Как узнать точный вес и объём моего груза?',
      answer: 'Мы взвесим и измерим твой груз на складе в Китае после получения. Результаты пришлём тебе в личный кабинет или по запросу. Так ты всегда будешь в курсе! ⚖️',
    },
    {
      question: 'Что делать, если трек-номер не обновляется?',
      answer: 'Не паникуй! Это бывает из-за задержек у перевозчика. Напиши нам с трек-номером, и мы уточним статус у наших партнёров. Решим всё вместе! 🔍',
    },
    {
      question: 'Предоставляете ли вы помощь с таможенными пошлинами?',
      answer: 'Да, поможем! Мы рассчитаем пошлины и подготовим документы, чтобы всё прошло гладко. Если есть вопросы, наш специалист проконсультирует тебя бесплатно. Удобно, правда? 📜',
    },
    {
      question: 'Можно ли объединить несколько посылок в одну?',
      answer: 'Конечно! Пришли нам трек-номера всех посылок, и мы объединим их на складе в один груз для экономии. Просто укажи это при заказе! 🎁',
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
    <div className="mx-auto min-h-screen max-w-7xl bg-gradient-to-b from-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Background texture overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="none"%3E%3Crect width="100" height="100" fill="url(%23pattern0)" /%3E%3Cdefs%3E%3Cpattern id="pattern0" patternUnits="userSpaceOnUse" width="50" height="50"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.5"/%3E%3C/pattern%3E%3C/defs%3E%3C/svg%3E')`,
        backgroundRepeat: 'repeat',
        zIndex: 0,
      }}></div>

      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row gap-8">
        {/* Sticky Navigation Sidebar */}
        <aside className="lg:w-64 w-full lg:sticky lg:top-16 bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-700/50 transition-all duration-300">
          <h3 className="text-lg font-semibold text-[var(--accent-color)] mb-4">Навигация по FAQ</h3>
          <ul className="space-y-2">
            {faqs.map((faq, index) => (
              <li key={index}>
                <button
                  onClick={() => toggleFAQ(index)}
                  className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 text-gray-300 hover:text-white ${
                    activeIndex === index ? 'bg-gray-700 text-white' : ''
                  }`}
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

        {/* Main Content */}
        <main className="flex-1">
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Поиск по вопросам..."
              className="w-full px-4 py-2 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300"
            />
          </div>

          {/* FAQ Items */}
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
                    <p className="text-gray-300 text-sm leading-relaxed animate-fade-in">{faq.answer}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center">Ничего не найдено. Попробуйте другой запрос!</p>
            )}
          </div>

          {/* Recently Viewed Section */}
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

      {/* Feedback Form */}
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
                  className={`w-full px-3 py-2 bg-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] ${
                    feedbackErrors.name ? 'border-red-500' : 'border-gray-500'
                  }`}
                />
                {feedbackErrors.name && <p className="text-red-400 text-xs mt-1">{feedbackErrors.name}</p>}
              </div>
              <div>
                <label className="block text-md font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={feedback.email}
                  onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                  className={`w-full px-3 py-2 bg-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] ${
                    feedbackErrors.email ? 'border-red-500' : 'border-gray-500'
                  }`}
                />
                {feedbackErrors.email && <p className="text-red-400 text-xs mt-1">{feedbackErrors.email}</p>}
              </div>
              <div>
                <label className="block text-md font-medium text-gray-300 mb-2">Сообщение *</label>
                <textarea
                  value={feedback.message}
                  onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                  className={`w-full px-3 py-2 bg-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] ${
                    feedbackErrors.message ? 'border-red-500' : 'border-gray-500'
                  }`}
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

      {/* Live Chat Button */}
      <button
        className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 z-50"
        onClick={() => alert('Чат поддержки открыт!')}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z" />
        </svg>
      </button>

      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>© 2025 ChinaShopBY. Все права защищены.</p>
        <p className="mt-1 animate-pulse text-[var(--accent-color)]">Обновлено: 08.08.2025 21:55 BST</p>
      </div>
    </div>
  );
}

// Добавление CSS-анимаций
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