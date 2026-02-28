import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import {
  TruckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  CreditCardIcon,
  StarIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';

/**
 * Главная страница — стиль по ТЗ: Modern Premium Logistics + Chinese Energy.
 * Светлая тема, Primary #FF6200, Secondary #003087, типографика Manrope/Inter.
 */

const EASING = [0.4, 0, 0.2, 1];
const DURATION_MICRO = 0.25;
const DURATION_BLOCK = 0.4;
const DURATION_PAGE = 0.6;

const Home = () => {
  const navigate = useNavigate();
  const heroSectionRef = useRef(null);
  const advantagesSectionRef = useRef(null);
  const statsSectionRef = useRef(null);
  const marketplacesSectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
      const isLowEndDevice =
        isMobileDevice &&
        (window.innerWidth < 400 ||
          navigator.hardwareConcurrency <= 2 ||
          navigator.deviceMemory <= 2);
      setReduceMotion(
        isLowEndDevice ||
          window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const marketplaces = [
    { name: 'Pinduoduo', url: 'https://www.pinduoduo.com', text: '拼多多', logo: '/logos/pinduoduo.svg', hasImage: false },
    { name: 'Taobao', url: 'https://www.taobao.com', text: '淘宝', logo: '/logos/taobao.svg', hasImage: true },
    { name: '1688', url: 'https://www.1688.com', text: '1688', hasImage: false },
    { name: 'GoFish', url: 'https://www.gofish.com', text: 'GoFish', hasImage: false },
    { name: 'WeChat', url: 'https://www.wechat.com', text: '微信', logo: '/logos/wechat.svg', hasImage: true },
    { name: 'Poizon', url: 'https://www.poizon.com', text: 'Poizon', hasImage: false },
    { name: '95', url: 'https://www.95.com', text: '95', hasImage: false },
  ];

  const advantages = [
    { icon: ClockIcon, title: 'Быстрая доставка', description: 'Доставка из Китая за 18–35 дней через Карго', chinaAccent: true },
    { icon: CurrencyDollarIcon, title: 'Фиксированная цена', description: '$6 за кг + тарифы Европочты, без скрытых платежей' },
    { icon: ShieldCheckIcon, title: 'Страховка груза', description: 'Гарантия возврата полной стоимости груза при нашей вине' },
    { icon: MagnifyingGlassIcon, title: 'Проверка товаров', description: 'Проверка целостности и качества (от $5)' },
    { icon: GlobeAltIcon, title: 'Упрощённая таможня', description: 'Помощь с таможенными процедурами' },
    { icon: TruckIcon, title: 'Отслеживание', description: 'Трек-номер и уведомления в Профиле' },
    { icon: CreditCardIcon, title: 'Прозрачная оплата', description: 'Оплата через Альфа-Банк (Visa, Mastercard)' },
    { icon: StarIcon, title: 'Опыт', description: 'Более 5 лет успешной доставки из Китая' },
  ];

  const stats = [
    { number: 1000, suffix: '+', label: 'Товаров из Китая' },
    { number: 90, suffix: '%', label: 'Клиентов рекомендуют' },
    { number: 5, suffix: '', label: 'Складов-партнёров' },
    { number: 24, suffix: '/7', label: 'Поддержка клиентов' },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fluvion',
    url: 'https://fluvion.by',
    logo: 'https://fluvion.by/logo.png',
    description: 'Доставка товаров из Китая в Беларусь за 18-35 дней. Заказывайте с Pinduoduo, Taobao, 1688 и других маркетплейсов.',
    address: { '@type': 'PostalAddress', addressCountry: 'BY' },
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: ['Russian'] },
    sameAs: ['https://t.me/FLUVIONN'],
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.5', reviewCount: '1000' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: '6',
      priceSpecification: { '@type': 'UnitPriceSpecification', price: '6', priceCurrency: 'USD', unitCode: 'KGM' },
    },
  };

  const serviceStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Cargo Delivery',
    provider: { '@type': 'Organization', name: 'Fluvion' },
    areaServed: { '@type': 'Country', name: 'Belarus' },
    description: 'Доставка товаров из Китая в Беларусь за 18-35 дней',
    offers: { '@type': 'Offer', price: '6', priceCurrency: 'USD', unitCode: 'KGM' },
  };

  return (
    <div className="cargo-home min-h-screen bg-[#F8F9FA] text-[#1F252F] overflow-hidden relative pb-24 sm:pb-0">
      <Helmet>
        <title>Fluvion - Доставка товаров из Китая в Беларусь | Карго доставка под ключ</title>
        <meta name="description" content="Доставка товаров из Китая в Беларусь за 18-35 дней. Заказывайте с Pinduoduo, Taobao, 1688, GoFish и других маркетплейсов. Фиксированная цена $6/кг, страховка груза, отслеживание заказа. Более 5 лет опыта, 1000+ товаров, 90% клиентов рекомендуют." />
        <meta name="keywords" content="доставка из Китая, карго доставка, доставка товаров из Китая в Беларусь, Pinduoduo доставка, Taobao доставка, 1688 доставка, карго из Китая, доставка из Китая в Минск, китайские товары, заказ из Китая, доставка под ключ, Fluvion" />
        <meta property="og:title" content="Fluvion - Доставка товаров из Китая в Беларусь | Карго доставка под ключ" />
        <meta property="og:description" content="Доставка товаров из Китая в Беларусь за 18-35 дней. Заказывайте с Pinduoduo, Taobao, 1688 и других маркетплейсов. Фиксированная цена $6/кг, страховка груза, отслеживание." />
        <meta property="og:image" content="https://fluvion.by/logo.png" />
        <meta property="og:url" content="https://fluvion.by/" />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Fluvion - Доставка товаров из Китая в Беларусь" />
        <meta property="twitter:description" content="Доставка товаров из Китая в Беларусь за 18-35 дней. Фиксированная цена $6/кг, страховка груза, отслеживание заказа." />
        <meta property="twitter:image" content="https://fluvion.by/logo.png" />
        <link rel="canonical" href="https://fluvion.by/" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceStructuredData)}</script>
      </Helmet>

      {/* Hero */}
      <section ref={heroSectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              className="mb-12 flex justify-center"
              initial={reduceMotion ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION_BLOCK, ease: EASING, delay: 0 }}
            >
              <img src="/logo.png" alt="Fluvion Logo" className="relative w-40 h-40 md:w-56 md:h-56 object-contain cargo-logo" />
            </motion.div>

            <motion.h1
              className="cargo-h1 font-bold mb-6 sm:mb-8 leading-[1.1]"
              initial={reduceMotion ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION_BLOCK, ease: EASING, delay: reduceMotion ? 0 : 0.1 }}
            >
              <span className="block mb-2 cargo-gradient-text">Доставка из Китая</span>
              <span className="block font-light text-[#1F252F]">под ключ</span>
            </motion.h1>

            <motion.p
              className="text-base md:text-lg text-[#6B7280] mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed font-[Inter]"
              initial={reduceMotion ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION_BLOCK, ease: EASING, delay: reduceMotion ? 0 : 0.2 }}
            >
              Заказывайте товары из Китая без хлопот: от выбора в{' '}
              <span className="text-[#003087] font-semibold">примерах товаров</span> или{' '}
              <span className="text-[#FF6200] font-semibold">Терминале</span> до доставки в Беларусь за 18–35 дней по цене $6/кг
            </motion.p>

            <motion.div
              className="max-w-3xl mx-auto mb-8 sm:mb-12 p-4 rounded-2xl bg-[#F1F3F5] border border-[#E5E7EB]"
              initial={reduceMotion ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION_BLOCK, ease: EASING, delay: reduceMotion ? 0 : 0.3 }}
            >
              <p className="text-sm md:text-base text-[#6B7280] text-center font-[Inter]">
                <span className="font-semibold text-[#1F252F]">Важно:</span> В «Примерах товаров» — только то, что уже заказывали. Любой товар по ссылке — через «Заказать товар».
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={reduceMotion ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION_BLOCK, ease: EASING, delay: reduceMotion ? 0 : 0.4 }}
            >
              <motion.button
                onClick={() => navigate('/terminal')}
                className="cargo-btn-primary min-h-[44px] sm:min-h-[56px] md:min-h-[56px] w-full sm:w-auto px-6 sm:px-12 py-4 rounded-2xl font-semibold text-white tracking-wide uppercase text-[15px] sm:text-[17px]"
                whileHover={reduceMotion ? {} : { scale: 1.04, filter: 'brightness(1.08)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: DURATION_MICRO, ease: EASING }}
              >
                Заказать товар
              </motion.button>
              <motion.button
                onClick={() => navigate('/catalog')}
                className="cargo-btn-secondary min-h-[44px] sm:min-h-[56px] w-full sm:w-auto px-6 sm:px-12 py-4 rounded-2xl font-semibold text-[#003087] border-2 border-[#003087] bg-white tracking-wide uppercase text-[15px] sm:text-[17px]"
                whileHover={reduceMotion ? {} : { background: 'linear-gradient(135deg, #FF6200 0%, #FF8A3D 100%)', color: '#fff', borderColor: 'transparent' }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: DURATION_MICRO, ease: EASING }}
              >
                Примеры товаров
              </motion.button>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: DURATION_BLOCK }}
        >
          <div className="cargo-mouse-scroll" />
          <ChevronDownIcon className="w-6 h-6 text-[#FF6200] animate-bounce" />
        </motion.div>
      </section>

      {/* Преимущества */}
      <SectionInView ref={advantagesSectionRef}>
        <div className="container mx-auto px-4 pt-16 pb-20">
          <motion.div className="text-center mb-16" variants={staggerItem} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <h2 className="cargo-h2 font-bold mb-4">
              <span className="cargo-gradient-text">Преимущества</span>
              <span className="text-[#1F252F]"> доставки с нами</span>
            </h2>
            <p className="text-[#6B7280] text-base md:text-lg max-w-2xl mx-auto font-[Inter]">
              Мы делаем доставку из Китая простой, быстрой и надёжной
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {advantages.map((advantage, index) => {
              const Icon = advantage.icon;
              return (
                <motion.div key={index} variants={staggerItem} className="cargo-card group">
                  <div className="cargo-card-inner">
                    <div className="cargo-icon-wrap">
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#FF6200] cargo-icon" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#1F252F] mb-3 text-center font-[Manrope]">{advantage.title}</h3>
                    <p className="text-[#6B7280] text-sm text-center leading-relaxed font-[Inter]">
                      {advantage.chinaAccent ? (
                        <>Доставка <span className="text-[#E30613] font-medium">из Китая</span> за 18–35 дней через Карго</>
                      ) : (
                        advantage.description
                      )}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </SectionInView>

      {/* Статистика */}
      <SectionInView ref={statsSectionRef}>
        <div className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <StatBlock key={index} stat={stat} index={index} reduceMotion={reduceMotion} />
              ))}
            </div>
          </div>
        </div>
      </SectionInView>

      {/* Маркетплейсы */}
      <SectionInView ref={marketplacesSectionRef}>
        <div className="py-20">
          <div className="container mx-auto px-4">
            <motion.div className="text-center mb-16" variants={staggerItem} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
              <h2 className="cargo-h2 font-bold mb-4">
                <span className="cargo-gradient-text">С нами вы можете заказывать</span>
                <span className="text-[#1F252F]"> с этих сайтов</span>
              </h2>
              <p className="text-[#6B7280] text-base md:text-lg max-w-2xl mx-auto font-[Inter]">
                Мы работаем со всеми популярными китайскими маркетплейсами
              </p>
            </motion.div>

            <motion.div
              className="flex flex-wrap justify-center gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {marketplaces.map((marketplace, index) => (
                <motion.a
                  key={marketplace.name}
                  href={marketplace.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={marketplace.name}
                  className="cargo-marketplace-link"
                  variants={staggerItem}
                  whileHover={reduceMotion ? {} : { y: -4, scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {marketplace.hasImage ? (
                    <div className="cargo-marketplace-box">
                      <img
                        src={marketplace.logo}
                        alt={marketplace.name}
                        className="cargo-marketplace-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const span = document.createElement('span');
                          span.className = 'cargo-marketplace-text';
                          span.textContent = marketplace.text;
                          e.target.parentElement.appendChild(span);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="cargo-marketplace-box">
                      <span className="cargo-marketplace-text">{marketplace.text}</span>
                    </div>
                  )}
                </motion.a>
              ))}
            </motion.div>
          </div>
        </div>
      </SectionInView>

      <style>{cargoHomeStyles}</style>
    </div>
  );
};

