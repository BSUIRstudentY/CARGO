

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
/**
 * Home.jsx — главная страница «Ethereal Void» 2026
 * Ultra-Minimal Glassmorphism + Parallax
 * ТЗ v4.0: Lenis (в лейауте), GSAP ScrollTrigger, Radial Menu, Timeline, Orbs, Mega CTA
 */
gsap.registerPlugin(ScrollTrigger);
// Компонент одной орбиты с count-up и scroll-эффектом как в «Путь груза»
function StatOrb({ number, suffix, label, reducedMotion }) {
const [count, setCount] = useState(0);
const ref = useRef(null);
const hasAnimated = useRef(false);
useEffect(() => {
if (reducedMotion) {
setCount(number);
return;
    }
const el = ref.current;
if (!el) return;
const observer = new IntersectionObserver(
      ([entry]) => {
if (!entry.isIntersecting || hasAnimated.current) return;
hasAnimated.current = true;
let start = 0;
const duration = 1800;
const startTime = performance.now();
const step = (now) => {
const elapsed = now - startTime;
const progress = Math.min(elapsed / duration, 1);
const eased = 1 - Math.pow(1 - progress, 3);
setCount(Math.round(number * eased));
if (progress < 1) requestAnimationFrame(step);
        };
requestAnimationFrame(step);
      },
      { threshold: 0.3 }
    );
observer.observe(el);
return () => observer.disconnect();
  }, [number, reducedMotion]);
return (
<div
ref={ref}
className="ev-stat-orb group relative flex items-center justify-center rounded-xl md:rounded-2xl bg-[var(--ev-glass)] backdrop-blur-[20px] md:backdrop-blur-[32px] border border-[var(--ev-gold)]/25 hover:border-[var(--ev-gold)] transition-all duration-500 w-28 h-28 md:w-44 md:h-44 lg:w-52 lg:h-52 mx-auto aspect-square"
style={{
boxShadow: '0 0 0 1px rgba(201,169,122,0.08), 0 0 60px -10px var(--ev-gold-glow), inset 0 1px 0 rgba(255,255,255,0.03)',
      }}
>
<div className="absolute inset-0 rounded-xl md:rounded-2xl border border-[var(--ev-gold)]/15 pointer-events-none" />
<div className="absolute inset-[2px] md:inset-[3px] rounded-xl md:rounded-2xl border border-[var(--ev-gold)]/10 pointer-events-none" />
<div className="text-center relative z-10">
<div className="ev-stat-orb-value text-2xl md:text-4xl lg:text-5xl font-ev-display font-light text-[var(--ev-gold)] tracking-tight">
{count}{suffix}
</div>
<div className="ev-stat-orb-label text-[var(--ev-text-muted)] text-[10px] md:text-[11px] lg:text-xs tracking-[0.12em] md:tracking-[0.15em] uppercase mt-1 md:mt-2 font-normal">
{label}
</div>
</div>
</div>
  );
}
// Ripple при клике на кнопку (золотой круг)
function useRipple() {
const runRipple = (e) => {
const btn = e.currentTarget;
const rect = btn.getBoundingClientRect();
const x = e.clientX - rect.left;
const y = e.clientY - rect.top;
const ripple = document.createElement('span');
ripple.className = 'ev-ripple';
ripple.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:0;height:0;border-radius:50%;background:rgba(201,169,122,0.5);transform:translate(-50%,-50%);pointer-events:none;`;
btn.style.position = 'relative';
btn.style.overflow = 'hidden';
btn.appendChild(ripple);
gsap.to(ripple, {
width: rect.width * 2,
height: rect.width * 2,
opacity: 0,
duration: 0.6,
ease: 'power2.out',
onComplete: () => ripple.remove(),
    });
  };
return runRipple;
}
const NAV_LINKS = [
  { href: '#путь-груза', label: 'Путь груза' },
  { href: '#преимущества', label: 'Преимущества' },
  { href: '#цифры', label: 'Цифры' },
  { href: '#партнёры', label: 'Партнёры' },
  { href: '#mega-cta', label: 'Заказать' },
];
const TIMELINE_STEPS = [
  { city: 'Китай', day: 'День 0', desc: 'Выкуп и консолидация на складе' },
  { city: 'Сортировка', day: 'День 3', desc: 'Проверка качества' },
  { city: 'Перевозка', day: 'День 8', desc: 'Карго в пути' },
  { city: 'Таможня', day: 'День 22', desc: 'Упрощённое оформление' },
  { city: 'Беларусь', day: 'День 28', desc: 'Доставка до двери' },
];
const ADVANTAGES = [
  { title: 'Фиксированная цена', desc: '$6/кг · без скрытых платежей', num: '01' },
  { title: '18–35 дней', desc: 'Карго из Китая в Беларусь', num: '02' },
  { title: 'Полная страховка', desc: 'Возврат 100% стоимости', num: '03' },
  { title: 'Проверка товаров', desc: 'От $5 · фото/видео отчёт', num: '04' },
];
const STATS = [
  { number: 1000, suffix: '+', label: 'товаров доставлено' },
  { number: 90, suffix: '%', label: 'клиентов рекомендуют' },
  { number: 5, suffix: '', label: 'складов-партнёров' },
  { number: 24, suffix: '/7', label: 'поддержка' },
];
const PARTNER_NAMES = ['Pinduoduo', 'Taobao', '1688', 'Poizon', 'WeChat', '95', 'GoFish'];
const Home = () => {
const navigate = useNavigate();
const [menuOpen, setMenuOpen] = useState(false);
const [reduceMotion, setReduceMotion] = useState(false);
const [isMobile, setIsMobile] = useState(false);
const heroRef = useRef(null);
const canvasRef = useRef(null);
const particlesApiRef = useRef(null); // { addParticles(px, py) } для спавна по клику
const timelineSectionRef = useRef(null);
const timelineLineRef = useRef(null);
const timelineCardsRef = useRef([]);
const advantagesRef = useRef(null);
const advantagesLineRef = useRef(null);
const advantagesCardsRef = useRef([]);
const statsSectionRef = useRef(null);
const statsLineRef = useRef(null);
const statsOrbsRef = useRef([]);
const ctaSphereRef = useRef(null);
const marqueeContentRef = useRef(null);
const ripple = useRipple();
// Reduce motion + mobile
useEffect(() => {
const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
const check = () => setReduceMotion(mq.matches);
check();
mq.addEventListener('change', check);
return () => mq.removeEventListener('change', check);
  }, []);
useEffect(() => {
const mq = window.matchMedia('(max-width: 767px)');
const check = () => setIsMobile(mq.matches);
check();
mq.addEventListener('change', check);
return () => mq.removeEventListener('change', check);
  }, []);
// ScrollTrigger: Lenis запускается в AppLayout/GuestLayout — здесь только анимации по скроллу
useEffect(() => {
ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' });
return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);
// Canvas — золотые линии + спавн частиц по клику
useEffect(() => {
const canvas = canvasRef.current;
if (!canvas || reduceMotion) return;
const ctx = canvas.getContext('2d');
let width = 0,
height = 0;
const particlesRef = { current: [] };
const resize = () => {
width = canvas.width = window.innerWidth;
height = canvas.height = window.innerHeight;
    };
resize();
window.addEventListener('resize', resize);
class Particle {
constructor(initX, initY) {
this.x = initX ?? Math.random() * width;
this.y = initY ?? Math.random() * height;
this.size = Math.random() * 1.5 + 0.5;
this.speedX = (Math.random() - 0.5) * 0.3;
this.speedY = (Math.random() - 0.5) * 0.3;
this.opacity = Math.random() * 0.4 + 0.1;
      }
update() {
this.x += this.speedX;
this.y += this.speedY;
if (this.x < 0 || this.x > width) this.speedX *= -1;
if (this.y < 0 || this.y > height) this.speedY *= -1;
      }
draw() {
ctx.fillStyle = `rgba(201, 169, 122, ${this.opacity})`;
ctx.beginPath();
ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
ctx.fill();
      }
    }
for (let i = 0; i < 100; i++) particlesRef.current.push(new Particle());
particlesApiRef.current = {
addParticles(px, py) {
const count = 3 + Math.floor(Math.random() * 2); // 3 или 4 точки
for (let i = 0; i < count; i++) {
const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
const dist = 8 + Math.random() * 12;
const x = px + Math.cos(angle) * dist;
const y = py + Math.sin(angle) * dist;
const p = new Particle(x, y);
p.speedX = (Math.random() - 0.5) * 0.2;
p.speedY = (Math.random() - 0.5) * 0.2;
p.opacity = 0.2 + Math.random() * 0.4;
particlesRef.current.push(p);
        }
      },
    };
let frame = 0;
const animate = () => {
ctx.fillStyle = 'rgba(5, 5, 5, 0.06)';
ctx.fillRect(0, 0, width, height);
const particles = particlesRef.current;
particles.forEach((p, i) => {
p.update();
p.draw();
for (let j = i + 1; j < particles.length; j++) {
const dx = particles[j].x - p.x;
const dy = particles[j].y - p.y;
const d = Math.sqrt(dx * dx + dy * dy);
if (d < 140) {
ctx.strokeStyle = `rgba(201, 169, 122, ${0.12 * (1 - d / 140)})`;
ctx.lineWidth = 0.6;
ctx.beginPath();
ctx.moveTo(p.x, p.y);
ctx.lineTo(particles[j].x, particles[j].y);
ctx.stroke();
          }
        }
      });
frame++;
requestAnimationFrame(animate);
    };
animate();
return () => {
particlesApiRef.current = null;
window.removeEventListener('resize', resize);
    };
  }, [reduceMotion]);
// ScrollTrigger: Hero canvas parallax (движение в противоположную сторону)
useEffect(() => {
if (reduceMotion || !canvasRef.current) return;
gsap.to(canvasRef.current, {
y: () => window.innerHeight * 0.3,
ease: 'none',
scrollTrigger: {
trigger: heroRef.current,
start: 'top top',
end: 'bottom top',
scrub: 1,
      },
    });
  }, [reduceMotion]);
// Timeline (#путь-груза): вертикальная линия по центру, загорается только кружок с номером, bidirectional
  useLayoutEffect(() => {
    if (reduceMotion || !timelineLineRef.current || !timelineSectionRef.current) return;
    const section = timelineSectionRef.current;
    const line = timelineLineRef.current;
    const cards = timelineCardsRef.current.filter(Boolean);
    const numEls = cards.map((el) => el && el.querySelector('.ev-timeline-card-num')).filter(Boolean);
    const DUR = 0.65;
    const EASE = 'power3.out';
    const sleep = { opacity: 0, y: 60, scale: 0.92, borderColor: 'rgba(201,169,122,0.12)', boxShadow: 'none' };
    const awake = {
      opacity: 1,
      y: -8,
      scale: 1.04,
      borderColor: 'rgba(201,169,122,0.95)',
      boxShadow: '0 0 0 1px rgba(201,169,122,0.6), 0 0 22px rgba(201,169,122,0.4)',
    };
    gsap.set(numEls, sleep);
    const setActive = (el, active) => {
      if (!el) return;
      if (active) {
        el.classList.add('--active');
        gsap.to(el, { ...awake, duration: DUR, ease: EASE, overwrite: true });
      } else {
        el.classList.remove('--active');
        gsap.to(el, { ...sleep, duration: DUR, ease: EASE, overwrite: true });
      }
    };
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      end: 'bottom 80%',
      scrub: 0.35,
      onUpdate: (self) => {
        const progress = self.progress;
        gsap.set(line, { scaleY: progress, transformOrigin: 'top center' });
        const sectionRect = section.getBoundingClientRect();
        const lineHeadY = sectionRect.top + progress * sectionRect.height;
        cards.forEach((card, i) => {
          if (!card) return;
          const numEl = numEls[i];
          if (!numEl) return;
          const rect = card.getBoundingClientRect();
          const cardCenterY = rect.top + rect.height / 2;
          const offset = rect.height * 0.3;
          const active = lineHeadY >= cardCenterY - offset;
          if (numEl.classList.contains('--active') !== active) setActive(numEl, active);
        });
      },
    });
    gsap.set(line, { scaleY: 0, transformOrigin: 'top center' });
    return () => {
      st.kill();
      numEls.forEach((el) => {
        if (el) {
          el.classList.remove('--active');
          gsap.set(el, { ...sleep });
        }
      });
    };
  }, [reduceMotion]);

  // Advantages (#преимущества): на десктопе — pin + линия; на мобильной — просто fade-in карточек
  useLayoutEffect(() => {
    if (reduceMotion || !advantagesLineRef.current || !advantagesRef.current) return;
    const section = advantagesRef.current;
    const line = advantagesLineRef.current;
    const cards = advantagesCardsRef.current.filter(Boolean);
    const DUR = 0.65;
    const EASE = 'power3.out';
    const sleep = { opacity: 0, y: 60, scale: 0.92, borderColor: 'rgba(201,169,122,0.12)', boxShadow: 'none' };
    const awake = {
      opacity: 1,
      y: -8,
      scale: 1.04,
      borderColor: 'rgba(201,169,122,0.95)',
      boxShadow: '0 0 35px rgba(201,169,122,0.45)',
    };

    if (isMobile) {
      gsap.set(line, { scaleX: 1, transformOrigin: 'left center' });
      gsap.set(cards, { opacity: 1, y: 0, scale: 1, borderColor: 'rgba(201,169,122,0.2)', boxShadow: 'none' });
      cards.forEach((el) => el && el.classList.remove('--active'));
      return () => {
        gsap.set(line, { scaleX: 1 });
        cards.forEach((el) => {
          if (el) { el.classList.remove('--active'); gsap.set(el, { opacity: 1, y: 0, scale: 1, clearProps: 'borderColor,boxShadow' }); }
        });
      };
    }

    gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
    gsap.set(cards, sleep);
    const setActive = (el, active) => {
      if (active) {
        el.classList.add('--active');
        gsap.to(el, { ...awake, duration: DUR, ease: EASE, overwrite: true });
      } else {
        el.classList.remove('--active');
        gsap.to(el, { ...sleep, duration: DUR, ease: EASE, overwrite: true });
      }
    };
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top 30%',
      end: '+=100%',
      pin: true,
      scrub: 0.35,
      onUpdate: (self) => {
        const progress = self.progress;
        gsap.set(line, { scaleX: progress, transformOrigin: 'left center' });
        const sectionRect = section.getBoundingClientRect();
        const lineHeadX = sectionRect.left + progress * sectionRect.width;
        cards.forEach((el) => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const cardCenterX = rect.left + rect.width / 2;
          const offset = rect.width * 0.25;
          const active = lineHeadX >= cardCenterX - offset;
          if (el.classList.contains('--active') !== active) setActive(el, active);
        });
      },
    });
    return () => {
      st.kill();
      gsap.set(line, { scaleX: 0 });
      cards.forEach((el) => {
        if (el) {
          el.classList.remove('--active');
          gsap.set(el, { ...sleep });
        }
      });
    };
  }, [reduceMotion, isMobile]);

  // Цифры (#цифры): на десктопе — pin + линия; на мобильной — просто fade-in орбов при скролле
  useLayoutEffect(() => {
    if (reduceMotion || !statsLineRef.current || !statsSectionRef.current) return;
    const section = statsSectionRef.current;
    const line = statsLineRef.current;
    const orbWrappers = statsOrbsRef.current.filter(Boolean);
    const DUR = 0.65;
    const EASE = 'power3.out';
    const sleep = { opacity: 0, y: 60, scale: 0.92, boxShadow: 'none' };
    const awake = { opacity: 1, y: -8, scale: 1.04 };

    if (isMobile) {
      gsap.set(line, { scaleX: 1, transformOrigin: 'right center' });
      gsap.set(orbWrappers, { opacity: 1, y: 0, scale: 1 });
      orbWrappers.forEach((w) => w && w.classList.remove('--active'));
      return () => {
        gsap.set(line, { scaleX: 1 });
        orbWrappers.forEach((wrap) => {
          if (wrap) { wrap.classList.remove('--active'); gsap.set(wrap, { opacity: 1, y: 0, scale: 1 }); }
        });
      };
    }

    gsap.set(line, { scaleX: 0, transformOrigin: 'right center' });
    gsap.set(orbWrappers, sleep);
    const setActive = (wrap, active) => {
      if (active) {
        wrap.classList.add('--active');
        gsap.to(wrap, { ...awake, duration: DUR, ease: EASE, overwrite: true });
      } else {
        wrap.classList.remove('--active');
        gsap.to(wrap, { ...sleep, duration: DUR, ease: EASE, overwrite: true });
      }
    };
    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top 30%',
      end: '+=100%',
      pin: true,
      scrub: 0.35,
      onUpdate: (self) => {
        const progress = self.progress;
        gsap.set(line, { scaleX: progress, transformOrigin: 'right center' });
        const sectionRect = section.getBoundingClientRect();
        const lineHeadX = sectionRect.right - progress * sectionRect.width;
        orbWrappers.forEach((wrap) => {
          if (!wrap) return;
          const el = wrap.querySelector('.ev-stat-orb') || wrap;
          const rect = el.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const offset = rect.width * 0.25;
          const active = lineHeadX <= centerX + offset;
          if (wrap.classList.contains('--active') !== active) setActive(wrap, active);
        });
      },
    });
    return () => {
      st.kill();
      gsap.set(line, { scaleX: 0 });
      orbWrappers.forEach((wrap) => {
        if (wrap) {
          wrap.classList.remove('--active');
          gsap.set(wrap, { ...sleep });
        }
      });
    };
  }, [reduceMotion, isMobile]);
// Radial Menu: открытие/закрытие с stagger
useEffect(() => {
const links = document.querySelectorAll('.radial-menu-link');
if (!links.length) return;
if (menuOpen) {
gsap.set(links, { opacity: 0, scale: 0.5 });
gsap.to(links, {
opacity: 1,
scale: 1,
duration: 0.4,
stagger: 0.06,
ease: 'back.out(1.2)',
      });
    } else {
gsap.to(links, { opacity: 0, scale: 0.5, duration: 0.2, stagger: 0.02 });
    }
  }, [menuOpen]);
// Блокировка скролла при открытом мобильном меню
useEffect(() => {
if (menuOpen) document.body.style.overflow = 'hidden';
else document.body.style.overflow = '';
return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);
// Горизонтальная лента партнёров — GSAP (надёжная прокрутка)
useEffect(() => {
const content = marqueeContentRef.current;
if (!content || reduceMotion) return;
let tween;
const run = () => {
const firstCopy = content.firstElementChild;
if (!firstCopy) return;
const copyWidth = firstCopy.offsetWidth;
if (copyWidth === 0) {
requestAnimationFrame(run);
return;
      }
gsap.set(content, { x: 0 });
tween = gsap.to(content, {
x: -copyWidth,
duration: 35,
repeat: -1,
ease: 'none',
      });
    };
const id = requestAnimationFrame(run);
const onResize = () => {
if (tween) tween.kill();
const firstCopy = content.firstElementChild;
const w = firstCopy ? firstCopy.offsetWidth : 0;
if (w > 0) {
gsap.set(content, { x: 0 });
tween = gsap.to(content, { x: -w, duration: 35, repeat: -1, ease: 'none' });
      }
    };
window.addEventListener('resize', onResize);
return () => {
cancelAnimationFrame(id);
if (tween) tween.kill();
window.removeEventListener('resize', onResize);
    };
  }, [reduceMotion]);
// CTA: переход в калькулятор + ripple и лёгкие частицы при клике
const handleCtaClick = (e) => {
ripple(e);
if (!reduceMotion && ctaSphereRef.current) {
const rect = ctaSphereRef.current.getBoundingClientRect();
const cx = rect.left + rect.width / 2;
const cy = rect.top + rect.height / 2;
for (let i = 0; i < 8; i++) {
const p = document.createElement('div');
p.className = 'ev-particle';
const angle = (i / 8) * Math.PI * 2;
const dist = 60;
p.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:6px;height:6px;border-radius:50%;background:var(--ev-gold);pointer-events:none;z-index:9999;`;
document.body.appendChild(p);
gsap.to(p, {
x: Math.cos(angle) * dist * 2,
y: Math.sin(angle) * dist * 2,
opacity: 0,
scale: 0,
duration: 0.6,
ease: 'power2.out',
onComplete: () => p.remove(),
        });
      }
    }
