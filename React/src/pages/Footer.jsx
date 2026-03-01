import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer — Ethereal Void 2026 (текущий дизайн)
 * Стиль как в хедере: glass, gold-soft границы, лого, юрданные, способы оплаты, копирайт.
 */
const Footer = ({ id }) => {
  const infoLinks = [
    { path: '/public-offer', label: 'Оферта' },
    { path: '/delivery-payment', label: 'Доставка и оплата' },
    { path: '/privacy-policy', label: 'Конфиденциальность' },
    { path: '/user-agreement', label: 'Согласие на обработку' },
    { path: '/faq', label: 'FAQ' },
    { path: '/reviews', label: 'Отзывы' },
  ];

  return (
    <footer
      id={id}
      className="border-t border-[var(--ev-gold-soft)] bg-[var(--ev-glass)] backdrop-blur-[32px] py-8 md:py-12"
    >
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
        {/* Лого + слоган — как в хедере */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--ev-gold)]" />
            <span className="font-[var(--ev-font-display)] font-light text-lg text-[var(--ev-text)]">Fluvion</span>
          </div>
          <p className="text-[var(--ev-text-muted)] text-sm">Прямо из Китая. С любовью в Беларусь.</p>
        </div>

        {/* Быстрые ссылки */}
        <nav className="flex flex-wrap gap-x-6 gap-y-2 mb-8 text-sm">
          {infoLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-[var(--ev-text-muted)] hover:text-[var(--ev-gold)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Юридическая информация */}
        <div className="border-t border-[var(--ev-gold-soft)] pt-6 mb-6">
          <h4 className="ev-label text-[var(--ev-gold)] mb-4">
            Юридическая информация
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[var(--ev-text-muted)]">
            <div className="space-y-1">
              <p className="text-[var(--ev-text)] font-medium">ИП Ковалевский Ярослав Андреевич</p>
              <p>УНП: 693299414</p>
              <p>Дата регистрации: 16.06.2025</p>
              <p>Солигорский райисполком</p>
            </div>
            <div className="space-y-1">
              <p className="text-[var(--ev-text)] font-medium">Юридический адрес</p>
              <p>Минск, Якуба Коласа 28</p>
              <p>
                <a href="tel:+375336540611" className="hover:text-[var(--ev-gold)] transition-colors">
                  +375 33 654-06-11
                </a>
              </p>
              <p>
                <a href="mailto:fluvionbiz@gmail.com" className="hover:text-[var(--ev-gold)] transition-colors">
                  fluvionbiz@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Способы оплаты — логотипы из payment-logos */}
        <div className="mb-6">
          <h4 className="ev-label text-[var(--ev-gold)] mb-3">
            Способы оплаты
          </h4>
          <div className="flex flex-wrap items-center gap-4">
            {['visa', 'mastercard', 'belkart', 'bepaid', 'erip', 'gpay', 'apple-pay', 'samsung-pay'].map((name) => (
              <img
                key={name}
                src={`/payment-logos/${name}.svg`}
                alt={name}
                className="h-6 md:h-7 w-auto opacity-75 hover:opacity-100 transition-opacity object-contain"
              />
            ))}
          </div>
        </div>

        {/* Копирайт + TG — нижняя строка */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-[var(--ev-gold-soft)]">
          <p className="ev-label text-[var(--ev-text-muted)]">
            © {new Date().getFullYear()} Fluvion · <span className="text-[var(--ev-gold)]">Прямо из Китая</span>
          </p>
          <a
            href="https://t.me/FLUVIONN"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--ev-gold)] text-[var(--ev-void)] font-medium text-sm hover:opacity-90 hover:scale-105 transition-all"
            aria-label="Telegram"
          >
            TG
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
