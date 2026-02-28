import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DocumentCheckIcon, ShoppingCartIcon, CreditCardIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon, LockClosedIcon, ScaleIcon, UserIcon } from '@heroicons/react/24/solid';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';

function PublicOffer() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <PageHeader 
          title="Публичная оферта"
          subtitle="Условия предоставления услуг по доставке товаров из Китая 'под ключ' через сайт Fluvion"
        />

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-10"
        >
          {/* Общие положения */}
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] mr-3">
                <DocumentCheckIcon className="w-6 h-6 text-[#00f0ff]" />
              </div>
              <h2 className="text-2xl font-bold text-[#00f0ff]">
                1. Общие положения
              </h2>
            </div>
            <p className="text-[#9ca3af] mb-4 text-base leading-relaxed">
              Настоящий документ является публичной офертой индивидуального предпринимателя Ковалевского Ярослава Андреевича (далее — Исполнитель) в соответствии со статьями 405 и 407 Гражданского кодекса Республики Беларусь. Оферта адресована неопределенному кругу физических и юридических лиц (далее — Заказчик) и содержит все существенные условия договора на оказание услуг по доставке товаров из Китая "под ключ" через сайт Fluvion.
            </p>
            <p className="text-[#9ca3af] mb-4 text-base leading-relaxed">
              <strong className="text-[#e5e7eb]">Исполнитель не является продавцом товаров, а оказывает услугу по организации их закупки и доставки по поручению Заказчика.</strong> Услуги включают выкуп товаров у указанных Заказчиком поставщиков, организацию транспортировки, оформление документов и информационное сопровождение.
            </p>
            <p className="text-[#9ca3af] text-base leading-relaxed">
              Оформление заказа через разделы <span className="font-bold text-[#00f0ff]">Каталог</span>, <span className="font-bold text-[#00f0ff]">Терминал</span> или <span className="font-bold text-[#00f0ff]">Корзина</span> на сайте, либо оплата услуг является полным и безоговорочным акцептом условий настоящей оферты.
            </p>
            <p className="text-[#9ca3af] mt-4 text-base leading-relaxed">
              Дополнительные сведения о процессе заказа, доставки и оплаты приведены в разделах{' '}
              <a href="/order-instructions" onClick={(e) => { e.preventDefault(); navigate('/order-instructions'); }} className="font-bold text-[#00f0ff] hover:underline">
                Инструкции по заказу
              </a>
              ,{' '}
              <a href="/delivery-payment" onClick={(e) => { e.preventDefault(); navigate('/delivery-payment'); }} className="font-bold text-[#00f0ff] hover:underline">
                Доставка и оплата
              </a>{' '}
              и{' '}
              <a href="/faq" onClick={(e) => { e.preventDefault(); navigate('/faq'); }} className="font-bold text-[#00f0ff] hover:underline">
                FAQ
              </a>{' '}
              на сайте Fluvion.
            </p>
          </div>

          {/* Предмет договора */}
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.3)] mr-3">
                <DocumentCheckIcon className="w-6 h-6 text-[#a78bfa]" />
              </div>
              <h2 className="text-2xl font-bold text-[#a78bfa]">
                2. Предмет договора
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-3 mb-3">
                  <TruckIcon className="w-6 h-6 text-[#00f0ff]" />
                  <h3 className="text-lg font-semibold text-[#e5e7eb]">Обязанности Исполнителя</h3>
                </div>
                <p className="text-[#9ca3af] text-sm leading-relaxed">
                  <strong className="text-[#e5e7eb]">Все действия Исполнителя совершаются от имени и в интересах Заказчика.</strong> Организовать доставку товаров из Китая "под ключ", включая выкуп товаров у указанных Заказчиком поставщиков, координацию транспортировки, оформление документов и предоставление информации о статусе доставки.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-3 mb-3">
                  <ShoppingCartIcon className="w-6 h-6 text-[#a78bfa]" />
                  <h3 className="text-lg font-semibold text-[#e5e7eb]">Обязанности Заказчика</h3>
                </div>
                <p className="text-[#9ca3af] text-sm leading-relaxed">
                  Предоставить достоверные данные о товаре и доставке через сайт, оплатить услуги в установленном порядке. Дополнительная проверка качества — от $5.
                </p>
              </div>
            </div>
          </div>

          {/* Стоимость и порядок оплаты */}
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] mr-3">
                <CreditCardIcon className="w-6 h-6 text-[#00f0ff]" />
              </div>
              <h2 className="text-2xl font-bold text-[#00f0ff]">
                3. Стоимость и порядок оплаты
              </h2>
            </div>
            <p className="text-[#9ca3af] mb-4 text-base leading-relaxed">
              <strong className="text-[#e5e7eb]">Оплата, принимаемая через сайт, является оплатой за услугу организации закупки и доставки. Стоимость самих товаров оплачивается Исполнителем поставщику от имени Заказчика.</strong>
            </p>
            <p className="text-[#9ca3af] mb-4 text-base">Стоимость услуг Исполнителя включает:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-semibold text-[#e5e7eb] mb-2">Цена товара</h3>
                <p className="text-[#9ca3af] text-sm mb-2">
                  Рассчитывается по <a href="/rates" onClick={(e) => { e.preventDefault(); navigate('/rates'); }} className="font-bold text-[#00f0ff] hover:underline">актуальному курсу</a> с учётом стоимости у поставщика.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-semibold text-[#e5e7eb] mb-2">Международная доставка</h3>
                <p className="text-[#9ca3af] text-sm mb-2">
                  Рассчитывается по <a href="/rates" onClick={(e) => { e.preventDefault(); navigate('/rates'); }} className="font-bold text-[#00f0ff] hover:underline">актуальному курсу</a> (минимальный вес — 1 кг). Рассчитывается на основе фактического или объёмного веса товаров.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] md:col-span-2">
                <h3 className="text-lg font-semibold text-[#e5e7eb] mb-2">Упаковка и доставка Европочтой</h3>
                <p className="text-[#9ca3af] text-sm">
                  $3 стандарт / $5 хрупкие. Услуги Европочты: 2–5 дней, зависит от региона.
                </p>
              </div>
            </div>
            <p className="text-[#9ca3af] mt-4 text-base leading-relaxed">
              Итоговая стоимость отображается в <span className="font-bold text-[#00f0ff]">Профиле</span>. Оплата через эквайринг BePaid (Visa, Mastercard) в течение 3 дней. Доставка оплачивается при получении. Все платежи защищены 256-битным SSL-шифрованием и 3D-Secure.
            </p>
          </div>

          {/* Права и обязанности сторон */}
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] mr-3">
                <ScaleIcon className="w-6 h-6 text-[#10b981]" />
              </div>
              <h2 className="text-2xl font-bold text-[#10b981]">
                4. Права и обязанности сторон
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-semibold text-[#e5e7eb] mb-3">Исполнитель обязуется:</h3>
                <ul className="list-disc pl-5 space-y-2 text-[#9ca3af] text-sm">
                  <li>Организовать доставку товаров из Китая, включая выкуп товаров у указанных Заказчиком поставщиков и координацию логистики.</li>
                  <li>Предоставить информацию о статусе доставки в <span className="font-bold text-[#00f0ff]">Профиле</span>.</li>
                </ul>
                <p className="text-[#9ca3af] mt-4 text-sm">
                  Исполнитель не участвует в таможенном оформлении, которое осуществляется исключительно карго-компанией.
                </p>
                <p className="text-[#9ca3af] mt-2 text-sm">
                  Исполнитель не отвечает за качество товаров или задержки перевозчиков.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-semibold text-[#e5e7eb] mb-3">Заказчик обязуется:</h3>
                <ul className="list-disc pl-5 space-y-2 text-[#9ca3af] text-sm">
                  <li>Предоставить достоверные данные о товаре и доставке через сайт.</li>
                  <li>Оплатить услуги в течение 3 дней через эквайринг BePaid (Visa, Mastercard).</li>
                  <li>Проверить статус заказа в <span className="font-bold text-[#00f0ff]">Профиле</span> и оплатить доставку при получении.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Условия доставки */}
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.3)] mr-3">
                <TruckIcon className="w-6 h-6 text-[#a78bfa]" />
              </div>
              <h2 className="text-2xl font-bold text-[#a78bfa]">
                5. Условия доставки
              </h2>
            </div>
            <p className="text-[#9ca3af] mb-4 text-base leading-relaxed">
              Доставка осуществляется в два этапа с отслеживанием в <span className="font-bold text-[#00f0ff]">Профиле</span>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-3 mb-2">
                  <TruckIcon className="w-6 h-6 text-[#00f0ff]" />
                  <h3 className="text-lg font-semibold text-[#e5e7eb]">Международная доставка</h3>
                </div>
                <p className="text-[#9ca3af] text-sm">
                  Из Китая в Минск через Карго (18–35 дней). Стоимость рассчитывается по <a href="/rates" onClick={(e) => { e.preventDefault(); navigate('/rates'); }} className="font-bold text-[#a78bfa] hover:underline">актуальному курсу</a>.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-3 mb-2">
                  <TruckIcon className="w-6 h-6 text-[#a78bfa]" />
                  <h3 className="text-lg font-semibold text-[#e5e7eb]">Внутренняя доставка</h3>
                </div>
                <p className="text-[#9ca3af] text-sm">
                  По РБ через Европочту (2–5 дней, зависит от региона).
                </p>
              </div>
            </div>
            <p className="text-[#9ca3af] mt-4 text-sm">
              <strong className="text-[#e5e7eb]">Исполнитель не участвует в таможенном оформлении, которое осуществляется исключительно карго-компанией. Ответственность за таможенное оформление и сроки доставки несут соответствующие перевозчики.</strong>
            </p>
          </div>

          {/* Правила возврата и претензии */}
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.3)] mr-3">
                <ArrowPathIcon className="w-6 h-6 text-[#a78bfa]" />
              </div>
              <h2 className="text-2xl font-bold text-[#a78bfa]">
                6. Правила возврата и претензии
              </h2>
            </div>
            <p className="text-[#9ca3af] mb-4 text-base leading-relaxed">
              <strong className="text-[#e5e7eb]">Возврат денежных средств за оказанные услуги возможен только в случаях, предусмотренных законодательством Республики Беларусь.</strong> Ориентируйтесь на описание товаров в <span className="font-bold text-[#00f0ff]">Каталоге</span>.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-semibold text-[#e5e7eb] mb-3">Претензии по доставке</h3>
                <ul className="list-disc pl-5 space-y-2 text-[#9ca3af] text-sm">
                  <li>Утеря товара (со страховкой): Страховка работает только если товар утерян и вы полностью засняли процесс распаковки товара на видео без пауз. В таком случае гарантия возврата полной стоимости груза в течение 7 дней.</li>
                  <li>Вина поставщика или перевозчика: содействие в претензии.</li>
                  <li>Срок подачи претензии: 7 дней. Email: <a href="mailto:fluvionbiz@gmail.com" className="text-[#00f0ff] hover:underline">fluvionbiz@gmail.com</a>, Тел: <a href="tel:+375336540611" className="text-[#00f0ff] hover:underline">+375 33 654-06-11</a>.</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-3 mb-3">
                  <ArrowPathIcon className="w-8 h-8 text-[#a78bfa]" />
                  <h3 className="text-lg font-semibold text-[#e5e7eb]">Как подать претензию</h3>
                </div>
                <p className="text-[#9ca3af] text-sm">
                  Укажите номер заказа и описание проблемы через форму на сайте или email.
                </p>
              </div>
            </div>
          </div>

          {/* Конфиденциальность */}
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] mr-3">
                <LockClosedIcon className="w-6 h-6 text-[#00f0ff]" />
              </div>
              <h2 className="text-2xl font-bold text-[#00f0ff]">
                7. Конфиденциальность
              </h2>
            </div>
            <p className="text-[#9ca3af] text-base leading-relaxed">
              Согласие на обработку персональных данных (ФИО, телефон, email, адрес) в соответствии с Законом РБ № 99-З "О защите персональных данных". <strong className="text-[#e5e7eb]">Обработка персональных данных осуществляется исключительно в целях исполнения настоящего договора.</strong> Данные используются для организации доставки и не передаются третьим лицам, кроме перевозчиков.
            </p>
          </div>

          {/* Срок действия и юрисдикция */}
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] mr-3">
                <ScaleIcon className="w-6 h-6 text-[#10b981]" />
              </div>
              <h2 className="text-2xl font-bold text-[#10b981]">
                8. Срок действия и юрисдикция
              </h2>
            </div>
            <p className="text-[#9ca3af] text-base leading-relaxed">
              <strong className="text-[#e5e7eb]">Настоящая оферта размещена в открытом доступе на сайте www.fluvion.by и считается заключённой с момента акцепта.</strong> Оферта действует с момента публикации на www.fluvion.by. Изменения вступают в силу с момента публикации. Споры разрешаются по законодательству РБ в суде по месту регистрации Исполнителя (г. Солигорск).
            </p>
          </div>

          {/* Реквизиты Исполнителя */}
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] mr-3">
                <UserIcon className="w-6 h-6 text-[#00f0ff]" />
              </div>
              <h2 className="text-2xl font-bold text-[#00f0ff]">
                9. Реквизиты Исполнителя
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-semibold text-[#e5e7eb] mb-2">Исполнитель</h3>
                <p className="text-[#9ca3af] text-sm">ИП Ковалевский Ярослав Андреевич</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-semibold text-[#e5e7eb] mb-2">Адрес</h3>
                <p className="text-[#9ca3af] text-sm">223710, РБ, г. Солигорск, ул. Железнодорожная 6</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-semibold text-[#e5e7eb] mb-2">УНП</h3>
                <p className="text-[#9ca3af] text-sm">693299414</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-semibold text-[#e5e7eb] mb-2">Регистрация</h3>
                <p className="text-[#9ca3af] text-sm">№755693886000 от 18.06.2025, Солигорский горисполком</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] sm:col-span-2">
                <h3 className="text-lg font-semibold text-[#e5e7eb] mb-2">Контакты</h3>
                <p className="text-[#9ca3af] text-sm">
                  Email: <a href="mailto:fluvionbiz@gmail.com" className="text-[#00f0ff] hover:underline">fluvionbiz@gmail.com</a><br />
                  Тел: <a href="tel:+375336540611" className="text-[#00f0ff] hover:underline">+375 33 654-06-11</a>
                </p>
              </div>
            </div>
          </div>

          {/* Призыв к действию */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent mb-4">
                Готовы оформить доставку?
              </h2>
              <p className="text-[#9ca3af] mb-6 text-base max-w-2xl mx-auto">
                Ознакомьтесь с процессом заказа и начните доставку товаров из Китая прямо сейчас!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  onClick={() => navigate('/catalog')}
                  className="flex items-center gap-2"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  Перейти в Каталог
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('/terminal')}
                  className="flex items-center gap-2"
                >
                  <DocumentCheckIcon className="w-5 h-5" />
                  Перейти в Терминал
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}

export default PublicOffer;