navigate('/calculator');
  };
return (
<div className="min-h-screen bg-[var(--ev-void)] text-[var(--ev-text)] overflow-x-hidden font-ev-body antialiased">
<Helmet>
<title>Fluvion — Ethereal Void | Доставка из Китая в Беларусь</title>
<meta name="description" content="Доставка товаров из Китая за 18–35 дней. $6/кг. Минимализм 2026." />
</Helmet>
{/* Grain overlay */}
<div className="grain-overlay" aria-hidden="true" />
{/* HEADER — glass 64px */}
<header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 md:px-6 bg-[var(--ev-glass)] backdrop-blur-[32px] border-b border-[var(--ev-gold-soft)]">
<div className="max-w-screen-2xl mx-auto w-full flex items-center justify-between">
<a href="/" className="flex items-center gap-2">
<span className="ev-logo-tint block h-7 w-7 shrink-0" style={{ maskImage: 'url(/logo.png)', WebkitMaskImage: 'url(/logo.png)' }} aria-hidden />
<span className="text-xl font-ev-display font-light tracking-[-0.04em]">Fluvion</span>
</a>
<nav className="hidden md:flex items-center gap-10 text-[15px]">
{NAV_LINKS.map(({ href, label }) => (
<a
key={label}
href={href}
className="relative py-1 text-[var(--ev-text-muted)] hover:text-[var(--ev-text)] transition-colors group"
>
{label}
<span className="absolute bottom-0 left-0 w-0 h-px bg-[var(--ev-gold)] group-hover:w-full transition-all duration-300" />
</a>
            ))}
</nav>
{/* Desktop: placeholder для выравнивания; mobile — орб внизу справа */}
<div className="w-12 h-12 md:hidden" />
</div>
</header>
{/* Mobile: Floating Gold Orb (48×48, правый нижний угол) */}
<button
onClick={() => setMenuOpen(!menuOpen)}
aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
className="md:hidden fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-[var(--ev-gold)] flex items-center justify-center shadow-[0_0_40px_var(--ev-gold-glow)] hover:scale-110 active:scale-95 transition-transform animate-breathing border border-[var(--ev-gold)]/30"
>
<span className="text-[var(--ev-void)] text-xl font-normal">{menuOpen ? '×' : '☰'}</span>
</button>
{/* Radial Glass Menu (mobile) */}
{menuOpen && (
<div
className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
onClick={() => setMenuOpen(false)}
aria-hidden="false"
>
<div
className="relative w-[min(320px,85vw)] h-[min(320px,85vw)] rounded-full border border-[var(--ev-gold)]/30 bg-[var(--ev-glass)] backdrop-blur-[40px] shadow-2xl flex items-center justify-center"
onClick={(e) => e.stopPropagation()}
>
{NAV_LINKS.map(({ href, label }, i) => {
const angle = (i / NAV_LINKS.length) * Math.PI * 2 - Math.PI / 2;
const r = 100;
const x = Math.cos(angle) * r;
const y = Math.sin(angle) * r;
return (
<a
key={label}
href={href}
className="radial-menu-link absolute px-4 py-2 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/20 hover:border-[var(--ev-gold)] hover:shadow-[0_0_30px_var(--ev-gold-soft)] transition-colors text-sm font-normal"
style={{
left: `calc(50% + ${x}px)`,
top: `calc(50% + ${y}px)`,
transform: 'translate(-50%, -50%)',
                  }}
onClick={() => setMenuOpen(false)}
>
{label}
</a>
              );
            })}
<button
onClick={() => setMenuOpen(false)}
className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs tracking-[0.2em] text-[var(--ev-gold)]"
>
              ЗАКРЫТЬ
</button>
</div>
</div>
      )}
{/* HERO — 100vh. Клик в любом месте — спавн частиц. */}
<section
ref={heroRef}
className="relative min-h-screen flex items-center justify-center overflow-hidden cursor-crosshair"
onClick={(e) => {
const canvas = canvasRef.current;
if (!canvas || !particlesApiRef.current) return;
const rect = canvas.getBoundingClientRect();
const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;
const px = (e.clientX - rect.left) * scaleX;
const py = (e.clientY - rect.top) * scaleY;
particlesApiRef.current.addParticles(px, py);
        }}
>
<canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full pointer-events-none" aria-hidden />
<div className="relative z-10 text-center px-4 md:px-6 max-w-4xl mx-auto pt-12 md:pt-16">
<p className="mb-2 md:mb-4 text-lg md:text-xl font-ev-display font-light text-[var(--ev-gold)] tracking-[-0.02em]">Fluvion</p>
<h1 className="font-ev-display text-3xl md:text-[68px] leading-tight tracking-[-0.04em] font-light mb-4 md:mb-6 text-balance">
            Доставка
<br />
            из Китая
</h1>
<p className="text-[13px] md:text-[17px] text-[var(--ev-text-muted)] max-w-md mx-auto mb-6 md:mb-10 leading-[1.6] md:leading-[1.75]">
            Тишина космоса. Товар уже в пути.
</p>
<button
onClick={(e) => {
ripple(e);
navigate('/terminal');
            }}
className="group relative px-8 py-3.5 md:px-12 md:py-5 text-sm md:text-base font-normal rounded-xl md:rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/30 hover:border-[var(--ev-gold)] backdrop-blur-[20px] md:backdrop-blur-[24px] transition-all hover:shadow-[0_0_40px_var(--ev-gold-glow)] active:scale-[0.98] overflow-hidden"
>
<span className="relative z-10 flex items-center gap-2">
              Заказать груз
<span className="text-[var(--ev-gold)] group-hover:translate-x-1 transition-transform">→</span>
</span>
</button>
</div>
<p className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 text-[var(--ev-text-muted)] text-xs md:text-sm">
          $6/кг · 18–35 дней
</p>
<p className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 ev-label text-[var(--ev-gold)]/50 md:text-[var(--ev-gold)]/60">
          SCROLL ↓
</p>
</section>
{/* ПУТЬ ГРУЗА */}
<section
id="путь-груза"
ref={timelineSectionRef}
className="relative py-12 md:py-20 lg:py-32 bg-[var(--ev-void)]"
>
<div className="max-w-screen-2xl mx-auto px-4 md:px-6">
<div className="text-center mb-10 md:mb-16 lg:mb-20">
<p className="ev-label text-[var(--ev-gold)] mb-2 md:mb-3">ПУТЬ ГРУЗА</p>
<h2 className="font-ev-display text-2xl md:text-3xl lg:text-5xl font-light tracking-[-0.03em] text-[var(--ev-gold)]">
              От Китая до твоей двери
</h2>
</div>
<div className="relative max-w-2xl mx-auto">
<div
ref={timelineLineRef}
className="absolute left-1/2 top-0 bottom-0 w-px md:w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-[var(--ev-gold)] to-transparent opacity-80 md:opacity-90"
style={{ transformOrigin: 'top center' }}
/>
{TIMELINE_STEPS.map((step, i) => (
<div
key={i}
ref={(el) => (timelineCardsRef.current[i] = el)}
className="relative flex items-start gap-3 md:gap-4 min-h-[72px] md:min-h-[80px] mb-10 md:mb-16 last:mb-0"
>
<div className="flex-1 min-w-0 text-right pr-1 md:pr-2">
<p className="text-[var(--ev-gold)]/80 text-[11px] md:text-sm mb-0.5 md:mb-1">{step.day}</p>
<h3 className="text-[var(--ev-text)] text-base md:text-xl lg:text-2xl font-normal mb-1 md:mb-2 ev-timeline-card-title">{step.city}</h3>
<p className="text-[var(--ev-text-muted)] text-[13px] md:text-[15px] lg:text-[17px] leading-[1.6] md:leading-[1.75] ev-timeline-card-desc">
{step.desc}
</p>
</div>
<div className="flex shrink-0 w-12 md:w-14 lg:w-16 flex items-center justify-center">
<div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl md:rounded-2xl bg-[var(--ev-glass)] backdrop-blur-[20px] md:backdrop-blur-[24px] border border-[var(--ev-gold)]/20 flex items-center justify-center text-lg md:text-xl lg:text-2xl font-ev-display font-light text-[var(--ev-gold)] ev-timeline-card-num">
{i + 1}
</div>
</div>
<div className="flex-1 min-w-0 w-3 md:w-4 shrink-0" aria-hidden />
</div>
            ))}
</div>
</div>
</section>
{/* ПРЕИМУЩЕСТВА */}
<section id="преимущества" ref={advantagesRef} className="py-12 md:py-20 lg:py-32 relative border-t border-[var(--ev-gold)]/[0.06] md:border-[var(--ev-gold)]/[0.08] overflow-visible">
<div className="max-w-screen-2xl mx-auto px-4 md:px-6">
<div className="relative max-w-5xl mx-auto">
<p className="ev-label text-[var(--ev-gold)] mb-2 md:mb-3 text-center">ПОЧЕМУ МЫ</p>
<h2 className="font-ev-display text-2xl md:text-3xl lg:text-5xl font-light tracking-[-0.03em] mb-10 md:mb-16 lg:mb-24 text-center">
              Просто и надёжно
</h2>
<div className="relative min-h-[200px] md:min-h-[280px] lg:min-h-[320px] flex flex-col justify-center">
<div
ref={advantagesLineRef}
className="absolute left-0 right-0 top-1/2 h-px md:h-[2px] -translate-y-1/2 bg-gradient-to-r from-transparent via-[var(--ev-gold)] to-transparent opacity-80 md:opacity-90 origin-left"
style={{ transformOrigin: 'left center' }}
/>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 relative z-10">
{ADVANTAGES.map((adv, i) => (
<div
key={i}
ref={(el) => (advantagesCardsRef.current[i] = el)}
className="rounded-xl md:rounded-2xl bg-[var(--ev-glass)] backdrop-blur-[20px] md:backdrop-blur-[24px] p-4 md:p-6 lg:p-8 border border-[var(--ev-gold)]/15 md:border-[var(--ev-gold)]/20 hover:border-[var(--ev-gold)]/40 md:hover:border-[var(--ev-gold)]/50 transition-all duration-300"
>
<h3 className="font-ev-display text-base md:text-lg lg:text-xl font-light text-[var(--ev-text)] mb-1 md:mb-2">
{adv.title}
</h3>
<p className="text-[var(--ev-text-muted)] text-[12px] md:text-sm leading-relaxed">
{adv.desc}
</p>
</div>
              ))}
</div>
</div>
</div>
</div>
</section>
{/* ЦИФРЫ */}
<section id="цифры" ref={statsSectionRef} className="py-12 md:py-20 lg:py-32 bg-[var(--ev-void)] border-t border-[var(--ev-gold)]/[0.06] md:border-[var(--ev-gold)]/[0.08] relative overflow-visible">
  <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
    <div className="relative max-w-4xl mx-auto">
      <p className="ev-label text-[var(--ev-gold)] mb-2 md:mb-3 text-center">ЦИФРЫ</p>
      <h2 className="font-ev-display text-2xl md:text-3xl lg:text-5xl font-light tracking-[-0.03em] mb-8 md:mb-16 lg:mb-20 text-center">
        В цифрах
      </h2>

      <div className="relative min-h-[200px] md:min-h-[260px] lg:min-h-[300px] flex flex-col justify-center">
        <div
          ref={statsLineRef}
          className="absolute left-0 right-0 top-1/2 h-px md:h-[2px] -translate-y-1/2 bg-gradient-to-r from-transparent via-[var(--ev-gold)] to-transparent opacity-80 md:opacity-90 origin-right"
          style={{ transformOrigin: 'right center' }}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 relative z-10">
          {STATS.map((stat, i) => (
            <div
              key={i}
              ref={(el) => (statsOrbsRef.current[i] = el)}
              className="flex items-center justify-center"
            >
              <StatOrb
                number={stat.number}
                suffix={stat.suffix}
                label={stat.label}
                reducedMotion={reduceMotion}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
</section>
{/* ПАРТНЁРЫ */}
<section id="партнёры" className="py-8 md:py-12 lg:py-16 border-t border-[var(--ev-gold)]/10 overflow-hidden">
<div className="ev-marquee-track">
<div ref={marqueeContentRef} className="ev-marquee-content flex w-max">
{[1, 2].map((block) => (
<div key={block} className="flex gap-4 md:gap-8 lg:gap-10 items-center shrink-0 pr-4 md:pr-8 lg:pr-10">
{PARTNER_NAMES.map((name, i) => (
<div
key={`${block}-${i}`}
className="px-3 py-2 md:px-6 md:py-4 rounded-lg md:rounded-2xl bg-[var(--ev-glass)] backdrop-blur-md border border-[var(--ev-gold)]/10 hover:border-[var(--ev-gold)] text-[13px] md:text-base font-normal whitespace-nowrap transition-all duration-300"
>
{name}
</div>
                ))}
</div>
            ))}
</div>
</div>
</section>
{/* CTA */}
<section
id="mega-cta"
className="min-h-[70vh] md:min-h-screen flex items-center justify-center relative overflow-hidden bg-[var(--ev-void)] border-t border-[var(--ev-gold)]/[0.06] md:border-[var(--ev-gold)]/[0.08]"
>
<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--ev-gold)_0.5px,transparent_1px)] bg-[length:32px_32px] md:bg-[length:40px_40px] opacity-[0.04] md:opacity-[0.06]" />
<div className="relative z-10 text-center px-4 md:px-6">
<p className="ev-label text-[var(--ev-gold)] mb-3 md:mb-4">
            УЗНАЙ СТОИМОСТЬ
</p>
<h2 className="font-ev-display text-2xl md:text-3xl lg:text-5xl font-light leading-tight mb-3 md:mb-4 lg:mb-6">
            Сколько весит
<br />
            твой заказ?
</h2>
<p className="text-[var(--ev-text-muted)] text-[12px] md:text-base mb-8 md:mb-10 max-w-md mx-auto">
            Введи вес и габариты — получи расчёт за секунды.
</p>
<button
ref={ctaSphereRef}
onClick={handleCtaClick}
className="group relative inline-flex items-center gap-2 md:gap-3 px-6 py-3 md:px-10 md:py-5 rounded-xl md:rounded-2xl bg-[var(--ev-glass)] backdrop-blur-[20px] md:backdrop-blur-[24px] border border-[var(--ev-gold)]/25 md:border-[var(--ev-gold)]/30 hover:border-[var(--ev-gold)] transition-all duration-300 active:scale-[0.98] overflow-hidden"
>
<span className="font-ev-display font-light text-[var(--ev-text)] text-base md:text-lg lg:text-xl tracking-tight">
              Рассчитать вес
</span>
<span className="text-[var(--ev-gold)] text-lg md:text-xl group-hover:translate-x-0.5 transition-transform">→</span>
</button>
</div>
</section>
{/* FOOTER */}
<footer className="border-t border-[var(--ev-gold)]/10 py-8 md:py-12 lg:py-16 bg-[var(--ev-glass)] backdrop-blur-[20px] md:backdrop-blur-[24px]">
<div className="max-w-screen-2xl mx-auto px-4 md:px-6">
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 items-center">
<div>
<div className="flex items-center gap-2 mb-2 md:mb-3">
<div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-[var(--ev-gold)] flex-shrink-0" />
<span className="font-ev-display font-light text-lg md:text-xl">Fluvion</span>
</div>
<p className="text-[var(--ev-text-muted)] text-[12px] md:text-sm">Прямо из Китая. С любовью в Беларусь.</p>
</div>
<div className="flex justify-center overflow-hidden">
<div className="flex gap-4 md:gap-8 shrink-0 max-w-full">
{[...PARTNER_NAMES.slice(0, 5), ...PARTNER_NAMES.slice(0, 5)].map((name, i) => (
<span
key={i}
className="text-[10px] md:text-xs text-[var(--ev-text-muted)] opacity-70 hover:opacity-100 hover:text-[var(--ev-gold)] transition-colors whitespace-nowrap"
>
{name}
</span>
                ))}
</div>
</div>
<div className="text-center md:text-right">
<a
href="#"
className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--ev-gold)] text-[var(--ev-void)] font-normal text-sm md:text-base hover:scale-110 transition-transform"
aria-label="Telegram"
>
                TG
