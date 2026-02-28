import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LockClosedIcon, ShieldCheckIcon, UserIcon, KeyIcon, DocumentCheckIcon, ArrowPathIcon, ScaleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { PageHeader } from './ui/PageHeader';
import { Button } from './ui/Button';

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <PageHeader 
          title="Политика обработки персональных данных"
          subtitle="Как мы собираем, используем и защищаем вашу информацию на Fluvion"
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
            <p className="text-[#9ca3af] text-base leading-relaxed">
              В соответствии с Законом Республики Беларусь «О защите персональных данных» (№ 99-З), ИП Ковалевский Ярослав Андреевич (далее — Оператор), оператор сайта Fluvion (www.fluvion.by), собирает и обрабатывает персональные данные Заказчиков исключительно для выполнения заказов и доставки товаров из Китая. Политика действует с момента публикации и применяется ко всем пользователям сайта.
            </p>
          </div>

          {/* Состав собираемых данных */}
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.3)] mr-3">
                <UserIcon className="w-6 h-6 text-[#a78bfa]" />
              </div>
              <h2 className="text-2xl font-bold text-[#a78bfa]">
                2. Состав собираемых данных
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-3 mb-3">
                  <UserIcon className="w-6 h-6 text-[#00f0ff]" />
                  <h3 className="text-lg font-semibold text-[#e5e7eb]">Персональные данные</h3>
                </div>
                <p className="text-[#9ca3af] text-sm leading-relaxed">
                  ФИО, телефон, email, адрес доставки. Предоставляются добровольно при заказе товаров через сайт.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-3 mb-3">
                  <InformationCircleIcon className="w-6 h-6 text-[#a78bfa]" />
                  <h3 className="text-lg font-semibold text-[#e5e7eb]">Технические данные</h3>
                </div>
                <p className="text-[#9ca3af] text-sm leading-relaxed">
                  IP-адрес, тип браузера, данные об устройстве. Используются для обеспечения безопасности и аналитики.
                </p>
              </div>
            </div>
          </div>

          {/* Цели обработки */}
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] mr-3">
                <ShieldCheckIcon className="w-6 h-6 text-[#00f0ff]" />
              </div>
              <h2 className="text-2xl font-bold text-[#00f0ff]">
                3. Цели обработки
              </h2>
            </div>
            <p className="text-[#9ca3af] mb-4 text-base">Данные используются для:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-semibold text-[#e5e7eb] mb-2">Выполнение заказа</h3>
                <p className="text-[#9ca3af] text-sm">
                  Оформление и обработка заказов, координация доставки через Карго и Европочту, предоставление информации о статусе доставки.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-semibold text-[#e5e7eb] mb-2">Уведомления и аналитика</h3>
                <p className="text-[#9ca3af] text-sm">
                  Отправка уведомлений о статусе заказа, анонимизированная статистика для улучшения качества услуг.
                </p>
              </div>
            </div>
          </div>

          {/* Передача данных */}
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] mr-3">
                <LockClosedIcon className="w-6 h-6 text-[#10b981]" />
              </div>
              <h2 className="text-2xl font-bold text-[#10b981]">
                4. Передача данных
              </h2>
            </div>
            <p className="text-[#9ca3af] mb-4 text-base leading-relaxed">
              Данные передаются транспортной компании Карго и Европочте исключительно для доставки товаров. Все транзакции защищены 256-битным SSL-шифрованием через эквайринг BePaid. Данные не передаются третьим лицам без согласия Заказчика, за исключением случаев, предусмотренных законодательством Республики Беларусь.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-center">
                <div className="inline-block bg-[rgba(0,240,255,0.1)] rounded-full p-3 mb-3">
                  <span className="text-2xl font-bold text-[#00f0ff]">1</span>
                </div>
                <h4 className="text-lg font-semibold text-[#e5e7eb] mb-2">Карго</h4>
                <p className="text-[#9ca3af] text-sm">Для международной доставки из Китая</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-center">
                <div className="inline-block bg-[rgba(167,139,250,0.1)] rounded-full p-3 mb-3">
                  <span className="text-2xl font-bold text-[#a78bfa]">2</span>
                </div>
                <h4 className="text-lg font-semibold text-[#e5e7eb] mb-2">Европочта</h4>
                <p className="text-[#9ca3af] text-sm">Для внутренней доставки по РБ</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-center">
                <div className="inline-block bg-[rgba(16,185,129,0.1)] rounded-full p-3 mb-3">
                  <span className="text-2xl font-bold text-[#10b981]">3</span>
                </div>
                <h4 className="text-lg font-semibold text-[#e5e7eb] mb-2">SSL</h4>
                <p className="text-[#9ca3af] text-sm">256-битное шифрование всех транзакций</p>
              </div>
            </div>
          </div>

          {/* Права Заказчика */}
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.3)] mr-3">
                <ScaleIcon className="w-6 h-6 text-[#a78bfa]" />
              </div>
              <h2 className="text-2xl font-bold text-[#a78bfa]">
                5. Права Заказчика
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-center">
                <h3 className="text-xl font-bold text-[#00f0ff] mb-2">Доступ</h3>
                <p className="text-[#9ca3af] text-sm">К своим персональным данным</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-center">
                <h3 className="text-xl font-bold text-[#a78bfa] mb-2">Исправление</h3>
                <p className="text-[#9ca3af] text-sm">Обновление информации в профиле</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-center">
                <h3 className="text-xl font-bold text-[#10b981] mb-2">Удаление</h3>
                <p className="text-[#9ca3af] text-sm">Запрос на удаление данных</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-center">
                <h3 className="text-xl font-bold text-[#00f0ff] mb-2">Ограничение</h3>
                <p className="text-[#9ca3af] text-sm">Обработки персональных данных</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-center sm:col-span-2">
                <h3 className="text-xl font-bold text-[#a78bfa] mb-2">Запросы</h3>
                <p className="text-[#9ca3af] text-sm">
                  По всем вопросам обращайтесь по email <a href="mailto:fluvionbiz@gmail.com" className="text-[#00f0ff] hover:underline">fluvionbiz@gmail.com</a> или телефону <a href="tel:+375336540611" className="text-[#00f0ff] hover:underline">+375 33 654-06-11</a>. Срок рассмотрения запросов — 30 дней.
                </p>
              </div>
            </div>
          </div>

          {/* Срок хранения */}
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] mr-3">
                <KeyIcon className="w-6 h-6 text-[#00f0ff]" />
              </div>
              <h2 className="text-2xl font-bold text-[#00f0ff]">
                6. Срок хранения
              </h2>
            </div>
            <p className="text-[#9ca3af] text-base leading-relaxed">
              Персональные данные хранятся в течение срока, необходимого для выполнения заказа, и удаляются после истечения 3 лет с момента последнего заказа, если иное не предусмотрено законодательством Республики Беларусь. Технические логи хранятся 1 год для обеспечения безопасности и предотвращения мошенничества.
            </p>
          </div>

          {/* Cookies и аналитика */}
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] mr-3">
                <InformationCircleIcon className="w-6 h-6 text-[#10b981]" />
              </div>
              <h2 className="text-2xl font-bold text-[#10b981]">
                7. Cookies и аналитика
              </h2>
            </div>
            <p className="text-[#9ca3af] text-base leading-relaxed">
              Сайт использует cookies для улучшения пользовательского опыта, сохранения настроек и аналитики. Вы можете управлять cookies в настройках браузера. Анонимизированные данные передаются сервисам аналитики для статистики и улучшения качества услуг. Мы не используем cookies для отслеживания пользователей без их согласия.
            </p>
          </div>

          {/* Изменения политики */}
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[rgba(167,139,250,0.1)] border border-[rgba(167,139,250,0.3)] mr-3">
                <ArrowPathIcon className="w-6 h-6 text-[#a78bfa]" />
              </div>
              <h2 className="text-2xl font-bold text-[#a78bfa]">
                8. Изменения политики
              </h2>
            </div>
            <p className="text-[#9ca3af] text-base leading-relaxed">
              Оператор оставляет за собой право изменять настоящую Политику обработки персональных данных. Изменения вступают в силу с момента публикации на сайте www.fluvion.by. Рекомендуется регулярно проверять обновления политики. Продолжение использования сайта после внесения изменений означает согласие с обновленной политикой.
            </p>
          </div>

          {/* Контакты */}
          <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] mr-3">
                <LockClosedIcon className="w-6 h-6 text-[#00f0ff]" />
              </div>
              <h2 className="text-2xl font-bold text-[#00f0ff]">
                9. Контакты
              </h2>
            </div>
            <p className="text-[#9ca3af] text-base leading-relaxed mb-4">
              По вопросам обработки персональных данных, реализации прав Заказчика или подачи запросов обращайтесь:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-semibold text-[#e5e7eb] mb-2">Email</h3>
                <p className="text-[#9ca3af] text-sm">
                  <a href="mailto:fluvionbiz@gmail.com" className="text-[#00f0ff] hover:underline">fluvionbiz@gmail.com</a>
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <h3 className="text-lg font-semibold text-[#e5e7eb] mb-2">Телефон</h3>
                <p className="text-[#9ca3af] text-sm">
                  <a href="tel:+375336540611" className="text-[#00f0ff] hover:underline">+375 33 654-06-11</a>
                </p>
              </div>
            </div>
            <p className="text-[#9ca3af] mt-4 text-sm">
              Поддержка доступна 24/7. Срок рассмотрения запросов — до 30 дней с момента получения.
            </p>
          </div>

          {/* Призыв к действию */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300 text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent mb-4">
                Готовы продолжить?
              </h2>
              <p className="text-[#9ca3af] mb-6 text-base max-w-2xl mx-auto">
                Ознакомьтесь с Согласием на обработку персональных данных и начните заказ товаров из Китая!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="primary"
                  onClick={() => navigate('/user-agreement')}
                  className="flex items-center gap-2"
                >
                  <DocumentCheckIcon className="w-5 h-5" />
                  Согласие на обработку
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/public-offer')}
                  className="flex items-center gap-2"
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
