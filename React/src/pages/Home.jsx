import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const marketplaces = [
    { name: 'Pinduoduo', url: 'https://www.pinduoduo.com', text: '拼多多', logo: '/logos/pinduoduo.svg', hasImage: true },
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

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] overflow-hidden relative">
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
                  className="relative w-40 h-40 md:w-56 md:h-56 object-contain logo-glow"
                />
              </div>
            </div>

            {/* Заголовок */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight fade-in-trigger">
              <span className="block mb-2 bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                Доставка из Китая
              </span>
              <span className="block text-[#e5e7eb] font-light">под ключ</span>
            </h1>

            <p className="text-xl md:text-2xl text-[#9ca3af] mb-12 max-w-3xl mx-auto leading-relaxed fade-in-trigger-delay-1">
              Заказывайте товары из Китая без хлопот: от выбора в{' '}
              <span className="text-[#00f0ff] font-semibold">Каталоге</span> или{' '}
              <span className="text-[#a78bfa] font-semibold">Терминале</span> до доставки в Беларусь за 18–35 дней по цене $6/кг
            </p>

            {/* Кнопки */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-trigger-delay-2">
              <button
                onClick={() => navigate('/catalog')}
                className="px-8 py-4 text-lg font-medium rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] hover:scale-105 transition-all duration-300"
              >
                Перейти в каталог
              </button>
              <button
                onClick={() => navigate('/terminal')}
                className="px-8 py-4 text-lg font-medium rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(167,139,250,0.4)] hover:text-[#a78bfa] hover:scale-105 transition-all duration-300"
              >
                Заказать товар
              </button>
            </div>
          </div>
        </div>

        {/* Иконка прокрутки мыши */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 fade-in-trigger-delay-2">
          <div className="flex flex-col items-center gap-2">
            <div className="mouse-scroll-icon">
              <svg
                width="24"
                height="40"
                viewBox="0 0 24 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-10"
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                Преимущества
              </span>
              <span className="text-[#e5e7eb]"> доставки с нами</span>
            </h2>
            <p className="text-[#9ca3af] text-lg max-w-2xl mx-auto">
              Мы делаем доставку из Китая простой, быстрой и надежной
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((advantage, index) => {
              const Icon = advantage.icon;
              return (
                <div key={index} className="fade-in-up-trigger group" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="relative h-full p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                    <div
                      className="relative w-14 h-14 mx-auto mb-5 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${advantage.accent}15, ${advantage.accent}05)`,
                        border: `1px solid ${advantage.accent}30`,
                      }}
                    >
                      <Icon className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" style={{ color: advantage.accent }} />
                    </div>
                    <h3 className="text-xl font-semibold text-[#e5e7eb] mb-3 text-center">
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
                  className="text-4xl md:text-5xl font-bold mb-3 hover:scale-110 transition-transform duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #00f0ff, #a78bfa)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {stat.number}
                </div>
                <div className="text-[#9ca3af] text-sm md:text-base">
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                С нами вы можете заказывать
              </span>
              <span className="text-[#e5e7eb]"> с этих сайтов</span>
            </h2>
            <p className="text-[#9ca3af] text-lg max-w-2xl mx-auto">
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

        /* Glow эффект для логотипа (оставляем) */
        .logo-glow-wrapper {
          position: relative;
          display: inline-block;
        }

        .logo-glow {
          position: relative;
          z-index: 1;
          display: block;
          /* Яркая и выразительная обводка по контуру с анимацией дыхания */
          filter: 
            drop-shadow(0 0 2px rgba(0, 240, 255, 1))
            drop-shadow(0 0 3px rgba(167, 139, 250, 0.95))
            drop-shadow(0 0 8px rgba(135, 206, 250, 0.85))
            drop-shadow(0 0 25px rgba(0, 240, 255, 0.7))
            drop-shadow(0 0 45px rgba(167, 139, 250, 0.5))
            drop-shadow(0 0 65px rgba(0, 240, 255, 0.4));
          animation: logo-glow-breathe 3s ease-in-out infinite;
        }

        @keyframes logo-glow-breathe {
          0%, 100% {
            filter: 
              drop-shadow(0 0 2px rgba(0, 240, 255, 1))
              drop-shadow(0 0 3px rgba(167, 139, 250, 0.95))
              drop-shadow(0 0 8px rgba(135, 206, 250, 0.85))
              drop-shadow(0 0 25px rgba(0, 240, 255, 0.7))
              drop-shadow(0 0 45px rgba(167, 139, 250, 0.5))
              drop-shadow(0 0 65px rgba(0, 240, 255, 0.4));
          }
          50% {
            filter: 
              drop-shadow(0 0 3px rgba(0, 240, 255, 1))
              drop-shadow(0 0 4px rgba(167, 139, 250, 1))
              drop-shadow(0 0 12px rgba(135, 206, 250, 1))
              drop-shadow(0 0 35px rgba(0, 240, 255, 0.9))
              drop-shadow(0 0 60px rgba(167, 139, 250, 0.7))
              drop-shadow(0 0 85px rgba(0, 240, 255, 0.6));
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
        }

        .marketplace-link:hover .marketplace-logo-img {
          filter: brightness(0) invert(1) sepia(100%) saturate(5000%) hue-rotate(175deg) brightness(1.3);
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