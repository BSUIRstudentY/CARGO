import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DocumentCheckIcon, ShoppingCartIcon, CreditCardIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon, LockClosedIcon, ScaleIcon, UserIcon } from '@heroicons/react/24/solid';
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

function PublicOffer() {
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
            Публичная оферта
          </h1>
          <p className="text-lg text-gray-300 mt-2">Условия предоставления посреднических услуг по заказу и доставке товаров из Китая</p>
        </motion.header>
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-10"
        >
          {/* Общие положения */}
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
              <p className="text-gray-300 mb-4 text-base">
                Настоящий документ является публичной офертой индивидуального предпринимателя Ковалевского Ярослава Андреевича (далее — Посредник) в соответствии со статьями 405 и 407 Гражданского кодекса Республики Беларусь. Оферта адресована неопределенному кругу физических и юридических лиц (далее — Заказчик) и содержит все существенные условия договора на оказание посреднических услуг по заказу и доставке товаров из Китая через сайт Fluvion (www.fluvion.by). Оформление заказа через разделы <span className="font-bold text-cyan-400">Каталог</span>, <span className="font-bold text-cyan-400">Терминал</span> или <span className="font-bold text-cyan-400">Корзина</span> на сайте, либо оплата услуг является полным и безоговорочным акцептом условий настоящей оферты.
              </p>
              <p className="text-gray-300 text-base">
                Дополнительные сведения о процессе заказа, доставки и оплаты приведены в разделах{' '}
                <a href="/order-instructions" className="text-cyan-400 hover:text-cyan-200 underline">
                  Инструкции по заказу
                </a>
                ,{' '}
                <a href="/delivery-payment" className="text-cyan-400 hover:text-cyan-200 underline">
                  Доставка и оплата
                </a>{' '}
                и{' '}
                <a href="/faq" className="text-cyan-400 hover:text-cyan-200 underline">
                  FAQ
                </a>{' '}
                на сайте Fluvion.
              </p>
            </motion.div>
          </Tilt>
          {/* Предмет договора */}
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
                <ShoppingCartIcon className="w-8 h-8 text-cyan-400 mr-2" />
                <h2 className="text-2xl font-bold text-cyan-400">2. Предмет договора</h2>
              </div>
              <p className="text-gray-300 text-base">
                Посредник обязуется оказать Заказчику услуги по заказу конкретного товара, указанного Заказчиком, и организации его доставки из Китая, включая проверку целостности упаковки (базовая проверка), координацию логистики через транспортную компанию Карго. За дополнительную плату (от $5) возможна проверка качества, количества или тестирование техники. Заказчик обязуется предоставить достоверные данные о товаре (ссылка, описание, параметры) и доставке (ФИО, адрес, телефон, email) и оплатить услуги в порядке, установленном настоящей офертой.
              </p>
            </motion.div>
          </Tilt>
          {/* Стоимость и порядок оплаты */}
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
                <h2 className="text-2xl font-bold text-cyan-400">3. Стоимость и порядок оплаты</h2>
              </div>
              <p className="text-gray-300 mb-4 text-base">
                Стоимость услуг Посредника включает:
              </p>
              <ul className="list-disc pl-5 space-y-3 text-gray-300">
                <li>Комиссию за посреднические услуги: 10% от стоимости товара, рассчитанной по курсу BYN/CNY Альфа-Банка на момент заказа.</li>
                <li>Международную доставку: $6 за каждый килограмм товара (минимальный вес — 1 кг).</li>
                <li>Упаковку: $3 за стандартную упаковку, $5 для хрупких товаров.</li>
                <li>Услуги Европочты: зависят от региона и типа доставки (2–5 дней).</li>
              </ul>
              <p className="text-gray-300 mt-4 text-base">
                Итоговая стоимость заказа отображается в разделе <span className="font-bold text-cyan-400">Профиль</span> после проверки заказа администрацией. Оплата товара и комиссии производится через эквайринг Альфа-Банка (Visa, MasterCard) в течение 3 рабочих дней после подтверждения заказа. Стоимость доставки ($6/кг + услуги Европочты) оплачивается при получении в отделении Европочты. Все транзакции защищены 256-битным SSL-шифрованием.
              </p>
            </motion.div>
          </Tilt>
          {/* Права и обязанности сторон */}
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
                <h2 className="text-2xl font-bold text-cyan-400">4. Права и обязанности сторон</h2>
              </div>
              <p className="text-gray-300 mb-4 text-base">
                <strong>Посредник обязуется:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-3 text-gray-300">
                <li>Заказать указанный Заказчиком товар и организовать его доставку в соответствии с предоставленными данными.</li>
                <li>Проверить целостность упаковки (базовая проверка) или качество товаров (по дополнительному запросу за плату от $5).</li>
                <li>Передать груз транспортной компании Карго для доставки в Беларусь и далее через Европочту.</li>
                <li>Уведомить Заказчика о статусе заказа через раздел <span className="font-bold text-cyan-400">Отправления</span> в <span className="font-bold text-cyan-400">Профиле</span>.</li>
              </ul>
              <p className="text-gray-300 mt-4 text-base">
                <strong>Заказчик обязуется:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-3 text-gray-300">
                <li>Предоставить достоверные данные о товаре (ссылка, описание, параметры) и доставке (ФИО, адрес, телефон, email).</li>
                <li>Оплатить товар и комиссию через эквайринг Альфа-Банка в течение 3 рабочих дней после проверки и подтверждения заказа администрацией.</li>
                <li>Проверить заказ в разделе <span className="font-bold text-cyan-400">Профиль</span> после подтверждения администрацией.</li>
                <li>Оплатить стоимость доставки при получении в отделении Европочты.</li>
              </ul>
              <p className="text-gray-300 mt-4 text-base">
                Посредник не несет ответственности за качество товаров, предоставленных китайским поставщиком, за исключением случаев, когда Заказчик оплатил дополнительную проверку качества. Посредник также не отвечает за задержки, вызванные действиями перевозчика.
              </p>
            </motion.div>
          </Tilt>
          {/* Условия доставки */}
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
                <h2 className="text-2xl font-bold text-cyan-400">5. Условия доставки</h2>
              </div>
              <p className="text-gray-300 mb-4 text-base">
                Доставка осуществляется в два этапа:
              </p>
              <ul className="list-disc pl-5 space-y-3 text-gray-300">
                <li>Международная доставка: через транспортную компанию Карго из Китая в Минск (18–35 дней, $6/кг).</li>
                <li>Внутренняя доставка: через Европочту в выбранное Заказчиком отделение (2–5 дней, стоимость зависит от региона).</li>
              </ul>
              <p className="text-gray-300 mt-4 text-base">
                Заказчик может отслеживать статус заказа в разделе <span className="font-bold text-cyan-400">Отправления</span> в <span className="font-bold text-cyan-400">Профиле</span>. Ответственность за сохранность груза после передачи в Европочту несет перевозчик.
              </p>
            </motion.div>
          </Tilt>
          {/* Правила возврата и претензии */}
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
                <h2 className="text-2xl font-bold text-cyan-400">6. Правила возврата и претензии</h2>
              </div>
              <p className="text-gray-300 mb-4 text-base">
                Возврат товаров невозможен, так как оплата производится после подтверждения полной стоимости заказа, и Заказчик должен быть уверен в своем выборе. Для товаров из <span className="font-bold text-cyan-400">Каталога</span> рекомендуется ориентироваться на отзывы и дату последней покупки.
              </p>
              <p className="text-gray-300 mb-4 text-base">
                <strong>Претензии по качеству или повреждениям:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-3 text-gray-300">
                <li>Если товар поврежден по вине Посредника и Заказчик выбрал страховку груза, Посредник компенсирует стоимость в течение 7 рабочих дней после проверки.</li>
                <li>Если виноват поставщик, Посредник содействует в составлении претензии к поставщику.</li>
                <li>
                  Претензии принимаются в течение 15 дней с момента получения заказа. Обращайтесь в поддержку по email{' '}
                  <a href="mailto:support@fluvion.by" className="text-cyan-400 hover:text-cyan-200 underline">
                    support@fluvion.by
                  </a>{' '}
                  или телефону{' '}
                  <a href="tel:+375291234567" className="text-cyan-400 hover:text-cyan-200 underline">
                    +375 29 123-45-67
                  </a>{' '}
                  с указанием номера заказа и описанием проблемы.
                </li>
              </ul>
            </motion.div>
          </Tilt>
          {/* Конфиденциальность */}
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
                <h2 className="text-2xl font-bold text-cyan-400">7. Конфиденциальность</h2>
              </div>
              <p className="text-gray-300 text-base">
                Оформляя заказ, Заказчик дает согласие на обработку персональных данных (ФИО, телефон, email, адрес) в соответствии с Законом Республики Беларусь «О защите персональных данных» (№ 99-З). Данные используются исключительно для выполнения заказа и не передаются третьим лицам, за исключением случаев, предусмотренных законодательством (например, для доставки).
              </p>
            </motion.div>
          </Tilt>
          {/* Срок действия и юрисдикция */}
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
                <h2 className="text-2xl font-bold text-cyan-400">8. Срок действия и юрисдикция</h2>
              </div>
              <p className="text-gray-300 text-base">
                Настоящая оферта действует с момента публикации на сайте www.fluvion.by до ее отзыва или изменения Посредником. Изменения вступают в силу с момента публикации на сайте. Все споры регулируются законодательством Республики Беларусь. Место заключения договора — г. Солигорск.
              </p>
            </motion.div>
          </Tilt>
          {/* Реквизиты Посредника */}
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
                <h2 className="text-2xl font-bold text-cyan-400">9. Реквизиты Посредника</h2>
              </div>
              <p className="text-gray-300 text-base">
                Исполнитель: ИП Ковалевский Ярослав Андреевич<br />
                Юридический адрес: 223710, Республика Беларусь, г. Солигорск, ул. Железнодорожная 6<br />
                УНП: 693299414<br />
                Свидетельство о государственной регистрации №755693886000, выдано Солигорским горисполкомом 18.06.2025 г.<br />
                Email:{' '}
                <a href="mailto:support@fluvion.by" className="text-cyan-400 hover:text-cyan-200 underline">
                  support@fluvion.by
                </a>
                <br />
                Телефон:{' '}
                <a href="tel:+375291234567" className="text-cyan-400 hover:text-cyan-200 underline">
                  +375 29 123-45-67
                </a>
              </p>
            </motion.div>
          </Tilt>
          {/* Call to Action */}
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
                <ShoppingCartIcon className="w-8 h-8 text-cyan-400 mr-2" />
                <h2 className="text-2xl font-bold text-cyan-400">Готовы оформить заказ?</h2>
              </div>
              <p className="text-gray-300 mb-6 text-base">
                Ознакомьтесь с процессом заказа и начните закупку товаров из Китая прямо сейчас!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
        </motion.section>
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 Fluvion. Все права защищены.</p>
          <p className="mt-1 animate-pulse text-cyan-400">Обновлено: 17.09.2025 19:39 CEST</p>
        </div>
      </div>
    </div>
  );
}

export default PublicOffer;