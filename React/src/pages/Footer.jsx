import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Футер Silent Empire — минимальный, без дублирования контактов с синей секцией.
 * Единственное место с полными реквизитами и контактами.
 */
const FOOTER_NAV = [
  { path: '/public-offer', label: 'Публичная оферта' },
  { path: '/delivery-payment', label: 'Доставка и оплата' },
  { path: '/faq', label: 'FAQ' },
  { path: '/reviews', label: 'Отзывы' },
  { path: '/privacy-policy', label: 'Политика конфиденциальности' },
  { path: '/user-agreement', label: 'Согласие на обработку данных' },
];

const COLORS = {
  navy: '#0F172A',
  gold: '#B89E6E',
};

// Логотипы партнёров (платёжные системы) — из payment-logos
const PARTNERS = [
  { name: 'Visa', logo: '/payment-logos/visa.svg' },
  { name: 'Mastercard', logo: '/payment-logos/mastercard.svg' },
  { name: 'BePaid', logo: '/payment-logos/bepaid.svg' },
  { name: 'ERIP', logo: '/payment-logos/erip.svg' },
  { name: 'Белкарт', logo: '/payment-logos/belkart.svg' },
  { name: 'Apple Pay', logo: '/payment-logos/apple-pay.svg' },
  { name: 'Google Pay', logo: '/payment-logos/gpay.svg' },
  { name: 'Samsung Pay', logo: '/payment-logos/samsung-pay.svg' },
];

const Footer = ({ id }) => (
  <footer
    id={id}
    className="relative border-t text-white"
    style={{
      background: COLORS.navy,
      borderColor: 'rgba(184, 158, 110, 0.2)',
    }}
  >
    <div className="container mx-auto px-6 py-12 md:py-16 max-w-6xl">
      {/* Логотипы партнёров */}
      <div className="mb-10 pb-8 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-4" style={{ fontFamily: 'General Sans, sans-serif' }}>
          Наши партнёры
        </p>
        <div className="flex flex-wrap items-center gap-6 md:gap-8">
          {PARTNERS.map((p) => (
            <img
              key={p.name}
              src={p.logo}
              alt={p.name}
              title={p.name}
              className="h-8 w-auto max-h-8 max-w-[100px] object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8 mb-10">
        <span
          className="text-xl font-black tracking-tight"
          style={{ fontFamily: 'Satoshi, sans-serif', letterSpacing: '-0.02em' }}
        >
          Fluvion
        </span>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {FOOTER_NAV.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="text-sm text-white/80 hover:text-[#B89E6E] transition-colors"
              style={{ fontFamily: 'General Sans, sans-serif' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div
        className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/70 mb-8"
        style={{ fontFamily: 'General Sans, sans-serif' }}
      >
        <a href="tel:+375336540611" className="hover:text-[#B89E6E] transition-colors">
          +375 33 654-06-11
        </a>
        <a href="mailto:fluvionbiz@gmail.com" className="hover:text-[#B89E6E] transition-colors">
          fluvionbiz@gmail.com
        </a>
        <a href="https://t.me/FLUVIONN" target="_blank" rel="noopener noreferrer" className="hover:text-[#B89E6E] transition-colors">
          Telegram
        </a>
        <span>fluvion.by</span>
      </div>

      <div
        className="text-xs text-white/50 space-y-1 pt-6 border-t"
        style={{
          fontFamily: 'General Sans, sans-serif',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <p>ИП Ковалевский Ярослав Андреевич · УНП 693299414</p>
        <p>Юридический адрес: г. Минск, ул. Якуба Коласа, 28 · Солигорский райисполком</p>
      </div>

      <p
        className="text-xs text-white/40 mt-6"
        style={{ fontFamily: 'General Sans, sans-serif' }}
      >
        © {new Date().getFullYear()} Fluvion. Все права защищены. Доставка из Китая в Беларусь.
      </p>
    </div>
  </footer>
);

export default Footer;
