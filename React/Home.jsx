import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  TruckIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  CreditCardIcon,
  StarIcon
} from '@heroicons/react/24/solid';
import { Button } from '../components/ui/Button';

/**
 * Fluid Neon Glass - Премиальная главная страница 2026
 * Концепция: минималистичный dark mode с glassmorphism и мягким неоновым свечением
 */

const Home = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorGlow, setCursorGlow] = useState({ x: 0, y: 0, active: false });
  const [ripples, setRipples] = useState([]);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Smooth scroll-driven transforms
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroBlur = useTransform(scrollYProgress, [0, 0.3], [0, 20]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);
  const sectionY = useTransform(scrollYProgress, [0.2, 0.5], [0, -50]);

  // Spring для плавности
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const cursorX = useSpring(mousePosition.x, springConfig);
  const cursorY = useSpring(mousePosition.y, springConfig);

  // Кастомный курсор с магнитным эффектом
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = (e) => {
      if (e.target.closest('button, a, [data-magnetic]')) {
        setCursorGlow(prev => ({ ...prev, active: true }));
      }
    };

    const handleMouseLeave = () => {
      setCursorGlow(prev => ({ ...prev, active: false }));
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
    };
  }, []);

  // Ripple эффект на клик
  const createRipple = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  }, []);

  // Живой фон - grain texture
  const grainPattern = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(200, 200);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const value = Math.random() * 255;
      imageData.data[i] = value;
      imageData.data[i + 1] = value;
      imageData.data[i + 2] = value;
      imageData.data[i + 3] = 15; // очень прозрачный
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
  }, []);

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
      description: '$7 за кг + тарифы Европочты, без скрытых платежей',
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

  return (
    <>
      {/* Кастомный курсор */}
      {!prefersReducedMotion && (
        <motion.div
          className="fixed top-0 left-0 w-6 h-6 pointer-events-none z-[9999] mix-blend-difference"
          style={{
            x: useTransform(cursorX, (x) => x - 12),
            y: useTransform(cursorY, (y) => y - 12),
          }}
        >
          <motion.div
            className="w-full h-full rounded-full bg-white"
            animate={{
              scale: cursorGlow.active ? 1.5 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-[#00f0ff] blur-xl opacity-30"
            animate={{
              scale: cursorGlow.active ? 2 : 1.2,
              opacity: cursorGlow.active ? 0.5 : 0.2,
            }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>
      )}

      <div className="min-h-screen bg-[#0a0d14] text-[#e5e7eb] overflow-hidden relative">
        {/* Живой фон с grain и пульсацией */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Grain texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url(${grainPattern})`,
              backgroundSize: '200px 200px',
              animation: prefersReducedMotion ? 'none' : 'grain 8s steps(10) infinite',
            }}
          />
          
          {/* Мягкие световые потоки */}
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 70%)',
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(167, 139, 250, 0.06) 0%, transparent 70%)',
            }}
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        >
          <motion.div
            className="container mx-auto px-4 relative z-10"
            style={{
              opacity: prefersReducedMotion ? 1 : heroOpacity,
              filter: prefersReducedMotion ? 'none' : `blur(${heroBlur}px)`,
              scale: prefersReducedMotion ? 1 : heroScale,
            }}
          >
            <div className="max-w-5xl mx-auto text-center">
              {/* Hero анимация - быстрый blur-in с glow */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, filter: 'blur(20px)', y: 30 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, filter: 'blur(0px)', y: 0 }}
                transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {/* Логотип с glassmorphism glow */}
                <motion.div
                  className="mb-12 flex justify-center"
                  animate={prefersReducedMotion ? {} : {
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#00f0ff] rounded-full blur-3xl opacity-20 animate-pulse" />
                    <img
                      src="/logo.png"
                      alt="Fluvion Logo"
                      className="relative w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-[0_0_30px_rgba(0,240,255,0.3)]"
                    />
                  </div>
                </motion.div>

                {/* Заголовок с неоновым свечением */}
                <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                  <motion.span
                    className="block mb-2"
                    style={{
                      background: 'linear-gradient(135deg, #00f0ff 0%, #a78bfa 50%, #10b981 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 0 20px rgba(0, 240, 255, 0.4))',
                    }}
                    animate={prefersReducedMotion ? {} : {
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    Доставка из Китая
                  </motion.span>
                  <span className="block text-[#e5e7eb] font-light">под ключ</span>
                </h1>

                <motion.p
                  className="text-xl md:text-2xl text-[#9ca3af] mb-12 max-w-3xl mx-auto leading-relaxed"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Заказывайте товары из Китая без хлопот: от выбора в{' '}
                  <span className="text-[#00f0ff] font-semibold">Каталоге</span> или{' '}
                  <span className="text-[#a78bfa] font-semibold">Терминале</span> до доставки в Беларусь за 18–35 дней по цене $7/кг
                </motion.p>

                {/* Кнопки с glassmorphism и ripple */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <button
                    onClick={(e) => {
                      createRipple(e);
                      navigate('/catalog');
                    }}
                    data-magnetic
                    className="relative overflow-hidden px-8 py-4 text-lg font-medium rounded-xl bg-[rgba(0,240,255,0.1)] backdrop-blur-xl border border-[rgba(0,240,255,0.3)] text-[#00f0ff] hover:bg-[rgba(0,240,255,0.15)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]"
                  >
                    {ripples.map(ripple => (
                      <motion.span
                        key={ripple.id}
                        className="absolute rounded-full bg-[#00f0ff] opacity-30"
                        initial={{ width: 0, height: 0, x: ripple.x, y: ripple.y }}
                        animate={{ width: 300, height: 300, x: ripple.x - 150, y: ripple.y - 150, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      />
                    ))}
                    <span className="relative z-10">Перейти в каталог</span>
                  </button>
                  <button
                    onClick={(e) => {
                      createRipple(e);
                      navigate('/terminal');
                    }}
                    data-magnetic
                    className="relative overflow-hidden px-8 py-4 text-lg font-medium rounded-xl bg-[rgba(255,255,255,0.03)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] transition-all duration-300 hover:border-[rgba(167,139,250,0.4)] hover:text-[#a78bfa]"
                  >
                    {ripples.map(ripple => (
                      <motion.span
                        key={ripple.id}
                        className="absolute rounded-full bg-[#a78bfa] opacity-20"
                        initial={{ width: 0, height: 0, x: ripple.x, y: ripple.y }}
                        animate={{ width: 300, height: 300, x: ripple.x - 150, y: ripple.y - 150, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      />
                    ))}
                    <span className="relative z-10">Заказать товар</span>
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Скролл индикатор */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={prefersReducedMotion ? {} : { y: [0, 12, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-6 h-10 border-2 border-[rgba(0,240,255,0.4)] rounded-full flex justify-center backdrop-blur-sm">
              <motion.div
                className="w-1.5 h-3 bg-[#00f0ff] rounded-full mt-2"
                animate={prefersReducedMotion ? {} : { y: [0, 14, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </section>

        {/* Преимущества с scroll-driven анимацией */}
        <motion.section
          className="py-32 relative z-10"
          style={{
            y: prefersReducedMotion ? 0 : sectionY,
          }}
        >
          <div className="container mx-auto px-4">
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 40 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span
                  className="bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent"
                  style={{
                    filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.3))',
                  }}
                >
                  Преимущества
                </span>
                <span className="text-[#e5e7eb]"> доставки с нами</span>
              </h2>
              <p className="text-[#9ca3af] text-lg max-w-2xl mx-auto">
                Мы делаем доставку из Китая простой, быстрой и надежной
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {advantages.map((advantage, index) => {
                const Icon = advantage.icon;
                return (
                  <motion.div
                    key={index}
                    initial={prefersReducedMotion ? {} : { opacity: 0, y: 40, scale: 0.9 }}
                    whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    whileHover={prefersReducedMotion ? {} : {
                      y: -8,
                      scale: 1.02,
                      transition: { duration: 0.3 },
                    }}
                    data-magnetic
                  >
                    <div className="relative h-full p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.15)] transition-all duration-300 group">
                      {/* Glow эффект при hover */}
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                        style={{
                          background: `radial-gradient(circle, ${advantage.accent}20 0%, transparent 70%)`,
                        }}
                      />
                      
                      <div
                        className="relative w-14 h-14 mx-auto mb-5 rounded-xl flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${advantage.accent}15, ${advantage.accent}05)`,
                          border: `1px solid ${advantage.accent}30`,
                          boxShadow: `0 0 20px ${advantage.accent}20`,
                        }}
                      >
                        <Icon className="w-7 h-7" style={{ color: advantage.accent }} />
                      </div>
                      <h3 className="text-xl font-semibold text-[#e5e7eb] mb-3 text-center">
                        {advantage.title}
                      </h3>
                      <p className="text-[#9ca3af] text-sm text-center leading-relaxed">
                        {advantage.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Статистика с резким scroll-driven эффектом */}
        <motion.section
          className="py-32 relative z-10"
          initial={prefersReducedMotion ? {} : { opacity: 0 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                  whileInView={prefersReducedMotion ? {} : { opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div
                    className="text-4xl md:text-5xl font-bold mb-3"
                    style={{
                      background: 'linear-gradient(135deg, #00f0ff, #a78bfa)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.3))',
                    }}
                  >
                    {stat.number}
                  </div>
                  <div className="text-[#9ca3af] text-sm md:text-base">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>

      {/* CSS для grain анимации */}
      <style>{`
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -10%); }
          20% { transform: translate(-15%, 5%); }
          30% { transform: translate(7%, -25%); }
          40% { transform: translate(-5%, 25%); }
          50% { transform: translate(-15%, 10%); }
          60% { transform: translate(15%, 0%); }
          70% { transform: translate(0%, 15%); }
          80% { transform: translate(3%, 35%); }
          90% { transform: translate(-10%, 10%); }
        }
      `}</style>
    </>
  );
};

export default Home;