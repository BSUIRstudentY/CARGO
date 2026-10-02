import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCartIcon, TruckIcon, CreditCardIcon, DocumentCheckIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';

function DeliveryPayment() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <PageHeader
          kicker="Доставка" 
          title="Доставка и оплата"
          subtitle="Узнайте, как мы организуем доставку товаров из Китая и принимаем платежи"
        />

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6 sm:space-y-10"
        >
          {/* Способы оплаты */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] mr-2 sm:mr-3">
                  <CreditCardIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#00f0ff]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#00f0ff]">
                  Способы оплаты
                </h2>
              </div>
              <p className="text-[#9ca3af] mb-3 sm:mb-4 text-sm sm:text-base">
              На Fluvion мы предлагаем удобные и безопасные способы оплаты. Оплата производится после проверки заказа администратором и подтверждения итоговой стоимости.
            </p>
            
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="p-3 sm:p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                  <CreditCardIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#00f0ff]" />
                  <h3 className="text-base sm:text-lg font-semibold text-[#e5e7eb]">Банковская карта</h3>
                </div>
                <p className="text-[#9ca3af] text-xs sm:text-sm">
                  Принимаем карты Visa и Mastercard через безопасный эквайринг BePaid с 256-битным SSL-шифрованием и 3D-Secure. Все платежи защищены и обрабатываются в соответствии с международными стандартами безопасности.
                </p>
              </div>
            </div>

            <div className="mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-[#e5e7eb] mb-2 sm:mb-3">Из чего складывается стоимость заказа:</h3>
              <ul className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 text-[#9ca3af] text-sm sm:text-base">
                <li>
                  <strong className="text-[#e5e7eb]">Цена товара:</strong> Рассчитывается по актуальному курсу с учётом стоимости у поставщика.
                </li>
                <li>
                  <strong className="text-[#e5e7eb]">Международная доставка:</strong> Рассчитывается по <a href="/rates" onClick={(e) => { e.preventDefault(); navigate('/rates'); }} className="font-bold text-[#00f0ff] hover:underline">актуальному курсу</a> (минимальный вес — 1 кг). Рассчитывается на основе фактического или объёмного веса товаров.
                </li>
                <li>
                  <strong className="text-[#e5e7eb]">Страховка (опционально):</strong> 5% от стоимости товаров. Страховка работает только если товар утерян и вы полностью засняли процесс распаковки товара на видео без пауз. В таком случае мы вернём полную стоимость груза.
                </li>
                <li>
                  <strong className="text-[#e5e7eb]">Скидки:</strong> Применяются скидки пользователя (накопительная система) и промокоды, если они доступны.
                </li>
              </ul>
            </div>

              <p className="text-[#9ca3af] mt-3 sm:mt-4 text-sm sm:text-base">
              Итоговая стоимость с учётом всех компонентов рассчитывается администратором после проверки заказа и отображается в <span className="font-bold text-[#00f0ff]">Профиле</span> во вкладке "Отправления" после проверки.
              </p>
            </div>

          {/* Способы доставки */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.3)] mr-2 sm:mr-3">
                  <TruckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#a78bfa]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#a78bfa]">
                  Способы доставки
                </h2>
              </div>
              <p className="text-[#9ca3af] mb-3 sm:mb-4 text-sm sm:text-base">
              Доставка товаров из Китая в Беларусь осуществляется в несколько этапов через систему сборных грузов для оптимизации логистики и снижения стоимости доставки.
            </p>
            
            <div className="space-y-3 sm:space-y-4 mb-3 sm:mb-4">
              <div className="p-3 sm:p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <h3 className="text-base sm:text-lg font-semibold text-[#e5e7eb] mb-1.5 sm:mb-2">1. Международная доставка из Китая</h3>
                <ul className="list-disc pl-4 sm:pl-5 space-y-1.5 sm:space-y-2 text-[#9ca3af] text-xs sm:text-sm">
                  <li>После проверки и оплаты заказ включается в <span className="font-bold text-[#a78bfa]">сборный груз</span></li>
                  <li>Товары выкупаются у поставщиков и консолидируются на складе в Китае</li>
                  <li>Транспортировка через транспортную компанию Карго в Минск</li>
                  <li><strong className="text-[#e5e7eb]">Срок доставки: 18–35 дней</strong> (зависит от способа транспортировки)</li>
                  <li><strong className="text-[#e5e7eb]">Стоимость:</strong> Рассчитывается по <a href="/rates" onClick={(e) => { e.preventDefault(); navigate('/rates'); }} className="font-bold text-[#a78bfa] hover:underline">актуальному курсу</a> (минимальный вес — 1 кг)</li>
                  <li>Расчёт веса: оплачивается максимальное значение из фактического и объёмного веса</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <h3 className="text-base sm:text-lg font-semibold text-[#e5e7eb] mb-1.5 sm:mb-2">2. Доставка по Республике Беларусь</h3>
                <ul className="list-disc pl-4 sm:pl-5 space-y-1.5 sm:space-y-2 text-[#9ca3af] text-xs sm:text-sm">
                  <li>После прибытия на склад в Минске заказ передаётся в Европочту</li>
                  <li>Доставка до выбранного вами отделения Европочты</li>
                  <li><strong className="text-[#e5e7eb]">Срок доставки: 2–5 дней</strong> (зависит от региона)</li>
                  <li><strong className="text-[#e5e7eb]">Оплата:</strong> При получении в отделении Европочты оплачивается стоимость доставки по тарифам Европочты + стоимость доставки из Китая в РБ по <a href="/rates" onClick={(e) => { e.preventDefault(); navigate('/rates'); }} className="font-bold text-[#a78bfa] hover:underline">актуальному курсу</a> (наличными или картой в отделении Европочты)</li>
                </ul>
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-[rgba(0,240,255,0.05)] border border-[rgba(0,240,255,0.2)]">
              <p className="text-[#9ca3af] text-xs sm:text-sm">
                <strong className="text-[#e5e7eb]">Отслеживание:</strong> Статус доставки можно отслеживать в разделе <span className="font-bold text-[#00f0ff]">Профиль</span> во вкладках "Отправления" (статус вашего заказа) и "Сборные грузы" (статус всего сборного груза). Вы получите уведомления при изменении статуса.
              </p>
            </div>
          </div>

          {/* Процесс работы со сборными грузами */}
          <div className="p-4 sm:p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] mr-2 sm:mr-3">
                <DocumentCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#10b981]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#10b981]">
                Сборные грузы
              </h2>
            </div>
            <p className="text-[#9ca3af] mb-3 sm:mb-4 text-sm sm:text-base">
              Все заказы объединяются в сборные грузы для оптимизации логистики и снижения стоимости доставки для всех клиентов.
              </p>
              <ul className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 text-[#9ca3af] text-sm sm:text-base">
                <li>
                <strong className="text-[#e5e7eb]">Формирование:</strong> После проверки администратором и оплаты заказ включается в ближайший сборный груз. В сборный груз включаются только оплаченные заказы. Сборные грузы формируются регулярно для оптимизации отправок.
              </li>
              <li>
                <strong className="text-[#e5e7eb]">Преимущества:</strong> Объединение заказов снижает стоимость доставки и ускоряет обработку всех заказов.
                </li>
                <li>
                <strong className="text-[#e5e7eb]">Отслеживание:</strong> В разделе <span className="font-bold text-[#10b981]">Профиль</span> → "Сборные грузы" вы можете видеть все сборные грузы, в которые включён ваш заказ, их текущий статус и даты отправки.
                </li>
                <li>
                <strong className="text-[#e5e7eb]">Статусы:</strong> Сборный груз проходит этапы: формирование → выкуп товаров → консолидация на складе → отправка из Китая → прибытие в Минск → распределение по заказам.
                </li>
              </ul>
          </div>

          {/* Правила оплаты и безопасности */}
          <div className="p-4 sm:p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] mr-2 sm:mr-3">
                <CreditCardIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#00f0ff]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#00f0ff]">
                Безопасность платежей
              </h2>
            </div>
            <p className="text-[#9ca3af] text-sm sm:text-base mb-3 sm:mb-4">
              Мы гарантируем безопасность ваших платежей и данных при заказе доставки из Китая.
            </p>
            <ul className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 text-[#9ca3af] text-sm sm:text-base">
              <li>
                <strong className="text-[#e5e7eb]">Защита данных:</strong> Все платёжные данные обрабатываются через защищённый эквайринг BePaid с 256-битным SSL-шифрованием и 3D-Secure для дополнительной защиты.
              </li>
              <li>
                <strong className="text-[#e5e7eb]">Конфиденциальность:</strong> Ваши персональные данные (ФИО, телефон, email, адрес) защищены в соответствии с Законом РБ № 99-З "О защите персональных данных" и используются только для организации доставки.
              </li>
              <li>
                <strong className="text-[#e5e7eb]">Срок оплаты:</strong> После проверки заказа администратором и подтверждения итоговой стоимости необходимо оплатить заказ в течение 3 дней банковской картой через эквайринг BePaid.
              </li>
            </ul>
            </div>

          {/* Правила возврата */}
            <div className="p-4 sm:p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
              <div className="flex items-center mb-3 sm:mb-4">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.3)] mr-2 sm:mr-3">
                <ArrowPathIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#a78bfa]" />
              </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#a78bfa]">
                Правила возврата и гарантии
                </h2>
              </div>
            <p className="text-[#9ca3af] text-sm sm:text-base mb-3 sm:mb-4">
              Правила возврата средств и обработки претензий для услуг по доставке товаров из Китая:
              </p>
              <ul className="list-disc pl-4 sm:pl-5 space-y-2 sm:space-y-3 text-[#9ca3af] text-sm sm:text-base">
                <li>
                <strong className="text-[#e5e7eb]">Возврат при невозможности выкупа:</strong> Если товар невозможно выкупить у поставщика (закончился, неверная ссылка и т.д.), средства автоматически возвращаются. Вы получите уведомление об этом.
              </li>
              <li>
                <strong className="text-[#e5e7eb]">Возврат средств:</strong> Возврат денежных средств за оказанные услуги возможен только в случаях, предусмотренных законодательством Республики Беларусь.
                </li>
                <li>
                <strong className="text-[#e5e7eb]">Ответственность за качество:</strong> Наша компания не несёт ответственности за качество товаров, приобретённых у китайских поставщиков, но мы содействуем в решении претензий к поставщику при необходимости.
                </li>
                <li>
                <strong className="text-[#e5e7eb]">Страхование и компенсация:</strong> При оформлении страховки мы гарантируем возврат полной стоимости груза, если товар утерян. Страховка работает только если вы полностью засняли процесс распаковки товара на видео без пауз. Претензии принимаются в течение 7 дней после получения товара.
                </li>
                <li>
                <strong className="text-[#e5e7eb]">Подача претензий:</strong> Претензии можно подать в течение 7 дней через  <span className="font-bold text-[#a78bfa]">Тех.поддержку</span> или по email <a href="mailto:fluvionbiz@gmail.com" className="text-[#a78bfa] hover:underline">fluvionbiz@gmail.com</a>.
                </li>
              </ul>
            <p className="text-[#9ca3af] mt-3 sm:mt-4 text-sm sm:text-base">
              Свяжитесь с поддержкой по email{' '}
              <a href="mailto:fluvionbiz@gmail.com" className="text-[#00f0ff] hover:underline">
                fluvionbiz@gmail.com
              </a>{' '}
              или  на сайте{' '}
              . Поддержка доступна 24/7.
            </p>
          </div>

          {/* Призыв к действию */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent mb-3 sm:mb-4">
                Готовы оформить заказ?
              </h2>
              <p className="text-[#9ca3af] mb-4 sm:mb-6 text-sm sm:text-base max-w-2xl mx-auto">
                Добавьте товары через «Заказать товар» или выберите из примеров. Мы организуем доставку от поставщика до вашего отделения почты!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  onClick={() => navigate('/terminal')}
                  className="flex items-center gap-2"
                >
                  <DocumentCheckIcon className="w-5 h-5" />
                  Заказать товар
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/catalog')}
                  className="flex items-center gap-2"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  Примеры товаров
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}

export default DeliveryPayment;