// --- Scroll-triggered section wrapper ---
const sectionVariants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

const SectionInView = React.forwardRef(function SectionInView({ children }, ref) {
  const internalRef = useRef(null);
  const targetRef = ref || internalRef;
  const isInView = useInView(targetRef, { once: true, amount: 0.2 });
  return (
    <motion.section ref={targetRef} initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={sectionVariants}>
      {children}
    </motion.section>
  );
});

// --- Count-up block for stats ---
function StatBlock({ stat, index, reduceMotion }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 50, damping: 30 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView || reduceMotion) {
      motionValue.set(stat.number);
      return;
    }
    motionValue.set(0);
    const unsubscribe = springValue.on('change', (v) => setDisplayValue(Math.round(v)));
    const timer = setTimeout(() => motionValue.set(stat.number), 100);
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [isInView, stat.number, motionValue, springValue, reduceMotion]);

  const value = reduceMotion || !isInView ? stat.number : displayValue;

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="cargo-stat-number font-bold mb-2">
        {value}{stat.suffix}
      </div>
      <div className="text-[#6B7280] text-sm md:text-base font-[Inter]">{stat.label}</div>
    </motion.div>
  );
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

const cargoHomeStyles = `
  .cargo-home {
    --cargo-primary: #FF6200;
    --cargo-secondary: #003087;
    --cargo-china-red: #E30613;
    --cargo-neutral-900: #1F252F;
    --cargo-neutral-500: #6B7280;
    --cargo-neutral-100: #F8F9FA;
    --cargo-neutral-200: #F1F3F5;
    --cargo-shadow-primary: 0 10px 30px rgba(255, 98, 0, 0.25);
    --cargo-shadow-hover: 0 20px 50px rgba(0, 48, 135, 0.15);
    --cargo-ease: cubic-bezier(0.4, 0, 0.2, 1);
  }

  .cargo-h1 {
    font-family: 'Manrope', sans-serif;
    font-size: clamp(2.25rem, 5vw, 3.5rem);
    font-weight: 700;
  }

  .cargo-h2 {
    font-family: 'Manrope', sans-serif;
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 700;
  }

  .cargo-gradient-text {
    background: linear-gradient(135deg, #FF6200 0%, #FF8A3D 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .cargo-btn-primary {
    background: linear-gradient(135deg, #FF6200 0%, #FF8A3D 100%);
    box-shadow: var(--cargo-shadow-primary);
    transition: box-shadow 0.3s var(--cargo-ease), transform 0.3s var(--cargo-ease), filter 0.3s var(--cargo-ease);
  }
  .cargo-btn-primary:hover {
    box-shadow: 0 14px 40px rgba(255, 98, 0, 0.35);
  }

  .cargo-btn-secondary {
    transition: background 0.3s var(--cargo-ease), color 0.3s var(--cargo-ease), border-color 0.3s var(--cargo-ease), transform 0.3s var(--cargo-ease);
  }

  .cargo-card {
    background: #fff;
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    transition: transform 0.4s var(--cargo-ease), box-shadow 0.4s var(--cargo-ease), border 0.4s var(--cargo-ease);
    cursor: default;
    position: relative;
    overflow: hidden;
  }
  .cargo-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #FF6200 0%, #FF8A3D 100%);
    opacity: 0;
    transition: opacity 0.4s var(--cargo-ease);
  }
  .cargo-card:hover {
    transform: translateY(-12px) scale(1.03);
    box-shadow: var(--cargo-shadow-hover);
  }
  .cargo-card:hover::before {
    opacity: 1;
  }

  .cargo-card-inner {
    position: relative;
    z-index: 1;
  }

  .cargo-icon-wrap {
    width: 48px;
    height: 48px;
    margin: 0 auto 20px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(255, 98, 0, 0.08) 0%, transparent 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s var(--cargo-ease);
  }
  .cargo-card:hover .cargo-icon-wrap {
    transform: scale(1.15) rotate(12deg);
  }
  .cargo-icon {
    flex-shrink: 0;
  }

  .cargo-stat-number {
    font-family: 'Manrope', sans-serif;
    font-size: clamp(1.75rem, 4vw, 3rem);
    background: linear-gradient(135deg, #FF6200 0%, #FF8A3D 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .cargo-mouse-scroll {
    width: 24px;
    height: 40px;
    border: 2px solid rgba(255, 98, 0, 0.6);
    border-radius: 12px;
    background: rgba(255, 98, 0, 0.05);
    position: relative;
  }
  .cargo-mouse-scroll::after {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #FF6200;
    animation: cargo-mouse-wheel 2s ease-in-out infinite;
  }
  @keyframes cargo-mouse-wheel {
    0%, 100% { opacity: 1; transform: translateX(-50%) translateY(0); }
    50% { opacity: 0.3; transform: translateX(-50%) translateY(8px); }
  }

  .cargo-marketplace-link {
    display: inline-flex;
    text-decoration: none;
    min-height: 44px;
    min-width: 44px;
  }

  .cargo-marketplace-box {
    width: 80px;
    height: 80px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #E5E7EB;
    background: linear-gradient(135deg, rgba(255, 98, 0, 0.08) 0%, transparent 100%);
    transition: border-color 0.3s var(--cargo-ease), box-shadow 0.3s var(--cargo-ease);
  }
  .cargo-marketplace-link:hover .cargo-marketplace-box {
    border-color: var(--cargo-primary);
    box-shadow: var(--cargo-shadow-hover);
  }

  .cargo-marketplace-img {
    width: 100%;
    height: 100%;
    padding: 12px;
    object-fit: contain;
  }

  .cargo-marketplace-text {
    font-size: 1rem;
    font-weight: 600;
    color: var(--cargo-primary);
    font-family: 'Inter', sans-serif;
  }

  @media (max-width: 768px) {
    .cargo-card {
      padding: 24px;
    }
    .cargo-marketplace-box {
      width: 70px;
      height: 70px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cargo-card:hover {
      transform: none;
    }
    .cargo-card:hover .cargo-icon-wrap {
      transform: none;
    }
  }
`;

export default Home;
