import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { ShoppingCartIcon, DocumentCheckIcon, UserIcon, CreditCardIcon, TruckIcon } from '@heroicons/react/24/solid';

// Append global styles for consistency with OrderDetails.jsx
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
                item.classList.toggle('bg-accent-primary', i === index);
                item.classList.toggle('bg-primary/50', i !== index);
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
    <div className="min-h-screen bg-primary text-secondary py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,37,73,0.3)_0%,transparent_70%)] pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
          style={{
            '@media (max-width: 640px)': {
              marginBottom: '24px',
              textAlign: 'center',
            }
          }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold font-display text-accent-primary tracking-tight animate-fade-in-down break-words" style={{
            '@media (max-width: 640px)': {
              fontSize: '28px',
              fontWeight: '800',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }
          }}>
            Инструкции по заказу
          </h1>
          <p className="text-lg text-secondary mt-2 font-sans" style={{
            '@media (max-width: 640px)': {
              fontSize: '14px',
              marginTop: '8px',
            }
          }}>Пошаговое руководство по оформлению доставки товаров из Китая на Fluvion</p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-10"
        >
          <motion.div
            className="bg-tertiary p-6 rounded-2xl shadow-card border border-primary/50 transition-shadow duration-300 animate-slide-up"
            whileTap={{ scale: 0.97 }}
            style={{
              '@media (max-width: 640px)': {
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                backgroundRepeat: 'repeat',
              }}
            />
            <div className="flex items-center mb-4">
              <DocumentCheckIcon className="w-8 h-8 mr-2 text-accent-primary" />
              <h2 className="text-2xl font-bold font-display text-accent-primary" style={{
                '@media (max-width: 640px)': {
                  fontSize: '20px',
                }
              }}>Товары из Китая под ключ</h2>
            </div>
            <p className="text-secondary mb-6 text-base font-sans">
              На Fluvion процесс заказа доставки товаров из Китая под ключ прост и удобен. Следуйте этим шагам, чтобы оформить заказ:
            </p>
            <div className="space-y-6">
              {[
                {
                  title: 'Добавление товара',
                  description: (
                    <>
                      Вы можете добавить товары двумя способами:
                      <ul className="list-disc pl-5 mt-2 space-y-2 text-secondary font-sans">
                        <li>
                          <strong>Через каталог:</strong> Перейдите в раздел <span className="font-bold text-accent-primary">Каталог</span>, где представлены проверенные товары от поставщиков. Выберите товар, укажите параметры (например, размер, цвет, количество) и нажмите "Добавить в корзину".
                        </li>
                        <li>
                          <strong>Через терминал:</strong> Если нужного товара нет в каталоге, используйте <span className="font-bold text-accent-primary">Терминал</span>. Введите ссылку на товар (например, с AliExpress, Taobao), описание, количество, цвет, размер и другие параметры.
                        </li>
                      </ul>
                    </>
                  ),
                  icon: <ShoppingCartIcon className="w-8 h-8 text-accent-primary" />,
                  image: 'https://via.placeholder.com/150?text=Cargo+Package',
                },
                {
                  title: 'Оформление корзины',
                  description: (
                    <>
                      После добавления товаров перейдите в <span className="font-bold text-accent-primary">Корзину</span>. Здесь вы можете:
                      <ul className="list-disc pl-5 mt-2 space-y-2 text-secondary font-sans">
                        <li>Указать адрес доставки: выберите отделение Европочты для доставки по РБ.</li>
                        <li>Применить промокод: введите промокод для получения скидки, если он у вас есть.</li>
                        <li>Добавить страховку: выберите опцию страхования груза для защиты от возможных повреждений.</li>
                      </ul>
                      <p className="mt-2 text-secondary font-sans">
                        После проверки деталей нажмите "Оформить заказ". Итоговая стоимость будет рассчитана с учётом цены товара, упаковки, доставки по Китаю, таможенных сборов и комиссии.
                      </p>
                    </>
                  ),
                  icon: <ShoppingCartIcon className="w-8 h-8 text-accent-primary" />,
                  image: 'https://via.placeholder.com/150?text=Cart',
                },
                {
                  title: 'Ожидание проверки администратором',
                  description: (
                    <>
                      После оформления заказа он отправляется на проверку нашей команде. Администраторы проверяют корректность данных, наличие товара у поставщика и актуальность цен. Этот процесс занимает 1–2 рабочих дня. Вы получите уведомление по email или в <span className="font-bold text-accent-primary">Профиле</span> о статусе проверки.
                    </>
                  ),
                  icon: <DocumentCheckIcon className="w-8 h-8 text-accent-primary" />,
                  image: 'https://via.placeholder.com/150?text=Admin+Check',
                },
                {
                  title: 'Просмотр и оплата заказа',
                  description: (
                    <>
                      После проверки администратором заказ появится в разделе <span className="font-bold text-accent-primary">Профиль</span> во вкладке "Отправления". Здесь вы увидите итоговую стоимость, включая цену товара, доставку из Китая в Беларусь ($6/кг), упаковку, таможенные сборы и комиссию. Оплатите заказ через эквайринг Альфа-Банка (Visa, Mastercard) в течение 3 дней. Платежи защищены 256-битным SSL-шифрованием. После оплаты заказ передаётся в логистику.
                    </>
                  ),
                  icon: <CreditCardIcon className="w-8 h-8 text-accent-primary" />,
                  image: 'https://via.placeholder.com/150?text=Payment',
                },
                {
                  title: 'Транспортировка в РБ',
                  description: (
                    <>
                      После оплаты заказ включается в ближайший сборный груз для транспортировки из Китая в Республику Беларусь через транспортную компанию Карго (18–35 дней). Отслеживайте статус в разделе <span className="font-bold text-accent-primary">Отправления</span> в вашем профиле.
                    </>
                  ),
                  icon: <TruckIcon className="w-8 h-8 text-accent-primary" />,
                  image: 'https://via.placeholder.com/150?text=Transport',
                },
                {
                  title: 'Отправка Европочтой',
                  description: 'После прибытия заказа на склад в Минске он передаётся в Европочту для доставки в выбранное вами отделение (2–5 дней). Вы получите уведомление с трек-номером и ориентировочным сроком доставки.',
                  icon: <TruckIcon className="w-8 h-8 text-accent-primary" />,
                  image: 'https://via.placeholder.com/150?text=Europochta',
                },
                {
                  title: 'Оплата доставки по РБ',
                  description: 'При получении заказа в отделении Европочты вы оплачиваете только стоимость доставки по Республике Беларусь по тарифам Европочты. Оплата производится наличными или через эквайринг в отделении.',
                  icon: <CreditCardIcon className="w-8 h-8 text-accent-primary" />,
                  image: 'https://via.placeholder.com/150?text=Final+Payment',
                },
                {
                  title: 'Получение заказа',
                  description: (
                    <>
                      Заберите товары в указанном отделении Европочты после оплаты местной доставки. Убедитесь, что товары соответствуют заказу, и оставьте отзыв в <span className="font-bold text-accent-primary">Профиле</span>.
                    </>
                  ),
                  icon: <TruckIcon className="w-8 h-8 text-accent-primary" />,
                  image: 'https://via.placeholder.com/150?text=Receipt',
                },
              ].map((step, index) => (
                <Tilt key={index} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
                  <motion.div
                    ref={(el) => (stepRefs.current[index] = el)}
                    className="step-card bg-tertiary p-6 rounded-2xl border border-primary/50 shadow-card hover:shadow-accent-primary/40 transition-shadow duration-300 mb-6"
                    whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      '@media (max-width: 640px)': {
                        padding: '16px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }
                    }}
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
                        className="w-16 h-16 mr-4 rounded-md filter grayscale image-hover border border-primary/50"
                        style={{
                          '@media (max-width: 640px)': {
                            width: '48px',
                            height: '48px',
                            borderRadius: '6px',
                          }
                        }}
                      />
                      <div>
                        <div className="flex items-center">
                          {step.icon}
                          <h3 className="text-xl font-semibold font-display text-accent-primary ml-2" style={{
                            '@media (max-width: 640px)': {
                              fontSize: '18px',
                            }
                          }}>{step.title}</h3>
                        </div>
                        <p className="text-secondary text-base mt-2 font-sans">{step.description}</p>
                      </div>
                    </div>
                  </motion.div>
                </Tilt>
              ))}
            </div>
          </motion.div>

          {/* Self-Purchase Section */}
          <motion.div
            className="bg-tertiary p-6 rounded-2xl shadow-card border border-primary/50 transition-shadow duration-300 animate-slide-up mt-12"
            whileTap={{ scale: 0.97 }}
            style={{
              '@media (max-width: 640px)': {
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }
            }}
          >
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                backgroundRepeat: 'repeat',
              }}
            />
            <div className="flex items-center mb-4">
              <UserIcon className="w-8 h-8 mr-2 text-accent-primary" />
              <h2 className="text-2xl font-bold font-display text-accent-primary" style={{
                '@media (max-width: 640px)': {
                  fontSize: '20px',
                }
              }}>Самовыкуп</h2>
            </div>
            <p className="text-secondary mb-6 text-base font-sans">
              Если вы самостоятельно приобрели товары на китайских площадках и отправили их на наш склад в Китае, следуйте этим шагам для организации доставки:
            </p>
            <div className="space-y-6">
              {[
                {
                  title: 'Самостоятельная покупка и отправка',
                  description: 'Купите товары на китайских площадках (например, AliExpress, Taobao) и отправьте их на наш китайский склад, указанный в Карго. Убедитесь, что товары упакованы правильно.',
                  icon: <ShoppingCartIcon className="w-8 h-8 text-accent-primary" />,
                  image: 'https://via.placeholder.com/150?text=Self-Purchase',
                },
                {
                  title: 'Оформление доставки в профиле',
                  description: (
                    <>
                      Перейдите в раздел <span className="font-bold text-accent-primary">Профиль</span> во вкладке "Отправления". Укажите детали отправки (номер трека, вес, габариты), выберите отделение Европочты и добавьте страховку, если нужно.
                    </>
                  ),
                  icon: <UserIcon className="w-8 h-8 text-accent-primary" />,
                  image: 'https://via.placeholder.com/150?text=Profile',
                },
                {
                  title: 'Оплата доставки',
                  description: 'Оплатите стоимость доставки из Китая в Беларусь ($6/кг) через эквайринг Альфа-Банка в профиле. После оплаты заказ передаётся в логистику.',
                  icon: <CreditCardIcon className="w-8 h-8 text-accent-primary" />,
                  image: 'https://via.placeholder.com/150?text=Payment',
                },
                {
                  title: 'Транспортировка в РБ',
                  description: (
                    <>
                      Заказ включается в сборный груз и транспортируется в Беларусь через Карго (18–35 дней). Отслеживайте статус в разделе <span className="font-bold text-accent-primary">Отправления</span>.
                    </>
                  ),
                  icon: <TruckIcon className="w-8 h-8 text-accent-primary" />,
                  image: 'https://via.placeholder.com/150?text=Transport',
                },
                {
                  title: 'Отправка Европочтой',
                  description: 'После прибытия на склад в Минске заказ передаётся в Европочту для доставки в выбранное отделение (2–5 дней). Получите трек-номер.',
                  icon: <TruckIcon className="w-8 h-8 text-accent-primary" />,
                  image: 'https://via.placeholder.com/150?text=Europochta',
                },
                {
                  title: 'Оплата доставки по РБ',
                  description: 'При получении оплатите только доставку по РБ по тарифам Европочты наличными или через эквайринг в отделении.',
                  icon: <CreditCardIcon className="w-8 h-8 text-accent-primary" />,
                  image: 'https://via.placeholder.com/150?text=Final+Payment',
                },
                {
                  title: 'Получение заказа',
                  description: (
                    <>
                      Заберите товары в указанном отделении Европочты после оплаты местной доставки. Убедитесь, что товары соответствуют, и оставьте отзыв в <span className="font-bold text-accent-primary">Профиле</span>.
                    </>
                  ),
                  icon: <TruckIcon className="w-8 h-8 text-accent-primary" />,
                  image: 'https://via.placeholder.com/150?text=Receipt',
                },
              ].map((step, index) => (
                <Tilt key={index} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
                  <motion.div
                    className="step-card bg-tertiary p-6 rounded-2xl border border-primary/50 shadow-card hover:shadow-accent-primary/40 transition-shadow duration-300 mb-6"
                    whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      '@media (max-width: 640px)': {
                        padding: '16px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }
                    }}
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
                        className="w-16 h-16 mr-4 rounded-md filter grayscale image-hover border border-primary/50"
                        style={{
                          '@media (max-width: 640px)': {
                            width: '48px',
                            height: '48px',
                            borderRadius: '6px',
                          }
                        }}
                      />
                      <div>
                        <div className="flex items-center">
                          {step.icon}
                          <h3 className="text-xl font-semibold font-display text-accent-primary ml-2" style={{
                            '@media (max-width: 640px)': {
                              fontSize: '18px',
                            }
                          }}>{step.title}</h3>
                        </div>
                        <p className="text-secondary text-base mt-2 font-sans">{step.description}</p>
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
              className="text-4xl sm:text-5xl font-bold font-display text-accent-primary mb-6 text-center break-words"
              style={{
                '@media (max-width: 640px)': {
                  fontSize: '28px',
                  fontWeight: '800',
                  marginBottom: '16px',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                }
              }}
            >
              Процесс доставки
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center text-lg sm:text-xl mb-8 text-secondary font-sans"
              style={{
                '@media (max-width: 640px)': {
                  fontSize: '14px',
                  marginBottom: '16px',
                }
              }}
            >
              <p>Пошаговое руководство по оформлению доставки товаров из Китая под ключ на Fluvion</p>
            </motion.div>
            <div ref={progressRef} className="relative max-w-3xl mx-auto">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-primary/50 h-full"></div>
              {[
                {
                  title: 'Добавление товара',
                  description: 'Выберите товары из каталога или добавьте через терминал, указав все детали.',
                  icon: <ShoppingCartIcon className="w-8 h-8 text-accent-primary" />,
                },
                {
                  title: 'Оформление корзины',
                  description: 'Укажите отделение Европочты, примените промокод и выберите страховку.',
                  icon: <ShoppingCartIcon className="w-8 h-8 text-accent-primary" />,
                },
                {
                  title: 'Проверка администратором',
                  description: 'Ожидайте подтверждения заказа в течение 1–2 рабочих дней.',
                  icon: <DocumentCheckIcon className="w-8 h-8 text-accent-primary" />,
                },
                {
                  title: 'Просмотр и оплата',
                  description: 'Оплатите полную стоимость (товар, доставка из Китая, сборы) в профиле.',
                  icon: <CreditCardIcon className="w-8 h-8 text-accent-primary" />,
                },
                {
                  title: 'Транспортировка в РБ',
                  description: 'Заказ транспортируется в Беларусь через Карго (18–35 дней).',
                  icon: <TruckIcon className="w-8 h-8 text-accent-primary" />,
                },
                {
                  title: 'Отправка Европочтой',
                  description: 'Заказ доставляется в отделение Европочты (2–5 дней).',
                  icon: <TruckIcon className="w-8 h-8 text-accent-primary" />,
                },
                {
                  title: 'Оплата доставки по РБ',
                  description: 'Оплатите доставку по тарифам Европочты при получении.',
                  icon: <CreditCardIcon className="w-8 h-8 text-accent-primary" />,
                },
                {
                  title: 'Получение заказа',
                  description: 'Заберите товары в отделении Европочты после оплаты местной доставки.',
                  icon: <TruckIcon className="w-8 h-8 text-accent-primary" />,
                },
              ].map((step, index) => (
                <Tilt key={index} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
                  <motion.div
                    className="relative mb-8 flex items-center"
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div
                      className={`w-full pl-12 ${index % 2 === 0 ? 'pr-8' : 'pl-8 text-right'} bg-tertiary p-4 rounded-2xl shadow-card border border-primary/50 hover:shadow-accent-primary/40 transition-shadow duration-300`}
                      style={{
                        '@media (max-width: 640px)': {
                          padding: '12px',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }
                      }}
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
                              <h4 className="text-xl font-semibold font-display text-accent-primary ml-2" style={{
                                '@media (max-width: 640px)': {
                                  fontSize: '16px',
                                }
                              }}>{step.title}</h4>
                            </div>
                            <p className="text-secondary text-base font-sans">{step.description}</p>
                          </>
                        ) : (
                          <>
                            <p className="text-secondary text-base font-sans">{step.description}</p>
                            <div className="flex items-center">
                              <h4 className="text-xl font-semibold font-display text-accent-primary mr-2" style={{
                                '@media (max-width: 640px)': {
                                  fontSize: '16px',
                                }
                              }}>{step.title}</h4>
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
              className="bg-tertiary p-8 rounded-2xl shadow-card border border-primary/50 hover:shadow-accent-primary/40 transition-shadow duration-300 text-center animate-slide-up"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                '@media (max-width: 640px)': {
                  padding: '16px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                  backgroundRepeat: 'repeat',
                }}
              />
              <h2 className="text-3xl font-bold font-display text-accent-primary mb-4" style={{
                '@media (max-width: 640px)': {
                  fontSize: '24px',
                }
              }}>Готовы начать?</h2>
              <p className="text-secondary mb-6 text-base font-sans">
                Оформите доставку товаров из Китая под ключ или через самовыкуп прямо сейчас! Выберите товары из каталога, настройте заказ в терминале или проверьте статус в профиле.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/catalog')}
                  className={`animate-pulse bg-accent-primary text-primary px-6 py-3 rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold font-sans flex items-center justify-center gap-2 ${isActive('/catalog') ? 'ring-2 ring-offset-2 ring-accent-primary' : ''}`}
                  aria-label="Перейти в Каталог"
                  style={{
                    '@media (max-width: 640px)': {
                      padding: '10px 16px',
                      fontSize: '14px',
                      borderRadius: '6px',
                    }
                  }}
                >
                  <ShoppingCartIcon className="w-6 h-6" style={{
                    '@media (max-width: 640px)': {
                      width: '20px',
                      height: '20px',
                    }
                  }} />
                  Каталог
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/terminal')}
                  className={`animate-pulse bg-accent-primary text-primary px-6 py-3 rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold font-sans flex items-center justify-center gap-2 ${isActive('/terminal') ? 'ring-2 ring-offset-2 ring-accent-primary' : ''}`}
                  aria-label="Перейти в Терминал"
                  style={{
                    '@media (max-width: 640px)': {
                      padding: '10px 16px',
                      fontSize: '14px',
                      borderRadius: '6px',
                    }
                  }}
                >
                  <DocumentCheckIcon className="w-6 h-6" style={{
                    '@media (max-width: 640px)': {
                      width: '20px',
                      height: '20px',
                    }
                  }} />
                  Терминал
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/profile')}
                  className={`animate-pulse bg-accent-primary text-primary px-6 py-3 rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold font-sans flex items-center justify-center gap-2 ${isActive('/profile') ? 'ring-2 ring-offset-2 ring-accent-primary' : ''}`}
                  aria-label="Перейти в Профиль"
                  style={{
                    '@media (max-width: 640px)': {
                      padding: '10px 16px',
                      fontSize: '14px',
                      borderRadius: '6px',
                    }
                  }}
                >
                  <UserIcon className="w-6 h-6" style={{
                    '@media (max-width: 640px)': {
                      width: '20px',
                      height: '20px',
                    }
                  }} />
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