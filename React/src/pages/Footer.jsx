import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

/**
 * Современный Footer с эффектами для сайта доставки из Китая
 */
const Footer = ({ id }) => {
  const navigate = useNavigate();

  const infoLinks = [
    { path: '/public-offer', label: 'Публичная оферта', icon: DocumentTextIcon },
    { path: '/delivery-payment', label: 'Доставка и оплата', icon: TruckIcon },
    { path: '/privacy-policy', label: 'Политика конфиденциальности', icon: LockClosedIcon },
    { path: '/user-agreement', label: 'Согласие на обработку', icon: ShieldCheckIcon },
    { path: '/faq', label: 'Частые вопросы (FAQ)', icon: QuestionMarkCircleIcon },
    { path: '/reviews', label: 'Отзывы клиентов', icon: ChatBubbleLeftRightIcon },
  ];

  const advantages = [
    { icon: TruckIcon, text: 'Доставка по РБ', color: 'from-[#e81e2d] to-[#ff4757]' },
    { icon: CurrencyDollarIcon, text: 'Лучшие цены', color: 'from-[#407CFF] to-[#5a8fff]' },
    { icon: ShieldCheckIcon, text: 'Гарантия качества', color: 'from-[#4caf50] to-[#66bb6a]' },
    { icon: ChatBubbleLeftRightIcon, text: 'Поддержка 24/7', color: 'from-[#ff9800] to-[#ffb74d]' },
    { icon: ClockIcon, text: 'От 18 дней доставка', color: 'from-[#9c27b0] to-[#ba68c8]' },
    { icon: LockClosedIcon, text: 'Безопасная оплата', color: 'from-[#00bcd4] to-[#4dd0e1]' },
  ];

  return (
    <footer id={id} className="relative bg-[#0a0d14] border-t border-[rgba(255,255,255,0.1)]">
      {/* Статичные световые акценты */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(167, 139, 250, 0.06) 0%, transparent 70%)',
          }}
        />
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* О компании */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <TruckIcon className="w-8 h-8 text-[#00f0ff]" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                Fluvion
              </h3>
            </div>
            <p className="text-[#9ca3af] mb-4 leading-relaxed">
              Доставка товаров из Китая в Беларусь под ключ. Надежно, быстро, с гарантией.
            </p>
            <div className="flex flex-col gap-2 text-sm text-[#9ca3af]">
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4" />
                <a href="tel:+375336540611" className="hover:text-[#00f0ff] transition-colors">+375 33 654-06-11</a>
              </div>
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4" />
                <a href="mailto:fluvionbiz@gmail.com" className="hover:text-[#00f0ff] transition-colors">fluvionbiz@gmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4" />
                <span>Беларусь, Минск</span>
              </div>
            </div>
          </motion.div>

          {/* Быстрые ссылки */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="text-lg font-semibold text-[#e5e7eb] mb-6">Информация</h4>
            <ul className="space-y-3">
              {infoLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="flex items-center gap-2 text-[#9ca3af] hover:text-[#00f0ff] transition-colors duration-300 group"
                    >
                      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>

          {/* Преимущества */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold text-[#e5e7eb] mb-6">Преимущества</h4>
            <div className="grid grid-cols-1 gap-3">
              {advantages.map((advantage, index) => {
                const Icon = advantage.icon;
                const accentColors = ['#00f0ff', '#a78bfa', '#10b981', '#00f0ff', '#a78bfa', '#10b981'];
                const accentColor = accentColors[index % accentColors.length];
                return (
                  <motion.div
                    key={index}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${accentColor}15, ${accentColor}05)`,
                        border: `1px solid ${accentColor}30`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: accentColor }} />
                    </div>
                    <span className="text-[#9ca3af] text-sm">{advantage.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Контакты */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold text-[#e5e7eb] mb-6">Контакты</h4>
            <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-[#00f0ff] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[#e5e7eb] font-medium mb-1">Адрес</p>
                    <p className="text-[#9ca3af] text-sm">Беларусь, Минск</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <PhoneIcon className="w-5 h-5 text-[#00f0ff] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[#e5e7eb] font-medium mb-1">Телефон</p>
                    <a href="tel:+375336540611" className="text-[#9ca3af] text-sm hover:text-[#00f0ff] transition-colors">+375 33 654-06-11</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-[#00f0ff] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[#e5e7eb] font-medium mb-1">Email</p>
                    <a href="mailto:fluvionbiz@gmail.com" className="text-[#9ca3af] text-sm hover:text-[#00f0ff] transition-colors">fluvionbiz@gmail.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ClockIcon className="w-5 h-5 text-[#00f0ff] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[#e5e7eb] font-medium mb-1">Время работы</p>
                    <p className="text-[#9ca3af] text-sm">24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Юридическая информация */}
        <div className="border-t border-[rgba(255,255,255,0.1)] pt-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h4 className="text-lg font-semibold text-[#e5e7eb] mb-6">Юридическая информация</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#9ca3af]">
              <div className="space-y-2">
                <p className="text-[#e5e7eb] font-medium">Официальное наименование:</p>
                <p>Индивидуальный предприниматель Ковалевский Ярослав Андреевич</p>
                <p className="text-[#e5e7eb] font-medium mt-4">УНП:</p>
                <p>693414299</p>
                <p className="text-[#e5e7eb] font-medium mt-4">Дата государственной регистрации:</p>
                <p>16.06.2025</p>
              </div>
              <div className="space-y-2">
                <p className="text-[#e5e7eb] font-medium">Орган государственной регистрации:</p>
                <p>Солигорский райисполком</p>
                <p className="text-[#e5e7eb] font-medium mt-4">Юридический адрес:</p>
                <p>Минск, Якуба Коласа 28</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Логотипы платежных систем */}
        <div className="border-t border-[rgba(255,255,255,0.1)] pt-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h4 className="text-lg font-semibold text-[#e5e7eb] mb-6">Способы оплаты</h4>
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-3 rounded-lg hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] transition-all">
                <img src="/payment-logos/visa.svg" alt="Visa" className="h-10 object-contain" />
              </div>
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-3 rounded-lg hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] transition-all">
                <img src="/payment-logos/mastercard.svg" alt="Mastercard" className="h-10 object-contain" />
              </div>
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-3 rounded-lg hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] transition-all">
                <img src="/payment-logos/belkart.svg" alt="Белкарт" className="h-10 object-contain" />
              </div>
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-3 rounded-lg hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] transition-all">
                <img src="/payment-logos/apple-pay.svg" alt="Apple Pay" className="h-10 object-contain" />
              </div>
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-3 rounded-lg hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] transition-all">
                <img src="/payment-logos/gpay.svg" alt="Google Pay" className="h-10 object-contain" />
              </div>
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-3 rounded-lg hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] transition-all">
                <img src="/payment-logos/samsung-pay.svg" alt="Samsung Pay" className="h-10 object-contain" />
              </div>
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-3 rounded-lg hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] transition-all">
                <img src="/payment-logos/bepaid.svg" alt="bePaid" className="h-10 object-contain" />
              </div>
              <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-3 rounded-lg hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] transition-all">
                <img src="/payment-logos/erip.svg" alt="ЕРИП" className="h-10 object-contain" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Нижняя часть */}
        <div className="border-t border-[rgba(255,255,255,0.1)] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#9ca3af] text-sm text-center md:text-left">
              © {new Date().getFullYear()} Fluvion. Все права защищены.
            </p>
            <div className="flex items-center gap-2 text-[#9ca3af] text-sm">
              <GlobeAltIcon className="w-4 h-4" />
              <span>Доставка из Китая в Беларусь</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
