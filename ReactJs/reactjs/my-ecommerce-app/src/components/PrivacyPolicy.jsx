import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LockClosedIcon, ShieldCheckIcon, UserIcon, KeyIcon, DocumentCheckIcon, ArrowPathIcon, ScaleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
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

function PrivacyPolicy() {
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
            Политика обработки персональных данных
          </h1>
          <p className="text-lg text-gray-300 mt-2">Как мы собираем, используем и защищаем вашу информацию на Fluvion</p>
        </motion.header>
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-10"
        >
          {/* 1. Общие положения */}
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
                <h2 className="text-2xl font-bold text-cyan-400">1. Общие положения</h2>
              </div>
              <p className="text-gray-300 text-base">
                В соответствии с Законом Республики Беларусь «О защите персональных данных» (№ 99-З), ИП Ковалевский Ярослав Андреевич (далее — Оператор), оператор сайта Fluvion (www.fluvion.by), собирает и обрабатывает персональные данные Заказчиков исключительно для выполнения заказов и доставки товаров из Китая. Политика действует с момента публикации и применяется ко всем пользователям сайта.
              </p>
            </motion.div>
          </Tilt>
          {/* 2. Состав собираемых данных */}
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
                <UserIcon className="w-8 h-8 text-cyan-400 mr-2" />
                <h2 className="text-2xl font-bold text-cyan-400">2. Состав собираемых данных</h2>
              </div>
              <p className="text-gray-300 text-base">
                Оператор собирает следующие данные: ФИО, номер телефона, email, адрес доставки, данные о заказе (ссылка на товар, описание, параметры). Все данные предоставляются Заказчиком добровольно при оформлении заказа. Также могут собираться технические данные (IP-адрес, тип браузера) для обеспечения безопасности и аналитики.
              </p>
            </motion.div>
          </Tilt>
          {/* 3. Цели обработки */}
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
                <h2 className="text-2xl font-bold text-cyan-400">3. Цели обработки</h2>
              </div>
              <p className="text-gray-300 mb-4 text-base">
                Данные используются для:
              </p>
              <ul className="list-disc pl-5 space-y-3 text-gray-300">
                <li>Оформления и обработки заказа.</li>
                <li>Координации доставки через транспортную компанию Карго и Европочту.</li>
                <li>Уведомления Заказчика о статусе заказа через раздел <span className="font-bold text-cyan-400">Отправления</span> в <span className="font-bold text-cyan-400">Профиле</span>.</li>
                <li>Анализа использования сайта для улучшения сервиса (анонимизированные данные).</li>
                <li>Обеспечения безопасности и предотвращения мошенничества.</li>
              </ul>
            </motion.div>
          </Tilt>
          {/* 4. Передача данных */}
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
                <h2 className="text-2xl font-bold text-cyan-400">4. Передача данных</h2>
              </div>
              <p className="text-gray-300 text-base">
                Данные передаются транспортной компании Карго и Европочте исключительно для доставки. Все транзакции защищены 256-битным SSL-шифрованием. Данные не передаются третьим лицам без согласия Заказчика, за исключением случаев, предусмотренных законодательством Республики Беларусь.
              </p>
            </motion.div>
          </Tilt>
          {/* 5. Права Заказчика */}
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
                <h2 className="text-2xl font-bold text-cyan-400">5. Права Заказчика</h2>
              </div>
              <p className="text-gray-300 text-base">
                Заказчик имеет право на доступ, исправление, удаление данных или ограничение их обработки. Обращайтесь по email:{' '}
                <a href="mailto:support@fluvion.by" className="text-cyan-400 hover:text-cyan-200 underline">
                  support@fluvion.by
                </a>
                . Запросы обрабатываются в течение 30 дней в соответствии с законодательством.
              </p>
            </motion.div>
          </Tilt>
          {/* 6. Срок хранения */}
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
                <h2 className="text-2xl font-bold text-cyan-400">6. Срок хранения</h2>
              </div>
              <p className="text-gray-300 text-base">
                Данные хранятся в течение срока, необходимого для выполнения заказа, и удаляются после истечения 3 лет с момента последнего заказа, если иное не предусмотрено законодательством. Технические логи хранятся 1 год для обеспечения безопасности.
              </p>
            </motion.div>
          </Tilt>
          {/* 7. Меры безопасности */}
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
                <h2 className="text-2xl font-bold text-cyan-400">7. Меры безопасности</h2>
              </div>
              <p className="text-gray-300 text-base">
                Оператор применяет технические и организационные меры для защиты данных: 256-битное SSL-шифрование, firewalls, регулярные аудиты безопасности. Доступ к данным ограничен авторизованным сотрудникам.
              </p>
            </motion.div>
          </Tilt>
          {/* 8. Cookies и аналитика */}
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
                <InformationCircleIcon className="w-8 h-8 text-cyan-400 mr-2" />
                <h2 className="text-2xl font-bold text-cyan-400">8. Cookies и аналитика</h2>
              </div>
              <p className="text-gray-300 text-base">
                Сайт использует cookies для улучшения пользовательского опыта и аналитики. Вы можете управлять cookies в настройках браузера. Анонимизированные данные передаются сервисам аналитики для статистики.
              </p>
            </motion.div>
          </Tilt>
          {/* 9. Изменения политики */}
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
                <h2 className="text-2xl font-bold text-cyan-400">9. Изменения политики</h2>
              </div>
              <p className="text-gray-300 text-base">
                Оператор оставляет за собой право изменять Политику. Изменения вступают в силу с момента публикации на сайте. Рекомендуется регулярно проверять обновления.
              </p>
            </motion.div>
          </Tilt>
          {/* 10. Контакты */}
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
                <LockClosedIcon className="w-8 h-8 text-cyan-400 mr-2" />
                <h2 className="text-2xl font-bold text-cyan-400">10. Контакты</h2>
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

export default PrivacyPolicy;