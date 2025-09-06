import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OrderInstructions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stepRefs = useRef([]);
  const progressRef = useRef(null);

  // Определяем активный маршрут для подсветки кнопок
  const isActive = (path) => location.pathname === path;

  // Настройка IntersectionObserver для отслеживания видимости шагов
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepRefs.current.indexOf(entry.target);
            if (index !== -1) {
              const progressItems = progressRef.current.querySelectorAll('.progress-item');
              progressItems.forEach((item, i) => {
                item.classList.toggle('bg-[var(--accent-color)]', i === index);
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
    <section className="max-w-7xl mx-auto px-4 text-white min-h-screen relative overflow-hidden">
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
          transform: translate(-50%, -50%); /* Center horizontally and move up vertically */
        }
        .timeline-dot:hover {
          transform: translate(-50%, -50%) scale(1.2); /* Maintain vertical offset during hover */
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
              Инструкции по заказу
            </h1>

            

            {/* Основной контент */}
            <div className="space-y-10">
              {/* Инструкции по заказу */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                  <svg className="w-8 h-8 mr-2 fill-current text-[var(--accent-color)]" viewBox="0 0 24 24">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-[var(--accent-color)]">Как оформить заказ</h2>
                </div>
                <p className="text-gray-300 mb-6">
                  На ChinaShopBY мы сделали процесс заказа простым и удобным. Следуйте этим шагам, чтобы успешно оформить покупку товаров из Китая:
                </p>
                <div className="space-y-6">
                  {/* Шаг 1: Добавление товара */}
                  <div ref={(el) => (stepRefs.current[0] = el)} className="step-card bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
                    <div className="flex items-start">
                      <img
                        src="https://via.placeholder.com/150?text=Cargo+Package"
                        alt="Cargo Package"
                        className="w-16 h-16 mr-4 rounded-md filter grayscale image-hover"
                      />
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-2">1. Добавление товара</h3>
                        <p className="text-gray-300">
                          Вы можете добавить товары в корзину двумя способами:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-300">
                          <li>
                            <strong>Через каталог:</strong> Перейдите в раздел{' '}
                            <span className="font-bold text-[var(--accent-color)]">Каталог</span>, где представлены проверенные товары от наших поставщиков. Выберите нужный товар, укажите параметры (например, размер, цвет, количество) и нажмите "Добавить в корзину". Каталог идеально подходит для быстрого выбора популярных товаров с гарантированным качеством.
                          </li>
                          <li>
                            <strong>Через терминал:</strong> Если вы хотите заказать товар, которого нет в каталоге, используйте{' '}
                            <span className="font-bold text-[var(--accent-color)]">Терминал</span>. Введите все необходимые данные о товаре: ссылку на товар (например, с AliExpress, Taobao), описание, количество, цвет, размер и другие параметры. Терминал позволяет заказывать уникальные товары, но требует точного заполнения всех полей для корректной обработки.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Шаг 2: Оформление корзины */}
                  <div ref={(el) => (stepRefs.current[1] = el)} className="step-card bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
                    <div className="flex items-start">
                      <img
                        src="https://via.placeholder.com/150?text=Cart"
                        alt="Cart"
                        className="w-16 h-16 mr-4 rounded-md filter grayscale image-hover"
                      />
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-2">2. Оформление корзины</h3>
                        <p className="text-gray-300">
                          После добавления товаров перейдите в{' '}
                          <span className="font-bold text-[var(--accent-color)]">Корзину</span>. Здесь вы можете:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-300">
                          <li>Указать адрес доставки: выберите существующий адрес из вашего профиля или добавьте новый.</li>
                          <li>Применить промокод: если у вас есть промокод, введите его в соответствующее поле для получения скидки.</li>
                          <li>Добавить страховку: выберите опцию страхования груза для защиты от возможных повреждений или потерь во время доставки.</li>
                        </ul>
                        <p className="mt-2 text-gray-300">
                          После проверки всех деталей нажмите "Оформить заказ". Итоговая стоимость будет рассчитана с учётом цены товара, доставки, таможенных сборов и комиссии.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Шаг 3: Ожидание проверки */}
                  <div ref={(el) => (stepRefs.current[2] = el)} className="step-card bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
                    <div className="flex items-start">
                      <img
                        src="https://via.placeholder.com/150?text=Admin+Check"
                        alt="Admin Check"
                        className="w-16 h-16 mr-4 rounded-md filter grayscale image-hover"
                      />
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-2">3. Ожидание проверки администратором</h3>
                        <p className="text-gray-300">
                          После оформления заказа он отправляется на проверку нашей команде. Администраторы проверяют корректность данных, наличие товара у поставщика и актуальность цен. Этот процесс занимает обычно 1–2 рабочих дня. Вы получите уведомление по email или в личном кабинете о статусе проверки.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Шаг 4: Просмотр заказа */}
                  <div ref={(el) => (stepRefs.current[3] = el)} className="step-card bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
                    <div className="flex items-start">
                      <img
                        src="https://via.placeholder.com/150?text=Profile"
                        alt="Profile"
                        className="w-16 h-16 mr-4 rounded-md filter grayscale image-hover"
                      />
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-2">4. Просмотр заказа в профиле</h3>
                        <p className="text-gray-300">
                          После проверки администратором ваш заказ появится в разделе{' '}
                          <span className="font-bold text-[var(--accent-color)]">Профиль</span> в вкладке "Отправления". Здесь вы увидите итоговую информацию о заказе, включая возможные корректировки, внесённые администратором (например, уточнение веса, габаритов или стоимости доставки).
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Шаг 5: Оплата */}
                  <div ref={(el) => (stepRefs.current[4] = el)} className="step-card bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
                    <div className="flex items-start">
                      <img
                        src="https://via.placeholder.com/150?text=Payment"
                        alt="Payment"
                        className="w-16 h-16 mr-4 rounded-md filter grayscale image-hover"
                      />
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--accent-color)] mb-2">5. Оплата через эквайринг</h3>
                        <p className="text-gray-300">
                          Когда заказ подтверждён, вы можете оплатить его через систему эквайринга. Мы принимаем банковские карты (Visa, Mastercard), электронные кошельки (WebMoney, ЮMoney, Qiwi) и банковские переводы (для юридических лиц). Все платежи защищены 256-битным SSL-шифрованием. После успешной оплаты вы получите подтверждение, и заказ будет передан в логистику для доставки.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Визуальный процесс заказа (вертикальная временная шкала) */}
              <div className="container py-12">
                <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-center text-[var(--accent-color)]">Процесс заказа</h2>
                <div className="text-center text-lg sm:text-xl mb-8 text-gray-300">
                  <p>Пошаговое руководство по оформлению заказа на ChinaShopBY</p>
                </div>
                <div className="relative max-w-3xl mx-auto">
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gray-600 h-full"></div>
                  {[
                    {
                      title: 'Добавление товара',
                      description: 'Выберите товары из каталога или добавьте через терминал, указав все детали.',
                      icon: <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10z" /></svg>,
                    },
                    {
                      title: 'Оформление корзины',
                      description: 'Укажите адрес, примените промокод и выберите страховку в корзине.',
                      icon: <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM17 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-8.1-5.83L10.17 12h6.66l1.28-1.83c.36-.51.86-.83 1.41-.83H22v-2h-2.49l-1.28 1.83c-.36.51-.86.83-1.41.83H10.1l-1.28 1.83zM4 6v2h2l3.6 7.59-1.35 2.44C7.91 18.58 8.36 19 9 19h12v-2H9.42l1.35-2.44L4 6H2V4h2.49l1.28 1.83c.36.51.86.83 1.41.83H20v2H7.49l-1.28-1.83c-.36-.51-.86-.83-1.41-.83H4z" /></svg>,
                    },
                    {
                      title: 'Проверка администратором',
                      description: 'Ожидайте подтверждения заказа в течение 1–2 рабочих дней.',
                      icon: <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>,
                    },
                    {
                      title: 'Просмотр заказа',
                      description: 'Проверьте итоговый заказ с учётом корректировок в профиле.',
                      icon: <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>,
                    },
                    {
                      title: 'Оплата',
                      description: 'Оплатите заказ через эквайринг с помощью карты или кошелька.',
                      icon: <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15H3V8h18v11zm-2-1.5c0 .83-.67 1.5-1.5 1.5h-4c-.83 0-1.5-.67-1.5-1.5V16h8v1.5zM12 10h6v2h-6v-2z" /></svg>,
                    },
                  ].map((step, index) => (
                    <div key={index} className="relative mb-8 flex items-center">
                      
                      <div className={`w-full pl-12 ${index % 2 === 0 ? 'pr-8' : 'pl-8 text-right'} bg-gray-900 p-4 rounded-lg shadow-lg`}>
                        <div className="flex items-center justify-between">
                          {index % 2 === 0 ? (
                            <>
                              <div className="flex items-center">
                                {step.icon}
                                <h4 className="text-xl font-semibold text-[var(--accent-color)] ml-2">{step.title}</h4>
                              </div>
                              <p className="text-gray-400">{step.description}</p>
                            </>
                          ) : (
                            <>
                              <p className="text-gray-400">{step.description}</p>
                              <div className="flex items-center">
                                <h4 className="text-xl font-semibold text-[var(--accent-color)] mr-2">{step.title}</h4>
                                {step.icon}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Призыв к действию */}
              <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-4">Готовы начать?</h2>
                <p className="text-gray-300 mb-6">
                  Оформите свой первый заказ прямо сейчас! Выберите товары из каталога, настройте заказ в терминале или проверьте статус в профиле.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/catalog')}
                    className={`cta-button bg-[var(--accent-color)] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition duration-300 ${
                      isActive('/catalog') ? 'ring-2 ring-offset-2 ring-[var(--accent-color)]' : ''
                    } w-full sm:w-auto flex items-center justify-center`}
                    aria-label="Перейти в Каталог"
                  >
                    <svg className="w-6 h-6 mr-2 fill-current" viewBox="0 0 24 24">
                      <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V6h5.17l2 2H20v10z" />
                    </svg>
                    Каталог
                  </button>
                  <button
                    onClick={() => navigate('/terminal')}
                    className={`cta-button bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 ${
                      isActive('/terminal') ? 'ring-2 ring-offset-2 ring-blue-600' : ''
                    } w-full sm:w-auto flex items-center justify-center`}
                    aria-label="Перейти в Терминал"
                  >
                    <svg className="w-6 h-6 mr-2 fill-current" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 18V6h16v12H4zm2-8h4V8H6v2zm0 4h4v-2H6v2zm6-4h6V8h-6v2zm0 4h6v-2h-6v2z" />
                    </svg>
                    Терминал
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className={`cta-button bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 ${
                      isActive('/profile') ? 'ring-2 ring-offset-2 ring-green-600' : ''
                    } w-full sm:w-auto flex items-center justify-center`}
                    aria-label="Перейти в Профиль"
                  >
                    <svg className="w-6 h-6 mr-2 fill-current" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    Профиль
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OrderInstructions;