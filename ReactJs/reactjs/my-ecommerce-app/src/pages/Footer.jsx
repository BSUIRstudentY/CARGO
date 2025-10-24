import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-primary font-sans text-accent-primary py-12 mt-auto border-t-4 border-accent-primary relative z-10">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Address and Contact Info */}
          <div className="md:col-span-2">
            <h4 className="text-xl font-semibold font-display text-accent-primary mb-4">Наш адрес и телефоны</h4>
            <p className="text-accent-primary mb-4">
              <strong>Индивидуальный предприниматель Ковалевский Ярослав Андреевич</strong><br />
              УНП 693299414<br />
              223710, Республика Беларусь, г. Солигорск, ул. Железнодорожная 6<br />
              Свидетельство о государственной регистрации №755693886000, выдано Солигорским райисполкомом 18.06.2025 г.
            </p>
            <div className="space-y-2">
              {[
                { href: 'tel:+375336540611', label: '+375 33 654 06-11' },
                {label: "Время работы: круглосуточно"}
                
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
                    className="text-accent-primary hover:text-accent-primary/80 transition-all duration-300 block"
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
              <h4 className="text-xl font-semibold font-display text-accent-primary mb-4">Информация</h4>
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
                        className="w-full text-left px-4 py-2 rounded-lg bg-tertiary backdrop-blur-lg border border-accent-primary/20 shadow-card hover:shadow-accent-primary/20 text-accent-primary hover:text-accent-primary/80 transition-all duration-300"
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
              <h4 className="text-xl font-semibold font-display text-accent-primary mb-4">Наша компания</h4>
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
                        className="w-full text-left px-4 py-2 rounded-lg bg-tertiary backdrop-blur-lg border border-accent-primary/20 shadow-card hover:shadow-accent-primary/20 text-accent-primary hover:text-accent-primary/80 transition-all duration-300"
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
        <hr className="my-6 border-accent-primary/50" />
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-accent-primary mb-4 md:mb-0">© 2025 Fluvion</p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;