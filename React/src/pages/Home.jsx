import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  TruckIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  CreditCardIcon,
  StarIcon,
  ChevronDownIcon
} from '@heroicons/react/24/solid';

/**
 * Оптимизированная главная страница
 * Минималистичный dark mode с легковесными эффектами
 */

const Home = () => {
  const navigate = useNavigate();
  const heroSectionRef = useRef(null);
  const advantagesSectionRef = useRef(null);
  const statsSectionRef = useRef(null);
  const marketplacesSectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Определение мобильного устройства и слабого устройства
  useEffect(() => {
    const checkDevice = () => {
      const isMobileDevice = window.innerWidth <= 768;
      setIsMobile(isMobileDevice);

      // Проверка на слабое устройство (низкое разрешение или медленный CPU)
      const isLowEndDevice = 
        isMobileDevice && 
        (window.innerWidth < 400 || 
         navigator.hardwareConcurrency <= 2 ||
         navigator.deviceMemory <= 2);
      
      setReduceMotion(isLowEndDevice || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
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
    {
      icon: ClockIcon,
      title: 'Быстрая доставка',
      description: 'Доставка из Китая за 18–35 дней через Карго',
      accent: '#00f0ff'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Фиксированная цена',
      description: '$6 за кг + тарифы Европочты, без скрытых платежей',
      accent: '#a78bfa'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Страховка груза',
      description: 'Гарантия возврата полной стоимости груза, если что-то с ним случится по нашей вине',
      accent: '#10b981'
    },
    {
      icon: MagnifyingGlassIcon,
      title: 'Проверка товаров',
      description: 'Проверка целостности и качества (от $5)',
      accent: '#00f0ff'
    },
    {
      icon: GlobeAltIcon,
      title: 'Упрощённая таможня',
      description: 'Помощь с таможенными процедурами',
      accent: '#a78bfa'
    },
    {
      icon: TruckIcon,
      title: 'Отслеживание',
      description: 'Трек-номер и уведомления в Профиле',
      accent: '#10b981'
    },
    {
      icon: CreditCardIcon,
      title: 'Прозрачная оплата',
      description: 'Оплата через Альфа-Банк (Visa, Mastercard)',
      accent: '#00f0ff'
    },
    {
      icon: StarIcon,
      title: 'Опыт',
      description: 'Более 5 лет успешной доставки из Китая',
      accent: '#a78bfa'
    }
  ];

  const stats = [
    { number: '1000+', label: 'Товаров из Китая' },
    { number: '90%', label: 'Клиентов рекомендуют' },
    { number: '5', label: 'Складов-партнёров' },
    { number: '24/7', label: 'Поддержка клиентов' },
  ];

  // Intersection Observer для анимаций при прокрутке
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1, // Элемент должен быть виден хотя бы на 10%
      rootMargin: '0px 0px -50px 0px' // Небольшой отступ снизу
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Добавляем класс in-view ко всем дочерним элементам с классами анимации
          const animatedElements = entry.target.querySelectorAll('.fade-in-trigger, .fade-in-trigger-delay-1, .fade-in-trigger-delay-2, .fade-in-up-trigger');
          animatedElements.forEach(el => el.classList.add('in-view'));
          // Отключаем observer после первого срабатывания для оптимизации
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Hero секция видна сразу - запускаем анимации немедленно
    if (heroSectionRef.current) {
      const heroAnimatedElements = heroSectionRef.current.querySelectorAll('.fade-in-trigger, .fade-in-trigger-delay-1, .fade-in-trigger-delay-2');
      heroAnimatedElements.forEach(el => el.classList.add('in-view'));
    }

    // Наблюдаем за секциями, которые появляются при прокрутке
    if (advantagesSectionRef.current) {
      observer.observe(advantagesSectionRef.current);
    }
    if (statsSectionRef.current) {
      observer.observe(statsSectionRef.current);
    }
    if (marketplacesSectionRef.current) {
      observer.observe(marketplacesSectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Fluvion",
    "url": "https://fluvion.by",
    "logo": "https://fluvion.by/logo.png",
    "description": "Доставка товаров из Китая в Беларусь за 18-35 дней. Заказывайте с Pinduoduo, Taobao, 1688 и других маркетплейсов.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "BY"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["Russian"]
    },
    "sameAs": [
      "https://t.me/FLUVIONN"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "1000"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": "6",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "6",
        "priceCurrency": "USD",
        "unitCode": "KGM"
      }
    }
  };

  const serviceStructuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Cargo Delivery",
    "provider": {
      "@type": "Organization",
      "name": "Fluvion"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Belarus"
    },
    "description": "Доставка товаров из Китая в Беларусь за 18-35 дней",
    "offers": {
      "@type": "Offer",
      "price": "6",
      "priceCurrency": "USD",
      "unitCode": "KGM"
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] overflow-hidden relative pb-24 sm:pb-0">
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
      {/* Hero Section */}
      <section ref={heroSectionRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Логотип с glow эффектом */}
            <div className="mb-12 flex justify-center fade-in-trigger">
              <div className="relative logo-glow-wrapper">
                <img
                  src="/logo.png"
                  alt="Fluvion Logo"
                  className={`relative w-40 h-40 md:w-56 md:h-56 object-contain ${reduceMotion ? '' : 'logo-glow'}`}
                />
              </div>
            </div>

            {/* Заголовок */}
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-6 sm:mb-8 leading-tight fade-in-trigger">
              <span className="block mb-2 bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                Доставка из Китая
              </span>
              <span className="block text-[#e5e7eb] font-light">под ключ</span>
            </h1>

            <p className="text-sm sm:text-base md:text-2xl text-[#9ca3af] mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed fade-in-trigger-delay-1">
              Заказывайте товары из Китая без хлопот: от выбора в{' '}
              <span className="text-[#00f0ff] font-semibold">примерах товаров</span> (уже заказывали клиенты) или{' '}
              <span className="text-[#a78bfa] font-semibold">Терминале</span> (любые товары по ссылке) до доставки в Беларусь за 18–35 дней по цене $6/кг
            </p>
            
            {/* Информационное уведомление о каталоге */}
            <div className="max-w-3xl mx-auto mb-8 sm:mb-12 p-3 sm:p-4 rounded-xl bg-[rgba(255,193,7,0.1)] border border-[rgba(255,193,7,0.3)] fade-in-trigger-delay-2">
              <p className="text-[11px] sm:text-sm md:text-base text-[#ffeaa7] text-center">
                <span className="font-bold text-[#ffc107]">💡 Важно:</span> В «Примерах товаров» — только то, что уже заказывали. Чтобы заказать любой товар по ссылке, используйте «Заказать товар».
              </p>
            </div>

            {/* Кнопки: сначала «Заказать товар» как основной призыв */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center fade-in-trigger-delay-2">
              <button
                onClick={() => navigate('/terminal')}
                className="px-5 py-3 text-sm sm:px-8 sm:py-4 sm:text-lg font-medium rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Заказать товар
              </button>
              <button
                onClick={() => navigate('/catalog')}
                className="px-5 py-3 text-sm sm:px-8 sm:py-4 sm:text-lg font-medium rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(167,139,250,0.4)] hover:text-[#a78bfa] hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Примеры товаров
              </button>
            </div>
          </div>
        </div>

        {/* Иконка прокрутки мыши */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 fade-in-trigger-delay-2">
          <div className="flex flex-col items-center gap-2">
            <div className="mouse-scroll-icon">
              <svg
                width="20"
                height="32"
                viewBox="0 0 24 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-8"
              >
                <rect
                  x="2"
                  y="2"
                  width="20"
                  height="32"
                  rx="10"
                  stroke="rgba(0, 240, 255, 0.6)"
                  strokeWidth="2"
                  fill="rgba(0, 240, 255, 0.05)"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  fill="#00f0ff"
                  className="mouse-scroll-wheel"
                />
              </svg>
            </div>
            <ChevronDownIcon className="w-6 h-6 text-[#00f0ff] animate-bounce" />
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section ref={advantagesSectionRef} className="pt-12 pb-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 fade-in-up-trigger">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                Преимущества
              </span>
              <span className="text-[#e5e7eb]"> доставки с нами</span>
            </h2>
            <p className="text-[#9ca3af] text-sm sm:text-lg max-w-2xl mx-auto">
              Мы делаем доставку из Китая простой, быстрой и надежной
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((advantage, index) => {
              const Icon = advantage.icon;
              return (
                <div key={index} className="fade-in-up-trigger group" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="relative h-full p-4 sm:p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                    <div
                      className="relative w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-5 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${advantage.accent}15, ${advantage.accent}05)`,
                        border: `1px solid ${advantage.accent}30`,
                      }}
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:scale-110" style={{ color: advantage.accent }} />
                    </div>
                    <h3 className="text-base sm:text-xl font-semibold text-[#e5e7eb] mb-3 text-center">
                      {advantage.title}
                    </h3>
                    <p className="text-[#9ca3af] text-sm text-center leading-relaxed">
                      {advantage.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Статистика */}
      <section ref={statsSectionRef} className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center fade-in-up-trigger" style={{ animationDelay: `${index * 0.15}s` }}>
                <div
                  className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 hover:scale-110 transition-transform duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #00f0ff, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.number}
                </div>
                <div className="text-[#9ca3af] text-xs sm:text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Маркетплейсы */}
      <section ref={marketplacesSectionRef} className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20 fade-in-up-trigger">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                С нами вы можете заказывать
              </span>
              <span className="text-[#e5e7eb]"> с этих сайтов</span>
            </h2>
            <p className="text-[#9ca3af] text-sm sm:text-lg max-w-2xl mx-auto">
              Мы работаем со всеми популярными китайскими маркетплейсами
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {marketplaces.map((marketplace, index) => (
              <a
                key={marketplace.name}
                href={marketplace.url}
                target="_blank"
                rel="noopener noreferrer"
                className="marketplace-link fade-in-up-trigger group"
                style={{ animationDelay: `${index * 0.1}s` }}
                title={marketplace.name}
              >
                {marketplace.hasImage ? (
                  <div className={`marketplace-logo-wrapper marketplace-logo-${index % 4} marketplace-logo-image`}>
                    <img 
                      src={marketplace.logo} 
                      alt={marketplace.name} 
                      className="marketplace-logo-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<span class="marketplace-text">${marketplace.text}</span>`;
                      }}
                    />
                  </div>
                ) : (
                  <div className={`marketplace-logo-wrapper marketplace-logo-${index % 4}`}>
                    <span className="marketplace-text">{marketplace.text}</span>
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CSS стили для эффектов */}
      <style>{`
        /* Анимация иконки прокрутки мыши */
        .mouse-scroll-icon {
          animation: mouse-scroll-pulse 2s ease-in-out infinite;
        }

        .mouse-scroll-wheel {
          animation: mouse-scroll-wheel 2s ease-in-out infinite;
        }

        @keyframes mouse-scroll-pulse {
          0%, 100% {
            opacity: 0.6;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(5px);
          }
        }

        @keyframes mouse-scroll-wheel {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          50% {
            opacity: 0.3;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Glow эффект для логотипа - оптимизирован для мобильных */
        .logo-glow-wrapper {
          position: relative;
          display: inline-block;
        }

        .logo-glow {
          position: relative;
          z-index: 1;
          display: block;
          /* Упрощенный glow для десктопа */
          filter: 
            drop-shadow(0 0 8px rgba(0, 240, 255, 0.7))
            drop-shadow(0 0 20px rgba(0, 240, 255, 0.5))
            drop-shadow(0 0 35px rgba(167, 139, 250, 0.4));
          animation: logo-glow-breathe 3s ease-in-out infinite;
          will-change: filter;
        }

        @keyframes logo-glow-breathe {
          0%, 100% {
            filter: 
              drop-shadow(0 0 8px rgba(0, 240, 255, 0.7))
              drop-shadow(0 0 20px rgba(0, 240, 255, 0.5))
              drop-shadow(0 0 35px rgba(167, 139, 250, 0.4));
          }
          50% {
            filter: 
              drop-shadow(0 0 12px rgba(0, 240, 255, 0.9))
              drop-shadow(0 0 30px rgba(0, 240, 255, 0.7))
              drop-shadow(0 0 50px rgba(167, 139, 250, 0.6));
          }
        }

        /* Упрощенный glow для мобильных устройств */
        @media (max-width: 768px) {
          .logo-glow {
            /* Минимальный glow на мобильных - только 2 слоя */
            filter: 
              drop-shadow(0 0 6px rgba(0, 240, 255, 0.6))
              drop-shadow(0 0 15px rgba(0, 240, 255, 0.4));
            animation: logo-glow-breathe-mobile 3s ease-in-out infinite;
          }

          @keyframes logo-glow-breathe-mobile {
            0%, 100% {
              filter: 
                drop-shadow(0 0 6px rgba(0, 240, 255, 0.6))
                drop-shadow(0 0 15px rgba(0, 240, 255, 0.4));
            }
            50% {
              filter: 
                drop-shadow(0 0 8px rgba(0, 240, 255, 0.8))
                drop-shadow(0 0 20px rgba(0, 240, 255, 0.5));
            }
          }
        }

        /* Отключение анимации для устройств с низкой производительностью */
        @media (prefers-reduced-motion: reduce) {
          .logo-glow {
            animation: none;
            filter: 
              drop-shadow(0 0 8px rgba(0, 240, 255, 0.7))
              drop-shadow(0 0 20px rgba(0, 240, 255, 0.5));
          }
        }

        /* Эффекты появления (fade-in) */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Анимации срабатывают только когда элемент виден (через класс in-view) */
        .fade-in-trigger {
          opacity: 0;
        }

        .fade-in-trigger.in-view {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .fade-in-trigger-delay-1 {
          opacity: 0;
        }

        .fade-in-trigger-delay-1.in-view {
          animation: fadeIn 0.8s ease-out 0.2s forwards;
        }

        .fade-in-trigger-delay-2 {
          opacity: 0;
        }

        .fade-in-trigger-delay-2.in-view {
          animation: fadeIn 0.8s ease-out 0.4s forwards;
        }

        .fade-in-up-trigger {
          opacity: 0;
        }

        .fade-in-up-trigger.in-view {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        /* Оптимизация анимаций */
        @media (prefers-reduced-motion: reduce) {
          .fade-in-trigger,
          .fade-in-trigger-delay-1,
          .fade-in-trigger-delay-2,
          .fade-in-up-trigger {
            animation: none;
            opacity: 1;
          }
        }

        /* Оптимизация для мобильных устройств */
        @media (max-width: 768px) {
          /* Упрощаем hover эффекты на мобильных */
          .marketplace-link:hover {
            transform: none;
          }

          .marketplace-link:hover .marketplace-logo-wrapper {
            border-color: rgba(0, 240, 255, 0.3);
            box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
          }

          /* Отключаем сложные анимации на мобильных */
          .mouse-scroll-icon,
          .mouse-scroll-wheel {
            animation-duration: 3s;
          }

          /* Упрощаем анимации появления */
          .fade-in-trigger.in-view,
          .fade-in-trigger-delay-1.in-view,
          .fade-in-trigger-delay-2.in-view,
          .fade-in-up-trigger.in-view {
            animation-duration: 0.5s;
          }
        }

        /* Дополнительная оптимизация для слабых устройств */
        @media (max-width: 768px) and (max-height: 900px) {
          .logo-glow {
            /* Еще более упрощенный glow для маленьких экранов */
            filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.5));
            animation: none;
          }
        }

        /* Класс для отключения glow на слабых устройствах */
        .no-glow {
          filter: none !important;
          animation: none !important;
        }

        /* GPU ускорение для анимаций */
        .logo-glow-wrapper,
        .fade-in-trigger,
        .fade-in-trigger-delay-1,
        .fade-in-trigger-delay-2,
        .fade-in-up-trigger {
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        /* Отключение hover эффектов на тач-устройствах */
        @media (hover: none) and (pointer: coarse) {
          .marketplace-link:hover,
          .marketplace-link:hover .marketplace-logo-wrapper,
          button:hover,
          .group:hover {
            transform: none;
          }

          .group:hover .group-hover\:scale-110 {
            transform: none;
          }

          .group:hover .group-hover\:-translate-y-1 {
            transform: none;
          }
        }

        /* Оптимизация для карточек преимуществ на мобильных */
        @media (max-width: 768px) {
          .group:hover .group-hover\:scale-110,
          .group:hover .group-hover\:-translate-y-1 {
            transform: none;
          }
        }

        /* Стили для маркетплейсов */
        .marketplace-link {
          display: inline-flex;
          text-decoration: none;
          transition: transform 0.3s ease;
        }

        .marketplace-link:hover {
          transform: translateY(-5px) scale(1.05);
        }

        .marketplace-logo-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .marketplace-link:hover .marketplace-logo-wrapper {
          border-color: rgba(0, 240, 255, 0.5);
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
        }

        /* Все маркетплейсы в голубых оттенках */
        .marketplace-logo-0,
        .marketplace-logo-1,
        .marketplace-logo-2,
        .marketplace-logo-3 {
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(0, 240, 255, 0.05));
        }

        .marketplace-link:hover .marketplace-logo-0,
        .marketplace-link:hover .marketplace-logo-1,
        .marketplace-link:hover .marketplace-logo-2,
        .marketplace-link:hover .marketplace-logo-3 {
          background: linear-gradient(135deg, rgba(0, 240, 255, 0.3), rgba(0, 240, 255, 0.1));
        }

        .marketplace-logo-image {
          padding: 12px;
        }

        .marketplace-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: brightness(0) invert(1) sepia(100%) saturate(5000%) hue-rotate(175deg) brightness(1.1);
          transition: filter 0.3s ease;
          will-change: filter;
        }

        .marketplace-link:hover .marketplace-logo-img {
          filter: brightness(0) invert(1) sepia(100%) saturate(5000%) hue-rotate(175deg) brightness(1.3);
        }

        /* Упрощение filter эффектов на мобильных */
        @media (max-width: 768px) {
          .marketplace-logo-img {
            /* Упрощенный filter на мобильных - только базовые операции */
            filter: brightness(0.8) invert(1) hue-rotate(175deg);
          }

          .marketplace-link:hover .marketplace-logo-img {
            filter: brightness(1) invert(1) hue-rotate(175deg);
          }
        }

        .marketplace-text {
          font-size: 1rem;
          font-weight: 700;
          color: #00f0ff;
          text-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
          transition: all 0.3s ease;
        }

        .marketplace-link:hover .marketplace-text {
          color: #00ffff;
          text-shadow: 0 0 15px rgba(0, 240, 255, 0.8);
        }

        @media (max-width: 768px) {
          .marketplace-logo-wrapper {
            width: 70px;
            height: 70px;
          }

          .marketplace-text {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;