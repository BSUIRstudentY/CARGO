import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LockClosedIcon, ShieldCheckIcon, UserIcon, DocumentCheckIcon, ArrowPathIcon, ScaleIcon, InformationCircleIcon, KeyIcon } from '@heroicons/react/24/solid';
import { Button } from './ui/Button';

function UserAgreement() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent text-[var(--ev-text)] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--ev-text)] mb-2">Согласие на обработку персональных данных</h1>
        <p className="text-[var(--ev-text-muted)] text-sm sm:text-base mb-8">Ваше согласие на сбор и использование информации для предоставления услуг на Fluvion</p>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-10"
        >
          {/* Ваше согласие */}
          <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 mr-3">
                <DocumentCheckIcon className="w-6 h-6 text-[var(--ev-gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--ev-gold)]">
                1. Ваше согласие
              </h2>
            </div>
            <p className="text-[var(--ev-text-muted)] text-base leading-relaxed">
              Оформляя заказ на сайте Fluvion (www.fluvion.by), Заказчик подтверждает свое согласие на обработку персональных данных (ФИО, телефон, email, адрес) в соответствии с{' '}
              <a href="/privacy-policy" onClick={(e) => { e.preventDefault(); navigate('/privacy-policy'); }} className="font-bold text-[var(--ev-gold)] hover:underline">
                Политикой обработки данных
              </a>{' '}
              и{' '}
              <a href="/public-offer" onClick={(e) => { e.preventDefault(); navigate('/public-offer'); }} className="font-bold text-[var(--ev-gold)] hover:underline">
                Публичной офертой
              </a>.
            </p>
            <p className="text-[var(--ev-text-muted)] mt-4 text-base leading-relaxed">
              Согласие предоставляется добровольно при оформлении заказа через разделы <span className="font-bold text-[var(--ev-gold)]">Примеры товаров</span>, <span className="font-bold text-[var(--ev-gold)]">Терминал</span> или <span className="font-bold text-[var(--ev-gold)]">Корзина</span>.
            </p>
          </div>

          {/* Обработка данных */}
          <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 mr-3">
                <ShieldCheckIcon className="w-6 h-6 text-[var(--ev-gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--ev-gold)]">
                2. Обработка данных
              </h2>
            </div>
            <p className="text-[var(--ev-text-muted)] mb-4 text-base leading-relaxed">
              Обработка включает сбор, хранение, использование и передачу данных для целей выполнения заказа и доставки. Данные обрабатываются в соответствии с Законом Республики Беларусь «О защите персональных данных» (№ 99-З) и хранятся в защищенных системах.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15">
                <h3 className="text-lg font-semibold text-[var(--ev-text)] mb-2">Меры безопасности</h3>
                <p className="text-[var(--ev-text-muted)] text-sm">
                  Оператор применяет технические и организационные меры для защиты данных: 256-битное SSL-шифрование через эквайринг BePaid, firewalls, регулярные аудиты безопасности. Доступ к данным ограничен авторизованным сотрудникам.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15">
                <h3 className="text-lg font-semibold text-[var(--ev-text)] mb-2">Цели обработки</h3>
                <p className="text-[var(--ev-text-muted)] text-sm">
                  Выполнение заказов, координация доставки через Карго и Европочту, предоставление информации о статусе доставки, отправка уведомлений, анонимизированная аналитика для улучшения качества услуг.
                </p>
              </div>
            </div>
          </div>

          {/* Права и обязанности */}
          <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 mr-3">
                <ScaleIcon className="w-6 h-6 text-[var(--ev-gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--ev-gold)]">
                3. Права и обязанности
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15">
                <h3 className="text-lg font-semibold text-[var(--ev-text)] mb-3">Права Заказчика</h3>
                <ul className="list-disc pl-5 space-y-2 text-[var(--ev-text-muted)] text-sm">
                  <li>Доступ к своим персональным данным</li>
                  <li>Исправление и обновление информации</li>
                  <li>Удаление данных (с ограничениями по закону)</li>
                  <li>Ограничение обработки данных</li>
                  <li>Отзыв согласия на обработку</li>
                </ul>
              </div>
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15">
                <h3 className="text-lg font-semibold text-[var(--ev-text)] mb-3">Обязанности Заказчика</h3>
                <ul className="list-disc pl-5 space-y-2 text-[var(--ev-text-muted)] text-sm">
                  <li>Предоставление достоверных персональных данных</li>
                  <li>Своевременное обновление информации при изменении</li>
                  <li>Не использовать сайт для незаконных целей</li>
                  <li>Соблюдение условий использования сайта</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Отзыв согласия */}
          <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 mr-3">
                <ArrowPathIcon className="w-6 h-6 text-[var(--ev-gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--ev-gold)]">
                4. Отзыв согласия
              </h2>
            </div>
            <p className="text-[var(--ev-text-muted)] mb-4 text-base leading-relaxed">
              Заказчик может отозвать согласие на обработку персональных данных, обратившись по email <a href="mailto:fluvionbiz@gmail.com" className="text-[var(--ev-gold)] hover:underline">fluvionbiz@gmail.com</a> или телефону <a href="tel:+375336540611" className="text-[var(--ev-gold)] hover:underline">+375 33 654-06-11</a>. Отзыв согласия может ограничить возможность выполнения заказа. Запросы обрабатываются в течение 30 дней.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 text-center">
                <div className="inline-block bg-[var(--ev-gold)]/10 rounded-full p-3 mb-3">
                  <span className="text-2xl font-bold text-[var(--ev-gold)]">1</span>
                </div>
                <h4 className="text-lg font-semibold text-[var(--ev-text)] mb-2">Запрос</h4>
                <p className="text-[var(--ev-text-muted)] text-sm">Отправьте email с описанием</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 text-center">
                <div className="inline-block bg-[var(--ev-gold)]/10 rounded-full p-3 mb-3">
                  <span className="text-2xl font-bold text-[var(--ev-gold)]">2</span>
                </div>
                <h4 className="text-lg font-semibold text-[var(--ev-text)] mb-2">Обработка</h4>
                <p className="text-[var(--ev-text-muted)] text-sm">В течение 30 дней</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 text-center">
                <div className="inline-block bg-[var(--ev-gold)]/10 rounded-full p-3 mb-3">
                  <span className="text-2xl font-bold text-[var(--ev-gold)]">3</span>
                </div>
                <h4 className="text-lg font-semibold text-[var(--ev-text)] mb-2">Подтверждение</h4>
                <p className="text-[var(--ev-text-muted)] text-sm">Уведомление по email</p>
              </div>
            </div>
          </div>

          {/* Ответственность */}
          <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 mr-3">
                <KeyIcon className="w-6 h-6 text-[var(--ev-gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--ev-gold)]">
                5. Ответственность
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15">
                <h3 className="text-lg font-semibold text-[var(--ev-text)] mb-2">Ответственность Оператора</h3>
                <p className="text-[var(--ev-text-muted)] text-sm">
                  Оператор несет ответственность за конфиденциальность и безопасность персональных данных в соответствии с законодательством Республики Беларусь. В случае нарушения обязательств по защите данных Оператор несет ответственность в соответствии с действующим законодательством.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15">
                <h3 className="text-lg font-semibold text-[var(--ev-text)] mb-2">Ответственность Заказчика</h3>
                <p className="text-[var(--ev-text-muted)] text-sm">
                  Заказчик несет ответственность за достоверность предоставленных персональных данных. В случае предоставления недостоверной информации Заказчик несет ответственность в соответствии с действующим законодательством.
                </p>
              </div>
            </div>
          </div>

          {/* Контакты */}
          <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 mr-3">
                <InformationCircleIcon className="w-6 h-6 text-[var(--ev-gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--ev-gold)]">
                6. Контакты
              </h2>
            </div>
            <p className="text-[var(--ev-text-muted)] text-base leading-relaxed mb-4">
              По вопросам обработки персональных данных, отзыва согласия или реализации прав обращайтесь:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15">
                <h3 className="text-lg font-semibold text-[var(--ev-text)] mb-2">Email</h3>
                <p className="text-[var(--ev-text-muted)] text-sm">
                  <a href="mailto:fluvionbiz@gmail.com" className="text-[var(--ev-gold)] hover:underline">fluvionbiz@gmail.com</a>
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15">
                <h3 className="text-lg font-semibold text-[var(--ev-text)] mb-2">Телефон</h3>
                <p className="text-[var(--ev-text-muted)] text-sm">
                  <a href="tel:+375336540611" className="text-[var(--ev-gold)] hover:underline">+375 33 654-06-11</a>
                </p>
              </div>
            </div>
            <p className="text-[var(--ev-text-muted)] mt-4 text-sm">
              Поддержка доступна 24/7. Срок рассмотрения запросов — до 30 дней с момента получения.
            </p>
          </div>

          {/* Призыв к действию */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="p-8 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300 text-center">
              <h2 className="text-3xl font-semibold text-[var(--ev-text)] mb-4">
                Готовы продолжить?
              </h2>
              <p className="text-[var(--ev-text-muted)] mb-6 text-base max-w-2xl mx-auto">
                Ознакомьтесь с Политикой конфиденциальности и начните заказ товаров из Китая!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  onClick={() => navigate('/privacy-policy')}
                  className="flex items-center gap-2 bg-[var(--ev-gold)]/15 border border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/25"
                >
                  <LockClosedIcon className="w-5 h-5" />
                  Политика конфиденциальности
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/public-offer')}
                  className="flex items-center gap-2 border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/10"
                >
                  <DocumentCheckIcon className="w-5 h-5" />
                  Публичная оферта
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}

export default UserAgreement;
