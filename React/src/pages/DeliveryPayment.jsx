import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TruckIcon, CreditCardIcon, DocumentCheckIcon, ArrowPathIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';
import { Button } from '../components/ui/Button';
import { Helmet } from 'react-helmet-async';

const SectionCard = ({ icon: Icon, label, title, children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    className={`rounded-2xl bg-[var(--ev-glass)] backdrop-blur-[24px] border border-[var(--ev-gold)]/15 p-5 md:p-6 ${className}`}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20">
        <Icon className="w-5 h-5 md:w-6 md:h-6 text-[var(--ev-gold)]" />
      </div>
      <div>
        {label && <p className="ev-label text-[var(--ev-gold)]/80">{label}</p>}
        <h2 className="font-[var(--ev-font-display)] text-lg md:text-xl font-light text-[var(--ev-text)]">
          {title}
        </h2>
      </div>
    </div>
    {children}
  </motion.div>
);

function DeliveryPayment() {
  const navigate = useNavigate();
  const linkClass = 'text-[var(--ev-gold)] hover:underline';
  const strongClass = 'font-medium text-[var(--ev-text)]';

  return (
    <div className="min-h-screen bg-[var(--ev-void)] text-[var(--ev-text)] font-[var(--ev-font-body)] overflow-x-hidden">
      <Helmet>
        <title>Доставка и оплата | Fluvion</title>
        <meta name="description" content="Как мы доставляем товары из Китая в Беларусь, способы оплаты, сборные грузы и безопасность платежей." />
      </Helmet>

      {/* Hero */}
      <div className="pt-8 pb-6 md:pt-12 md:pb-8 px-4 text-center">
        <p className="ev-label text-[var(--ev-gold)] mb-2">Информация</p>
        <h1 className="font-[var(--ev-font-display)] text-2xl md:text-4xl font-light tracking-tight text-[var(--ev-gold)] mb-2">
          Доставка и оплата
        </h1>
        <p className="text-[var(--ev-text-muted)] text-sm md:text-base max-w-xl mx-auto">
          Как мы везём груз из Китая, как платить и как отслеживать заказ
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16 md:pb-24 space-y-6 md:space-y-8">
        {/* Способы оплаты */}
        <SectionCard
          icon={CreditCardIcon}
          label="Оплата"
          title="Способы оплаты"
        >
          <p className="text-[var(--ev-text-muted)] text-sm md:text-base mb-4">
            Оплата после проверки заказа администратором и подтверждения итоговой стоимости.
          </p>
          <div className="p-4 rounded-xl bg-[var(--ev-void)]/60 border border-[var(--ev-gold)]/10 mb-4">
            <h3 className="font-medium text-[var(--ev-text)] mb-1.5">Банковская карта</h3>
            <p className="text-[var(--ev-text-muted)] text-sm">
              Visa и Mastercard через BePaid: SSL-шифрование и 3D-Secure. Платежи соответствуют международным стандартам.
            </p>
          </div>
          <h3 className="text-sm font-medium text-[var(--ev-text)] mb-2">Из чего складывается стоимость:</h3>
          <ul className="list-disc pl-5 space-y-2 text-[var(--ev-text-muted)] text-sm">
            <li><span className={strongClass}>Цена товара</span> — по курсу с учётом стоимости у поставщика.</li>
            <li><span className={strongClass}>Доставка</span> — по <a href="/rates" onClick={(e) => { e.preventDefault(); navigate('/rates'); }} className={linkClass}>актуальному тарифу</a> (мин. 1 кг), по фактическому или объёмному весу.</li>
            <li><span className={strongClass}>Страховка</span> (по желанию) — 5% от стоимости. Возврат полной суммы при утрате при наличии видео распаковки без пауз.</li>
            <li><span className={strongClass}>Скидки</span> — накопительные и промокоды, если доступны.</li>
          </ul>
          <p className="text-[var(--ev-text-muted)] text-sm mt-4">
            Итоговая сумма считается после проверки заказа и отображается в <span className="text-[var(--ev-gold)]">Профиле</span> → «Отправления».
          </p>
        </SectionCard>

        {/* Способы доставки */}
        <SectionCard
          icon={TruckIcon}
          label="Логистика"
          title="Как мы доставляем"
        >
          <p className="text-[var(--ev-text-muted)] text-sm md:text-base mb-4">
            Доставка из Китая в Беларусь — сборные грузы для оптимизации стоимости и сроков.
          </p>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--ev-void)]/60 border border-[var(--ev-gold)]/10">
              <h3 className="font-medium text-[var(--ev-text)] mb-2">1. Из Китая в Минск</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-[var(--ev-text-muted)] text-sm">
                <li>После оплаты заказ попадает в <span className="text-[var(--ev-gold)]">сборный груз</span></li>
                <li>Выкуп, консолидация на складе в Китае, перевозка в Минск</li>
                <li><span className={strongClass}>Срок: 18–35 дней</span></li>
                <li><span className={strongClass}>Стоимость:</span> по <a href="/rates" onClick={(e) => { e.preventDefault(); navigate('/rates'); }} className={linkClass}>актуальному курсу</a> (мин. 1 кг). Вес — максимум из фактического и объёмного.</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-[var(--ev-void)]/60 border border-[var(--ev-gold)]/10">
              <h3 className="font-medium text-[var(--ev-text)] mb-2">2. По Беларуси</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-[var(--ev-text-muted)] text-sm">
                <li>Из Минска — через Европочту до выбранного отделения</li>
                <li><span className={strongClass}>Срок: 2–5 дней</span></li>
                <li><span className={strongClass}>Оплата:</span> в отделении Европочты (наличные или карта) — доставка по РБ + доля доставки из Китая по <a href="/rates" onClick={(e) => { e.preventDefault(); navigate('/rates'); }} className={linkClass}>курсу</a>.</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-[var(--ev-gold)]/5 border border-[var(--ev-gold)]/20">
            <p className="text-[var(--ev-text-muted)] text-sm">
              <span className={strongClass}>Отслеживание:</span> в <span className="text-[var(--ev-gold)]">Профиле</span> — вкладки «Отправления» (ваш заказ) и «Сборные грузы» (общий груз). Уведомления при смене статуса.
            </p>
          </div>
        </SectionCard>

        {/* Сборные грузы */}
        <SectionCard
          icon={DocumentCheckIcon}
          label="Процесс"
          title="Сборные грузы"
        >
          <p className="text-[var(--ev-text-muted)] text-sm md:text-base mb-4">
            Заказы объединяются в сборные грузы — так дешевле и быстрее для всех.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[var(--ev-text-muted)] text-sm">
            <li><span className={strongClass}>Формирование:</span> после проверки и оплаты заказ добавляется в ближайший сборный груз. В груз попадают только оплаченные заказы.</li>
            <li><span className={strongClass}>Плюсы:</span> ниже стоимость доставки, быстрее обработка.</li>
            <li><span className={strongClass}>Отслеживание:</span> в <span className="text-[var(--ev-gold)]">Профиле</span> → «Сборные грузы» — список грузов с вашими заказами, статусы и даты.</li>
            <li><span className={strongClass}>Этапы:</span> формирование → выкуп → консолидация → отправка из Китая → Минск → распределение по заказам.</li>
          </ul>
        </SectionCard>

        {/* Безопасность */}
        <SectionCard
          icon={CreditCardIcon}
          label="Защита"
          title="Безопасность платежей"
        >
          <p className="text-[var(--ev-text-muted)] text-sm md:text-base mb-4">
            Платежи и персональные данные защищены при заказе доставки из Китая.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[var(--ev-text-muted)] text-sm">
            <li><span className={strongClass}>Платежи:</span> эквайринг BePaid — SSL 256-bit и 3D-Secure.</li>
            <li><span className={strongClass}>Данные:</span> ФИО, телефон, email, адрес — в соответствии с Законом РБ о персональных данных, только для доставки.</li>
            <li><span className={strongClass}>Срок оплаты:</span> после подтверждения итоговой суммы — оплата в течение 3 дней картой через BePaid.</li>
          </ul>
        </SectionCard>

        {/* Возврат и гарантии */}
        <SectionCard
          icon={ArrowPathIcon}
          label="Гарантии"
          title="Возврат и претензии"
        >
          <p className="text-[var(--ev-text-muted)] text-sm md:text-base mb-4">
            Условия возврата и обработки претензий при доставке из Китая.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[var(--ev-text-muted)] text-sm">
            <li><span className={strongClass}>Невозможность выкупа:</span> товар закончился или неверная ссылка — средства возвращаются, вы получите уведомление.</li>
            <li><span className={strongClass}>Возврат:</span> по правилам, предусмотренным законодательством РБ.</li>
            <li><span className={strongClass}>Качество:</span> за качество товаров поставщика мы не отвечаем, но помогаем в претензиях к поставщику при необходимости.</li>
            <li><span className={strongClass}>Страховка:</span> при утрате — возврат полной стоимости при наличии видео распаковки без пауз. Претензии — в течение 7 дней после получения.</li>
            <li><span className={strongClass}>Претензии:</span> через <span className="text-[var(--ev-gold)]">Поддержку</span> или <a href="mailto:fluvionbiz@gmail.com" className={linkClass}>fluvionbiz@gmail.com</a>. Поддержка 24/7.</li>
          </ul>
        </SectionCard>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="rounded-2xl bg-[var(--ev-glass)] backdrop-blur-[24px] border border-[var(--ev-gold)]/20 p-6 md:p-8 text-center"
        >
          <h2 className="font-[var(--ev-font-display)] text-xl md:text-2xl font-light text-[var(--ev-gold)] mb-2">
            Готовы оформить заказ?
          </h2>
          <p className="text-[var(--ev-text-muted)] text-sm md:text-base mb-6 max-w-md mx-auto">
            Добавьте товары через «Заказать товар» или выберите из примеров — довезём до отделения почты.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="ev-primary"
              size="lg"
              onClick={() => navigate('/terminal')}
              className="flex items-center justify-center gap-2"
            >
              <DocumentCheckIcon className="w-5 h-5" />
              Заказать товар
            </Button>
            <Button
              variant="ev-outline"
              size="lg"
              onClick={() => navigate('/catalog')}
              className="flex items-center justify-center gap-2"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              Примеры товаров
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default DeliveryPayment;
