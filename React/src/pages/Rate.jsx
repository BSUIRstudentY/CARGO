import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import {
  CurrencyDollarIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ShoppingCartIcon,
  DocumentCheckIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
  TruckIcon,
  BanknotesIcon,
} from '@heroicons/react/24/solid';
import { PageHeader } from '../components/ui/PageHeader';
  
// Минималистичная карточка с курсом валют
const RateCard = ({ label, value, icon: Icon, accentColor, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="h-full"
    >
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 h-full">
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="p-3 rounded-xl flex items-center justify-center"
            style={{
              background: `${accentColor}15`,
              border: `1px solid ${accentColor}30`,
            }}
          >
            <Icon className="w-6 h-6" style={{ color: accentColor }} />
              </div>
            </div>
            
        <span className="text-xs uppercase tracking-wider text-[#9ca3af] font-semibold block mb-3">
              {label}
            </span>
            
        <span className="text-2xl sm:text-3xl font-bold block" style={{ color: accentColor }}>
                {value}
              </span>
          </div>
    </motion.div>
  );
};

// Минималистичная карточка расчета стоимости
const CalculationCard = ({ shippingRate = 6.0 }) => {
  // Расчет: товар 500 CNY = 225 BYN (500 * 0.45), доставка 3кг × shippingRate = $18, упаковка $3
  const deliveryCost = 3 * shippingRate;
  const usdToByn = 3.0; // Примерный курс USD/BYN
  const totalByn = 225 + (deliveryCost * usdToByn) + (3 * usdToByn);
  const steps = [
    { label: 'Товар', value: '500 CNY', result: '225 BYN', accentColor: '#00f0ff' },
    { label: 'Доставка', value: `3 кг × $${shippingRate}`, result: `$${deliveryCost.toFixed(2)}`, accentColor: '#a78bfa' },
    { label: 'Упаковка', value: 'Стандарт', result: '$3', accentColor: '#10b981' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)]">
            <ChartBarIcon className="w-5 h-5 text-[#00f0ff]" />
              </div>
          <h3 className="text-xl font-bold text-[#00f0ff]">
                Пример расчета
              </h3>
            </div>

        <p className="text-[#9ca3af] mb-6 text-sm">
          Товар стоимостью <span className="text-[#e5e7eb] font-semibold">500 CNY</span>, весом <span className="text-[#e5e7eb] font-semibold">3 кг</span>
            </p>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
              initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: step.accentColor }}
                  />
                  <span className="text-[#e5e7eb] font-medium">{step.label}:</span>
                  <span className="text-[#9ca3af]">{step.value}</span>
                    </div>
                <span className="font-bold" style={{ color: step.accentColor }}>
                      {step.result}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
          initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]"
            >
              <div className="flex items-center justify-between">
            <span className="text-[#e5e7eb] font-bold text-lg">Итого:</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
              ~{totalByn.toFixed(0)} BYN
                </span>
              </div>
            </motion.div>
          </div>
    </motion.div>
  );
};

// Минималистичная FAQ карточка
const FAQItem = ({ question, answer, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.05, duration: 0.4 }}
    >
      <div className="p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3 flex-1">
            <div className="p-2 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)]">
              <QuestionMarkCircleIcon className="w-5 h-5 text-[#00f0ff]" />
              </div>
            <span className="font-semibold text-[#e5e7eb] group-hover:text-[#00f0ff] transition-colors">
                {question}
              </span>
            </div>
            <ChevronDownIcon
            className={`w-5 h-5 text-[#9ca3af] transition-all duration-300 ${
              open ? 'rotate-180 text-[#00f0ff]' : 'group-hover:text-[#e5e7eb]'
              }`}
            />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
              <p className="mt-4 text-[#9ca3af] leading-relaxed pl-12">
                  {answer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
      </div>
    </motion.div>
  );
};

