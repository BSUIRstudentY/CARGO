import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCartIcon, DocumentCheckIcon, UserIcon, CreditCardIcon, TruckIcon } from '@heroicons/react/24/solid';
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
  @keyframes slideIn {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .step-card {
    animation: slideIn 0.5s ease-out forwards;
  }
  .step-card:nth-child(2) { animation-delay: 0.1s; }
  .step-card:nth-child(3) { animation-delay: 0.2s; }
  .step-card:nth-child(4) { animation-delay: 0.3s; }
  .step-card:nth-child(5) { animation-delay: 0.4s; }
  .step-card:nth-child(6) { animation-delay: 0.5s; }
  .step-card:nth-child(7) { animation-delay: 0.6s; }
  .step-card:nth-child(8) { animation-delay: 0.7s; }
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  .animate-pulse {
    animation: pulse 2s infinite;
  }
  .timeline-dot {
    transition: transform 0.3s ease, background-color 0.3s ease;
    transform: translate(-50%, -50%);
  }
  .timeline-dot:hover {
    transform: translate(-50%, -50%) scale(1.2);
  }
  .image-hover {
    transition: filter 0.3s ease, transform 0.3s ease;
  }
  .image-hover:hover {
    filter: none;
    transform: scale(1.05);
  }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

function OrderInstructions() {
  const navigate = useNavigate();
  const location = useLocation();
  const stepRefs = useRef([]);
  const progressRef = useRef(null);
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepRefs.current.indexOf(entry.target);
            if (index !== -1) {
              const progressItems = progressRef.current.querySelectorAll('.progress-item');
              progressItems.forEach((item, i) => {
                item.classList.toggle('bg-cyan-500', i === index);
                item.classList.toggle('bg-gray-600', i !== index);
              });
            }
          }
        });
      },
      { threshold: 0.5 }
    );
    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => {
      stepRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

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
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500 tracking-tight animate-fade-in-down">
            Инструкции по заказу
          </h1>
          <p className="text-lg text-gray-300 mt-2">Пошаговое руководство по оформлению заказа на Fluvion</p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-10"
        >
          <motion.div
            className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 rounded-2xl shadow-lg border border-cyan-500/30 transition-shadow duration-300"
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
              <DocumentCheckIcon className="w-8 h-8 mr-2 text-cyan-400" />
              <h2 className="text-2xl font-bold text-cyan-400">Как оформить заказ</h2>
            </div>
            <p className="text-gray-300 mb-6 text-base">
              На Fluvion мы сделали процесс заказа простым и удобным. Следуйте этим шагам, чтобы успешно оформить покупку товаров из Китая:
            </p>
            <div className="space-y-6">
              {[
                {
                  title: 'Добавление товара',
                  description: (
                    <>
                      Вы можете добавить товары двумя способами:
                      <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-300">
                        <li>
                          <strong>Через каталог:</strong> Перейдите в раздел{' '}
                          <span className="font-bold text-cyan-400">Каталог</span>, где представлены проверенные товары, ранее заказанные другими клиентами. Выберите товар, укажите параметры (например, размер, цвет, количество) и нажмите "Добавить в корзину".
                        </li>
                        <li>
                          <strong>Через терминал:</strong> Если нужного товара нет в каталоге, используйте{' '}
                          <span className="font-bold text-cyan-400">Терминал</span>. Введите ссылку на товар (например, с AliExpress, Taobao), описание, количество, цвет, размер и другие параметры.
                        </li>
                      </ul>
                    </>
                  ),
                  icon: <ShoppingCartIcon className="w-8 h-8 text-cyan-400" />,
                  image: 'https://via.placeholder.com/150?text=Cargo+Package',
                },
                {
                  title: 'Оформление корзины',
                  description: (
                    <>
                      После добавления товаров перейдите в{' '}
                      <span className="font-bold text-cyan-400">Корзину</span>. Здесь вы можете:
                      <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-300">
                        <li>Указать адрес доставки: выберите отделение Европочты для доставки.</li>
                        <li>Применить промокод: введите промокод для получения скидки, если он у вас есть.</li>
                        <li>Добавить страховку: выберите опцию страхования груза для защиты от возможных повреждений.</li>
                      </ul>
                      <p className="mt-2 text-gray-300">
                        После проверки деталей нажмите "Оформить заказ". Итоговая стоимость будет рассчитана с учётом цены товара, упаковки, доставки по Китаю, таможенных сборов и комиссии.
                      </p>
                    </>
                  ),
                  icon: <ShoppingCartIcon className="w-8 h-8 text-cyan-400" />,
                  image: 'https://via.placeholder.com/150?text=Cart',
                },
                {
                  title: 'Ожидание проверки администратором',
                  description:
                    'После оформления заказа он отправляется на проверку нашей команде. Администраторы проверяют корректность данных, наличие товара у поставщика и актуальность цен. Этот процесс занимает 1–2 рабочих дня. Вы получите уведомление по email или в личном кабинете о статусе проверки.',
                  icon: <DocumentCheckIcon className="w-8 h-8 text-cyan-400" />,
                  image: 'https://via.placeholder.com/150?text=Admin+Check',
                },
                {
                  title: 'Просмотр заказа в профиле',
                  description: (
                    <>
                      После проверки администратором ваш заказ появится в разделе{' '}
                      <span className="font-bold text-cyan-400">Профиль</span> во вкладке "Отправления". Здесь вы увидите итоговую информацию, включая корректировки (например, уточнение веса, габаритов или стоимости доставки по Китаю).
                    </>
                  ),
                  icon: <UserIcon className="w-8 h-8 text-cyan-400" />,
                  image: 'https://via.placeholder.com/150?text=Profile',
                },
                {
                  title: 'Оплата заказа',
                  description:
                    'После подтверждения заказа вы можете оплатить его через эквайринг Альфа-Банка. Мы принимаем банковские карты (Visa, Mastercard). Все платежи защищены 256-битным SSL-шифрованием. После оплаты заказ передаётся в логистику.',
                  icon: <CreditCardIcon className="w-8 h-8 text-cyan-400" />,
                  image: 'https://via.placeholder.com/150?text=Payment',
                },
                {
                  title: 'Ожидание транспортировки заказа в РБ',
                  description: (
                    <>
                      После оплаты заказ включается в ближайший сборный груз для транспортировки из Китая в Республику Беларусь через транспортную компанию Карго. Вы можете отслеживать статус транспортировки в разделе{' '}
                      <span className="font-bold text-cyan-400">Отправления</span> в вашем профиле.
                    </>
                  ),
                  icon: <TruckIcon className="w-8 h-8 text-cyan-400" />,
                  image: 'https://via.placeholder.com/150?text=Transport',
                },
                {
                  title: 'Отправка заказа Европочтой клиенту',
                  description:
                    'После прибытия заказа на склад в Минске он передаётся в Европочту для доставки в выбранное вами отделение. Вы получите уведомление с трек-номером и ориентировочным сроком доставки.',
                  icon: <TruckIcon className="w-8 h-8 text-cyan-400" />,
                  image: 'https://via.placeholder.com/150?text=Europochta',
                },
                {
                  title: 'Оплата полной доставки заказа',
                  description:
                    'При получении заказа в отделении Европочты вы оплачиваете полную стоимость доставки, которая включает транспортировку из Китая в Беларусь ($6 за кг) и услуги Европочты. Оплата производится через эквайринг Альфа-Банка или наличными в отделении.',
                  icon: <CreditCardIcon className="w-8 h-8 text-cyan-400" />,
                  image: 'https://via.placeholder.com/150?text=Final+Payment',
                },
              ].map((step, index) => (
                <Tilt key={index} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
                  <motion.div
                    ref={(el) => (stepRefs.current[index] = el)}
                    className="step-card bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 rounded-2xl border border-cyan-500/30 shadow-lg hover:shadow-cyan-500/40 transition-shadow duration-300 mb-6"
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
                    <div className="flex items-start">
                      <img
                        src={step.image}
                        alt={step.title}
                        className="w-16 h-16 mr-4 rounded-md filter grayscale image-hover"
                      />
                      <div>
                        <div className="flex items-center">
                          {step.icon}
                          <h3 className="text-xl font-semibold text-cyan-400 ml-2">{step.title}</h3>
                        </div>
                        <p className="text-gray-300 text-base mt-2">{step.description}</p>
                      </div>
                    </div>
                  </motion.div>
                </Tilt>
              ))}
            </div>
          </motion.div>

          <div className="container py-12">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-4xl sm:text-5xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500"
            >
              Процесс заказа
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center text-lg sm:text-xl mb-8 text-gray-300"
            >
              <p>Пошаговое руководство по оформлению заказа на Fluvion</p>
            </motion.div>
            <div ref={progressRef} className="relative max-w-3xl mx-auto">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gray-600 h-full"></div>
              {[
                {
                  title: 'Добавление товара',
                  description: 'Выберите товары из каталога или добавьте через терминал, указав все детали.',
                  icon: <ShoppingCartIcon className="w-8 h-8 text-cyan-400" />,
                },
                {
                  title: 'Оформление корзины',
                  description: 'Укажите отделение Европочты, примените промокод и выберите страховку.',
                  icon: <ShoppingCartIcon className="w-8 h-8 text-cyan-400" />,
                },
                {
                  title: 'Проверка администратором',
                  description: 'Ожидайте подтверждения заказа в течение 1–2 рабочих дней.',
                  icon: <DocumentCheckIcon className="w-8 h-8 text-cyan-400" />,
                },
                {
                  title: 'Просмотр заказа',
                  description: 'Проверьте итоговый заказ с учётом корректировок в профиле.',
                  icon: <UserIcon className="w-8 h-8 text-cyan-400" />,
                },
                {
                  title: 'Оплата заказа',
                  description: 'Оплатите заказ через эквайринг Альфа-Банка.',
                  icon: <CreditCardIcon className="w-8 h-8 text-cyan-400" />,
                },
                {
                  title: 'Транспортировка в РБ',
                  description: 'Заказ включается в сборный груз и транспортируется в Беларусь.',
                  icon: <TruckIcon className="w-8 h-8 text-cyan-400" />,
                },
                {
                  title: 'Отправка Европочтой',
                  description: 'Заказ передаётся в Европочту для доставки в выбранное отделение.',
                  icon: <TruckIcon className="w-8 h-8 text-cyan-400" />,
                },
                {
                  title: 'Оплата доставки',
                  description: 'Оплатите доставку ($6/кг + услуги Европочты) при получении заказа.',
                  icon: <CreditCardIcon className="w-8 h-8 text-cyan-400" />,
                },
              ].map((step, index) => (
                <Tilt key={index} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
                  <motion.div
                    className="relative mb-8 flex items-center"
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div
                      className={`w-full pl-12 ${index % 2 === 0 ? 'pr-8' : 'pl-8 text-right'} bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-4 rounded-2xl shadow-lg border border-cyan-500/30 hover:shadow-cyan-500/40 transition-shadow duration-300`}
                    >
                      <div
                        className="absolute inset-0 opacity-10 pointer-events-none"
                        style={{
                          backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                          backgroundRepeat: 'repeat',
                        }}
                      />
                      <div className="flex items-center justify-between">
                        {index % 2 === 0 ? (
                          <>
                            <div className="flex items-center">
                              {step.icon}
                              <h4 className="text-xl font-semibold text-cyan-400 ml-2">{step.title}</h4>
                            </div>
                            <p className="text-gray-300 text-base">{step.description}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-gray-300 text-base">{step.description}</p>
                            <div className="flex items-center">
                              <h4 className="text-xl font-semibold text-cyan-400 mr-2">{step.title}</h4>
                              {step.icon}
                            </div>
                          </>
                        )}
                      </div>
                     
                    </div>
                  </motion.div>
                </Tilt>
              ))}
            </div>
          </div>

          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-8 rounded-2xl shadow-lg border border-cyan-500/30 hover:shadow-cyan-500/40 transition-shadow duration-300 text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
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
              <h2 className="text-3xl font-bold text-cyan-400 mb-4">Готовы начать?</h2>
              <p className="text-gray-300 mb-6 text-base">
                Оформите свой первый заказ прямо сейчас! Выберите товары из каталога, настройте заказ в терминале или проверьте статус в профиле.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/catalog')}
                  className={`animate-pulse bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 ${isActive('/catalog') ? 'ring-2 ring-offset-2 ring-cyan-500' : ''}`}
                  aria-label="Перейти в Каталог"
                >
                  <ShoppingCartIcon className="w-6 h-6" />
                  Каталог
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/terminal')}
                  className={`animate-pulse bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 ${isActive('/terminal') ? 'ring-2 ring-offset-2 ring-cyan-500' : ''}`}
                  aria-label="Перейти в Терминал"
                >
                  <DocumentCheckIcon className="w-6 h-6" />
                  Терминал
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/profile')}
                  className={`animate-pulse bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 ${isActive('/profile') ? 'ring-2 ring-offset-2 ring-cyan-500' : ''}`}
                  aria-label="Перейти в Профиль"
                >
                  <UserIcon className="w-6 h-6" />
                  Профиль
                </motion.button>
              </div>
            </motion.div>
          </Tilt>
        </motion.section>
      </div>
    </div>
  );
}

export default OrderInstructions;