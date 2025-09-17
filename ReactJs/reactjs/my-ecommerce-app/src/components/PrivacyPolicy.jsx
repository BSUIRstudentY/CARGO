import React from 'react';

const PrivacyPolicy = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10 md:py-16 text-white min-h-screen relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 text-center">
          Политика обработки персональных данных
        </h1>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">1. Общие положения</h2>
            <div className="text-gray-300">
              В соответствии с Законом Республики Беларусь «О защите персональных данных» (№ 99-З), ИП Ковалевский Ярослав Андреевич (далее — Оператор), оператор сайта Fluvion (www.fluvion.by), собирает и обрабатывает персональные данные Заказчиков исключительно для выполнения заказов и доставки товаров из Китая.
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">2. Состав собираемых данных</h2>
            <div className="text-gray-300">
              Оператор собирает следующие данные: ФИО, номер телефона, email, адрес доставки, данные о заказе (ссылка на товар, описание, параметры). Все данные предоставляются Заказчиком добровольно при оформлении заказа.
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">3. Цели обработки</h2>
            <div className="text-gray-300">
              Данные используются для:
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Оформления и обработки заказа.</li>
                <li>Координации доставки через транспортную компанию Карго и Европочту.</li>
                <li>Уведомления Заказчика о статусе заказа через раздел <span className="font-bold text-[var(--accent-color)]">Отправления</span> в <span className="font-bold text-[var(--accent-color)]">Профиле</span>.</li>
              </ul>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">4. Передача данных</h2>
            <div className="text-gray-300">
              Данные передаются транспортной компании Карго и Европочте исключительно для доставки. Все транзакции защищены 256-битным SSL-шифрованием.
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">5. Права Заказчика</h2>
            <div className="text-gray-300">
              Заказчик имеет право на доступ, исправление, удаление данных или ограничение их обработки. Обращайтесь по email: <a href="mailto:support@fluvion.by" className="text-[var(--accent-color)] underline">support@fluvion.by</a>.
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">6. Срок хранения</h2>
            <div className="text-gray-300">
              Данные хранятся в течение срока, необходимого для выполнения заказа, и удаляются после истечения 3 лет с момента последнего заказа, если иное не предусмотрено законодательством.
            </div>
          </div>
        </div>
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 Fluvion. Все права защищены.</p>
          <p className="mt-1 animate-pulse text-[var(--accent-color)]">Обновлено: 17.09.2025 19:39 CEST</p>
        </div>
      </div>
    </section>
  );
};

export default PrivacyPolicy;