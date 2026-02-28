/**
 * Fluvion — главная страница v2.0
 * Silent Empire Ultra-Minimal Luxury 2026
 * Анимации: GSAP Timeline + ScrollTrigger + Lenis
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import {
  Clock,
  DollarSign,
  ShieldCheck,
  Search,
  Globe,
  Truck,
  CreditCard,
  Star,
  Calculator,
  MessageCircle,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Палитра Silent Empire
const COLORS = {
  bg: '#F8F5F0',
  text: '#11110F',
  gold: '#B89E6E',
  navy: '#0F172A',
  china: '#8C1C1C',
  goldGradient: 'linear-gradient(145deg, #B89E6E, #D4B98A)',
};

const NAV_LINKS = [
  { path: '/catalog', label: 'Примеры товаров' },
  { path: '/terminal', label: 'Заказать товар' },
  { path: '/calculator', label: 'Калькулятор' },
  { path: '/rates', label: 'Курс' },
  { path: '/faq', label: 'FAQ' },
];

const ADVANTAGES = [
  { icon: Clock, title: 'Быстрая доставка', description: 'Доставка из Китая за 18–35 дней через Карго' },
  { icon: DollarSign, title: 'Фиксированная цена', description: '$6 за кг + тарифы Европочты, без скрытых платежей' },
  { icon: ShieldCheck, title: 'Страховка груза', description: 'Гарантия возврата полной стоимости груза при нашей вине' },
  { icon: Search, title: 'Проверка товаров', description: 'Проверка целостности и качества (от $5)' },
  { icon: Globe, title: 'Упрощённая таможня', description: 'Помощь с таможенными процедурами' },
  { icon: Truck, title: 'Отслеживание', description: 'Трек-номер и уведомления в Профиле' },
  { icon: CreditCard, title: 'Прозрачная оплата', description: 'Оплата через Альфа-Банк (Visa, Mastercard)' },
  { icon: Star, title: 'Опыт', description: 'Более 5 лет успешной доставки из Китая' },
];

const STATS = [
  { value: 1000, suffix: '+', label: 'Товаров из Китая' },
  { value: 90, suffix: '%', label: 'Клиентов рекомендуют' },
  { value: 5, suffix: '', label: 'Складов-партнёров' },
  { value: 24, suffix: '/7', label: 'Поддержка клиентов' },
];

const MARKETPLACES = [
  { name: '1688', text: '1688' },
  { name: 'Taobao', text: '淘宝' },
  { name: 'Pinduoduo', text: '拼多多' },
  { name: 'GoFish', text: 'GoFish' },
  { name: 'Poizon', text: 'Poizon' },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Выбор товара', text: 'В каталоге — примеры. Любой товар по ссылке — в Терминале.' },
  { step: '2', title: 'Оформление', text: 'Добавляете в корзину, мы считаем стоимость и страховку.' },
  { step: '3', title: 'Доставка', text: 'Груз идёт на наш склад в Китае, затем в Беларусь за 18–35 дней.' },
];

const ABOUT_TEXT = {
  lead: 'Fluvion — это карго-доставка из Китая под ключ: от выбора товара на 1688, Taobao или Pinduoduo до получения в отделении Европочты. Мы работаем с 2019 года и провели тысячи посылок.',
  points: [
    'Фиксированный тариф $6/кг плюс тарифы перевозчика — без скрытых наценок.',
    'Страховка груза и проверка товара перед отправкой — забота о вашем заказе.',
    'Поддержка в Telegram и личный кабинет с трекингом — вы всегда в курсе.',
  ],
};

const Home = () => {
  const navigate = useNavigate();
  const [reduceMotion, setReduceMotion] = useState(false);
  const lenisRef = useRef(null);
  const heroTitleRef = useRef(null);
  const heroSubtitleRef = useRef(null);
  const heroCtaRef = useRef(null);
  const goldLineRef = useRef(null);
  const statsSectionRef = useRef(null);
  const advantagesRef = useRef(null);
  const ctaTitleRef = useRef(null);
  const marqueeRef = useRef(null);
  const ctaSplitDoneRef = useRef(false);
  const ctaScrollTriggerRef = useRef(null);
  const [showMobileCta, setShowMobileCta] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  // Нижняя панель на мобильном: показывать после скролла вниз, скрывать при скролле вверх (возврат кнопок на место)
  useEffect(() => {
    const thresholdShow = 400;
    const thresholdHide = 320;
    const onScroll = () => {
      const y = window.scrollY ?? document.documentElement.scrollTop ?? 0;
      setShowMobileCta((prev) => {
        if (y > thresholdShow) return true;
        if (y < thresholdHide) return false;
        return prev;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Lenis smooth scroll + GSAP ScrollTrigger
  useEffect(() => {
    if (reduceMotion) return;
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    return () => {
      lenis.off('scroll', ScrollTrigger.update);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduceMotion]);

  // Hero timeline — запуск после монтирования, явно выставляем opacity подзаголовку
  useEffect(() => {
    if (reduceMotion) {
      const s = heroSubtitleRef.current;
      const line = goldLineRef.current;
      if (s) gsap.set(s, { opacity: 1 });
      if (line && typeof line.getTotalLength === 'function') {
        const len = line.getTotalLength();
        line.style.strokeDasharray = String(len);
        line.style.strokeDashoffset = '0';
      }
      return;
    }
    const subtitle = heroSubtitleRef.current;
    const line = goldLineRef.current;
    if (subtitle) gsap.set(subtitle, { opacity: 0 });

    const tl = gsap.timeline();
    const titleSpans = heroTitleRef.current?.querySelectorAll('.hero-title span');
    const ctas = heroCtaRef.current?.querySelectorAll('.hero-cta');

    if (titleSpans?.length) {
      tl.from(titleSpans, { y: 24, opacity: 0.6, stagger: 0.08, duration: 0.9, ease: 'power3.out' });
    }
    if (subtitle) {
      tl.from(subtitle, { opacity: 0, y: 30 }, '-=0.7');
    }
    if (ctas?.length) {
      gsap.set(ctas, { opacity: 1 });
      tl.fromTo(ctas, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.1, duration: 0.5 }, '-=0.5');
    }
    if (line && typeof line.getTotalLength === 'function') {
      const len = line.getTotalLength();
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(line, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.out' }, '-=1');
    }
    return () => {
      tl.kill();
      const c = heroCtaRef.current?.querySelectorAll('.hero-cta');
      if (c?.length) gsap.set(c, { opacity: 1, scale: 1 });
    };
  }, [reduceMotion]);

  // Pinned Stats + count-up + gold lines
  useEffect(() => {
    const section = statsSectionRef.current;
    if (!section || reduceMotion) return;

    const statEls = section.querySelectorAll('[data-stat-value]');
    const lineEls = section.querySelectorAll('.stat-gold-line-inner');
    const masterTl = gsap.timeline({ paused: true });

    statEls.forEach((el, i) => {
      const val = +el.dataset.statValue;
      const suffix = el.dataset.statSuffix ?? '';
      const isPercent = suffix === '%';
      const duration = 1.4;
      masterTl.to(
        { v: 0 },
        {
          v: val,
          duration,
          ease: 'power2.out',
          onUpdate: function () {
            const v = Math.round(this.targets()[0].v);
            el.textContent = isPercent && val === 90 ? `${v}%` : `${v}${suffix}`;
          },
        },
        i * 0.12
      );
    });

    lineEls.forEach((line, i) => {
      masterTl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power2.out', transformOrigin: 'left' }, i * 0.12);
    });

    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '30% top',
      pin: true,
      scrub: 0.5,
      onEnter: () => masterTl.play(),
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.trigger === section && t.kill());
      masterTl.kill();
    };
  }, [reduceMotion]);

  // Преимущества: один раз по скроллу, без сдвига по x
  useEffect(() => {
    const container = advantagesRef.current;
    if (!container || reduceMotion) return;

    const cards = container.querySelectorAll('.advantage-card');
    const sts = [];
    cards.forEach((card) => {
      const progress = card.querySelector('.gold-progress');
      const textBlock = card.querySelector('.advantage-icon')?.nextElementSibling;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true,
          toggleActions: 'play none none none',
        },
      });
      if (progress) tl.to(progress, { height: '100%', duration: 0.8, ease: 'power2.out' });
      if (textBlock) tl.fromTo(textBlock, { opacity: 0 }, { opacity: 1, duration: 0.4 }, '-=0.4');
      if (tl.scrollTrigger) sts.push(tl.scrollTrigger);
    });

    return () => {
      sts.forEach((st) => st.kill());
    };
  }, [reduceMotion]);

  // Marquee: цикличная анимация — двигаем на 50% ширины трека (второй набор = копия первого)
  useEffect(() => {
    const track = marqueeRef.current;
    if (!track || reduceMotion) return;
    const mq = window.matchMedia('(min-width: 1024px)');
    if (!mq.matches) return;

    gsap.set(track, { x: 0 });
    gsap.to(track, { x: '-50%', duration: 32, ease: 'none', repeat: -1 });
    return () => gsap.killTweensOf(track);
  }, [reduceMotion]);

  // Final CTA split text — только если ещё не разбивали
  useEffect(() => {
    const el = ctaTitleRef.current;
    if (!el || reduceMotion || ctaSplitDoneRef.current) return;
    const raw = (el.textContent || '').trim();
    if (!raw || el.children.length > 0) return;

    ctaSplitDoneRef.current = true;
    el.textContent = '';
    const chars = raw.split('').map((c) => {
      const s = document.createElement('span');
      s.className = 'inline-block';
      s.textContent = c;
      s.style.opacity = '0';
      el.appendChild(s);
      return s;
    });

    const st = ScrollTrigger.create({
      trigger: el.closest('.final-cta-section'),
      start: 'top 78%',
      once: true,
      onEnter: () => gsap.to(chars, { opacity: 1, stagger: 0.02, duration: 0.35, ease: 'power2.out' }),
    });
    ctaScrollTriggerRef.current = st;

    return () => {
      if (ctaScrollTriggerRef.current) ctaScrollTriggerRef.current.kill();
      ctaScrollTriggerRef.current = null;
    };
  }, [reduceMotion]);

  // Обновить ScrollTrigger после первого рендера (pin + Lenis)
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 500);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fluvion',
    url: 'https://fluvion.by',
    logo: 'https://fluvion.by/logo.png',
    description: 'Доставка товаров из Китая в Беларусь за 18-35 дней. Заказывайте с Pinduoduo, Taobao, 1688 и других маркетплейсов.',
  };

  return (
    <div className="home-silent-empire pb-20 md:pb-0" style={{ background: COLORS.bg, color: COLORS.text }}>
      <Helmet>
        <title>Fluvion - Доставка товаров из Китая в Беларусь | Карго доставка под ключ</title>
        <meta name="description" content="Доставка товаров из Китая в Беларусь за 18-35 дней. Заказывайте с Pinduoduo, Taobao, 1688. Фиксированная цена $6/кг, страховка груза, отслеживание заказа." />
        <meta name="theme-color" content={COLORS.bg} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      {/* ——— Sticky Header 72px, navy + blur ——— */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex h-[72px] items-center justify-between px-6 md:px-10"
        style={{
          background: `${COLORS.navy}ee`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <button onClick={() => navigate('/')} className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0F172A] focus:ring-[#B89E6E] rounded">
          <span className="font-black text-white text-xl tracking-tight" style={{ fontFamily: 'Satoshi, sans-serif', letterSpacing: '-0.02em' }}>
            Fluvion
          </span>
        </button>
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {NAV_LINKS.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="group relative text-white/90 text-[15px] font-medium hover:text-white transition-colors focus:outline-none min-h-[48px] min-w-[48px] flex items-center justify-center"
              style={{ fontFamily: 'General Sans, sans-serif' }}
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-[#B89E6E] transition-all duration-300 group-hover:w-full" aria-hidden />
            </button>
          ))}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 ml-2 pl-4 border-l border-white/20">
            <button
              onClick={() => navigate('/terminal')}
              className="h-10 px-4 rounded-full text-white text-sm font-medium border border-white/30 hover:bg-white/10 transition-colors"
              style={{ fontFamily: 'General Sans, sans-serif' }}
            >
              Заказать товар
            </button>
            <button
              onClick={() => navigate('/catalog')}
              className="h-10 px-4 rounded-full text-white/90 text-sm font-medium hover:bg-white/10 transition-colors"
              style={{ fontFamily: 'General Sans, sans-serif' }}
            >
              Примеры товаров
            </button>
          </div>
        </nav>
        <button
          onClick={() => navigate('/calculator')}
          className="flex items-center justify-center h-12 min-h-[48px] px-6 rounded-full text-white font-medium text-[15px] focus:outline-none focus:ring-2 focus:ring-[#B89E6E] focus:ring-offset-2 focus:ring-offset-[#0F172A] hover:scale-[1.03] transition-transform will-change-transform"
          style={{
            background: COLORS.goldGradient,
            fontFamily: 'General Sans, sans-serif',
          }}
        >
          Рассчитать стоимость
        </button>
      </header>

      {/* ——— Hero 100vh, split 50/50 ——— */}
      <section className="relative min-h-screen flex flex-col md:flex-row pt-[72px]">
        <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-16 py-16 md:py-0 max-w-full md:max-w-[50%]">
          <p className="hero-tagline text-sm md:text-base font-medium mb-4 opacity-100" style={{ fontFamily: 'General Sans, sans-serif', color: COLORS.gold, letterSpacing: '0.08em' }}>
            Доставка с Fluvion
          </p>
          <h1
            ref={heroTitleRef}
            className="hero-title text-[48px] leading-[1.1] md:text-[92px] font-black mb-6 md:mb-8"
            style={{ fontFamily: 'Satoshi, sans-serif', letterSpacing: '-0.02em' }}
          >
            <span className="block">Доставка</span>
            <span className="block">из Китая</span>
            <span className="block" style={{ color: COLORS.gold }}>под ключ</span>
          </h1>
          <p
            ref={heroSubtitleRef}
            className="text-base md:text-[19px] leading-[1.85] max-w-lg mb-3 opacity-0"
            style={{ fontFamily: 'General Sans, sans-serif', color: COLORS.text }}
          >
            От выбора в примерах товаров или по ссылке в Терминале до доставки в Беларусь за 18–35 дней по цене $6/кг.
          </p>
          <div ref={heroCtaRef} className="flex flex-col gap-3 max-w-[280px]">
            <button
              onClick={() => navigate('/terminal')}
              className="hero-cta h-[68px] rounded-full text-white font-medium text-[17px] focus:outline-none focus:ring-2 focus:ring-[#B89E6E] focus:ring-offset-2 hover:scale-[1.03] transition-transform will-change-transform"
              style={{ background: COLORS.goldGradient, fontFamily: 'General Sans, sans-serif', opacity: 1 }}
            >
              Заказать товар
            </button>
            <button
              onClick={() => navigate('/catalog')}
              className="hero-cta h-[68px] rounded-full border-2 font-medium text-[17px] focus:outline-none focus:ring-2 focus:ring-[#B89E6E] focus:ring-offset-2 hover:scale-[1.03] transition-transform will-change-transform"
              style={{ borderColor: COLORS.gold, color: COLORS.gold, fontFamily: 'General Sans, sans-serif', opacity: 1 }}
            >
              Примеры товаров
            </button>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center relative min-h-[40vh] md:min-h-0 md:h-[calc(100vh-72px)] px-6 md:pl-8 lg:pl-12">
          <div className="relative w-full max-w-md">
            <svg className="absolute left-0 top-0 bottom-0 w-px opacity-30" viewBox="0 0 1 400" preserveAspectRatio="none">
              <path ref={goldLineRef} d="M0 0 V400" stroke={COLORS.gold} strokeWidth="1" fill="none" />
            </svg>
            <p className="text-sm font-medium mb-6 pl-6" style={{ fontFamily: 'General Sans, sans-serif', color: COLORS.gold, letterSpacing: '0.05em' }}>
              КАК ЭТО РАБОТАЕТ
            </p>
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="pl-6 mb-8 last:mb-0">
                <span className="text-xs font-bold mb-1 block opacity-70" style={{ color: COLORS.gold }}>{item.step}</span>
                <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'Satoshi, sans-serif', color: COLORS.text }}>{item.title}</h3>
                <p className="text-sm leading-relaxed opacity-90" style={{ fontFamily: 'General Sans, sans-serif', color: COLORS.text }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— О нас: текст + визуал ——— */}
      <section className="py-16 md:py-24" style={{ background: COLORS.bg }}>
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div>
              <h2 className="text-2xl md:text-[40px] font-black mb-6" style={{ fontFamily: 'Satoshi, sans-serif', letterSpacing: '-0.02em' }}>
                Доставка под ключ без лишних слов
              </h2>
              <p className="text-base md:text-[19px] leading-[1.85] mb-6" style={{ fontFamily: 'General Sans, sans-serif', color: COLORS.text }}>
                {ABOUT_TEXT.lead}
              </p>
              <ul className="space-y-3">
                {ABOUT_TEXT.points.map((point, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2.5" style={{ background: COLORS.gold }} />
                    <span className="text-[17px] leading-[1.75]" style={{ fontFamily: 'General Sans, sans-serif', color: COLORS.text }}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border flex items-center justify-center" style={{ borderColor: 'rgba(184,158,110,0.3)', background: 'rgba(184,158,110,0.06)' }}>
              <img src="/logo.png" alt="Fluvion" className="max-w-[200px] max-h-[200px] object-contain opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* ——— Цифры, которые молчат (pinned 40%) ——— */}
      <section ref={statsSectionRef} className="relative min-h-screen flex items-center justify-center bg-[#F8F5F0] py-20 md:py-28">
        <div className="container mx-auto px-6">
          <h2
            className="text-3xl md:text-[56px] font-black text-center mb-4"
            style={{ fontFamily: 'Satoshi, sans-serif', letterSpacing: '-0.02em' }}
          >
            Цифры, которые молчат
          </h2>
          <p className="text-center text-base md:text-lg mb-12 md:mb-16 max-w-xl mx-auto" style={{ fontFamily: 'General Sans, sans-serif', color: COLORS.text }}>
            За годы работы мы накопили опыт и доверие клиентов по всей Беларуси.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="relative p-6 md:p-8 rounded-2xl border overflow-hidden"
                style={{ borderColor: COLORS.gold, background: '#F8F5F0' }}
              >
                <div
                  className="text-3xl md:text-5xl font-black mb-2"
                  style={{ fontFamily: 'Satoshi, sans-serif', color: COLORS.gold }}
                  data-stat-value={stat.value}
                  data-stat-suffix={stat.suffix}
                >
                  {stat.value}{stat.suffix}
                </div>
                <div
                  className="text-sm md:text-base font-medium"
                  style={{ fontFamily: 'General Sans, sans-serif', color: COLORS.text }}
                >
                  {stat.label}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
                  <div
                    className="stat-gold-line-inner h-full w-full origin-left"
                    style={{ background: COLORS.gold }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Преимущества без слов (vertical single column) ——— */}
      <section className="py-20 md:py-28" style={{ background: COLORS.bg }}>
        <div className="container mx-auto px-6 max-w-4xl">
          <h2
            className="text-3xl md:text-[56px] font-black mb-4"
            style={{ fontFamily: 'Satoshi, sans-serif', letterSpacing: '-0.02em' }}
          >
            Преимущества без слов
          </h2>
          <p className="text-base md:text-lg mb-12 md:mb-16 max-w-2xl" style={{ fontFamily: 'General Sans, sans-serif', color: COLORS.text }}>
            Всё, что нужно для спокойной доставки: прозрачные цены, страховка, проверка и поддержка.
          </p>
          <div ref={advantagesRef} className="flex flex-col gap-8 md:gap-12">
            {ADVANTAGES.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="advantage-card relative flex items-start gap-6 md:gap-10 rounded-[28px] border min-h-[280px] md:min-h-[320px] justify-center flex-col transition-[transform,box-shadow] duration-300 hover:shadow-lg pl-14 md:pl-20 pr-8 md:pr-16 py-8 md:py-16"
                  style={{
                    background: COLORS.bg,
                    borderColor: 'rgba(184, 158, 110, 0.25)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="absolute left-6 md:left-10 top-0 bottom-0 w-px overflow-hidden rounded-full" style={{ background: 'rgba(184,158,110,0.2)' }}>
                    <div className="gold-progress w-full h-0 transition-none" style={{ background: COLORS.gold }} />
                  </div>
                  <div
                    className="advantage-icon flex items-center justify-center flex-shrink-0"
                    style={{ color: COLORS.gold }}
                  >
                    <Icon strokeWidth={1.5} size={48} />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ fontFamily: 'Satoshi, sans-serif', color: COLORS.text }}>
                      {item.title}
                    </h3>
                    <p className="text-base md:text-[19px] leading-[1.85]" style={{ fontFamily: 'General Sans, sans-serif', color: COLORS.text }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ——— Маркетплейсы: карусель по центру страницы ——— */}
      <section className="py-16 md:py-24 flex flex-col items-center" style={{ background: COLORS.bg }}>
        <h2 className="text-2xl md:text-3xl font-black text-center mb-4" style={{ fontFamily: 'Satoshi, sans-serif', letterSpacing: '-0.02em' }}>
          Работаем с маркетплейсами
        </h2>
        <p className="text-center text-base md:text-lg mb-12 max-w-xl mx-auto" style={{ fontFamily: 'General Sans, sans-serif', color: COLORS.text }}>
          Заказывайте с 1688, Taobao, Pinduoduo и других площадок — привезём в Беларусь.
        </p>
        {/* Desktop: карусель центрирована по горизонтали */}
        <div className="hidden lg:block w-full max-w-4xl mx-auto overflow-hidden">
          <div ref={marqueeRef} className="home-marquee-track flex items-stretch gap-6 will-change-transform">
            {[...MARKETPLACES, ...MARKETPLACES].map((m, i) => (
              <div
                key={i}
                className="home-marquee-item flex-shrink-0 flex items-center justify-center min-w-[140px] h-[72px] rounded-2xl border px-6 transition-colors duration-300"
                style={{ borderColor: 'rgba(184,158,110,0.35)', background: 'rgba(184,158,110,0.06)', fontFamily: 'Satoshi, sans-serif', color: COLORS.gold, fontSize: '1.125rem', fontWeight: 700 }}
              >
                {m.text}
              </div>
            ))}
          </div>
        </div>
        {/* Mobile: сетка карточек */}
        <div className="flex lg:hidden flex-wrap justify-center gap-4 py-4">
          {MARKETPLACES.map((m, i) => (
            <div
              key={i}
              className="flex items-center justify-center min-w-[100px] h-14 rounded-xl border px-4"
              style={{ borderColor: 'rgba(184,158,110,0.35)', background: 'rgba(184,158,110,0.06)', fontFamily: 'Satoshi, sans-serif', color: COLORS.gold, fontWeight: 700 }}
            >
              {m.text}
            </div>
          ))}
        </div>
      </section>

      {/* ——— Синяя область: два блока слева и справа (как в начале) ——— */}
      <section className="min-h-screen flex flex-col md:flex-row py-20 md:py-28" style={{ background: COLORS.navy }}>
        <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-16 max-w-full md:max-w-[50%]">
          <p className="text-sm font-medium mb-4" style={{ fontFamily: 'General Sans, sans-serif', color: COLORS.gold, letterSpacing: '0.06em' }}>
            НАМ ДОВЕРЯЮТ
          </p>
          <h2 className="text-2xl md:text-[40px] font-black text-white mb-6" style={{ fontFamily: 'Satoshi, sans-serif', letterSpacing: '-0.02em' }}>
            Тысячи посылок без лишних слов
          </h2>
          <p className="text-base md:text-[19px] leading-[1.85] text-white/85 mb-8 max-w-lg" style={{ fontFamily: 'General Sans, sans-serif' }}>
            Считаем стоимость заранее, страхуем груз, ведём до отделения Европочты. Поддержка в Telegram и по почте 24/7.
          </p>
          <MessageCircle className="mb-4 opacity-50" size={32} strokeWidth={1.5} style={{ color: COLORS.gold }} />
          <blockquote className="text-lg md:text-xl font-medium leading-relaxed text-white/95 mb-4" style={{ fontFamily: 'General Sans, sans-serif' }}>
            «Заказывала несколько раз — всё приходит в срок, упаковка целая. Считают стоимость сразу, без сюрпризов. Рекомендую».
          </blockquote>
          <p className="text-sm text-white/55" style={{ fontFamily: 'General Sans, sans-serif' }}>
            Клиент Fluvion, Минск
          </p>
        </div>
        <div className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-16 max-w-full md:max-w-[50%] md:pl-8">
          <div className="w-full max-w-md">
            <p className="text-sm font-medium mb-4" style={{ fontFamily: 'General Sans, sans-serif', color: COLORS.gold, letterSpacing: '0.06em' }}>
              ПОДДЕРЖКА
            </p>
            <h3 className="text-xl md:text-2xl font-black text-white mb-6" style={{ fontFamily: 'Satoshi, sans-serif', letterSpacing: '-0.02em' }}>
              Всегда на связи
            </h3>
            <p className="text-base md:text-[19px] leading-[1.85] text-white/85" style={{ fontFamily: 'General Sans, sans-serif' }}>
              Отвечаем на вопросы по заказу, весу и срокам доставки. Напишите в Telegram или на почту — подскажем и посчитаем стоимость. Контакты и реквизиты — внизу страницы в подвале.
            </p>
          </div>
        </div>
      </section>

      {/* ——— Final CTA (navy, full viewport) ——— */}
      <section
        className="final-cta-section min-h-screen flex flex-col items-center justify-center px-6 py-24"
        style={{ background: COLORS.navy }}
      >
        <h2
          ref={ctaTitleRef}
          className="text-4xl md:text-7xl lg:text-8xl font-black text-white text-center mb-6"
          style={{ fontFamily: 'Satoshi, sans-serif', letterSpacing: '-0.02em' }}
        >
          Готовы начать?
        </h2>
        <p className="text-center text-white/90 text-base md:text-lg mb-4 max-w-lg" style={{ fontFamily: 'General Sans, sans-serif' }}>
          Рассчитайте стоимость доставки за минуту или оформите заказ в Терминале. От $6 за кг — без скрытых платежей.
        </p>
        <p className="text-center text-white/60 text-sm md:text-base mb-10 max-w-md" style={{ fontFamily: 'General Sans, sans-serif' }}>
          Сайт fluvion.by · Telegram: t.me/FLUVIONN · Вопросы: fluvionbiz@gmail.com
        </p>
        <button
          onClick={() => navigate('/calculator')}
          className="h-[68px] px-12 rounded-full text-white font-medium text-[17px] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0F172A] hover:scale-[1.03] transition-transform"
          style={{ background: COLORS.goldGradient, fontFamily: 'General Sans, sans-serif' }}
        >
          Рассчитать стоимость
        </button>
      </section>

      {/* Мобильная нижняя панель: кнопки «Заказать» и «Примеры» всегда под рукой */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-3 p-3 transition-transform duration-300"
        style={{
          background: `${COLORS.navy}f5`,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          transform: showMobileCta ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        <button
          onClick={() => navigate('/terminal')}
          className="flex-1 max-w-[180px] h-12 rounded-full text-white text-sm font-medium"
          style={{ background: COLORS.goldGradient, fontFamily: 'General Sans, sans-serif' }}
        >
          Заказать товар
        </button>
        <button
          onClick={() => navigate('/catalog')}
          className="flex-1 max-w-[180px] h-12 rounded-full border-2 text-white/95 text-sm font-medium"
          style={{ borderColor: COLORS.gold, fontFamily: 'General Sans, sans-serif' }}
        >
          Примеры товаров
        </button>
      </div>

      <style>{`
        .home-silent-empire * { box-sizing: border-box; }
        .home-silent-empire nav button:hover .absolute { width: 100%; }
        .home-silent-empire .advantage-card:hover {
          transform: perspective(1000px) rotateX(2deg);
          box-shadow: 0 20px 40px rgba(184, 158, 110, 0.12);
        }
        .home-marquee-track {
          display: flex;
          width: max-content;
          gap: 1.5rem;
          padding: 0 0.5rem;
        }
        .home-marquee-item:hover {
          background: rgba(184, 158, 110, 0.12) !important;
          border-color: rgba(184, 158, 110, 0.6) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .home-silent-empire * { animation: none !important; }
          .home-silent-empire .advantage-card:hover { transform: none; }
        }
      `}</style>
    </div>
  );
};

export default Home;