</a>
<p className="text-[10px] md:text-xs text-[var(--ev-text-muted)] mt-3 md:mt-4">Контакты · Telegram-бот</p>
</div>
</div>
<div className="mt-8 md:mt-10 pt-4 md:pt-6 border-t border-[var(--ev-gold)]/10 text-center text-[10px] md:text-xs text-[var(--ev-text-muted)]">
            © 2026 Fluvion · <span className="text-[var(--ev-gold)]">Прямо из Китая</span>
</div>
</div>
</footer>
<style>{`
        .ev-ripple { will-change: transform, opacity; }
        .ev-particle { will-change: transform, opacity; }
        .ev-marquee-track { overflow: hidden; width: 100%; }
        .ev-marquee-content { will-change: transform; }
        /* Только бордер + лёгкий ореол у кружков; без свечения всего блока */
        .--active {
          border-color: rgba(201, 169, 122, 0.95) !important;
          box-shadow: 0 0 0 1px rgba(201, 169, 122, 0.5), 0 0 22px rgba(201, 169, 122, 0.4) !important;
        }
        .ev-timeline-card-num.--active {
          border-color: rgba(201, 169, 122, 0.95);
          box-shadow: 0 0 0 1px rgba(201, 169, 122, 0.6), 0 0 22px rgba(201, 169, 122, 0.4), inset 0 0 12px rgba(201, 169, 122, 0.08);
        }
        .--active .ev-stat-orb {
          border-color: rgba(201, 169, 122, 0.95) !important;
          box-shadow: 0 0 0 1px rgba(201, 169, 122, 0.6), 0 0 22px rgba(201, 169, 122, 0.4), inset 0 0 12px rgba(201, 169, 122, 0.08) !important;
        }
        .--active .ev-stat-orb .ev-stat-orb-value {
          color: #e8d4b8 !important;
          text-shadow: 0 0 16px rgba(201, 169, 122, 0.35);
        }
        .--active .ev-stat-orb .ev-stat-orb-label {
          color: rgba(201, 169, 122, 0.9) !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee, .animate-marquee-fast, .animate-spin-slow, .animate-breathing { animation: none; }
        }
      `}</style>
</div>
  );
};
export default Home;
 