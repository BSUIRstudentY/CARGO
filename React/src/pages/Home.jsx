import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import {
  BanknotesIcon,
  ClockIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

gsap.registerPlugin(ScrollTrigger);

const GOLD = '#C9A97A';
const BG_VOID = '#050505';
const BG_SURFACE = '#0F0F0F';

const JOURNEY_STEPS = [
  { label: 'Заказ', days: '1–2', desc: 'Оформление в Терминале или по ссылке' },
  { label: 'Выкуп', days: '2–5', desc: 'Оплата и выкуп на складе в Китае' },
  { label: 'Проверка', days: '1–3', desc: 'Фото и видео от $5 по желанию' },
  { label: 'Отправка', days: '5–15', desc: 'Карго до нашей базы' },
  { label: 'Доставка', days: '7–14', desc: 'Европочта до двери' },
];

const ADVANTAGES = [
  { title: 'Фиксированная ставка', desc: '$6 / кг без сюрпризов', icon: BanknotesIcon },
  { title: '18–35 дней', desc: 'Реальные сроки карго', icon: ClockIcon },
  { title: 'Полная страховка', desc: 'Возврат 100% стоимости', icon: ShieldCheckIcon },
  { title: 'Проверка на складе', desc: 'Фото + видео от $5', icon: MagnifyingGlassIcon },
];

const STATS = [
  { value: 1000, suffix: '+', label: 'Товаров из Китая' },
  { value: 90, suffix: '%', label: 'Клиентов рекомендуют' },
  { value: 5, suffix: '', label: 'Складов-партнёров' },
  { value: 24, suffix: '/7', label: 'Поддержка' },
];

const MARKETPLACES_LIST = [
  'Pinduoduo', 'Taobao', '1688', 'WeChat', 'Poizon', 'GoFish', 'Tmall', 'JD', 'AliExpress', 'Xianyu', 'Weidian',
];

const SCROLLER = typeof document !== 'undefined' ? document.documentElement : null;

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scopeRef = useRef(null);
  const lenisRef = useRef(null);
  const heroSectionRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroContentRef = useRef(null);
  const goldLineRef = useRef(null);
  const journeySectionRef = useRef(null);
  const journeyWrapperRef = useRef(null);
  const advantagesRefs = useRef([]);
  const statsSectionRef = useRef(null);
  const ctaSectionRef = useRef(null);
  const ctaTitleRef = useRef(null);
  const priceDisplayRef = useRef(null);
  const magneticRef = useRef(null);
  const reduceMotionRef = useRef(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [weight, setWeight] = useState(5);
  const [price, setPrice] = useState(30);

  const navGroups = [
    { title: 'Сервис', links: [
      { to: '/', label: 'Главная' },
      { to: '/calculator', label: 'Калькулятор' },
      { to: '/catalog', label: 'Примеры товаров' },
      { to: '/terminal', label: 'Заказать товар' },
      { to: '/self-pickup', label: 'Самовыкуп' },
      { to: '/rates', label: 'Курс' },
      { to: '/news', label: 'Новости' },
      { to: '/batch-cargo-list', label: 'Сборные грузы' },
      { to: '/cart', label: 'Корзина' },
    ]},
    { title: 'Информация', links: [
      { to: '/delivery-payment', label: 'Доставка и оплата' },
      { to: '/order-instructions', label: 'Инструкции' },
      { to: '/public-offer', label: 'Публичная оферта' },
      { to: '/privacy-policy', label: 'Политика конфиденциальности' },
      { to: '/user-agreement', label: 'Согласие на обработку' },
      { to: '/faq', label: 'FAQ' },
      { to: '/support', label: 'Поддержка' },
      { to: '/reviews', label: 'Отзывы' },
    ]},
  ];

  const PRICE_PER_KG = 6;
  reduceMotionRef.current = reduceMotion;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); };
  }, [menuOpen]);

  useEffect(() => {
    if (!scopeRef.current || !SCROLLER) return;
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });
    lenisRef.current = lenis;

    ScrollTrigger.scrollerProxy(SCROLLER, {
      scrollTop(value) {
        if (arguments.length) lenis.scrollTo(value, { immediate: false });
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
    });
    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.clearScrollMemory();
    };
  }, []);

  // MOBILE ADAPTIVE: horizontal pinned journey on all viewports; smaller scrollDistance on mobile
  useEffect(() => {
    if (!scopeRef.current || reduceMotionRef.current) return;
    const ctx = gsap.context(() => {
      const section = journeySectionRef.current;
      const wrapper = journeyWrapperRef.current;
      if (!section || !wrapper) return;
      const steps = wrapper.querySelectorAll('.journey-step');
      const isNarrow = typeof window !== 'undefined' && window.innerWidth < 768;
      const scrollDistance = window.innerHeight * (steps.length - 1) * (isNarrow ? 0.8 : 1);

      const anim = gsap.to(wrapper, {
        xPercent: -100 * (steps.length - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          scroller: SCROLLER,
          pin: true,
          scrub: 0.8,
          start: 'top top',
          end: () => `+=${scrollDistance}`,
          invalidateOnRefresh: true,
          id: 'journey-h',
        },
      });

      steps.forEach((step) => {
        const icon = step.querySelector('.step-icon');
        const line = step.querySelector('.step-line');
        if (!icon || !line) return;
        gsap.timeline({
          scrollTrigger: {
            trigger: step,
            scroller: SCROLLER,
            containerAnimation: anim,
            start: 'left 70%',
            end: 'left 30%',
            scrub: 0.5,
          },
        })
          .to(icon, { scale: 1.1, duration: 0.5 })
          .to(line, { scaleX: 1, duration: 0.8, transformOrigin: 'left' }, '-=0.4');
      });
    }, scopeRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  useEffect(() => {
    if (!scopeRef.current || reduceMotionRef.current) return;
    const ctx = gsap.context(() => {
      if (!heroTitleRef.current) return;
      const letters = heroTitleRef.current.querySelectorAll('.hero-letter');
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.from(letters, {
        yPercent: 120,
        opacity: 0,
        stagger: 0.07,
        duration: 1.4,
      })
        .from('.hero-subtitle', { opacity: 0, y: 60, duration: 1.1 }, '-=0.9')
        .from('.hero-cta', { scale: 0.7, opacity: 0, duration: 1, ease: 'back.out(1.4)' }, '-=0.8');

      const path = goldLineRef.current?.querySelector('.gold-line-path');
      if (path && typeof path.getTotalLength === 'function') {
        const length = path.getTotalLength();
        path.setAttribute('stroke-dasharray', String(length));
        gsap.fromTo(
          path,
          { strokeDashoffset: length },
          { strokeDashoffset: 0, duration: 3.2, ease: 'power2.out', delay: 1.2 }
        );
      }
    }, scopeRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  useEffect(() => {
    if (!scopeRef.current || !heroSectionRef.current || !heroContentRef.current || reduceMotionRef.current) return;
    const ctx = gsap.context(() => {
      const section = heroSectionRef.current;
      const content = heroContentRef.current;
      const noiseLayer = section?.querySelector('.hero-parallax-noise');
      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          scroller: SCROLLER,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      })
        .to(content, { yPercent: 32, ease: 'none' }, 0)
        .to(noiseLayer, { yPercent: 15, ease: 'none' }, 0);
    }, scopeRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  useEffect(() => {
    if (!scopeRef.current || reduceMotionRef.current) return;
    const ctx = gsap.context(() => {
      advantagesRefs.current.forEach((block, i) => {
        if (!block) return;
        const direction = i % 2 === 0 ? -60 : 60;
        const line = block.querySelector('.advantage-line');
        const icon = block.querySelector('.advantage-icon');
        const title = block.querySelector('.advantage-title');
        if (!line || !icon || !title) return;
        gsap.timeline({
          scrollTrigger: {
            trigger: block,
            scroller: SCROLLER,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        })
          .from(line, { scaleX: 0, duration: 1.4, ease: 'power3.out', transformOrigin: 'left' })
          .from(icon, { scale: 0.4, x: direction, opacity: 0, duration: 1.1 }, '-=0.9')
          .from(title, { opacity: 0, x: -direction * 0.5, duration: 0.9 }, '-=0.7');
      });
    }, scopeRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  useEffect(() => {
    if (!scopeRef.current || !statsSectionRef.current || reduceMotionRef.current) return;
    const ctx = gsap.context(() => {
      const boxes = statsSectionRef.current.querySelectorAll('.stat-box');
      boxes.forEach((box, i) => {
        const numEl = box.querySelector('.stat-number');
        const barEl = box.querySelector('.stat-bar-fill');
        const data = STATS[i];
        if (!numEl || !barEl || !data) return;
        const obj = { val: 0 };
        gsap.timeline({
          scrollTrigger: {
            trigger: box,
            scroller: SCROLLER,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        })
          .to(obj, {
            val: data.value,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: function () {
              numEl.textContent = Math.round(obj.val) + data.suffix;
            },
          })
          .to(barEl, { scaleX: 1, duration: 1.2, ease: 'power3.out', transformOrigin: 'left' }, '-=1.2');
      });
    }, scopeRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  useEffect(() => {
    if (!scopeRef.current || !ctaSectionRef.current || !ctaTitleRef.current || reduceMotionRef.current) return;
    const ctx = gsap.context(() => {
      const letters = ctaTitleRef.current.querySelectorAll('.cta-letter');
      gsap.from(letters, {
        opacity: 0,
        y: 40,
        stagger: 0.04,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ctaSectionRef.current,
          scroller: SCROLLER,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });
    }, scopeRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  useEffect(() => {
    setPrice(weight * PRICE_PER_KG);
    if (priceDisplayRef.current && !reduceMotionRef.current) {
      gsap.to(priceDisplayRef.current, { scale: 1.15, duration: 0.2, yoyo: true, repeat: 1 });
    }
  }, [weight]);

  useEffect(() => {
    const el = magneticRef.current;
    if (!el || reduceMotionRef.current) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
      gsap.to(el, { x, y, duration: 0.3, ease: 'power2.out' });
    };
    const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [reduceMotion]);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fluvion',
    url: 'https://fluvion.by',
    description: 'Доставка товаров из Китая в Беларусь за 18-35 дней.',
  };

  return (
    <div
      ref={scopeRef}
      className="min-h-screen overflow-x-hidden text-[#F5F5F5] text-base md:text-lg"
      style={{ background: BG_VOID, fontFamily: "'Neue Montreal', 'Inter', system-ui, sans-serif" }}
    >
      <Helmet>
        <title>Fluvion — Доставка из Китая в Беларусь | Карго под ключ</title>
        <meta name="description" content="Доставка из Китая за 18–35 дней. $6/кг, страховка, проверка на складе. Заказывайте с Pinduoduo, Taobao, 1688." />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <header className="fixed top-0 left-0 right-0 z-50 h-14 md:h-[68px] border-b border-[#1A1A1A] backdrop-blur-xl px-4 md:px-6" style={{ background: `${BG_VOID}E6` }}>
        <div className="container mx-auto flex h-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3 md:gap-6">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="p-2 rounded-lg border border-[#1A1A1A] text-[#F5F5F5] hover:text-[#C9A97A] hover:border-[#C9A97A]/40 transition-colors"
              aria-label="Меню"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <Link to="/" className="font-cabinet text-xl md:text-2xl font-bold tracking-tight" style={{ color: GOLD }}>
              Fluvion
            </Link>
          </div>
          <nav className="hidden items-center gap-6 md:flex md:gap-8">
            <Link to="/catalog" className="text-xs md:text-sm text-[#F5F5F5] transition-colors hover:text-[#C9A97A]">Примеры товаров</Link>
            <Link to="/rates" className="text-xs md:text-sm text-[#F5F5F5] transition-colors hover:text-[#C9A97A]">Курс</Link>
            <Link to="/delivery-payment" className="text-xs md:text-sm text-[#F5F5F5] transition-colors hover:text-[#C9A97A]">Доставка</Link>
            <Link to="/faq" className="text-xs md:text-sm text-[#F5F5F5] transition-colors hover:text-[#C9A97A]">FAQ</Link>
          </nav>
          <button
            ref={magneticRef}
            onClick={() => navigate('/terminal')}
            className="relative overflow-hidden rounded-full px-4 py-2.5 md:px-6 md:py-3 text-xs md:text-sm font-medium text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(201,169,122,0.25)]"
            style={{ background: `linear-gradient(145deg, ${GOLD}, #E8C89A)` }}
          >
            <span className="relative z-10">Рассчитать</span>
          </button>
        </div>
      </header>

      <AnimatePresence onExitComplete={() => { document.body.style.overflow = ''; }}>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
              aria-label="Закрыть меню"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed top-0 left-0 z-[101] h-full w-72 max-w-[85vw] overflow-y-auto border-r border-[#1A1A1A] py-6 px-4 shadow-2xl"
              style={{ background: BG_VOID }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-cabinet text-lg font-bold" style={{ color: GOLD }}>Меню</span>
                <motion.button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-lg text-[#A3A3A3] hover:text-[#F5F5F5] transition-colors"
                  aria-label="Закрыть"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <XMarkIcon className="w-6 h-6" />
                </motion.button>
              </div>
              {navGroups.map((group, gi) => (
                <motion.div
                  key={group.title}
                  className="mb-6"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + gi * 0.08, duration: 0.25 }}
                >
                  <h4 className="text-[10px] font-semibold text-[#A3A3A3] uppercase tracking-wider mb-3">{group.title}</h4>
                  <ul className="space-y-1">
                    {group.links.map(({ to, label }, li) => {
                      const isOrder = to === '/terminal';
                      const isCurrent = location.pathname === to || (to !== '/' && location.pathname.startsWith(to + '/'));
                      return (
                        <motion.li
                          key={to}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 + gi * 0.08 + li * 0.02, duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
                        >
                          <Link
                            to={to}
                            className="flex items-center gap-2.5 py-2 text-sm text-[#F5F5F5] hover:text-[#C9A97A] transition-colors"
                            onClick={() => setMenuOpen(false)}
                          >
                            {label}
                            {isOrder && (
                              <span
                                className="ml-0.5 h-2 w-2 shrink-0 rounded-full"
                                style={{
                                  background: GOLD,
                                  boxShadow: `0 0 8px ${GOLD}, 0 0 14px ${GOLD}99, 0 0 20px ${GOLD}66`,
                                }}
                                aria-hidden
                              />
                            )}
                            {isCurrent && (
                              <span className="ml-auto text-[10px] font-medium uppercase tracking-wider" style={{ color: GOLD }}>
                                Сейчас
                              </span>
                            )}
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>
                </motion.div>
              ))}
              <motion.div
                className="pt-4 border-t border-[#1A1A1A]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.2 }}
              >
                <Link to="/profile" className="flex items-center justify-between py-2 text-sm text-[#F5F5F5] hover:text-[#C9A97A] transition-colors" onClick={() => setMenuOpen(false)}>
                  Профиль
                  {(location.pathname === '/profile' || location.pathname.startsWith('/profile/')) && (
                    <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: GOLD }}>Сейчас</span>
                  )}
                </Link>
                <Link to="/notifications" className="flex items-center justify-between py-2 text-sm text-[#F5F5F5] hover:text-[#C9A97A] transition-colors" onClick={() => setMenuOpen(false)}>
                  Уведомления
                  {(location.pathname === '/notifications' || location.pathname.startsWith('/notifications/')) && (
                    <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: GOLD }}>Сейчас</span>
                  )}
                </Link>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* TIGHT SPACING + MOBILE ADAPTIVE + PARALLAX */}
      <section ref={heroSectionRef} className="relative flex min-h-screen items-center justify-center overflow-hidden pt-14 pb-12 px-4 md:pt-20 md:pb-32 md:px-6" style={{ background: BG_VOID }}>
        <div className="hero-parallax-noise absolute inset-0 opacity-[0.02] will-change-transform" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
        <div ref={heroContentRef} className="container relative z-10 mx-auto max-w-6xl text-center will-change-transform">
          <h1
            ref={heroTitleRef}
            className="mb-4 font-cabinet text-[38px] leading-tight font-extrabold tracking-tight sm:text-[48px] md:mb-10 md:text-8xl md:leading-none lg:text-[96px]"
          >
            {'Доставка'.split('').map((char, i) => (
              <span key={i} className="hero-letter inline-block will-change-transform">
                {char}
              </span>
            ))}
            <br />
            <span className="mt-1 md:mt-4 block" style={{ color: GOLD }}>
              {'из Китая'.split('').map((char, i) => (
                <span key={i} className="hero-letter inline-block will-change-transform">
                  {char}
                </span>
              ))}
            </span>
          </h1>
          <p className="hero-subtitle mx-auto mb-6 max-w-3xl text-sm text-[#A3A3A3] md:mb-16 md:text-xl lg:text-3xl">
            $6 / кг · 18–35 дней · полная страховка · проверка на складе
          </p>
          <button
            className="hero-cta rounded-full px-6 py-3 text-sm font-medium text-black shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(201,169,122,0.2)] md:px-12 md:py-6 md:text-2xl lg:text-3xl"
            style={{ background: `linear-gradient(145deg, ${GOLD}, #E8C89A)` }}
            onClick={() => navigate('/terminal')}
          >
            Начать расчёт
          </button>
        </div>
        <svg ref={goldLineRef} className="absolute bottom-0 right-4 h-40 w-0.5 hidden sm:block md:right-16 md:h-96" viewBox="0 0 2 400" fill="none">
          <path className="gold-line-path" d="M1 0v400" stroke={GOLD} strokeWidth="2" />
        </svg>
      </section>

      <section ref={journeySectionRef} className="relative h-screen overflow-hidden">
        <div
          ref={journeyWrapperRef}
          className="absolute inset-y-0 flex items-center"
          style={{ width: `${JOURNEY_STEPS.length * 100}vw` }}
        >
          {JOURNEY_STEPS.map((step, i) => (
            <div key={step.label} className="journey-step flex h-full w-screen flex-shrink-0 items-center justify-center px-4 md:px-6">
              <div className="max-w-2xl text-center">
                <div className="step-icon mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 text-2xl md:mb-10 md:h-24 md:w-24 md:text-4xl" style={{ borderColor: `${GOLD}4D` }}>
                  {i + 1}
                </div>
                <h2 className="mb-2 font-cabinet text-3xl font-extrabold md:mb-4 md:text-5xl lg:text-7xl xl:text-8xl">{step.label}</h2>
                <p className="mb-2 text-sm text-[#A3A3A3] md:mb-6 md:text-xl">{step.days} дней</p>
                <p className="mb-4 text-xs text-[#A3A3A3] md:mb-8 md:text-lg">{step.desc}</p>
                <div className="step-line mx-auto h-0.5 w-20 origin-left rounded-full bg-[#C9A97A]/30 md:h-1 md:w-32" style={{ transform: 'scaleX(0)' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Секция после горизонтальной прокрутки — заполняем пробел заголовком и контентом */}
      <section className="pt-6 pb-12 px-4 md:pt-12 md:pb-24 md:px-6">
        <div className="container mx-auto max-w-7xl px-0 md:px-6">
          <div className="mb-12 text-center md:mb-24 lg:mb-32">
            <h2 className="font-cabinet text-2xl font-extrabold md:text-4xl lg:text-5xl xl:text-6xl" style={{ color: GOLD }}>
              Почему выбирают нас
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-[#A3A3A3] md:mt-6 md:text-lg lg:text-xl">
              Прозрачные условия, фиксированные ставки и полный цикл доставки из Китая под ключ.
            </p>
          </div>
          <div className="space-y-12 md:space-y-40 lg:space-y-48">
          {ADVANTAGES.map((adv, i) => {
            const Icon = adv.icon;
            return (
              <div
                key={adv.title}
                ref={(el) => (advantagesRefs.current[i] = el)}
                className={`flex flex-col items-center gap-6 md:flex-row md:gap-32 ${i % 2 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="advantage-line mb-3 h-0.5 origin-left rounded-full md:mb-8 md:h-1" style={{ background: GOLD, transform: 'scaleX(0)' }} />
                  <h3 className="advantage-title font-cabinet text-xl font-extrabold md:text-6xl lg:text-7xl">{adv.title}</h3>
                  <p className="mt-2 text-sm text-[#A3A3A3] md:mt-6 md:text-2xl lg:text-3xl">{adv.desc}</p>
                </div>
                <div className="advantage-icon flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-xl border md:h-80 md:w-80 md:rounded-3xl" style={{ background: BG_SURFACE, borderColor: `${GOLD}1A` }}>
                  <Icon className="h-8 w-8 md:h-20 md:w-20" style={{ color: GOLD, strokeWidth: 1.5 }} />
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </section>

      <section ref={statsSectionRef} className="py-12 px-4 md:py-24 md:px-6">
        <div className="container mx-auto grid max-w-7xl grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="stat-box rounded-xl p-4 md:rounded-2xl md:p-8 lg:p-10"
              style={{ background: BG_SURFACE, borderBottom: `3px solid ${GOLD}` }}
            >
              <div className="font-cabinet text-2xl font-extrabold md:text-5xl lg:text-6xl xl:text-7xl" style={{ color: GOLD }}>
                <span className="stat-number">{stat.value}</span>{stat.suffix}
              </div>
              <p className="mt-1 text-xs text-[#A3A3A3] md:mt-4 md:text-lg">{stat.label}</p>
              <div className="stat-bar mt-2 h-0.5 md:mt-6 md:h-1 w-full overflow-hidden rounded-full bg-[#1A1A1A]">
                <div className="stat-bar-fill h-full rounded-full bg-[#C9A97A]" style={{ width: '100%', transform: 'scaleX(0)', transformOrigin: 'left' }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 px-4 md:py-24 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="mb-3 text-center font-cabinet text-xl font-extrabold md:mb-8 md:text-4xl lg:text-5xl">Прямо с источников</h2>
          <p className="mb-3 text-center text-sm text-[#A3A3A3] md:mb-8 md:text-lg">
            Заказываем с площадок:{' '}
            <span className="text-[#F5F5F5]" style={{ fontFamily: "'Neue Montreal', sans-serif" }}>
              {MARKETPLACES_LIST.join(', ')}
            </span>
            . Выкупим и доставим под ключ.
          </p>
          <p className="text-center text-sm text-[#A3A3A3] md:text-base">
            <span style={{ color: GOLD }}>Прямо из Китая.</span>
          </p>
        </div>
      </section>

      <section ref={ctaSectionRef} className="flex min-h-screen flex-col items-center justify-center py-12 px-4 md:py-32 md:px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 ref={ctaTitleRef} className="mb-6 font-cabinet text-lg font-extrabold leading-tight md:mb-16 md:text-4xl lg:text-6xl xl:text-7xl">
            {'Готовы забрать свой товар из Китая?'.split('').map((char, i) => (
              <span key={i} className="cta-letter inline-block">{char}</span>
            ))}
          </h2>
          <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl border p-4 md:mb-12 md:gap-8 md:rounded-3xl md:p-8 lg:p-12" style={{ background: BG_SURFACE, borderColor: `${GOLD}20` }}>
            <div className="w-full max-w-md">
              <label className="mb-1 block text-left text-xs text-[#A3A3A3] md:mb-4 md:text-lg">Вес груза (кг)</label>
              <input
                type="range"
                min="1"
                max="50"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#1A1A1A] accent-[#C9A97A] md:h-3"
              />
              <div className="mt-1 flex justify-between text-xs text-[#A3A3A3] md:mt-2 md:text-sm">
                <span>1 кг</span>
                <span>{weight} кг</span>
                <span>50 кг</span>
              </div>
            </div>
            <p className="text-sm text-[#A3A3A3] md:text-2xl">
              Примерно: <strong ref={priceDisplayRef} className="text-[#C9A97A] md:text-[1.5rem]">${price}</strong> (доставка по весу)
            </p>
          </div>
          <button
            onClick={() => navigate('/terminal')}
            className="rounded-full px-6 py-3 text-sm font-medium text-black shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(201,169,122,0.25)] md:px-14 md:py-6 md:text-2xl lg:text-3xl"
            style={{ background: `linear-gradient(145deg, ${GOLD}, #E8C89A)` }}
          >
            Начать расчёт
          </button>
        </div>
      </section>

      <footer className="border-t border-[#1A1A1A] px-4 py-8 md:px-6 md:py-16 lg:py-20" style={{ background: BG_VOID }}>
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-12 lg:grid-cols-3">
            <div>
              <div className="font-cabinet text-base md:text-xl font-bold tracking-tight mb-1 md:mb-4" style={{ color: GOLD }}>Fluvion</div>
              <p className="text-xs text-[#A3A3A3] leading-relaxed md:text-sm">
                Доставка товаров из Китая в Беларусь под ключ. Надёжно, быстро, с гарантией.
              </p>
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-semibold text-[#F5F5F5] mb-1 md:mb-4 uppercase tracking-wider">Информация</h4>
              <ul className="space-y-1 md:space-y-3">
                <li><Link to="/delivery-payment" className="text-xs text-[#A3A3A3] hover:text-[#C9A97A] transition-colors md:text-sm">Доставка и оплата</Link></li>
                <li><Link to="/public-offer" className="text-xs text-[#A3A3A3] hover:text-[#C9A97A] transition-colors md:text-sm">Публичная оферта</Link></li>
                <li><Link to="/privacy-policy" className="text-xs text-[#A3A3A3] hover:text-[#C9A97A] transition-colors md:text-sm">Политика конфиденциальности</Link></li>
                <li><Link to="/faq" className="text-xs text-[#A3A3A3] hover:text-[#C9A97A] transition-colors md:text-sm">FAQ</Link></li>
                <li><Link to="/reviews" className="text-xs text-[#A3A3A3] hover:text-[#C9A97A] transition-colors md:text-sm">Отзывы</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-semibold text-[#F5F5F5] mb-1 md:mb-4 uppercase tracking-wider">Контакты</h4>
              <ul className="space-y-1 text-xs text-[#A3A3A3] md:space-y-3 md:text-sm">
                <li><a href="tel:+375336540611" className="hover:text-[#C9A97A] transition-colors">+375 33 654-06-11</a></li>
                <li><a href="mailto:fluvionbiz@gmail.com" className="hover:text-[#C9A97A] transition-colors">fluvionbiz@gmail.com</a></li>
                <li>Беларусь, Минск</li>
              </ul>
              <a
                href="https://t.me/FLUVIONN"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all hover:shadow-[0_0_30px_rgba(201,169,122,0.2)] md:mt-4 md:px-5 md:py-3 md:text-sm"
                style={{ background: `${GOLD}20`, color: GOLD, border: `1px solid ${GOLD}40` }}
              >
                Telegram
              </a>
            </div>
          </div>
          <div className="mt-8 border-t border-[#1A1A1A] pt-6 md:mt-12 md:pt-8">
            <h4 className="text-xs font-semibold text-[#F5F5F5] mb-3 uppercase tracking-wider md:text-sm md:mb-4">Способы оплаты</h4>
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <div className="rounded-lg border p-2 md:p-3" style={{ borderColor: `${GOLD}30`, background: BG_SURFACE }}>
                <img src="/payment-logos/visa.svg" alt="Visa" className="h-6 object-contain md:h-10" />
              </div>
              <div className="rounded-lg border p-2 md:p-3" style={{ borderColor: `${GOLD}30`, background: BG_SURFACE }}>
                <img src="/payment-logos/mastercard.svg" alt="Mastercard" className="h-6 object-contain md:h-10" />
              </div>
              <div className="rounded-lg border p-2 md:p-3" style={{ borderColor: `${GOLD}30`, background: BG_SURFACE }}>
                <img src="/payment-logos/belkart.svg" alt="Белкарт" className="h-6 object-contain md:h-10" />
              </div>
              <div className="rounded-lg border p-2 md:p-3" style={{ borderColor: `${GOLD}30`, background: BG_SURFACE }}>
                <img src="/payment-logos/apple-pay.svg" alt="Apple Pay" className="h-6 object-contain md:h-10" />
              </div>
              <div className="rounded-lg border p-2 md:p-3" style={{ borderColor: `${GOLD}30`, background: BG_SURFACE }}>
                <img src="/payment-logos/gpay.svg" alt="Google Pay" className="h-6 object-contain md:h-10" />
              </div>
              <div className="rounded-lg border p-2 md:p-3" style={{ borderColor: `${GOLD}30`, background: BG_SURFACE }}>
                <img src="/payment-logos/samsung-pay.svg" alt="Samsung Pay" className="h-6 object-contain md:h-10" />
              </div>
              <div className="rounded-lg border p-2 md:p-3" style={{ borderColor: `${GOLD}30`, background: BG_SURFACE }}>
                <img src="/payment-logos/bepaid.svg" alt="bePaid" className="h-6 object-contain md:h-10" />
              </div>
              <div className="rounded-lg border p-2 md:p-3" style={{ borderColor: `${GOLD}30`, background: BG_SURFACE }}>
                <img src="/payment-logos/erip.svg" alt="ЕРИП" className="h-6 object-contain md:h-10" />
              </div>
            </div>
          </div>
          <div className="mt-8 pt-4 flex flex-col md:flex-row justify-between items-center gap-2 border-t border-[#1A1A1A] md:mt-16 md:pt-8 md:gap-4">
            <p className="text-xs text-[#A3A3A3] md:text-sm">© {new Date().getFullYear()} Fluvion. Все права защищены.</p>
            <p className="text-xs text-[#A3A3A3] md:text-sm">Доставка из Китая в Беларусь</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
