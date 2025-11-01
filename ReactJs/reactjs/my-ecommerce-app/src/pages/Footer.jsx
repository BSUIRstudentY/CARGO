// Footer.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  ClockIcon, 
  ShieldCheckIcon, 
  TruckIcon, 
  DocumentTextIcon,
  LockClosedIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const navigate = useNavigate();

  const infoLinks = [
    { path: '/public-offer', label: 'Публичная оферта', icon: <DocumentTextIcon className="w-5 h-5" /> },
    { path: '/delivery-payment', label: 'Доставка и оплата', icon: <TruckIcon className="w-5 h-5" /> },
    { path: '/privacy-policy', label: 'Политика конфиденциальности', icon: <LockClosedIcon className="w-5 h-5" /> },
    { path: '/user-agreement', label: 'Согласие на обработку', icon: <ShieldCheckIcon className="w-5 h-5" /> },
    { path: '/faq', label: 'Частые вопросы (FAQ)', icon: <QuestionMarkCircleIcon className="w-5 h-5" /> },
    { path: '/reviews', label: 'Отзывы клиентов', icon: <SparklesIcon className="w-5 h-5" /> },
    { path: '/support', label: 'Техподдержка', icon: <ChatBubbleLeftRightIcon className="w-5 h-5" /> },
    { path: '/how-to-buy', label: 'Как покупать?', icon: <AcademicCapIcon className="w-5 h-5" /> },
  ];

  const advantages = [
    { icon: <TruckIcon className="w-5 h-5" />, text: 'Доставка по РБ' },
    { icon: <CurrencyDollarIcon className="w-5 h-5" />, text: 'Лучшие цены' },
    { icon: <ShieldCheckIcon className="w-5 h-5" />, text: 'Гарантия качества' },
    { icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />, text: 'Поддержка 24/7' },
    { icon: <ClockIcon className="w-5 h-5" />, text: 'От 18 дней доставка' },
    { icon: <LockClosedIcon className="w-5 h-5" />, text: 'Безопасная оплата' },
  ];

  // ОРИГИНАЛЬНЫЕ 9 логотипов — без дублирования
  const paymentLogos = [
    { src: '/logos/color-21.png', alt: 'Visa' },
    { src: '/logos/color-22.png', alt: 'Visa Secure' },
    { src: '/logos/color-23.png', alt: 'MasterCard' },
    { src: '/logos/color-24.png', alt: 'MasterCard ID Check' },
    { src: '/logos/color-25.png', alt: 'Белкарт' },
    { src: '/logos/color-26.png', alt: 'Белкарт ИнтернетПароль' },
    { src: '/logos/color-28.png', alt: 'Samsung Pay' },
    { src: '/logos/color-29.png', alt: 'Альфа-Банк' },
    { src: '/logos/color-30.png', alt: 'Apple Pay' },
  ];

  return (
    <footer className="bg-gradient-to-b from-bg-primary to-bg-secondary/50 border-t-4 border-accent-primary relative overflow-hidden">
      {/* Декоративный градиент */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent-primary/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Левый блок: Логотип + Адрес + Преимущества */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold font-display bg-gradient-to-r from-accent-primary to-accent-muted bg-clip-text text-transparent mb-4">
                FLUVION
              </h3>
              <div className="space-y-3 text-sm text-text-secondary">
                <div className="flex items-start gap-2">
                  <MapPinIcon className="w-5 h-5 text-accent-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white">ИП Ковалевский Ярослав Андреевич</p>
                    <p>УНП 693299414</p>
                    <p>223710, Беларусь, г. Солигорск, ул. Железнодорожная 6</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-accent-primary" />
                  <span className="text-white">Работаем круглосуточно</span>
                </div>
              </div>
            </motion.div>

            {/* 6 преимуществ — 2 ряда × 3 колонки */}
            <div className="grid grid-cols-3 gap-3">
              {advantages.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex flex-col items-center justify-center gap-1 bg-bg-secondary/30 backdrop-blur-sm px-2 py-2 rounded-xl border border-accent-primary/20 hover:border-accent-primary/40 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-accent-primary">{item.icon}</span>
                  <span className="text-xs text-white font-medium text-center leading-tight">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Центральный блок: Полезные ссылки — 8 штук */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h4 className="text-xl font-semibold font-display text-white mb-5">Полезные ссылки</h4>
              <ul className="space-y-2.5">
                {infoLinks.map((link, index) => (
                  <motion.li
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    whileHover={{ x: 4 }}
                  >
                    <button
                      onClick={() => navigate(link.path)}
                      className="group flex items-center gap-3 text-text-secondary hover:text-white transition-all duration-300 w-full text-left"
                    >
                      <span className="text-accent-primary group-hover:scale-110 transition-transform">
                        {link.icon}
                      </span>
                      <span className="text-sm font-medium">{link.label}</span>
                    </button>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Правый блок: Наши партнёры — ОРИГИНАЛЬНЫЕ 9 логотипов */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-bg-secondary/20 backdrop-blur-md rounded-2xl p-5 border border-accent-primary/10 hover:border-accent-primary/30 transition-all duration-300"
            >
              <p className="text-sm font-medium text-white mb-4 text-center">Наши партнёры</p>
              <div className="grid grid-cols-3 gap-3">
                {paymentLogos.map((logo, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-2 flex items-center justify-center hover:bg-white/20 transition-all"
                    title={logo.alt}
                  >
                    <img
                      src={logo.src}
                      alt={logo.alt}
                      className="h-10 w-auto object-contain max-w-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <span className="hidden text-xs text-white/70 font-medium justify-center items-center w-full text-center px-1">
                      {logo.alt}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Нижняя полоса */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 pt-6 border-t border-accent-primary/20 flex flex-col md:flex-row justify-between items-center gap-4 text-sm"
        >
          <p className="text-text-secondary">© 2025 FLUVION — Все права защищены</p>
          <p className="text-text-secondary/70">Сделано с любовью в Беларуси</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;