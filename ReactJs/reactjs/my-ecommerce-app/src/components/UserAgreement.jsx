import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LockClosedIcon, ShieldCheckIcon, UserIcon, DocumentCheckIcon, ArrowPathIcon, ScaleIcon, InformationCircleIcon, KeyIcon } from '@heroicons/react/24/solid';

function UserAgreement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isImageVisible, setIsImageVisible] = useState(false);
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    setIsImageVisible(true);
  }, []);

  return (
    <>
      {/* Full-Page Container - Dark Theme */}
      <div className="min-h-screen bg-bg-primary text-text-primary font-sans">
        {/* Hero Section */}
        <section className="hero pt-24 pb-16 relative min-h-screen flex items-center justify-center" style={{
          backgroundImage: `url(/main.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}>
          <div className="container-xl mx-auto px-4 w-full max-w-7xl relative z-10">
            <div className="bg-bg-secondary/40 backdrop-blur-md rounded-2xl p-8 shadow-card text-center">
              <div className="flex flex-col items-center justify-center">
                <h1 className="text-5xl lg:text-6xl font-display font-bold mb-4 text-accent-primary">
                  Согласие на обработку персональных данных
                </h1>
                <p className="lead text-lg text-text-secondary mb-6 max-w-prose mx-auto">
                  Ваше согласие на сбор и использование информации для предоставления услуг на Fluvion
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Intro Section - Like About */}
        <section id="intro" className="py-16 bg-bg-secondary">
          <div className="container-xl mx-auto px-4 w-full max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-items-center">
              <div className="order-2 lg:order-1 flex justify-center">
                <div className={`rounded-xl overflow-hidden ${isImageVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 shadow-card`}>
                  <img
                    src="/data-consent.png" // Placeholder for consent image
                    alt="Data Consent"
                    className="w-full h-64 lg:h-80 object-cover"
                  />
                </div>
              </div>
              <div className="order-1 lg:order-2 flex justify-center">
                <div className="text-center max-w-prose">
                  <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6 text-accent-primary">Ваше согласие</h2>
                  <p className="text-lg text-text-secondary mb-6">
                    Оформляя заказ на сайте Fluvion (www.fluvion.by), Заказчик подтверждает свое согласие на обработку персональных данных (ФИО, телефон, email, адрес) в соответствии с <a href="/privacy-policy" className="text-accent-primary hover:text-accent-primary/90 underline">Политикой обработки данных</a> и <a href="/public-offer" className="text-accent-primary hover:text-accent-primary/90 underline">Публичной офертой</a>. Согласие предоставляется добровольно при оформлении заказа через разделы <span className="font-bold text-accent-primary">Каталог</span>, <span className="font-bold text-accent-primary">Терминал</span> или <span className="font-bold text-accent-primary">Корзина</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Processing Section - Like Advantages */}
        <section id="processing" className="py-16 bg-section-gradient">
          <div className="container-xl mx-auto px-4 w-full max-w-7xl text-center">
            <div className="mb-8 text-2xl lg:text-3xl font-display font-bold text-accent-primary">
              Обработка данных
            </div>
            <div className="advantages__list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              <div className="advantages__item-wrap">
                <div className="advantages__item">
                  <div className="advantages__item-title text-xl font-semibold mb-4 text-text-primary">2. Обработка данных</div>
                  <div className="advantages__item-img mb-4">
                    <ShieldCheckIcon className="w-12 h-12 text-accent-primary" />
                  </div>
                  <div className="advantages__item-about text-text-secondary">Обработка включает сбор, хранение, использование и передачу данных для целей выполнения заказа и доставки. Данные обрабатываются в соответствии с Законом Республики Беларусь «О защите персональных данных» (№ 99-З) и хранятся в защищенных системах.</div>
                </div>
              </div>
              <div className="advantages__item-wrap">
                <div className="advantages__item">
                  <div className="advantages__item-title text-xl font-semibold mb-4 text-text-primary">7. Меры безопасности</div>
                  <div className="advantages__item-img mb-4">
                    <ShieldCheckIcon className="w-12 h-12 text-accent-primary" />
                  </div>
                  <div className="advantages__item-about text-text-secondary">Оператор применяет технические и организационные меры для защиты данных: 256-битное SSL-шифрование, firewalls, регулярные аудиты безопасности. Доступ к данным ограничен авторизованным сотрудникам.</div>
                </div>
              </div>
            </div>
          </div>
          <style jsx>{`
            * {
              text-decoration: none;
              color: #f5f9ff;
              box-sizing: border-box;
              font-family: Montserrat, sans-serif;
              font-size: 16px;
              line-height: 125%;
              font-weight: 500;
            }
            .advantages__item {
              width: 100%;
              padding: 24px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              gap: 24px 0;
              height: 100%;
              border-radius: 6px;
              box-shadow: 0 12px 29px -5px #0000006b;
              background: #121212;
              z-index: 2;
              position: relative;
              transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            .advantages__item:hover {
              transform: translateY(-5px);
              box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
            }
            .advantages__item-title {
              font-family: Montserrat, sans-serif;
              font-size: 16px;
              line-height: 125%;
              font-weight: 500;
              color: #f5f9ff;
              text-decoration: none;
            }
            .advantages__item-about {
              font-family: Montserrat, sans-serif;
              font-size: 16px;
              line-height: 125%;
              font-weight: 500;
              color: #f5f9ff;
              text-decoration: none;
              text-align: center;
            }
            .advantages__item-wrap {
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 1px;
              height: 100%;
              border-radius: 6px;
              box-shadow: 0 12px 29px -5px rgba(0, 0, 0, 0.42);
              position: relative;
              overflow: hidden;
            }
            .advantages__item-wrap:before {
              content: "";
              position: absolute;
              display: block;
              background: linear-gradient(340deg, rgb(8, 8, 8) 0%, rgb(255, 37, 73) 50%, rgb(8, 8, 8) 80%);
              width: 100%;
              height: 110%;
              z-index: 1;
            }
            .advantages__item-wrap:nth-child(2):before {
              background: linear-gradient(-45deg, rgb(8, 8, 8) 20%, rgb(255, 37, 73) 50%, rgb(8, 8, 8) 80%);
            }
            .advantages__item-wrap:hover:before {
              animation: rotate-gradient linear 5s normal infinite;
            }
            @keyframes rotate-gradient {
              0% { transform: rotate(0deg); width: 100%; }
              50% { transform: rotate(180deg); width: 200%; }
              100% { transform: rotate(360deg); width: 100%; }
            }
          `}</style>
        </section>

        {/* Rights Section - Like Services */}
        <section id="rights" className="py-16 bg-bg-primary">
          <div className="container-xl mx-auto px-4 w-full max-w-7xl text-center">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-8 text-accent-primary">3. Права и обязанности</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="services__item-wrap">
                <div className="services__item">
                  <div className="services__item-title text-xl font-semibold mb-4 text-text-primary">Права Заказчика</div>
                  <div className="services__item-info text-text-secondary text-center">
                    <div className="services__item-price mb-2 text-accent-primary">Доступ и контроль</div>
                    <div className="services__item-term">Доступ, исправление, удаление данных; отзыв согласия</div>
                  </div>
                </div>
              </div>
              <div className="services__item-wrap">
                <div className="services__item">
                  <div className="services__item-title text-xl font-semibold mb-4 text-text-primary">Обязанности</div>
                  <div className="services__item-info text-text-secondary text-center">
                    <div className="services__item-price mb-2 text-accent-primary">Достоверность данных</div>
                    <div className="services__item-term">Предоставить верные данные; не использовать сайт незаконно</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <style jsx>{`
            * {
              text-decoration: none;
              color: #f5f9ff;
              box-sizing: border-box;
              font-family: Montserrat, sans-serif;
              font-size: 16px;
              line-height: 125%;
              font-weight: 500;
            }
            .services__item {
              width: 100%;
              padding: 24px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              gap: 24px 0;
              height: 100%;
              border-radius: 6px;
              box-shadow: 0 12px 29px -5px #0000006b;
              background: #121212;
              z-index: 2;
              position: relative;
              transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            .services__item:hover {
              transform: translateY(-5px);
              box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
            }
            .services__item-title {
              font-family: Montserrat, sans-serif;
              font-size: 16px;
              line-height: 125%;
              font-weight: 500;
              color: #f5f9ff;
              text-decoration: none;
            }
            .services__item-info {
              font-family: Montserrat, sans-serif;
              font-size: 16px;
              line-height: 125%;
              font-weight: 500;
              color: #f5f9ff;
              text-decoration: none;
              text-align: center;
            }
            .services__item-wrap {
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 1px;
              height: 100%;
              border-radius: 6px;
              box-shadow: 0 12px 29px -5px rgba(0, 0, 0, 0.42);
              position: relative;
              overflow: hidden;
            }
            .services__item-wrap:before {
              content: "";
              position: absolute;
              display: block;
              background: linear-gradient(340deg, rgb(8, 8, 8) 0%, rgb(255, 37, 73) 50%, rgb(8, 8, 8) 80%);
              width: 100%;
              height: 110%;
              z-index: 1;
            }
            .services__item-wrap:nth-child(2):before {
              background: linear-gradient(-45deg, rgb(8, 8, 8) 20%, rgb(255, 37, 73) 50%, rgb(8, 8, 8) 80%);
            }
            .services__item-wrap:hover:before {
              animation: rotate-gradient linear 5s normal infinite;
            }
            @keyframes rotate-gradient {
              0% { transform: rotate(0deg); width: 100%; }
              50% { transform: rotate(180deg); width: 200%; }
              100% { transform: rotate(360deg); width: 100%; }
            }
          `}</style>
        </section>

        {/* Withdrawal Section - Like History */}
        <section id="withdrawal" className="py-16 bg-bg-secondary">
          <div className="container-xl mx-auto px-4 w-full max-w-7xl text-center">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6 text-accent-primary">4. Отзыв согласия</h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              Заказчик может отозвать согласие, обратившись по email: <a href="mailto:support@fluvion.by" className="text-accent-primary">support@fluvion.by</a>. Отзыв согласия может ограничить возможность выполнения заказа. Запросы обрабатываются в течение 30 дней.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
              <div className="text-center">
                <div className="inline-block bg-bg-tertiary rounded-full p-4 mb-4">
                  <span className="text-2xl font-bold text-accent-primary">1</span>
                </div>
                <h4 className="text-xl font-semibold mb-2 text-text-primary">Запрос</h4>
                <p className="text-text-muted">Отправьте email с описанием.</p>
              </div>
              <div className="text-center">
                <div className="inline-block bg-bg-tertiary rounded-full p-4 mb-4">
                  <span className="text-2xl font-bold text-accent-primary">2</span>
                </div>
                <h4 className="text-xl font-semibold mb-2 text-text-primary">Обработка</h4>
                <p className="text-text-muted">В течение 30 дней.</p>
              </div>
              <div className="text-center">
                <div className="inline-block bg-bg-tertiary rounded-full p-4 mb-4">
                  <span className="text-2xl font-bold text-accent-primary">3</span>
                </div>
                <h4 className="text-xl font-semibold mb-2 text-text-primary">Подтверждение</h4>
                <p className="text-text-muted">Уведомление по email.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Responsibility Section - Like Stats */}
        <section id="responsibility" className="py-16 bg-bg-primary">
          <div className="container-xl mx-auto px-4 w-full max-w-7xl">
            <div className="bg-bg-tertiary rounded-lg p-6 sm:p-10 shadow-card mx-auto max-w-4xl">
              <div className="text-center mb-6">
                <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6 text-accent-primary">5. Ответственность</h2>
                <KeyIcon className="w-16 h-16 text-accent-primary mx-auto mb-4" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center justify-items-center">
                <div>
                  <h3 className="text-4xl font-bold text-text-primary">Оператор</h3>
                  <p className="text-text-muted">Конфиденциальность и безопасность данных по закону. Компенсация ущерба при нарушении.</p>
                </div>
                <div>
                  <h3 className="text-4xl font-bold text-text-primary">Заказчик</h3>
                  <p className="text-text-muted">Достоверность данных. Ответственность за предоставленную информацию.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contacts Section */}
        <section id="contacts" className="py-16 bg-bg-secondary">
          <div className="container-xl mx-auto px-4 w-full max-w-7xl text-center">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6 text-accent-primary">6. Контакты</h2>
            <p className="text-lg text-text-secondary mb-8 max-w-prose mx-auto">
              По вопросам обработки персональных данных обращайтесь по email <a href="mailto:support@fluvion.by" className="text-accent-primary">support@fluvion.by</a> или телефону <a href="tel:+375291234567" className="text-accent-primary">+375 29 123-45-67</a>. Поддержка доступна 24/7.
            </p>
            <InformationCircleIcon className="w-16 h-16 text-accent-primary mx-auto mb-4" />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-bg-primary">
          <div className="container-xl mx-auto px-4 w-full max-w-7xl text-center">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6 text-accent-primary">Готовы продолжить?</h2>
            <p className="text-lg text-text-secondary mb-8 max-w-prose mx-auto">
              Ознакомьтесь с Политикой конфиденциальности и начните заказ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/privacy-policy')}
                className="bg-accent-primary text-text-primary px-8 py-3 rounded-md hover:bg-accent-primary/90 transition duration-300 text-base font-medium"
              >
                Политика конфиденциальности
              </button>
              <button
                onClick={() => navigate('/public-offer')}
                className="bg-transparent border-2 border-accent-primary text-accent-primary px-8 py-3 rounded-md hover:bg-accent-primary hover:text-text-primary transition duration-300 text-base font-medium"
              >
                Публичная оферта
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-bg-secondary text-center text-text-muted text-sm">
          <p>© 2025 Fluvion. Все права защищены.</p>
          <p className="mt-1 text-accent-primary">Обновлено: 20.10.2025</p>
        </footer>
      </div>

      {/* Scroll to Top Button */}
      <a href="#" className="fixed bottom-6 right-6 bg-accent-primary text-text-primary p-3 rounded-full shadow-card hover:bg-accent-primary/90 transition duration-300 hidden md:block">
        <i className="bi bi-arrow-up-short"></i>
      </a>
    </>
  );
}

export default UserAgreement;