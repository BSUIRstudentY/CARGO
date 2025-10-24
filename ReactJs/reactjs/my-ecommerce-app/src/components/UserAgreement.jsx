import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LockClosedIcon, ShieldCheckIcon, UserIcon, DocumentCheckIcon, ArrowPathIcon, ScaleIcon, InformationCircleIcon, KeyIcon } from '@heroicons/react/24/solid';
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

function UserAgreement() {
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
            Согласие на обработку персональных данных
          </h1>
          <p className="text-lg text-gray-300 mt-2">Ваше согласие на сбор и использование информации для предоставления услуг на Fluvion</p>
        </motion.header>
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-10"
        >
          {/* 1. Согласие */}
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
                <LockClosedIcon className="w-8 h-8 text-cyan-400 mr-2" />
                <h2 className="text-2xl font-bold text-cyan-400">1. Согласие</h2>
              </div>
              <p className="text-gray-300 text-base">
                Оформляя заказ на сайте Fluvion (www.fluvion.by), Заказчик подтверждает свое согласие на обработку персональных данных (ФИО, телефон, email, адрес) в соответствии с{' '}
                <a href="/privacy-policy" className="text-cyan-400 hover:text-cyan-200 underline">
                  Политикой обработки данных
                </a>{' '}
                и{' '}
                <a href="/public-offer" className="text-cyan-400 hover:text-cyan-200 underline">
                  Публичной офертой
                </a>
                . Согласие предоставляется добровольно при оформлении заказа через разделы <span className="font-bold text-cyan-400">Каталог</span>, <span className="font-bold text-cyan-400">Терминал</span> или <span className="font-bold text-cyan-400">Корзина</span>.
              </p>
            </motion.div>
          </Tilt>
          {/* 2. Обработка данных */}
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
                <ShieldCheckIcon className="w-8 h-8 text-cyan-400 mr-2" />
                <h2 className="text-2xl font-bold text-cyan-400">2. Обработка данных</h2>
              </div>
              <p className="text-gray-300 text-base">
                Обработка включает сбор, хранение, использование и передачу данных для целей выполнения заказа и доставки. Данные обрабатываются в соответствии с Законом Республики Беларусь «О защите персональных данных» (№ 99-З) и хранятся в защищенных системах.
              </p>
            </motion.div>
          </Tilt>
          {/* 3. Права и обязанности */}
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
                <ScaleIcon className="w-8 h-8 text-cyan-400 mr-2" />
                <h2 className="text-2xl font-bold text-cyan-400">3. Права и обязанности</h2>
              </div>
              <p className="text-gray-300 mb-4 text-base">
                <strong>Права Заказчика:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-3 text-gray-300">
                <li>Доступ к своим данным, их исправление или удаление.</li>
                <li>Отзыв согласия на обработку (может ограничить выполнение заказа).</li>
                <li>Получение информации о целях и сроках обработки.</li>
              </ul>
              <p className="text-gray-300 mt-4 text-base">
                <strong>Обязанности Заказчика:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-3 text-gray-300">
                <li>Предоставить достоверные данные при оформлении заказа.</li>
                <li>Не использовать сайт для незаконных целей.</li>
              </ul>
            </motion.div>
          </Tilt>
          {/* 4. Отзыв согласия */}
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
                <h2 className="text-2xl font-bold text-cyan-400">4. Отзыв согласия</h2>
              </div>
              <p className="text-gray-300 text-base">
                Заказчик может отозвать согласие, обратившись по email:{' '}
                <a href="mailto:support@fluvion.by" className="text-cyan-400 hover:text-cyan-200 underline">
                  support@fluvion.by
                </a>
                . Отзыв согласия может ограничить возможность выполнения заказа. Запросы обрабатываются в течение 30 дней.
              </p>
            </motion.div>
          </Tilt>
          {/* 5. Ответственность */}
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
                <KeyIcon className="w-8 h-8 text-cyan-400 mr-2" />
                <h2 className="text-2xl font-bold text-cyan-400">5. Ответственность</h2>
              </div>
              <p className="text-gray-300 text-base">
                Оператор несет ответственность за конфиденциальность и безопасность данных в соответствии с законодательством. Заказчик несет ответственность за достоверность предоставленных данных. В случае нарушения конфиденциальности Оператор компенсирует ущерб в установленном законом порядке.
              </p>
            </motion.div>
          </Tilt>
          {/* 6. Контакты */}
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 rounded-2xl shadow-lg border border-cyan-500/30 hover:shadow-cyan-500/40 transition-shadow duration-300 relative overflow-hidden text-center"
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
              <div className="flex items-center justify-center mb-4">
                <InformationCircleIcon className="w-8 h-8 text-cyan-400 mr-2" />
                <h2 className="text-2xl font-bold text-cyan-400">6. Контакты</h2>
              </div>
              <p className="text-gray-300 mb-6 text-base">
                По вопросам обработки персональных данных обращайтесь по email{' '}
                <a href="mailto:support@fluvion.by" className="text-cyan-400 hover:text-cyan-200 underline">
                  support@fluvion.by
                </a>{' '}
                или телефону{' '}
                <a href="tel:+375291234567" className="text-cyan-400 hover:text-cyan-200 underline">
                  +375 29 123-45-67
                </a>
                . Поддержка доступна 24/7.
              </p>
            </motion.div>
          </Tilt>
        </motion.section>
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 Fluvion. Все права защищены.</p>
          <p className="mt-1 animate-pulse text-cyan-400">Обновлено: 17.09.2025 19:39 CEST</p>
        </div>
      </div>
    </div>
  );
}

export default UserAgreement;