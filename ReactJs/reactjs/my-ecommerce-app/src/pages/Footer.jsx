import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-cyan-400 py-12 mt-auto border-t-4 border-cyan-400 relative z-10">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="none"%3E%3Crect width="100" height="100" fill="url(%23pattern0)" /%3E%3Cdefs%3E%3Cpattern id="pattern0" patternUnits="userSpaceOnUse" width="50" height="50"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="1"/%3E%3C/pattern%3E%3C/defs%3E%3C/svg%3E')`,
          backgroundRepeat: 'repeat',
          zIndex: 0,
        }}
      ></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Address and Contact Info */}
          <div className="md:col-span-2">
            <h4 className="text-xl font-semibold text-cyan-400 mb-4">Наш адрес и телефоны</h4>
            <p className="text-cyan-400 mb-4">
              <strong>Индивидуальный предприниматель Ковалевский Ярослав Андреевич</strong><br />
              УНП 693299414<br />
              223710, Республика Беларусь, г. Солигорск, ул. Железнодорожная 6<br />
              Свидетельство о государственной регистрации №755693886000, выдано Солигорским горисполкомом 18.06.2025 г.
            </p>
            <div className="space-y-2">
              {[
                { href: 'tel:+375291234567', label: '+375 29 123-45-67' },
                { href: 'tel:+375331234567', label: '+375 33 123-45-67' },
                { href: 'tel:+375251234567', label: '+375 25 123-45-67' },
                { href: 'tel:+375171234567', label: '+375 17 123-45-67' },
              ].map((contact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <a
                    href={contact.href}
                    className="text-cyan-400 hover:text-cyan-200 transition-all duration-300 block"
                    aria-label={`Позвонить по номеру ${contact.label}`}
                  >
                    {contact.label}
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
          {/* Information Links */}
          <div>
            <div className="widget">
              <h4 className="text-xl font-semibold text-cyan-400 mb-4">Информация</h4>
              <ul className="space-y-2">
                {[
                  { path: '/public-offer', label: 'Публичная оферта', aria: 'Перейти к Публичной оферте' },
                  { path: '/delivery-payment', label: 'Доставка и оплата', aria: 'Перейти к Доставке и оплате' },
                  { path: '/privacy-policy', label: 'Политика обработки данных', aria: 'Перейти к Политике обработки данных' },
                  { path: '/user-agreement', label: 'Согласие на обработку данных', aria: 'Перейти к Согласию на обработку данных' },
                ].map((item, index) => (
                  <li key={item.path}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <button
                        onClick={() => navigate(item.path)}
                        className="w-full text-left px-4 py-2 rounded-lg bg-gray-900/30 backdrop-blur-lg border border-cyan-400/20 shadow-lg hover:shadow-cyan-400/20 text-cyan-400 hover:text-cyan-200 transition-all duration-300"
                        aria-label={item.aria}
                      >
                        {item.label}
                      </button>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Company Links */}
          <div>
            <div className="widget">
              <h4 className="text-xl font-semibold text-cyan-400 mb-4">Наша компания</h4>
              <ul className="space-y-2">
                {[
                  { path: '/about', label: 'О компании', aria: 'Перейти к странице О компании' },
                  { path: '/news', label: 'Новости', aria: 'Перейти к странице Новости' },
                  { path: '/vacancies', label: 'Вакансии', aria: 'Перейти к странице Вакансии' },
                  { path: '/contact', label: 'Контакты', aria: 'Перейти к странице Контакты' },
                ].map((item, index) => (
                  <li key={item.path}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <button
                        onClick={() => navigate(item.path)}
                        className="w-full text-left px-4 py-2 rounded-lg bg-gray-900/30 backdrop-blur-lg border border-cyan-400/20 shadow-lg hover:shadow-cyan-400/20 text-cyan-400 hover:text-cyan-200 transition-all duration-300"
                        aria-label={item.aria}
                      >
                        {item.label}
                      </button>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {/* Logo Container */}
        <div className="logo-container pt-7">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {[
              { src: '/logos/color-21.png', alt: 'Visa' },
              { src: '/logos/color-22.png', alt: 'Visa Secure' },
              { src: '/logos/color-23.png', alt: 'MasterCard' },
              { src: '/logos/color-24.png', alt: 'MasterCard ID Check' },
              { src: '/logos/color-25.png', alt: 'Белкарт' },
              { src: '/logos/color-26.png', alt: 'Белкарт ИнтернетПароль' },
              { src: '/logos/color-28.png', alt: 'Samsung Pay' },
              { src: '/logos/color-29.png', alt: 'Альфа-Банк' },
              { src: '/logos/color-30.png', alt: 'Apple Pay' },
            ].map((logo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-12 object-contain mx-auto filter brightness-100 hover:brightness-125 transition-all duration-300"
                />
              </motion.div>
            ))}
          </div>
        </div>
        {/* Divider and Bottom Section */}
        <hr className="my-6 border-gray-700" />
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-cyan-400 mb-4 md:mb-0">© 2025 Fluvion</p>
          <p className="text-cyan-400 animate-pulse">Обновлено: 17.09.2025 20:33 CEST</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;