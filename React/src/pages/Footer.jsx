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
import { Card } from '../components/ui/Card';

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
    <footer id={id} className="relative bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] border-t border-[#333333]">
      {/* Декоративный градиент */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(232,30,45,0.1),transparent_50%)]" />
      
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
              <TruckIcon className="w-8 h-8 text-[#e81e2d]" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#e81e2d] to-[#ff4757] bg-clip-text text-transparent">
                Fluvion
              </h3>
            </div>
            <p className="text-[#cdcdcd] mb-4 leading-relaxed">
              Доставка товаров из Китая в Беларусь под ключ. Надежно, быстро, с гарантией.
            </p>
            <div className="flex flex-col gap-2 text-sm text-[#808080]">
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4" />
                <a href="tel:+375336540611" className="hover:text-[#e81e2d] transition-colors">+375 33 654-06-11</a>
              </div>
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4" />
                <a href="mailto:fluvionbiz@gmail.com" className="hover:text-[#e81e2d] transition-colors">fluvionbiz@gmail.com</a>
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
            <h4 className="text-lg font-semibold text-white mb-6">Информация</h4>
            <ul className="space-y-3">
              {infoLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="flex items-center gap-2 text-[#cdcdcd] hover:text-[#e81e2d] transition-colors duration-300 group"
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
            <h4 className="text-lg font-semibold text-white mb-6">Преимущества</h4>
            <div className="grid grid-cols-1 gap-3">
              {advantages.map((advantage, index) => {
                const Icon = advantage.icon;
                return (
                  <motion.div
                    key={index}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${advantage.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[#cdcdcd] text-sm">{advantage.text}</span>
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
            <h4 className="text-lg font-semibold text-white mb-6">Контакты</h4>
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-[#e81e2d] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium mb-1">Адрес</p>
                    <p className="text-[#cdcdcd] text-sm">Беларусь, Минск</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <PhoneIcon className="w-5 h-5 text-[#e81e2d] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium mb-1">Телефон</p>
                    <a href="tel:+375336540611" className="text-[#cdcdcd] text-sm hover:text-[#e81e2d] transition-colors">+375 33 654-06-11</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-[#e81e2d] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium mb-1">Email</p>
                    <a href="mailto:fluvionbiz@gmail.com" className="text-[#cdcdcd] text-sm hover:text-[#e81e2d] transition-colors">fluvionbiz@gmail.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ClockIcon className="w-5 h-5 text-[#e81e2d] mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium mb-1">Время работы</p>
                    <p className="text-[#cdcdcd] text-sm">24/7</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Юридическая информация */}
        <div className="border-t border-[#333333] pt-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h4 className="text-lg font-semibold text-white mb-6">Юридическая информация</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#cdcdcd]">
              <div className="space-y-2">
                <p className="text-white font-medium">Официальное наименование:</p>
                <p>Индивидуальный предприниматель Ковалевский Ярослав Андреевич</p>
                <p className="text-white font-medium mt-4">УНП:</p>
                <p>693414299</p>
                <p className="text-white font-medium mt-4">Дата государственной регистрации:</p>
                <p>16.06.2025</p>
              </div>
              <div className="space-y-2">
                <p className="text-white font-medium">Орган государственной регистрации:</p>
                <p>Солигорский райисполком</p>
                <p className="text-white font-medium mt-4">Юридический адрес:</p>
                <p>Минск, Якуба Коласа 28</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Логотипы платежных систем */}
        <div className="border-t border-[#333333] pt-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h4 className="text-lg font-semibold text-white mb-6">Способы оплаты</h4>
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                <img src="/payment-logos/visa.svg" alt="Visa" className="h-10 object-contain" />
              </div>
              <div className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                <img src="/payment-logos/mastercard.svg" alt="Mastercard" className="h-10 object-contain" />
              </div>
              <div className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                <img src="/payment-logos/belkart.svg" alt="Белкарт" className="h-10 object-contain" />
              </div>
              <div className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                <img src="/payment-logos/apple-pay.svg" alt="Apple Pay" className="h-10 object-contain" />
              </div>
              <div className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                <img src="/payment-logos/gpay.svg" alt="Google Pay" className="h-10 object-contain" />
              </div>
              <div className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                <img src="/payment-logos/samsung-pay.svg" alt="Samsung Pay" className="h-10 object-contain" />
              </div>
              <div className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                <img src="/payment-logos/bepaid.svg" alt="bePaid" className="h-10 object-contain" />
              </div>
              <div className="bg-white/5 p-3 rounded-lg hover:bg-white/10 transition-colors">
                <img src="/payment-logos/erip.svg" alt="ЕРИП" className="h-10 object-contain" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Нижняя часть */}
        <div className="border-t border-[#333333] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#808080] text-sm text-center md:text-left">
              © {new Date().getFullYear()} Fluvion. Все права защищены.
            </p>
            <div className="flex items-center gap-2 text-[#808080] text-sm">
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
