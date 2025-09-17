import React from 'react';

const UserAgreement = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10 md:py-16 text-white min-h-screen relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 text-center">
          Согласие на обработку персональных данных
        </h1>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">1. Согласие</h2>
            <div className="text-gray-300">
              Оформляя заказ на сайте Fluvion (www.fluvion.by), Заказчик подтверждает свое согласие на обработку персональных данных (ФИО, телефон, email, адрес) в соответствии с <a href="/privacy-policy" className="text-[var(--accent-color)] underline">Политикой обработки данных</a> и <a href="/public-offer" className="text-[var(--accent-color)] underline">Публичной офертой</a>. Согласие предоставляется добровольно при оформлении заказа через разделы «Каталог», «Терминал» или «Корзина».
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">2. Отзыв согласия</h2>
            <div className="text-gray-300">
              Заказчик может отозвать согласие, обратившись по email: <a href="mailto:support@fluvion.by" className="text-[var(--accent-color)] underline">support@fluvion.by</a>. Отзыв согласия может ограничить возможность выполнения заказа.
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

export default UserAgreement;