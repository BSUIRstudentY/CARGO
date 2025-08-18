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
                  На нашем сайте ChinaShopBY мы стремимся обеспечить максимальное удобство при оплате ваших заказов. Все процессы оплаты прозрачны, безопасны и адаптированы под различные потребности клиентов. Итоговая стоимость заказа формируется из следующих компонентов:
                </p>
                <ul className="list-disc pl-5 space-y-3 text-gray-300">
                  <li>
                    <strong>Цена товара по актуальному курсу:</strong> Стоимость каждого товара рассчитывается на основе курса Национального банка Республики Беларусь на момент оформления заказа. Курс обновляется ежедневно, чтобы обеспечить точное соответствие международным ценам.
                  </li>
                  <li>
                    <strong>Упаковка:</strong> Для защиты товаров во время транспортировки мы используем высококачественные упаковочные материалы, такие как пузырчатая плёнка, картонные коробки и амортизирующие наполнители. Это гарантирует, что ваш заказ прибудет в целости.
                  </li>
                  <li>
                    <strong>Международная доставка:</strong> Покрывает логистические расходы по транспортировке товаров от поставщиков в Китае до нашего склада в Республике Беларусь. Мы сотрудничаем с проверенными международными перевозчиками для обеспечения надёжности и скорости.
                  </li>
                  <li>
                    <strong>Таможенные платежи:</strong> Включают все пошлины, налоги и сборы, необходимые для законного ввоза товаров в Беларусь. Мы берём на себя оформление всех таможенных документов, чтобы упростить процесс для вас.
                  </li>
                  <li>
                    <strong>Комиссия компании:</strong> Небольшая плата за услуги нашей команды, которая включает организацию закупки, координацию логистики, проверку качества товаров и круглосуточную поддержку клиентов.
                  </li>
                </ul>
                <p className="text-gray-300 mt-4">
                  Итоговая стоимость заказа рассчитывается автоматически и отображается в <span className="font-bold text-[var(--accent-color)]">Терминале</span> после выбора товаров и параметров. Мы предлагаем несколько способов оплаты для вашего удобства: банковские карты (Visa, Mastercard), электронные кошельки (WebMoney, ЮMoney, Qiwi), а также банковский перевод для юридических лиц. Все транзакции защищены 256-битным SSL-шифрованием, а данные ваших карт не сохраняются на наших серверах, что гарантирует полную конфиденциальность.
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
                  Мы сотрудничаем с ведущей логистической компанией СДЭК, чтобы гарантировать быструю, безопасную и удобную доставку по всей Республике Беларусь. Процесс доставки начинается после прибытия товаров на наш склад в Минске, где они проходят финальную проверку качества. Мы предлагаем следующие варианты доставки:
                </p>
                <ul className="list-disc pl-5 space-y-3 text-gray-300">
                  <li>
                    <strong>Бесплатная доставка:</strong> Доступна для заказов на сумму от 100 рублей. Срок доставки составляет 3–5 рабочих дней, в зависимости от вашего региона (например, Минск — 3 дня, удалённые регионы — до 5 дней). Доставка осуществляется до пункта выдачи СДЭК или курьером по вашему адресу.
                  </li>
                  <li>
                    <strong>Платная доставка:</strong> Стоимость составляет 10 рублей для заказов на сумму менее 100 рублей. Срок доставки — 2–4 рабочих дня. Вы можете выбрать доставку до ближайшего пункта выдачи или до двери, если эта услуга доступна в вашем регионе.
                  </li>
                </ul>
                <p className="text-gray-300 mt-4">
                  После оформления заказа в <span className="font-bold text-[var(--accent-color)]">Терминале</span> вы получите подтверждение с ориентировочным сроком доставки, который зависит от вашего местоположения. Мы отправим уведомление по email или телефону с трек-номером для отслеживания и точной датой доставки. Если у вас есть особые пожелания по доставке, укажите их при оформлении, и наша команда постарается их учесть.
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
                  Мы создали интуитивно понятную систему управления заказами, чтобы вы могли легко оформлять новые покупки и следить за существующими. Наш интерфейс позволяет вам:
                </p>
                <ul className="list-none pl-0 mt-2 space-y-3 text-gray-300">
                  <li>
                    <strong>Оформление заказа:</strong> В <span className="font-bold text-[var(--accent-color)]">Терминале</span> вы можете просматривать каталог товаров, выбирать нужные позиции, указывать параметры (например, размер, цвет или количество), а также проверять итоговую стоимость с учётом всех сборов. После подтверждения заказа и оплаты он передаётся в обработку. Вы получите email-подтверждение с деталями заказа и ожидаемыми сроками доставки.
                  </li>
                  <li>
                    <strong>Отслеживание заказов:</strong> Все ваши заказы доступны в <span className="font-bold text-[var(--accent-color)]">Каталоге</span>. Здесь вы можете проверить статус (например, «в обработке», «отправлен», «доставлен»), посмотреть детали заказа (номер, состав, стоимость) и скачать электронные документы, такие как счёт или чек.
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
                  Безопасность ваших данных — наш главный приоритет. Мы предлагаем удобные и защищённые способы оплаты, чтобы вы могли совершать покупки без беспокойства:
                  <ul className="list-disc pl-5 mt-2 space-y-3">
                    <li>
                      <strong>Банковские карты:</strong> Мы принимаем карты Visa и Mastercard. Все транзакции проходят через систему 3D-Secure, которая требует дополнительного подтверждения (например, кода из SMS или приложения банка) для защиты от мошенничества.
                    </li>
                    <li>
                      <strong>Электронные кошельки:</strong> Поддерживаем популярные сервисы, такие как WebMoney, ЮMoney и Qiwi. Это быстрый и удобный способ оплаты, особенно для тех, кто предпочитает цифровые платёжные системы.
                    </li>
                    <li>
                      <strong>Банковский перевод:</strong> Доступен для юридических лиц и индивидуальных предпринимателей. Мы предоставляем полный пакет документов (счёт-фактуру, договор) для упрощения бухгалтерского учёта.
                    </li>
                  </ul>
                  Все платежи обрабатываются через защищённое соединение с использованием 256-битного SSL-протокола, который обеспечивает шифрование данных. Мы не храним данные ваших банковских карт или платёжных систем на наших серверах, что гарантирует полную конфиденциальность и безопасность.
                </p>
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
                  Мы хотим, чтобы вы были полностью удовлетворены покупкой. Если товар не оправдал ваших ожиданий, вы можете оформить возврат в соответствии с Законом Республики Беларусь «О защите прав потребителей». Условия возврата:
                  <ul className="list-disc pl-5 mt-2 space-y-3">
                    <li>
                      <strong>Срок возврата:</strong> Вы можете вернуть товар в течение 14 календарных дней с момента его получения, при условии, что он не был в использовании.
                    </li>
                    <li>
                      <strong>Состояние товара:</strong> Товар должен быть возвращён в оригинальной упаковке, с сохранением всех ярлыков, этикеток и без следов использования (например, без царапин, пятен или запахов).
                    </li>
                    <li>
                      <strong>Процесс возврата:</strong> Для начала процедуры возврата свяжитесь с нашей службой поддержки по email{' '}
                      <a href="mailto:support@chinashopby.com" className="text-[var(--accent-color)] underline hover:text-opacity-80">
                        support@chinashopby.com
                      </a>{' '}
                      или по телефону{' '}
                      <a href="tel:+375291234567" className="text-[var(--accent-color)] underline hover:text-opacity-80">
                        +375 29 123-45-67
                      </a>. Мы предоставим вам форму возврата и инструкции по отправке. Обратная доставка оплачивается покупателем, если иное не указано в договоре.
                    </li>
                  </ul>
                  После получения и проверки возвращённого товара мы обработаем возврат средств в течение 7 рабочих дней. Деньги будут переведены на ваш счёт или карту, использованные при оплате. Если у вас возникнут вопросы, наша поддержка доступна 24/7.
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