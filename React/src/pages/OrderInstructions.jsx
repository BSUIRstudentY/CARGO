import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCartIcon, DocumentCheckIcon, UserIcon, CreditCardIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { Button } from '../components/ui/Button';
import { Helmet } from 'react-helmet-async';

const linkClass = 'text-[var(--ev-gold)] hover:underline';
const strongClass = 'font-medium text-[var(--ev-text)]';

const MARKETPLACES = [
  { name: 'Pinduoduo', href: 'https://www.pinduoduo.com', img: '/logos/pinduoduo.svg', label: '拼多多' },
  { name: 'Taobao', href: 'https://www.taobao.com', style: { backgroundColor: '#FF5000' }, label: '淘宝' },
  { name: '1688', href: 'https://www.1688.com', style: { backgroundColor: '#FF6A00' }, label: '1688' },
  { name: 'GoFish', href: 'https://www.gofish.com', label: 'GoFish' },
  { name: 'WeChat', href: 'https://www.wechat.com', style: { backgroundColor: '#09BB07' }, label: '微信' },
  { name: 'Poizon', href: 'https://www.poizon.com', label: 'Poizon' },
  { name: '95', href: 'https://www.95.com', label: '95' },
];

function OrderInstructions() {
  const navigate = useNavigate();
  const stepRefs = useRef([]);
  const [flow, setFlow] = useState('full'); // 'full' | 'self'

  const fullServiceSteps = [
    {
      title: 'Добавление товара',
      icon: ShoppingCartIcon,
      description: (
        <>
          Два способа:
          <ul className="list-disc pl-5 mt-2 space-y-2 text-[var(--ev-text-muted)] text-sm">
            <li><span className={strongClass}>Заказать товар:</span> в меню добавьте ссылки с китайских площадок, укажите параметры и оформите заявку.</li>
            <li><span className={strongClass}>Примеры товаров:</span> готовые товары от клиентов — можно добавить в корзину.</li>
          </ul>
          <p className="mt-3 text-[var(--ev-text-muted)] text-sm mb-2">Поддерживаемые площадки:</p>
          <div className="flex flex-wrap gap-2">
            {MARKETPLACES.map(({ name, href, img, style, label }) => (
              <a key={name} href={href} target="_blank" rel="noopener noreferrer" style={style}
                className="inline-flex items-center justify-center w-14 h-14 rounded-xl border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/40 bg-[var(--ev-void)]/80 transition-all overflow-hidden"
                title={name}
              >
                {img ? (
                  <img src={img} alt={name} className="w-full h-full object-contain p-2" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span class="text-[var(--ev-text-muted)] font-bold text-xs">${label}</span>`; }} />
                ) : (
                  <span className="text-[var(--ev-text)] font-bold text-xs">{label}</span>
                )}
              </a>
            ))}
          </div>
        </>
      ),
    },
    {
      title: 'Оформление заказа в корзине',
      icon: ShoppingCartIcon,
      description: (
        <>
          В <span className={linkClass}>Корзине</span> можно: выбрать отделение Европочты, ввести промокод, добавить страховку (+5%), выбрать оплату (баланс или карта).
          <p className="mt-2 text-[var(--ev-text-muted)] text-sm">После проверки нажмите «Оформить заказ» — статус будет <span className={strongClass}>Ожидает оплаты</span>.</p>
        </>
      ),
    },
    {
      title: 'Проверка администратором',
      icon: DocumentCheckIcon,
      description: (
        <>
          Мы проверяем: данные заказа, ссылки, наличие у поставщика, цены. После проверки — статус <span className={strongClass}>Подтверждён</span>, считается итог. Уведомление по email или в <span className={linkClass}>Профиле</span>. Срок: 1–2 рабочих дня.
        </>
      ),
    },
    {
      title: 'Оплата заказа',
      icon: CreditCardIcon,
      description: (
        <>
          Оплата в течение 3 дней в <span className={linkClass}>Профиле</span> → «Отправления». С баланса (полностью или частично) или картой Visa/Mastercard через BePaid (SSL, 3D-Secure). После оплаты — статус <span className={strongClass}>Оплачен</span>, заказ попадает в сборный груз.
        </>
      ),
    },
    {
      title: 'Включение в сборный груз',
      icon: TruckIcon,
      description: (
        <>
          Оплаченные заказы объединяются в <span className={linkClass}>сборные грузы</span>. В <span className={linkClass}>Профиле</span> → «Сборные грузы» можно отслеживать статус груза.
        </>
      ),
    },
    {
      title: 'Выкуп товаров у поставщиков',
      icon: ShoppingCartIcon,
      description: (
        <>
          Выкуп всех товаров у поставщиков, проверка наличия и цен. Если выкупить нельзя — средства возвращаются на баланс, придёт уведомление.
        </>
      ),
    },
    {
      title: 'Консолидация на складе в Китае',
      icon: TruckIcon,
      description: (
        <>
          Проверка, упаковка, формирование сборного груза. Когда всё собрано — статус <span className={strongClass}>Завершён</span>, груз готов к отправке.
        </>
      ),
    },
    {
      title: 'Транспортировка из Китая в Беларусь',
      icon: TruckIcon,
      description: (
        <>
          Срок <span className={strongClass}>18–35 дней</span>. Стоимость по <a href="/rates" onClick={(e) => { e.preventDefault(); navigate('/rates'); }} className={linkClass}>актуальному курсу</a> (мин. 1 кг). Отслеживание в <span className={linkClass}>Профиле</span> → «Сборные грузы».
        </>
      ),
    },
    {
      title: 'Отправка через Европочту',
      icon: TruckIcon,
      description: (
        <>
          После Минска — Европочта до выбранного отделения. По РБ: <span className={strongClass}>2–5 дней</span>. Придёт уведомление с трек-номером.
        </>
      ),
    },
    {
      title: 'Получение заказа',
      icon: CheckCircleIcon,
      description: (
        <>
          Забрать в отделении Европочты. При получении оплатить доставку по тарифам Европочты + долю доставки из Китая по <a href="/rates" onClick={(e) => { e.preventDefault(); navigate('/rates'); }} className={linkClass}>курсу</a>. Можно оставить отзыв в разделе <span className={linkClass}>Отзывы</span>.
        </>
      ),
    },
  ];

  const selfPurchaseSteps = [
    { title: 'Самостоятельная покупка', icon: ShoppingCartIcon, description: <>Купите товары на китайских площадках и отправьте на наш склад в Китае. Адрес — в разделе <span className={linkClass}>Самовыкуп</span> или у поддержки.</> },
    { title: 'Оформление в разделе Самовыкуп', icon: UserIcon, description: <>В <span className={linkClass}>Самовыкуп</span> укажите трек-номер груза, описание товаров, отделение Европочты и страховку при необходимости.</> },
    { title: 'Сборный груз и транспортировка', icon: TruckIcon, description: <>Заказ объединяется с другими, отправка в РБ. Срок <span className={strongClass}>18–35 дней</span>. Отслеживание в <span className={linkClass}>Профиле</span> → «Сборные грузы» / «Отправления».</> },
    { title: 'Прибытие в Минск', icon: CheckCircleIcon, description: <>Груз на складе в Минске, подготовка к отправке через Европочту.</> },
    { title: 'Европочта и оплата', icon: TruckIcon, description: <>Доставка до отделения: <span className={strongClass}>2–5 дней</span>. После отправки оплатить доставку из Китая по <a href="/rates" onClick={(e) => { e.preventDefault(); navigate('/rates'); }} className={linkClass}>курсу</a> (BePaid или с баланса в <span className={linkClass}>Профиле</span>). Трек-номер придёт уведомлением.</> },
    { title: 'Получение', icon: CheckCircleIcon, description: <>Забрать в отделении Европочты. В отделении оплатить только доставку по тарифам Европочты. Отзыв — в <span className={linkClass}>Отзывах</span>.</> },
  ];

  const StepCard = ({ step, index }) => (
    <motion.div
      ref={(el) => (stepRefs.current[index] = el)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="p-4 rounded-xl bg-[var(--ev-void)]/60 border border-[var(--ev-gold)]/10 hover:border-[var(--ev-gold)]/20 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-2 rounded-lg bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20">
          <step.icon className="w-5 h-5 text-[var(--ev-gold)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[var(--ev-text)] mb-1.5">
            {index + 1}. {step.title}
          </h3>
          <div className="text-[var(--ev-text-muted)] text-sm leading-relaxed">
            {step.description}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[var(--ev-void)] text-[var(--ev-text)] font-[var(--ev-font-body)] overflow-x-hidden">
      <Helmet>
        <title>Инструкции по заказу | Fluvion</title>
        <meta name="description" content="Пошаговое руководство: как оформить доставку из Китая под ключ или через самовыкуп на Fluvion." />
      </Helmet>

      {/* Hero */}
      <div className="pt-8 pb-4 md:pt-10 md:pb-6 px-4 text-center">
        <p className="ev-label text-[var(--ev-gold)] mb-2">Руководство</p>
        <h1 className="font-[var(--ev-font-display)] text-2xl md:text-3xl font-light tracking-tight text-[var(--ev-gold)] mb-2">
          Инструкции по заказу
        </h1>
        <p className="text-[var(--ev-text-muted)] text-sm max-w-lg mx-auto">
          Выберите ваш сценарий — и смотрите только нужные шаги
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16 md:pb-24">
        {/* Выбор сценария */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
          <button
            type="button"
            onClick={() => setFlow('full')}
            className={`relative rounded-xl p-4 md:p-5 text-left border transition-all ${
              flow === 'full'
                ? 'bg-[var(--ev-glass)] border-[var(--ev-gold)]/60 shadow-[0_0_0_1px_rgba(201,169,122,0.5),0_0_20px_rgba(201,169,122,0.3),0_0_40px_rgba(201,169,122,0.2),0_0_60px_rgba(201,169,122,0.12)]'
                : 'bg-[var(--ev-void)]/40 border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25'
            }`}
          >
            {flow === 'full' && (
              <span className="absolute top-2 right-2 ev-label text-[10px] md:text-xs uppercase tracking-widest text-[var(--ev-gold)] font-medium">
                Сейчас
              </span>
            )}
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20">
                <DocumentCheckIcon className="w-5 h-5 text-[var(--ev-gold)]" />
              </div>
              <span className="font-[var(--ev-font-display)] font-medium text-[var(--ev-text)]">Под ключ</span>
            </div>
            <p className="text-[var(--ev-text-muted)] text-xs md:text-sm">
              Вы даёте ссылки — мы выкупаем, везём и доставляем в отделение
            </p>
          </button>
          <button
            type="button"
            onClick={() => setFlow('self')}
            className={`relative rounded-xl p-4 md:p-5 text-left border transition-all ${
              flow === 'self'
                ? 'bg-[var(--ev-glass)] border-[var(--ev-gold)]/60 shadow-[0_0_0_1px_rgba(201,169,122,0.5),0_0_20px_rgba(201,169,122,0.3),0_0_40px_rgba(201,169,122,0.2),0_0_60px_rgba(201,169,122,0.12)]'
                : 'bg-[var(--ev-void)]/40 border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25'
            }`}
          >
            {flow === 'self' && (
              <span className="absolute top-2 right-2 ev-label text-[10px] md:text-xs uppercase tracking-widest text-[var(--ev-gold)] font-medium">
                Сейчас
              </span>
            )}
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20">
                <UserIcon className="w-5 h-5 text-[var(--ev-gold)]" />
              </div>
              <span className="font-[var(--ev-font-display)] font-medium text-[var(--ev-text)]">Самовыкуп</span>
            </div>
            <p className="text-[var(--ev-text-muted)] text-xs md:text-sm">
              Вы уже купили и отправили на наш склад — мы довезём до РБ
            </p>
          </button>
        </div>

        {/* Шаги выбранного сценария */}
        <AnimatePresence mode="wait">
          {flow === 'full' ? (
            <motion.section
              key="full"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl bg-[var(--ev-glass)] backdrop-blur-[24px] border border-[var(--ev-gold)]/15 p-5 md:p-6"
            >
              <p className="text-[var(--ev-text-muted)] text-sm mb-4">От добавления товара до получения в отделении:</p>
              <div className="space-y-3">
                {fullServiceSteps.map((step, i) => (
                  <StepCard key={i} step={step} index={i} />
                ))}
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="self"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl bg-[var(--ev-glass)] backdrop-blur-[24px] border border-[var(--ev-gold)]/15 p-5 md:p-6"
            >
              <p className="text-[var(--ev-text-muted)] text-sm mb-4">От оформления в разделе «Самовыкуп» до получения:</p>
              <div className="space-y-3">
                {selfPurchaseSteps.map((step, i) => (
                  <StepCard key={i} step={step} index={i} />
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-6 md:mt-8 rounded-2xl bg-[var(--ev-glass)] backdrop-blur-[24px] border border-[var(--ev-gold)]/20 p-6 md:p-8 text-center"
        >
          <h2 className="font-[var(--ev-font-display)] text-lg md:text-xl font-light text-[var(--ev-gold)] mb-2">
            Готовы начать?
          </h2>
          <p className="text-[var(--ev-text-muted)] text-sm mb-5 max-w-md mx-auto">
            Заказать товар или открыть профиль для отслеживания.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="ev-primary" size="lg" onClick={() => navigate('/terminal')} className="flex items-center justify-center gap-2">
              <ShoppingCartIcon className="w-5 h-5" />
              Заказать товар
            </Button>
            <Button variant="ev-outline" size="lg" onClick={() => navigate('/login')} className="flex items-center justify-center gap-2">
              <UserIcon className="w-5 h-5" />
              Профиль
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default OrderInstructions;
