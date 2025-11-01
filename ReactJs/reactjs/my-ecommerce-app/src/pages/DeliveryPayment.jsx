import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCartIcon, TruckIcon, CreditCardIcon, DocumentCheckIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
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
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-up {
    animation: slideUp 0.5s ease-out;
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

function DeliveryPayment() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-primary font-sans text-primary py-20 sm:py-24 lg:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold font-display text-accent-primary tracking-tight animate-fade-in-down">
            Доставка и оплата
          </h1>
          <p className="text-lg text-secondary mt-2">Узнайте, как мы организуем доставку товаров из Китая "под ключ" и принимаем платежи</p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-10"
        >
          {/* Способы оплаты */}
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              className="bg-tertiary p-6 rounded-2xl shadow-card border border-primary hover:shadow-accent-primary/40 transition-shadow duration-300 relative overflow-hidden"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center mb-4">
                <CreditCardIcon className="w-8 h-8 text-accent-primary mr-2" />
                <h2 className="text-2xl font-bold font-display text-accent-primary">Способы оплаты</h2>
              </div>
              <p className="text-secondary mb-4 text-base">
                На сайте Fluvion мы предлагаем удобные и безопасные способы оплаты для услуг по доставке товаров из Китая "под ключ". Полная стоимость, включая доставку, оплачивается сразу после подтверждения заказа. Итоговая стоимость включает следующие компоненты:
              </p>
              <ul className="list-disc pl-5 space-y-3 text-secondary">
                <li>
                  <strong>Цена товара:</strong> Рассчитывается по актуальному курсу BYN/CNY Альфа-Банка с добавлением комиссии 10% за организацию закупки.
                </li>
                <li>
                  <strong>Упаковка:</strong> Стандартная — $3, для хрупких товаров — $5.
                </li>
                <li>
                  <strong>Международная доставка:</strong> $6 за кг (минимальный вес — 1 кг), отображается в <span className="font-bold text-accent-primary">Терминале</span> после подтверждения заказа.
                </li>
                <li>
                  <strong>Таможенные услуги:</strong> Организация оформления через транспортную компанию Карго.
                </li>
                <li>
                  <strong>Комиссия за услуги:</strong> 10% от стоимости заказа за поиск поставщиков, координацию доставки и оформление документов.
                </li>
              </ul>
              <p className="text-secondary mt-4 text-base">
                Оплата осуществляется через эквайринг Альфа-Банка с 256-битным SSL-шифрованием. Итоговая стоимость отображается в <span className="font-bold text-accent-primary">Профиле</span>. Полная оплата требуется в течение 3 дней после подтверждения заказа.
              </p>
            </motion.div>
          </Tilt>

          {/* Способы доставки */}
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              className="bg-tertiary p-6 rounded-2xl shadow-card border border-primary hover:shadow-accent-primary/40 transition-shadow duration-300 relative overflow-hidden"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center mb-4">
                <TruckIcon className="w-8 h-8 text-accent-primary mr-2" />
                <h2 className="text-2xl font-bold font-display text-accent-primary">Способы доставки</h2>
              </div>
              <p className="text-secondary mb-4 text-base">
                Доставка товаров из Китая осуществляется в два этапа: международная транспортировка до Минска и внутренняя доставка по РБ.
              </p>
              <ul className="list-disc pl-5 space-y-3 text-secondary">
                <li>
                  <strong>Международная доставка:</strong> Через Карго в Минск (18–35 дней, $6 за кг).
                </li>
                <li>
                  <strong>Внутренняя доставка:</strong> Через Европочту до выбранного отделения (2–5 дней, стоимость зависит от региона).
                </li>
                <li>
                  <strong>Отслеживание:</strong> Статус доставки доступен в <span className="font-bold text-accent-primary">Профиле</span> с трек-номером.
                </li>
              </ul>
              <p className="text-secondary mt-4 text-base">
                Укажите отделение Европочты и предпочтения по доставке в <span className="font-bold text-accent-primary">Терминале</span> при оформлении заказа.
              </p>
            </motion.div>
          </Tilt>

          {/* Действия с заказами */}
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              className="bg-tertiary p-6 rounded-2xl shadow-card border border-primary hover:shadow-accent-primary/40 transition-shadow duration-300 relative overflow-hidden"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center mb-4">
                <DocumentCheckIcon className="w-8 h-8 text-accent-primary mr-2" />
                <h2 className="text-2xl font-bold font-display text-accent-primary">Действия с заказами</h2>
              </div>
              <p className="text-secondary mb-4 text-base">
                На сайте Fluvion вы можете легко оформлять и отслеживать заказы на доставку товаров из Китая.
              </p>
              <ul className="list-disc pl-5 space-y-3 text-secondary">
                <li>
                  <strong>Оформление заказа:</strong> В <span className="font-bold text-accent-primary">Терминале</span> укажите характеристики товаров, ссылки на поставщиков и пункт назначения.
                </li>
                <li>
                  <strong>Каталог:</strong> Выбирайте проверенные товары с описаниями и отзывами.
                </li>
                <li>
                  <strong>Отслеживание:</strong> Следите за статусом заказа (поиск поставщика, выкуп, доставка) в <span className="font-bold text-accent-primary">Отправления</span>.
                </li>
                <li>
                  <strong>Документы:</strong> Все транспортные и таможенные документы оформляются Исполнителем и доступны в <span className="font-bold text-accent-primary">Профиле</span>.
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/catalog')}
                  className={`px-6 py-3 bg-accent-primary text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold font-sans flex items-center justify-center gap-2 shadow-card ${isActive('/catalog') ? 'ring-2 ring-offset-2 ring-accent-primary' : ''}`}
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  Перейти в Каталог
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/terminal')}
                  className={`px-6 py-3 bg-accent-primary text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold font-sans flex items-center justify-center gap-2 shadow-card ${isActive('/terminal') ? 'ring-2 ring-offset-2 ring-accent-primary' : ''}`}
                >
                  <DocumentCheckIcon className="w-5 h-5" />
                  Перейти в Терминал
                </motion.button>
              </div>
            </motion.div>
          </Tilt>

          {/* Правила оплаты и безопасности */}
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              className="bg-tertiary p-6 rounded-2xl shadow-card border border-primary hover:shadow-accent-primary/40 transition-shadow duration-300 relative overflow-hidden"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center mb-4">
                <CreditCardIcon className="w-8 h-8 text-accent-primary mr-2" />
                <h2 className="text-2xl font-bold font-display text-accent-primary">Правила оплаты и безопасность</h2>
              </div>
              <p className="text-secondary text-base">
                Мы гарантируем безопасность ваших платежей и данных при заказе доставки из Китая.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-3 text-secondary">
                <li>
                  <strong>Банковские карты:</strong> Принимаем Visa и Mastercard через эквайринг Альфа-Банка с 256-битным SSL-шифрованием и 3D-Secure.
                </li>
                <li>
                  <strong>Порядок оплаты:</strong> Полная оплата, включая стоимость товара, доставки и услуг, в течение 3 дней после подтверждения заказа.
                </li>
                <li>
                  <strong>Безопасность данных:</strong> Ваши данные (ФИО, телефон, email, адрес) защищены в соответствии с Законом РБ № 99-З и используются только для доставки.
                </li>
              </ul>
            </motion.div>
          </Tilt>

          {/* Правила возврата */}
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              className="bg-tertiary p-6 rounded-2xl shadow-card border border-primary hover:shadow-accent-primary/40 transition-shadow duration-300 relative overflow-hidden"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center mb-4">
                <ArrowPathIcon className="w-8 h-8 text-accent-primary mr-2" />
                <h2 className="text-2xl font-bold font-display text-accent-primary">Правила возврата</h2>
              </div>
              <p className="text-secondary text-base">
                Правила возврата для услуг по доставке товаров из Китая:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-3 text-secondary">
                <li>
                  <strong>Отсутствие возврата:</strong> После оплаты заказа возврат невозможен. Убедитесь в выборе товара перед оформлением.
                </li>
                <li>
                  <strong>Ответственность за качество:</strong> Исполнитель не несет ответственности за качество товаров, но содействует в претензиях к поставщику.
                </li>
                <li>
                  <strong>Компенсация:</strong> Возможна при повреждении груза по вине Исполнителя (с страховкой) в течение 7 дней.
                </li>
                <li>
                  <strong>Претензии:</strong> Подавайте претензии в течение 15 дней через форму в <span className="font-bold text-accent-primary">Профиле</span> или email.
                </li>
              </ul>
              <p className="text-secondary mt-4 text-base">
                Свяжитесь с поддержкой по email{' '}
                <a href="mailto:support@fluvion.by" className="text-accent-primary hover:underline">
                  support@fluvion.by
                </a>{' '}
                или телефону{' '}
                <a href="tel:+375291234567" className="text-accent-primary hover:underline">
                  +375 29 123-45-67
                </a>. Поддержка доступна 24/7.
              </p>
            </motion.div>
          </Tilt>
        </motion.section>
      </div>
    </div>
  );
}

export default DeliveryPayment;