function Rate() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [shippingRate, setShippingRate] = useState(6.0); // Fallback значение

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Загружаем курс доставки из API
  useEffect(() => {
    const fetchShippingRate = async () => {
      try {
        const response = await api.get('/exchange-rates/shipping/current');
        if (response.data && response.data.rate) {
          setShippingRate(response.data.rate);
        }
      } catch (error) {
        console.error('Ошибка при получении курса доставки:', error);
        // Используем значение по умолчанию
      }
    };
    fetchShippingRate();
  }, []);

  const faqs = [
    {
      question: 'Как часто обновляется курс?',
      answer: 'Курс CNY/BYN обновляется ежедневно по данным банка и внутренних расчетов Fluvion. При оформлении заказа фиксируется актуальное значение.',
    },
    {
      question: `Что входит в стоимость доставки $${shippingRate}/кг?`,
      answer: 'В ставку входит международная доставка из Китая до склада в Минске, работа логистики и базовое страхование груза.',
    },
    {
      question: 'Меняется ли стоимость после оформления заказа?',
      answer: 'Нет. После оплаты стоимость фиксируется и не пересчитывается даже при изменении курса на следующий день.',
    },
    {
      question: 'Можно ли получить скидку на курс или доставку?',
      answer: 'Скидки доступны по программе лояльности и промокодам. Актуальные предложения отображаются в вашем профиле Fluvion.',
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <PageHeader
            title="Курс валют"
            subtitle="Актуальный курс CNY/BYN и прозрачное ценообразование для заказов через Fluvion"
          />
        </motion.div>

        {/* Основные показатели */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <RateCard
            label="Курс CNY/BYN"
            value="1 CNY = 0.45 BYN"
            icon={CurrencyDollarIcon}
            accentColor="#00f0ff"
            delay={0.1}
          />
          <RateCard
            label="Доставка из Китая"
            value={`$${shippingRate} за 1 кг`}
            icon={TruckIcon}
            accentColor="#a78bfa"
            delay={0.15}
          />
          <RateCard
            label="Обновление курса"
            value="Ежедневно 10:00"
            icon={ClockIcon}
            accentColor="#10b981"
            delay={0.2}
          />
        </div>

        {/* Как формируется стоимость */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-12"
        >
          <div className="p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)]">
                <BanknotesIcon className="w-6 h-6 text-[#00f0ff]" />
                  </div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                    Как рассчитывается стоимость
                  </h2>
                </div>
                
            <p className="text-[#9ca3af] mb-6 text-base leading-relaxed">
                  Мы делаем ценообразование максимально прозрачным. Итоговая сумма складывается из нескольких компонентов:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                { title: 'Стоимость товара', desc: 'Пересчет из CNY в BYN по текущему курсу', icon: CurrencyDollarIcon, accentColor: '#00f0ff' },
                { title: 'Международная доставка', desc: `Ставка $${shippingRate} за 1 кг (минимум 1 кг) от склада в Китае до Минска`, icon: TruckIcon, accentColor: '#a78bfa' },
                { title: 'Упаковка и обработка', desc: 'Подготовка груза к транспортировке, консолидация и фотоотчет', icon: DocumentCheckIcon, accentColor: '#10b981' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                  initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="p-5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300"
                    >
                  <div 
                    className="inline-flex p-2 rounded-xl mb-3"
                    style={{
                      background: `${item.accentColor}15`,
                      border: `1px solid ${item.accentColor}30`,
                    }}
                  >
                    <item.icon className="w-5 h-5" style={{ color: item.accentColor }} />
                      </div>
                  <h3 className="text-[#e5e7eb] font-semibold mb-2">
                        {item.title}
                      </h3>
                  <p className="text-[#9ca3af] text-sm leading-relaxed">
                        {item.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
        </motion.section>

        {/* Пример расчета и как зафиксировать курс */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <CalculationCard shippingRate={shippingRate} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="p-8 h-full flex flex-col justify-between rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
              <div>
                  <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.3)]">
                    <ArrowTrendingUpIcon className="w-5 h-5 text-[#a78bfa]" />
                    </div>
                  <h3 className="text-xl font-bold text-[#a78bfa]">
                      Как зафиксировать курс
                    </h3>
                  </div>
                  
                <p className="text-[#9ca3af] mb-6 text-sm leading-relaxed">
                    Курс фиксируется в момент создания счета на оплату в Fluvion и не меняется после успешной оплаты.
                  </p>
                  
                <div className="space-y-3 mb-6">
                    {[
                      'Оформите заказ через «Заказать товар» или выберите из примеров товаров',
                      'Проверьте итоговую сумму в профиле',
                      'Оплатите счет в указанный срок — курс зафиксируется',
                    ].map((step, index) => (
                      <motion.div
                        key={index}
                      initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(167,139,250,0.3)] transition-all duration-300"
                      >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.3)] flex items-center justify-center text-[#a78bfa] font-bold">
                          {index + 1}
                        </div>
                      <span className="text-[#9ca3af]">{step}</span>
                      </motion.div>
                    ))}
                </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                <button
                      onClick={() => navigate('/terminal')}
                  className="px-6 py-3 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:border-[rgba(0,240,255,0.5)] transition-all duration-300 font-medium flex items-center gap-2"
                    >
                      <ShoppingCartIcon className="w-5 h-5" />
                      Заказать товар
                </button>
                <button
                      onClick={() => navigate('/terminal')}
                  className="px-6 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(167,139,250,0.4)] hover:text-[#a78bfa] transition-all duration-300 font-medium flex items-center gap-2"
                    >
                      <DocumentCheckIcon className="w-5 h-5" />
                      В терминал
                </button>
                  </div>
                </div>
          </motion.div>
        </div>

        {/* FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)]">
              <QuestionMarkCircleIcon className="w-5 h-5 text-[#00f0ff]" />
            </div>
            <h3 className="text-2xl font-bold text-[#00f0ff]">
              Часто задаваемые вопросы
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, index) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} index={index} />
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

export default Rate;
