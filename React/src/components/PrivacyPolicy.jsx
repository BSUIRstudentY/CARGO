import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LockClosedIcon, ShieldCheckIcon, UserIcon, KeyIcon, DocumentCheckIcon, ArrowPathIcon, ScaleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { Button } from './ui/Button';

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent text-[var(--ev-text)] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--ev-text)] mb-2">Политика обработки персональных данных</h1>
        <p className="text-[var(--ev-text-muted)] text-sm sm:text-base mb-8">Как мы собираем, используем и защищаем вашу информацию на Fluvion</p>

        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-10"
        >
          {/* Общие положения */}
          <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 mr-3">
                <DocumentCheckIcon className="w-6 h-6 text-[var(--ev-gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--ev-gold)]">
                1. Общие положения
              </h2>
            </div>
            <p className="text-[var(--ev-text-muted)] text-base leading-relaxed">
              В соответствии с Законом Республики Беларусь «О защите персональных данных» (№ 99-З), ИП Ковалевский Ярослав Андреевич (далее — Оператор), оператор сайта Fluvion (www.fluvion.by), собирает и обрабатывает персональные данные Заказчиков исключительно для выполнения заказов и доставки товаров из Китая. Политика действует с момента публикации и применяется ко всем пользователям сайта.
            </p>
          </div>

          {/* Состав собираемых данных */}
          <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 mr-3">
                <UserIcon className="w-6 h-6 text-[var(--ev-gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--ev-gold)]">
                2. Состав собираемых данных
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15">
                <div className="flex items-center gap-3 mb-3">
                  <UserIcon className="w-6 h-6 text-[var(--ev-gold)]" />
                  <h3 className="text-lg font-semibold text-[var(--ev-text)]">Персональные данные</h3>
                </div>
                <p className="text-[var(--ev-text-muted)] text-sm leading-relaxed">
                  ФИО, телефон, email, адрес доставки. Предоставляются добровольно при заказе товаров через сайт.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15">
                <div className="flex items-center gap-3 mb-3">
                  <InformationCircleIcon className="w-6 h-6 text-[var(--ev-gold)]" />
                  <h3 className="text-lg font-semibold text-[var(--ev-text)]">Технические данные</h3>
                </div>
                <p className="text-[var(--ev-text-muted)] text-sm leading-relaxed">
                  IP-адрес, тип браузера, данные об устройстве. Используются для обеспечения безопасности и аналитики.
                </p>
              </div>
            </div>
          </div>

          {/* Цели обработки */}
          <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 mr-3">
                <ShieldCheckIcon className="w-6 h-6 text-[var(--ev-gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--ev-gold)]">
                3. Цели обработки
              </h2>
            </div>
            <p className="text-[var(--ev-text-muted)] mb-4 text-base">Данные используются для:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15">
                <h3 className="text-lg font-semibold text-[var(--ev-text)] mb-2">Выполнение заказа</h3>
                <p className="text-[var(--ev-text-muted)] text-sm">
                  Оформление и обработка заказов, координация доставки через Карго и Европочту, предоставление информации о статусе доставки.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15">
                <h3 className="text-lg font-semibold text-[var(--ev-text)] mb-2">Уведомления и аналитика</h3>
                <p className="text-[var(--ev-text-muted)] text-sm">
                  Отправка уведомлений о статусе заказа, анонимизированная статистика для улучшения качества услуг.
                </p>
              </div>
            </div>
          </div>

          {/* Передача данных */}
          <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 mr-3">
                <LockClosedIcon className="w-6 h-6 text-[var(--ev-gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--ev-gold)]">
                4. Передача данных
              </h2>
            </div>
            <p className="text-[var(--ev-text-muted)] mb-4 text-base leading-relaxed">
              Данные передаются транспортной компании Карго и Европочте исключительно для доставки товаров. Все транзакции защищены 256-битным SSL-шифрованием через эквайринг BePaid. Данные не передаются третьим лицам без согласия Заказчика, за исключением случаев, предусмотренных законодательством Республики Беларусь.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 text-center">
                <div className="inline-block bg-[var(--ev-gold)]/10 rounded-full p-3 mb-3">
                  <span className="text-2xl font-bold text-[var(--ev-gold)]">1</span>
                </div>
                <h4 className="text-lg font-semibold text-[var(--ev-text)] mb-2">Карго</h4>
                <p className="text-[var(--ev-text-muted)] text-sm">Для международной доставки из Китая</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 text-center">
                <div className="inline-block bg-[var(--ev-gold)]/10 rounded-full p-3 mb-3">
                  <span className="text-2xl font-bold text-[var(--ev-gold)]">2</span>
                </div>
                <h4 className="text-lg font-semibold text-[var(--ev-text)] mb-2">Европочта</h4>
                <p className="text-[var(--ev-text-muted)] text-sm">Для внутренней доставки по РБ</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 text-center">
                <div className="inline-block bg-[var(--ev-gold)]/10 rounded-full p-3 mb-3">
                  <span className="text-2xl font-bold text-[var(--ev-gold)]">3</span>
                </div>
                <h4 className="text-lg font-semibold text-[var(--ev-text)] mb-2">SSL</h4>
                <p className="text-[var(--ev-text-muted)] text-sm">256-битное шифрование всех транзакций</p>
              </div>
            </div>
          </div>

          {/* Права Заказчика */}
          <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 mr-3">
                <ScaleIcon className="w-6 h-6 text-[var(--ev-gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--ev-gold)]">
                5. Права Заказчика
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 text-center">
                <h3 className="text-xl font-bold text-[var(--ev-gold)] mb-2">Доступ</h3>
                <p className="text-[var(--ev-text-muted)] text-sm">К своим персональным данным</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 text-center">
                <h3 className="text-xl font-bold text-[var(--ev-gold)] mb-2">Исправление</h3>
                <p className="text-[var(--ev-text-muted)] text-sm">Обновление информации в профиле</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 text-center">
                <h3 className="text-xl font-bold text-[var(--ev-gold)] mb-2">Удаление</h3>
                <p className="text-[var(--ev-text-muted)] text-sm">Запрос на удаление данных</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 text-center">
                <h3 className="text-xl font-bold text-[var(--ev-gold)] mb-2">Ограничение</h3>
                <p className="text-[var(--ev-text-muted)] text-sm">Обработки персональных данных</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 text-center sm:col-span-2">
                <h3 className="text-xl font-bold text-[var(--ev-gold)] mb-2">Запросы</h3>
                <p className="text-[var(--ev-text-muted)] text-sm">
                  По всем вопросам обращайтесь по email <a href="mailto:fluvionbiz@gmail.com" className="text-[var(--ev-gold)] hover:underline">fluvionbiz@gmail.com</a> или телефону <a href="tel:+375336540611" className="text-[var(--ev-gold)] hover:underline">+375 33 654-06-11</a>. Срок рассмотрения запросов — 30 дней.
                </p>
              </div>
            </div>
          </div>

          {/* Срок хранения */}
          <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 mr-3">
                <KeyIcon className="w-6 h-6 text-[var(--ev-gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--ev-gold)]">
                6. Срок хранения
              </h2>
            </div>
            <p className="text-[var(--ev-text-muted)] text-base leading-relaxed">
              Персональные данные хранятся в течение срока, необходимого для выполнения заказа, и удаляются после истечения 3 лет с момента последнего заказа, если иное не предусмотрено законодательством Республики Беларусь. Технические логи хранятся 1 год для обеспечения безопасности и предотвращения мошенничества.
            </p>
          </div>

          {/* Cookies и аналитика */}
          <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 mr-3">
                <InformationCircleIcon className="w-6 h-6 text-[var(--ev-gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--ev-gold)]">
                7. Cookies и аналитика
              </h2>
            </div>
            <p className="text-[var(--ev-text-muted)] text-base leading-relaxed">
              Сайт использует cookies для улучшения пользовательского опыта, сохранения настроек и аналитики. Вы можете управлять cookies в настройках браузера. Анонимизированные данные передаются сервисам аналитики для статистики и улучшения качества услуг. Мы не используем cookies для отслеживания пользователей без их согласия.
            </p>
          </div>

          {/* Изменения политики */}
          <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 mr-3">
                <ArrowPathIcon className="w-6 h-6 text-[var(--ev-gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--ev-gold)]">
                8. Изменения политики
              </h2>
            </div>
            <p className="text-[var(--ev-text-muted)] text-base leading-relaxed">
              Оператор оставляет за собой право изменять настоящую Политику обработки персональных данных. Изменения вступают в силу с момента публикации на сайте www.fluvion.by. Рекомендуется регулярно проверять обновления политики. Продолжение использования сайта после внесения изменений означает согласие с обновленной политикой.
            </p>
          </div>

          {/* Контакты */}
          <div className="p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 mr-3">
                <LockClosedIcon className="w-6 h-6 text-[var(--ev-gold)]" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--ev-gold)]">
                9. Контакты
              </h2>
            </div>
            <p className="text-[var(--ev-text-muted)] text-base leading-relaxed mb-4">
              По вопросам обработки персональных данных, реализации прав Заказчика или подачи запросов обращайтесь:
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
                Ознакомьтесь с Согласием на обработку персональных данных и начните заказ товаров из Китая!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  onClick={() => navigate('/user-agreement')}
                  className="flex items-center gap-2 bg-[var(--ev-gold)]/15 border border-[var(--ev-gold)]/30 text-[var(--ev-gold)] hover:bg-[var(--ev-gold)]/25"
                >
                  <DocumentCheckIcon className="w-5 h-5" />
                  Согласие на обработку
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

export default PrivacyPolicy;
