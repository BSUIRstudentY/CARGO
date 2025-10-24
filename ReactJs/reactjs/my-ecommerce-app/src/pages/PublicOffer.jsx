import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DocumentCheckIcon, ShoppingCartIcon, CreditCardIcon, TruckIcon, ShieldCheckIcon, ArrowPathIcon, LockClosedIcon, ScaleIcon, UserIcon } from '@heroicons/react/24/solid';

function PublicOffer() {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [isImageVisible, setIsImageVisible] = useState(false);

  useEffect(() => {
    setIsImageVisible(true);
  }, []);

  return (
    <>
      {/* Full-Page Container - Dark Theme */}
      <div className="min-h-screen bg-bg-primary text-text-primary font-sans">
        {/* Hero Section - Full-Width */}
        <section className="hero pt-24 pb-16 relative min-h-screen flex items-center justify-center bg-gradient-to-b from-bg-primary to-bg-secondary">
          <div className="container-xl mx-auto px-4 w-full max-w-7xl relative z-10">
            <div className="bg-bg-secondary/40 backdrop-blur-md rounded-2xl p-8 shadow-card text-center">
              <div className="flex flex-col items-center justify-center">
                <h1 className="text-5xl lg:text-6xl font-display font-bold mb-4 text-accent-primary">
                  Публичная оферта
                </h1>
                <p className="lead text-lg text-text-secondary mb-6 max-w-prose mx-auto">
                  Условия предоставления посреднических услуг по заказу и доставке товаров из Китая
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* General Provisions Section */}
        <section id="general" className="py-16 bg-bg-secondary">
          <div className="container-xl mx-auto px-4 w-full max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1 flex justify-center">
                <div className={`rounded-xl overflow-hidden ${isImageVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500 shadow-card`}>
                  <DocumentCheckIcon className="w-full h-64 lg:h-80 text-accent-primary p-8" />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="text-left max-w-prose">
                  <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6 text-accent-primary">1. Общие положения</h2>
                  <p className="text-lg text-text-secondary mb-6">
                    Настоящий документ является публичной офертой индивидуального предпринимателя Ковалевского Ярослава Андреевича (далее — Посредник) в соответствии со статьями 405 и 407 Гражданского кодекса Республики Беларусь. Оферта адресована неопределенному кругу физических и юридических лиц (далее — Заказчик) и содержит все существенные условия договора на оказание посреднических услуг по заказу и доставке товаров из Китая через сайт Fluvion (www.fluvion.by). Оформление заказа через разделы <span className="font-bold text-accent-primary">Каталог</span>, <span className="font-bold text-accent-primary">Терминал</span> или <span className="font-bold text-accent-primary">Корзина</span> на сайте, либо оплата услуг является полным и безоговорочным акцептом условий настоящей оферты.
                  </p>
                  <p className="text-lg text-text-secondary">
                    Дополнительные сведения о процессе заказа, доставки и оплаты приведены в разделах{' '}
                    <a href="/order-instructions" className="text-accent-primary hover:text-accent-primary/90 underline">
                      Инструкции по заказу
                    </a>
                    ,{' '}
                    <a href="/delivery-payment" className="text-accent-primary hover:text-accent-primary/90 underline">
                      Доставка и оплата
                    </a>{' '}
                    и{' '}
                    <a href="/faq" className="text-accent-primary hover:text-accent-primary/90 underline">
                      FAQ
                    </a>{' '}
                    на сайте Fluvion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Subject of the Contract Section - Like Advantages */}
        <section id="subject" className="py-16 bg-section-gradient">
          <div className="container-xl mx-auto px-4 w-full max-w-7xl text-center">
            <div className="mb-8 text-2xl lg:text-3xl font-display font-bold text-accent-primary">
              2. Предмет договора
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              <div className="advantages__item-wrap">
                <div className="advantages__item">
                  <div className="advantages__item-title text-xl font-semibold mb-4 text-text-primary">Обязанности Посредника</div>
                  <div className="advantages__item-img mb-4">
                    <ShoppingCartIcon className="w-12 h-12 text-accent-primary" />
                  </div>
                  <div className="advantages__item-about text-text-secondary">Оказать услуги по заказу товара и организации доставки из Китая, включая базовую проверку упаковки и координацию логистики через Карго.</div>
                </div>
              </div>
              <div className="advantages__item-wrap">
                <div className="advantages__item">
                  <div className="advantages__item-title text-xl font-semibold mb-4 text-text-primary">Обязанности Заказчика</div>
                  <div className="advantages__item-img mb-4">
                    <ShoppingCartIcon className="w-12 h-12 text-accent-primary" />
                  </div>
                  <div className="advantages__item-about text-text-secondary">Предоставить достоверные данные о товаре и доставке, оплатить услуги в установленном порядке. Дополнительная проверка качества — от $5.</div>
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

        {/* Cost and Payment Section - Like Services */}
        <section id="cost" className="py-16 bg-bg-primary">
          <div className="container-xl mx-auto px-4 w-full max-w-7xl text-center">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-8 text-accent-primary">3. Стоимость и порядок оплаты</h2>
            <p className="text-lg text-text-secondary mb-6">Стоимость услуг Посредника включает:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="services__item-wrap">
                <div className="services__item">
                  <div className="services__item-title text-xl font-semibold mb-4 text-text-primary">Комиссия за услуги</div>
                  <div className="services__item-info text-text-secondary text-center">
                    <div className="services__item-price mb-2 text-accent-primary">10% от стоимости товара</div>
                    <div className="services__item-term">По курсу BYN/CNY Альфа-Банка</div>
                  </div>
                </div>
              </div>
              <div className="services__item-wrap">
                <div className="services__item">
                  <div className="services__item-title text-xl font-semibold mb-4 text-text-primary">Международная доставка</div>
                  <div className="services__item-info text-text-secondary text-center">
                    <div className="services__item-price mb-2 text-accent-primary">$6 за кг</div>
                    <div className="services__item-term">Минимальный вес — 1 кг</div>
                  </div>
                </div>
              </div>
              <div className="services__item-wrap md:col-span-2">
                <div className="services__item">
                  <div className="services__item-title text-xl font-semibold mb-4 text-text-primary">Упаковка и Европочта</div>
                  <div className="services__item-info text-text-secondary text-center">
                    <div className="services__item-price mb-2 text-accent-primary">$3 стандарт / $5 хрупкие</div>
                    <div className="services__item-term">Услуги Европочты: 2–5 дней, зависит от региона</div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-lg text-text-secondary mt-8 max-w-prose mx-auto">
              Итоговая стоимость отображается в <span className="font-bold text-accent-primary">Профиле</span>. Оплата через эквайринг Альфа-Банка в 3 дня. Доставка оплачивается при получении. Защищено SSL.
            </p>
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

        {/* Rights and Obligations Section - Like History */}
        <section id="rights" className="py-16 bg-bg-secondary">
          <div className="container-xl mx-auto px-4 w-full max-w-7xl text-center">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6 text-accent-primary">4. Права и обязанности сторон</h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              Подробное описание обязательств сторон.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 justify-items-center">
              <div className="text-left">
                <div className="inline-block bg-bg-tertiary rounded-full p-4 mb-4">
                  <span className="text-2xl font-bold text-accent-primary">Посредник</span>
                </div>
                <h4 className="text-xl font-semibold mb-2 text-text-primary">Обязуется</h4>
                <ul className="text-text-muted space-y-2">
                  <li>Заказать товар и организовать доставку.</li>
                  <li>Провести базовую проверку (качество — за доплату от $5).</li>
                  <li>Передать груз Карго и уведомить о статусе в <span className="font-bold text-accent-primary">Профиле</span>.</li>
                </ul>
              </div>
              <div className="text-left">
                <div className="inline-block bg-bg-tertiary rounded-full p-4 mb-4">
                  <span className="text-2xl font-bold text-accent-primary">Заказчик</span>
                </div>
                <h4 className="text-xl font-semibold mb-2 text-text-primary">Обязуется</h4>
                <ul className="text-text-muted space-y-2">
                  <li>Предоставить достоверные данные.</li>
                  <li>Оплатить в 3 дня через Альфа-Банк.</li>
                  <li>Проверить заказ в <span className="font-bold text-accent-primary">Профиле</span> и оплатить доставку.</li>
                </ul>
                <p className="text-text-muted mt-4">Посредник не отвечает за качество без доп. проверки и задержки перевозчика.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Delivery Conditions Section */}
        <section id="delivery" className="py-16 bg-bg-primary">
          <div className="container-xl mx-auto px-4 w-full max-w-7xl text-center">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6 text-accent-primary">5. Условия доставки</h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              Доставка в два этапа с отслеживанием в <span className="font-bold text-accent-primary">Профиле</span>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 justify-items-center">
              <div className="text-center">
                <div className="inline-block bg-bg-tertiary rounded-full p-4 mb-4">
                  <TruckIcon className="w-8 h-8 text-accent-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2 text-text-primary">Международная</h4>
                <p className="text-text-muted">Через Карго в Минск (18–35 дней, $6/кг)</p>
              </div>
              <div className="text-center">
                <div className="inline-block bg-bg-tertiary rounded-full p-4 mb-4">
                  <TruckIcon className="w-8 h-8 text-accent-primary" />
                </div>
                <h4 className="text-xl font-semibold mb-2 text-text-primary">Внутренняя</h4>
                <p className="text-text-muted">Через Европочту (2–5 дней, зависит от региона)</p>
              </div>
            </div>
            <p className="text-text-muted mt-4">Ответственность за груз после передачи — перевозчик.</p>
          </div>
        </section>

        {/* Returns and Claims Section */}
        <section id="returns" className="py-16 bg-bg-secondary">
          <div className="container-xl mx-auto px-4 w-full max-w-7xl text-center">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6 text-accent-primary">6. Правила возврата и претензии</h2>
            <p className="text-lg text-text-secondary mb-6">Возврат невозможен после оплаты. Ориентируйтесь на отзывы в <span className="font-bold text-accent-primary">Каталоге</span>.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-left">
                <h4 className="text-xl font-semibold mb-2 text-text-primary">Претензии по качеству</h4>
                <ul className="text-text-muted space-y-2">
                  <li>Повреждение по вине Посредника (со страховкой): компенсация в 7 дней.</li>
                  <li>Вина поставщика: содействие в претензии.</li>
                  <li>Срок: 15 дней. Email: <a href="mailto:support@fluvion.by" className="text-accent-primary">support@fluvion.by</a>, Тел: <a href="tel:+375291234567" className="text-accent-primary">+375 29 123-45-67</a>.</li>
                </ul>
              </div>
              <div className="text-left">
                <ArrowPathIcon className="w-12 h-12 text-accent-primary mb-4" />
                <p className="text-text-muted">Укажите номер заказа и описание проблемы.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Confidentiality Section */}
        <section id="confidentiality" className="py-16 bg-bg-primary">
          <div className="container-xl mx-auto px-4 w-full max-w-7xl text-center">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6 text-accent-primary">7. Конфиденциальность</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Согласие на обработку данных (ФИО, телефон, email, адрес) по Закону РБ № 99-З. Данные для заказа, не передаются третьим лицам (кроме доставки).
            </p>
            <LockClosedIcon className="w-16 h-16 text-accent-primary mx-auto mt-6" />
          </div>
        </section>

        {/* Term and Jurisdiction Section */}
        <section id="term" className="py-16 bg-bg-secondary">
          <div className="container-xl mx-auto px-4 w-full max-w-7xl text-center">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6 text-accent-primary">8. Срок действия и юрисдикция</h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Действует с публикации на www.fluvion.by. Изменения — с публикации. Споры по законодательству РБ. Место: г. Солигорск.
            </p>
            <ScaleIcon className="w-16 h-16 text-accent-primary mx-auto mt-6" />
          </div>
        </section>

        {/* Mediator Details Section - Like Stats */}
        <section id="details" className="py-16 bg-bg-primary">
          <div className="container-xl mx-auto px-4 w-full max-w-7xl">
            <div className="bg-bg-tertiary rounded-lg p-6 sm:p-10 shadow-card mx-auto max-w-4xl">
              <div className="text-center mb-6">
                <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6 text-accent-primary">9. Реквизиты Посредника</h2>
                <UserIcon className="w-16 h-16 text-accent-primary mx-auto mb-4" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="text-xl font-bold text-text-primary">Исполнитель</h3>
                  <p className="text-text-muted">ИП Ковалевский Ярослав Андреевич</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">Адрес</h3>
                  <p className="text-text-muted">223710, РБ, г. Солигорск, ул. Железнодорожная 6</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">УНП</h3>
                  <p className="text-text-muted">693299414</p>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text-primary">Регистрация</h3>
                  <p className="text-text-muted">№755693886000 от 18.06.2025, Солигорский горисполком</p>
                </div>
                <div className="sm:col-span-2">
                  <h3 className="text-xl font-bold text-text-primary">Контакты</h3>
                  <p className="text-text-muted">
                    Email: <a href="mailto:support@fluvion.by" className="text-accent-primary">support@fluvion.by</a><br />
                    Тел: <a href="tel:+375291234567" className="text-accent-primary">+375 29 123-45-67</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-bg-secondary">
          <div className="container-xl mx-auto px-4 w-full max-w-7xl text-center">
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6 text-accent-primary">Готовы оформить заказ?</h2>
            <p className="text-lg text-text-secondary mb-8 max-w-prose mx-auto">
              Ознакомьтесь с процессом заказа и начните закупку товаров из Китая прямо сейчас!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/catalog')}
                className={`px-6 py-3 bg-accent-primary text-text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 shadow-sm mx-auto ${isActive('/catalog') ? 'ring-2 ring-offset-2 ring-accent-primary' : ''}`}
              >
                <ShoppingCartIcon className="w-5 h-5" />
                Перейти в Каталог
              </button>
              <button
                onClick={() => navigate('/terminal')}
                className={`px-6 py-3 bg-accent-primary text-text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold flex items-center justify-center gap-2 shadow-sm mx-auto ${isActive('/terminal') ? 'ring-2 ring-offset-2 ring-accent-primary' : ''}`}
              >
                <DocumentCheckIcon className="w-5 h-5" />
                Перейти в Терминал
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 bg-bg-primary text-center text-text-muted text-sm">
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

export default PublicOffer;