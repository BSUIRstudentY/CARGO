import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const DeliveryPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Определяем активный маршрут для подсветки кнопок
  const isActive = (path) => location.pathname === path;

  return (
    <section className="mx-auto px-4 text-white min-h-screen relative overflow-hidden">
      {/* Фон с текстурой контейнера */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .step-card {
          animation: slideIn 0.5s ease-out forwards;
        }
        .step-card:nth-child(2) { animation-delay: 0.1s; }
        .step-card:nth-child(3) { animation-delay: 0.2s; }
        .step-card:nth-child(4) { animation-delay: 0.3s; }
        .step-card:nth-child(5) { animation-delay: 0.4s; }
        .timeline-dot {
          transition: transform 0.3s ease, background-color 0.3s ease;
          transform: translate(-50%, -50%);
        }
        .timeline-dot:hover {
          transform: translate(-50%, -50%) scale(1.2);
        }
        .cta-button {
          animation: pulse 2s infinite;
        }
        .image-hover {
          transition: filter 0.3s ease, transform 0.3s ease;
        }
        .image-hover:hover {
          filter: none;
          transform: scale(1.05);
        }
      `}</style>
      <div className="max-w-6xl mx-auto py-10 md:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="col-span-12">
            {/* Заголовок */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 text-center">
              Доставка и оплата
            </h1>
            {/* Основной контент */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-10">
              {/* Способы оплаты */}
              <div className="step-card bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
                <div className="flex items-center mb-4">
                  <svg className="w-8 h-8 mr-2 fill-current text-[var(--accent-color)]" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-6 12H6v-2h8v2zm4-4H6v-2h12v2zm0-4H6V6h12v2z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-[var(--accent-color)]">Способы оплаты</h2>
                </div>
                <p className="text-gray-300 mb-4">
                  На сайте Fluvion мы предлагаем удобные и прозрачные способы оплаты. Итоговая стоимость заказа формируется из следующих компонентов:
                </p>
                <ul className="list-disc pl-5 space-y-3 text-gray-300">
                  <li>
                    <strong>Цена товара:</strong> Рассчитывается по актуальному курсу Альфа-Банка с добавлением сервисного сбора 10%. Курс обновляется ежедневно для соответствия международным ценам.
                  </li>
                  <li>
                    <strong>Упаковка:</strong> Стандартная упаковка стоит $3, для хрупких товаров — $5. Это обеспечивает защиту ваших заказов во время транспортировки.
                  </li>
                  <li>
                    <strong>Доставка по Китаю:</strong> После проверки заказа администратором вы увидите конечную стоимость доставки каждого товара по Китаю в <span className="font-bold text-[var(--accent-color)]">Терминале</span>.
                  </li>
                  <li>
                    <strong>Таможенные платежи:</strong> Все таможенные процедуры организуются через транспортную компанию Карго, что упрощает процесс ввоза товаров в Беларусь.
                  </li>
                  <li>
                    <strong>Комиссия компании:</strong> Составляет 10% от стоимости заказа. Это плата за организацию закупки, координацию логистики, проверку качества и поддержку клиентов.
                  </li>
                </ul>
                <p className="text-gray-300 mt-4">
                  Итоговая стоимость заказа отображается в <span className="font-bold text-[var(--accent-color)]">Профиле</span> после проверки администрацией заказа. Оплата осуществляется через эквайринг Альфа-Банка, обеспечивающий безопасность транзакций с использованием 256-битного SSL-шифрования.
                </p>
              </div>
              {/* Способы доставки */}
              <div className="step-card bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
                <div className="flex items-center mb-4">
                  <svg className="w-8 h-8 mr-2 fill-current text-[var(--accent-color)]" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 12l-8-5v-2l8 5 8-5v2l-8 5z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-[var(--accent-color)]">Способы доставки</h2>
                </div>
                <p className="text-gray-300 mb-4">
                  Мы организуем доставку через Европочту, чтобы обеспечить удобство и надёжность. Процесс начинается после проверки товаров на нашем складе в Минске.
                </p>
                <ul className="list-disc pl-5 space-y-3 text-gray-300">
                  <li>
                    <strong>Доставка:</strong> Осуществляется через отделения Европочты. Вы выбираете удобное отделение при оформлении заказа в <span className="font-bold text-[var(--accent-color)]">Корзине</span>.
                  </li>
                  <li>
                    <strong>Стоимость доставки:</strong> Рассчитывается как $6 за каждый килограмм товара плюс стоимость услуг Европочты, которая зависит от региона и типа доставки.
                  </li>
                </ul>
                <p className="text-gray-300 mt-4">
                  После оформления заказа вы получите уведомление с трек-номером и ориентировочным сроком доставки. Укажите любые пожелания по доставке в <span className="font-bold text-[var(--accent-color)]">Терминале</span>, и мы постараемся их учесть.
                </p>
              </div>
              {/* Действия с заказами */}
              <div className="step-card bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
                <div className="flex items-center mb-4">
                  <svg className="w-8 h-8 mr-2 fill-current text-[var(--accent-color)]" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 9H6V7h6v4zm6 0h-2V7h2v4zm0 4h-6v-2h6v2z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-[var(--accent-color)]">Действия с заказами</h2>
                </div>
                <p className="text-gray-300 mb-4">
                  На сайте Fluvion мы разработали удобную систему управления заказами, чтобы упростить процесс покупки и отслеживания.
                </p>
                <ul className="list-none pl-0 mt-2 space-y-3 text-gray-300">
                  <li>
                    <strong>Оформление заказа:</strong> В <span className="font-bold text-[var(--accent-color)]">Терминале</span> вы можете создать заказ, указав характеристики товаров (размер, цвет, количество) и ссылки на товары. После подтверждения заказа он передаётся в обработку.
                  </li>
                  <li>
                    <strong>Каталог:</strong> Содержит товары, проверенные администрацией. Это товары, которые ранее заказывали другие клиенты, что гарантирует их качество и надёжность.
                  </li>
                  <li>
                    <strong>Отслеживание заказов:</strong> В разделе профиля вы можете оплатить заказ и отслеживать его статус. После оплаты заказ включается в ближайший сборный груз. В разделе <span className="font-bold text-[var(--accent-color)]">Отправления</span> доступна информация о статусе выкупа и доставки каждого товара.
                  </li>
                </ul>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                  <button
                    onClick={() => navigate('/catalog')}
                    className={`cta-button bg-[var(--accent-color)] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition duration-300 ${
                      isActive('/catalog') ? 'ring-2 ring-offset-2 ring-[var(--accent-color)]' : ''
                    } w-full sm:w-auto`}
                  >
                    Перейти в Каталог
                  </button>
                  <button
                    onClick={() => navigate('/terminal')}
                    className={`cta-button bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 ${
                      isActive('/terminal') ? 'ring-2 ring-offset-2 ring-blue-600' : ''
                    } w-full sm:w-auto`}
                  >
                    Перейти в Терминал
                  </button>
                </div>
              </div>
              {/* Правила оплаты и безопасности */}
              <div className="step-card bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
                <div className="flex items-center mb-4">
                  <svg className="w-8 h-8 mr-2 fill-current text-[var(--accent-color)]" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-[var(--accent-color)]">Правила оплаты и безопасность</h2>
                </div>
                <p className="text-gray-300">
                  Безопасность ваших данных — наш приоритет. Оплата осуществляется через эквайринг Альфа-Банка:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-3 text-gray-300">
                  <li>
                    <strong>Банковские карты:</strong> Принимаем карты Visa и Mastercard. Все транзакции защищены 256-битным SSL-шифрованием и проходят через систему 3D-Secure для дополнительной безопасности.
                  </li>
                </ul>
              </div>
              {/* Правила возврата */}
              <div className="step-card bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
                <div className="flex items-center mb-4">
                  <svg className="w-8 h-8 mr-2 fill-current text-[var(--accent-color)]" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-[var(--accent-color)]">Правила возврата</h2>
                </div>
                <p className="text-gray-300">
                  На сайте Fluvion действуют следующие правила возврата:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-3 text-gray-300">
                  <li>
                    <strong>Отсутствие возврата:</strong> Оплата производится только после подтверждения полной стоимости заказа. Убедитесь, что вы полностью уверены в выборе товара перед оплатой.
                  </li>
                  <li>
                    <strong>Ответственность за качество:</strong> Если вы выбираете поставщика через <span className="font-bold text-[var(--accent-color)]">Терминал</span>, мы не несём ответственности за качество товара. При выборе товаров из <span className="font-bold text-[var(--accent-color)]">Каталога</span> ориентируйтесь на отзывы и дату последней покупки.
                  </li>
                  <li>
                    <strong>Компенсация:</strong> Мы можем компенсировать стоимость заказа, если товар пришёл с браком или повреждён по нашей вине, при условии, что вы выбрали страховку груза при оформлении заказа.
                  </li>
                </ul>
                <p className="text-gray-300 mt-4">
                  Если у вас есть вопросы, свяжитесь с нашей службой поддержки по email{' '}
                  <a href="mailto:support@fluvion.com" className="text-[var(--accent-color)] underline hover:text-opacity-80">
                    support@fluvion.com
                  </a>{' '}
                  или по телефону{' '}
                  <a href="tel:+375291234567" className="text-[var(--accent-color)] underline hover:text-opacity-80">
                    +375 29 123-45-67
                  </a>. Наша поддержка доступна 24/7.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliveryPayment;