import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCartIcon, DocumentCheckIcon, UserIcon, CreditCardIcon, TruckIcon, WalletIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';

function OrderInstructions() {
  const navigate = useNavigate();
  const location = useLocation();
  const stepRefs = useRef([]);
  const isActive = (path) => location.pathname === path;

  const fullServiceSteps = [
    {
      title: 'Добавление товара',
      description: (
        <>
          Вы можете добавить товары двумя способами:
          <ul className="list-disc pl-5 mt-2 space-y-2 text-[#9ca3af]">
            <li>
              <strong>Заказать товар (основной способ):</strong> Перейдите в раздел <span className="font-bold text-[#00f0ff]">Заказать товар</span> в меню. Добавьте ссылки на товары с китайских площадок, укажите параметры и оформите заявку.
            </li>
            <li>
              <strong>Примеры товаров:</strong> В разделе <span className="font-bold text-[#00f0ff]">Примеры товаров</span> — проверенные товары, которые уже заказывали клиенты. Можно добавить их в корзину.
            </li>
          </ul>
          <div className="mt-4">
            <p className="text-[#9ca3af] mb-3">Мы можем привезти вам товары с этих и любых других китайских маркетплейсов:</p>
            <div className="flex flex-wrap gap-3 items-center">
              <a
                href="https://www.pinduoduo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl border border-[rgba(255,255,255,0.1)] hover:border-[#00f0ff] hover:scale-110 transition-all duration-300 overflow-hidden"
                title="Pinduoduo"
              >
                <img 
                  src="/logos/pinduoduo.svg" 
                  alt="Pinduoduo" 
                  className="w-full h-full object-contain p-2"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<span class="text-gray-600 font-bold text-xs">拼多多</span>';
                  }}
                />
              </a>
              <a
                href="https://www.taobao.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-16 h-16 rounded-xl border border-[rgba(255,255,255,0.1)] hover:border-[#00f0ff] hover:scale-110 transition-all duration-300"
                style={{ backgroundColor: '#FF5000' }}
                title="Taobao"
              >
                <span className="text-[#e5e7eb] font-bold text-sm">淘宝</span>
              </a>
              <a
                href="https://www.1688.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-16 h-16 rounded-xl border border-[rgba(255,255,255,0.1)] hover:border-[#00f0ff] hover:scale-110 transition-all duration-300"
                style={{ backgroundColor: '#FF6A00' }}
                title="1688"
              >
                <span className="text-[#e5e7eb] font-bold text-base">1688</span>
              </a>
              <a
                href="https://www.gofish.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-16 h-16 bg-[#1a1a1a] rounded-lg border-2 border-[#333] hover:border-[#e81e2d] hover:scale-110 transition-all duration-300"
                title="GoFish"
              >
                <span className="text-[#e5e7eb] font-bold text-xs">GoFish</span>
              </a>
              <a
                href="https://www.wechat.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-16 h-16 rounded-xl border border-[rgba(255,255,255,0.1)] hover:border-[#00f0ff] hover:scale-110 transition-all duration-300"
                style={{ backgroundColor: '#09BB07' }}
                title="WeChat"
              >
                <span className="text-[#e5e7eb] font-bold text-sm">微信</span>
              </a>
              <a
                href="https://www.poizon.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-lg border-2 border-[#333] hover:border-[#e81e2d] hover:scale-110 transition-all duration-300"
                title="Poizon"
              >
                <span className="text-[#e5e7eb] font-bold text-xs">Poizon</span>
              </a>
              <a
                href="https://www.95.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-16 h-16 bg-[#1a1a1a] rounded-lg border-2 border-[#333] hover:border-[#e81e2d] hover:scale-110 transition-all duration-300"
                title="95"
              >
                <span className="text-[#e5e7eb] font-bold text-sm">95</span>
              </a>
            </div>
          </div>
        </>
      ),
      icon: <ShoppingCartIcon className="w-6 h-6 text-[#10b981]" />,
    },
    {
      title: 'Оформление заказа в корзине',
      description: (
        <>
          После добавления товаров перейдите в <span className="font-bold text-[#00f0ff]">Корзину</span>. Здесь вы можете:
          <ul className="list-disc pl-5 mt-2 space-y-2 text-[#9ca3af]">
            <li>Выбрать отделение Европочты для доставки по Республике Беларусь</li>
            <li>Применить промокод для получения скидки (если он у вас есть)</li>
            <li>Добавить страховку груза (опционально, +5% к стоимости товаров) — гарантия возврата полной стоимости груза, если что-то с ним случится по нашей вине</li>
            <li>Выбрать способ оплаты: с баланса (полностью или частично) или банковской картой</li>
          </ul>
          <p className="mt-2 text-[#9ca3af]">
            После проверки всех деталей нажмите "Оформить заказ". Заказ будет создан со статусом <span className="font-semibold text-[#e5e7eb]">Ожидает оплаты</span>.
          </p>
        </>
      ),
      icon: <ShoppingCartIcon className="w-6 h-6 text-[#10b981]" />,
    },
    {
      title: 'Проверка администратором',
      description: (
        <>
          После создания заказ проверяется нашей командой. Администраторы проверяют:
          <ul className="list-disc pl-5 mt-2 space-y-2 text-[#9ca3af]">
            <li>Корректность данных заказа</li>
            <li>Актуальность ссылок на товары</li>
            <li>Наличие товаров у поставщика</li>
            <li>Соответствие цен</li>
          </ul>
          <p className="mt-2 text-[#9ca3af]">
            После проверки администратором заказ получает статус <span className="font-semibold text-white">Подтверждён</span> и рассчитывается итоговая стоимость. Вы получите уведомление по email или в <span className="font-bold text-[#00f0ff]">Профиле</span>. Процесс проверки занимает 1–2 рабочих дня.
          </p>
        </>
      ),
      icon: <DocumentCheckIcon className="w-6 h-6 text-[#00f0ff]" />,
    },
    {
      title: 'Оплата заказа',
      description: (
        <>
          После проверки администратором и подтверждения итоговой стоимости необходимо оплатить заказ в течение 3 дней. Оплата производится в разделе <span className="font-bold text-[#00f0ff]">Профиль</span> во вкладке "Отправления".
          <ul className="list-disc pl-5 mt-2 space-y-2 text-[#9ca3af]">
            <li>
              <strong>Оплата с баланса:</strong> Если у вас достаточно средств на балансе, можно оплатить полностью или частично. Недостающую сумму можно доплатить банковской картой.
            </li>
            <li>
              <strong>Оплата банковской картой:</strong> Visa или Mastercard через безопасный эквайринг BePaid с 256-битным SSL-шифрованием и 3D-Secure.
            </li>
          </ul>
          <p className="mt-2 text-[#9ca3af]">
            После успешной оплаты заказ получает статус <span className="font-semibold text-white">Оплачен</span> и включается в сборный груз.
          </p>
        </>
      ),
      icon: <CreditCardIcon className="w-6 h-6 text-[#00f0ff]" />,
    },
    {
      title: 'Включение в сборный груз',
      description: (
        <>
          Оплаченные заказы включаются в <span className="font-bold text-[#00f0ff]">сборные грузы</span> для оптимизации логистики и снижения стоимости доставки для всех клиентов. Оплатить заказ можно после проверки администратором и подтверждения итоговой стоимости.
          <p className="mt-2 text-[#9ca3af]">
            После включения вашего заказа в сборный груз вы увидите его в разделе <span className="font-bold text-[#00f0ff]">Профиль</span> во вкладке "Сборные грузы". Здесь можно отслеживать статус всего сборного груза.
          </p>
        </>
      ),
      icon: <TruckIcon className="w-6 h-6 text-[#00f0ff]" />,
    },
    {
      title: 'Выкуп товаров у поставщиков',
      description: (
        <>
          После формирования сборного груза администраторы выкупают все товары у китайских поставщиков. Для каждого товара проверяется:
          <ul className="list-disc pl-5 mt-2 space-y-2 text-[#9ca3af]">
            <li>Доступность товара у поставщика</li>
            <li>Актуальность цены</li>
            <li>Наличие товара в нужном количестве</li>
          </ul>
          <p className="mt-2 text-[#9ca3af]">
            Если товар невозможно выкупить (закончился, неверная ссылка и т.д.), средства автоматически возвращаются на ваш баланс, и вы получите уведомление об этом.
          </p>
        </>
      ),
      icon: <ShoppingCartIcon className="w-6 h-6 text-[#10b981]" />,
    },
    {
      title: 'Консолидация на складе в Китае',
      description: (
        <>
          После выкупа товары доставляются от поставщиков на наш склад в Китае, где происходит:
          <ul className="list-disc pl-5 mt-2 space-y-2 text-[#9ca3af]">
            <li>Проверка товаров</li>
            <li>Упаковка в соответствии с требованиями</li>
            <li>Формирование общего сборного груза</li>
            <li>Подготовка к отправке</li>
          </ul>
          <p className="mt-2 text-[#9ca3af]">
            Когда все товары сборного груза собраны на складе, груз получает статус <span className="font-semibold text-white">Завершён</span> и готовится к отправке.
          </p>
        </>
      ),
      icon: <TruckIcon className="w-6 h-6 text-[#00f0ff]" />,
    },
    {
      title: 'Транспортировка из Китая в Беларусь',
      description: (
        <>
          Сборный груз отправляется из Китая в Республику Беларусь через транспортную компанию Карго. Срок доставки составляет <strong className="text-white">18–35 дней</strong> в зависимости от способа транспортировки.
          <p className="mt-2 text-[#9ca3af]">
            Стоимость международной доставки рассчитывается по <a href="/rates" onClick={(e) => { e.preventDefault(); navigate('/rates'); }} className="font-bold text-[#00f0ff] hover:underline">актуальному курсу</a> (минимальный вес — 1 кг). Отслеживать статус транспортировки можно в разделе <span className="font-bold text-[#00f0ff]">Профиль</span> во вкладке "Сборные грузы".
          </p>
        </>
      ),
      icon: <TruckIcon className="w-6 h-6 text-[#00f0ff]" />,
    },
    {
      title: 'Отправка через Европочту',
      description: (
        <>
          После прибытия на склад в Минске ваш заказ передаётся в Европочту для доставки в выбранное вами отделение. Срок доставки по Республике Беларусь: <strong className="text-white">2–5 дней</strong> в зависимости от региона.
          <p className="mt-2 text-[#9ca3af]">
            Вы получите уведомление с трек-номером для отслеживания доставки и ориентировочным сроком получения.
          </p>
        </>
      ),
      icon: <TruckIcon className="w-6 h-6 text-[#00f0ff]" />,
    },
    {
      title: 'Получение заказа',
      description: (
        <>
          Заберите ваш заказ в указанном отделении Европочты. При получении необходимо оплатить стоимость доставки по тарифам Европочты + стоимость доставки из Китая в РБ по <a href="/rates" onClick={(e) => { e.preventDefault(); navigate('/rates'); }} className="font-bold text-[#00f0ff] hover:underline">актуальному курсу</a>. 
          <p className="mt-2 text-[#9ca3af]">
            Убедитесь, что товары соответствуют заказу. После получения оставьте отзыв во вкладке <span className="font-bold text-[#00f0ff]">Отзывы</span> — это поможет другим клиентам сделать правильный выбор!
          </p>
        </>
      ),
      icon: <CheckCircleIcon className="w-6 h-6 text-[#00f0ff]" />,
    },
  ];

  const selfPurchaseSteps = [
    {
      title: 'Самостоятельная покупка товаров',
      description: (
        <>
          Купите товары на любых китайских площадках (Pinduoduo, Taobao, 1688, GoFish, WeChat, Poizon, 95 и любых других) самостоятельно и отправьте их на наш китайский склад. Адрес склада можно узнать в разделе <span className="font-bold text-[#00f0ff]">Самовыкуп</span> или связавшись с поддержкой.
          
        </>
      ),
      icon: <ShoppingCartIcon className="w-6 h-6 text-[#10b981]" />,
    },
    {
      title: 'Оформление доставки в разделе Самовыкуп',
      description: (
        <>
          После отправки товаров на наш склад в Китае перейдите в раздел <span className="font-bold text-[#00f0ff]">Самовыкуп</span> и укажите трек-номер вашего груза. Также необходимо указать:
          <ul className="list-disc pl-5 mt-2 space-y-2 text-[#9ca3af]">
            <li>Описание товаров</li>
            <li>Выбранное отделение Европочты для доставки по РБ</li>
            <li>Опцию страхования (если необходимо)</li>
          </ul>
        </>
      ),
      icon: <UserIcon className="w-6 h-6 text-[#00f0ff]" />,
    },
    {
      title: 'Включение в сборный груз и транспортировка',
      description: (
        <>
          Ваш заказ объединяется с другими заказами в сборный груз и отправляется из Китая в Беларусь через транспортную компанию Карго. Срок доставки: <strong className="text-white">18–35 дней</strong>.
          <p className="mt-2 text-[#9ca3af]">
            Отслеживать статус можно в разделе <span className="font-bold text-[#00f0ff]">Профиль</span> во вкладке "Сборные грузы" или "Отправления".
          </p>
        </>
      ),
      icon: <TruckIcon className="w-6 h-6 text-[#00f0ff]" />,
    },
    {
      title: 'Прибытие в Минск',
      description: (
        <>
          После прибытия в Беларусь груз прибывает на склад в Минске и подготавливается к отправке через Европочту.
        </>
      ),
      icon: <CheckCircleIcon className="w-6 h-6 text-[#00f0ff]" />,
    },
    {
      title: 'Отправка через Европочту и оплата',
      description: (
        <>
          После прибытия на склад в Минске заказ передаётся в Европочту для доставки в выбранное отделение. Срок доставки по РБ: <strong className="text-white">2–5 дней</strong>.
          <p className="mt-2 text-[#9ca3af]">
            После отправки заказа через Европочту необходимо оплатить стоимость доставки из Китая в Беларусь по <a href="/rates" onClick={(e) => { e.preventDefault(); navigate('/rates'); }} className="font-bold text-[#00f0ff] hover:underline">актуальному курсу</a>. Оплата производится через эквайринг BePaid (Visa, Mastercard) или с баланса в <span className="font-bold text-[#00f0ff]">Профиле</span>.
          </p>
          <p className="mt-2 text-[#9ca3af]">
            Вы получите уведомление с трек-номером для отслеживания доставки.
          </p>
        </>
      ),
      icon: <TruckIcon className="w-6 h-6 text-[#00f0ff]" />,
    },
    {
      title: 'Получение заказа',
      description: (
        <>
          Заберите товары в указанном отделении Европочты. При получении оплатите только стоимость доставки по тарифам Европочты (наличными или через эквайринг в отделении).
          <p className="mt-2 text-[#9ca3af]">
            Убедитесь, что товары соответствуют заказу, и оставьте отзыв во вкладке <span className="font-bold text-[#00f0ff]">Отзывы</span>.
          </p>
        </>
      ),
      icon: <CheckCircleIcon className="w-6 h-6 text-[#00f0ff]" />,
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <PageHeader
          kicker="Инструкция"
          title="Инструкции по заказу"
          subtitle="Пошаговое руководство по оформлению доставки товаров из Китая на Fluvion"
        />

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6 sm:space-y-10"
        >
          {/* Товары из Китая под ключ */}
          <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] mr-2 sm:mr-3">
                <DocumentCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#10b981]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#10b981]">
                Товары из Китая под ключ
              </h2>
            </div>
            <p className="text-[#9ca3af] mb-4 sm:mb-6 text-sm sm:text-base">
              На Fluvion процесс заказа доставки товаров из Китая под ключ прост и удобен. Мы берём на себя все этапы: от оформления заказа до доставки в ваше отделение почты. Следуйте этим шагам:
            </p>
            <div className="space-y-3 sm:space-y-4">
              {fullServiceSteps.map((step, index) => (
                <motion.div
                  key={index}
                  ref={(el) => (stepRefs.current[index] = el)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="p-3 sm:p-5 mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-xl font-semibold text-[#00f0ff] mb-1.5 sm:mb-2">
                          {index + 1}. {step.title}
                        </h3>
                        <div className="text-[#9ca3af] text-sm sm:text-base">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Самовыкуп */}
          <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.3)] mr-2 sm:mr-3">
                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#a78bfa]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#a78bfa]">
                Самовыкуп
              </h2>
            </div>
            <p className="text-[#9ca3af] mb-4 sm:mb-6 text-sm sm:text-base">
              Если вы самостоятельно приобрели товары на китайских площадках и отправили их на наш склад в Китае, мы организуем доставку до вашего отделения почты. Следуйте этим шагам:
            </p>
            <div className="space-y-3 sm:space-y-4">
              {selfPurchaseSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="p-3 sm:p-5 mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base sm:text-xl font-semibold text-[#00f0ff] mb-1.5 sm:mb-2">
                          {index + 1}. {step.title}
                        </h3>
                        <div className="text-[#9ca3af] text-sm sm:text-base">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Призыв к действию */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="p-4 sm:p-6 md:p-8 text-center rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent mb-3 sm:mb-4">
                Готовы начать?
              </h2>
              <p className="text-[#9ca3af] mb-4 sm:mb-6 text-sm sm:text-base max-w-2xl mx-auto">
                Оформите доставку товаров из Китая под ключ или через самовыкуп прямо сейчас! Добавьте товары через «Заказать товар», выберите из примеров или проверьте статус в профиле.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  onClick={() => navigate('/terminal')}
                  className="flex items-center justify-center gap-2"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  Заказать товар
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('/terminal')}
                  className="flex items-center justify-center gap-2"
                >
                  <DocumentCheckIcon className="w-5 h-5" />
                  Терминал
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-center gap-2"
                >
                  <UserIcon className="w-5 h-5" />
                  Профиль
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}

export default OrderInstructions;
