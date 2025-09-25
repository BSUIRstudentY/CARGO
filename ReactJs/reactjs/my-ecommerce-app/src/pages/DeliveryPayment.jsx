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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500 tracking-tight animate-fade-in-down">
            Доставка и оплата
          </h1>
          <p className="text-lg text-gray-300 mt-2">Узнайте, как мы доставляем ваши заказы и принимаем платежи</p>
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
              className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 rounded-2xl shadow-lg border border-cyan-500/30 hover:shadow-cyan-500/40 transition-shadow duration-300 relative overflow-hidden"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                  backgroundRepeat: 'repeat',
                }}
              />
              <div className="flex items-center mb-4">
                <CreditCardIcon className="w-8 h-8 text-cyan-400 mr-2" />
                <h2 className="text-2xl font-bold text-cyan-400">Способы оплаты</h2>
              </div>
              <p className="text-gray-300 mb-4 text-base">
                На сайте Fluvion мы предлагаем удобные и прозрачные способы оплаты. Итоговая стоимость заказа формируется из следующих компонентов:
              </p>
              <ul className="list-disc pl-5 space-y-3 text-gray-300">
                <li>
                  <strong>Цена товара:</strong> Рассчитывается по актуальному курсу Альфа-Банка с добавлением сервисного сбора 10%. Курс обновляется ежедневно.
                </li>
                <li>
                  <strong>Упаковка:</strong> Стандартная упаковка — $3, для хрупких товаров — $5.
                </li>
                <li>
                  <strong>Доставка по Китаю:</strong> Конечная стоимость отображается в <span className="font-bold text-cyan-400">Терминале</span> после проверки.
                </li>
                <li>
                  <strong>Таможенные платежи:</strong> Организуются через транспортную компанию Карго.
                </li>
                <li>
                  <strong>Комиссия компании:</strong> 10% от стоимости заказа за организацию закупки и поддержку.
                </li>
              </ul>
              <p className="text-gray-300 mt-4 text-base">
                Оплата осуществляется через эквайринг Альфа-Банка с 256-битным SSL-шифрованием. Итоговая стоимость отображается в <span className="font-bold text-cyan-400">Профиле</span>.
              </p>
            </motion.div>
          </Tilt>

          {/* Способы доставки */}
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 rounded-2xl shadow-lg border border-cyan-500/30 hover:shadow-cyan-500/40 transition-shadow duration-300 relative overflow-hidden"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                  backgroundRepeat: 'repeat',
                }}
              />
              <div className="flex items-center mb-4">
                <TruckIcon className="w-8 h-8 text-cyan-400 mr-2" />
                <h2 className="text-2xl font-bold text-cyan-400">Способы доставки</h2>
              </div>
              <p className="text-gray-300 mb-4 text-base">
                Доставка осуществляется через Европочту после проверки товаров на складе в Минске.
              </p>
              <ul className="list-disc pl-5 space-y-3 text-gray-300">
                <li>
                  <strong>Доставка:</strong> Выберите отделение Европочты в <span className="font-bold text-cyan-400">Корзине</span>.
                </li>
                <li>
                  <strong>Стоимость доставки:</strong> $6 за килограмм + услуги Европочты, зависящие от региона.
                </li>
              </ul>
              <p className="text-gray-300 mt-4 text-base">
                После оформления вы получите трек-номер и срок доставки. Укажите пожелания в <span className="font-bold text-cyan-400">Терминале</span>.
              </p>
            </motion.div>
          </Tilt>

          {/* Действия с заказами */}
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 rounded-2xl shadow-lg border border-cyan-500/30 hover:shadow-cyan-500/40 transition-shadow duration-300 relative overflow-hidden"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                  backgroundRepeat: 'repeat',
                }}
              />
              <div className="flex items-center mb-4">
                <DocumentCheckIcon className="w-8 h-8 text-cyan-400 mr-2" />
                <h2 className="text-2xl font-bold text-cyan-400">Действия с заказами</h2>
              </div>
              <p className="text-gray-300 mb-4 text-base">
                Удобная система управления заказами на Fluvion упрощает процесс покупки и отслеживания.
              </p>
              <ul className="list-disc pl-5 space-y-3 text-gray-300">
                <li>
                  <strong>Оформление заказа:</strong> В <span className="font-bold text-cyan-400">Терминале</span> укажите характеристики товаров и ссылки.
                </li>
                <li>
                  <strong>Каталог:</strong> Проверенные товары с отзывами и гарантией качества.
                </li>
                <li>
                  <strong>Отслеживание заказов:</strong> В разделе <span className="font-bold text-cyan-400">Отправления</span> следите за статусом выкупа и доставки.
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/catalog')}
                  className={`px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 shadow-sm ${isActive('/catalog') ? 'ring-2 ring-offset-2 ring-cyan-500' : ''}`}
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  Перейти в Каталог
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/terminal')}
                  className={`px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 shadow-sm ${isActive('/terminal') ? 'ring-2 ring-offset-2 ring-cyan-500' : ''}`}
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
              className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 rounded-2xl shadow-lg border border-cyan-500/30 hover:shadow-cyan-500/40 transition-shadow duration-300 relative overflow-hidden"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                  backgroundRepeat: 'repeat',
                }}
              />
              <div className="flex items-center mb-4">
                <CreditCardIcon className="w-8 h-8 text-cyan-400 mr-2" />
                <h2 className="text-2xl font-bold text-cyan-400">Правила оплаты и безопасность</h2>
              </div>
              <p className="text-gray-300 text-base">
                Безопасность ваших данных — наш приоритет. Оплата осуществляется через эквайринг Альфа-Банка:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-3 text-gray-300">
                <li>
                  <strong>Банковские карты:</strong> Принимаем Visa и Mastercard с 256-битным SSL-шифрованием и 3D-Secure.
                </li>
              </ul>
            </motion.div>
          </Tilt>

          {/* Правила возврата */}
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 rounded-2xl shadow-lg border border-cyan-500/30 hover:shadow-cyan-500/40 transition-shadow duration-300 relative overflow-hidden"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                  backgroundRepeat: 'repeat',
                }}
              />
              <div className="flex items-center mb-4">
                <ArrowPathIcon className="w-8 h-8 text-cyan-400 mr-2" />
                <h2 className="text-2xl font-bold text-cyan-400">Правила возврата</h2>
              </div>
              <p className="text-gray-300 text-base">
                На сайте Fluvion действуют следующие правила возврата:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-3 text-gray-300">
                <li>
                  <strong>Отсутствие возврата:</strong> Убедитесь в выборе товара перед оплатой.
                </li>
                <li>
                  <strong>Ответственность за качество:</strong> За товары из <span className="font-bold text-cyan-400">Терминала</span> ответственность лежит на покупателе. Для <span className="font-bold text-cyan-400">Каталога</span> ориентируйтесь на отзывы.
                </li>
                <li>
                  <strong>Компенсация:</strong> Возможна при браке, если выбрана страховка груза.
                </li>
              </ul>
              <p className="text-gray-300 mt-4 text-base">
                Свяжитесь с поддержкой по email{' '}
                <a href="mailto:support@fluvion.com" className="text-cyan-400 hover:underline">
                  support@fluvion.com
                </a>{' '}
                или телефону{' '}
                <a href="tel:+375291234567" className="text-cyan-400 hover:underline">
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