import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto border-t-4 border-[var(--accent-color)]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Блок адреса и телефонов */}
          <div className="md:col-span-2">
            <h4 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Наш адрес и телефоны</h4>
            <p className="text-gray-400 mb-4">
              <strong>ООО "Пример Компания"</strong><br />
              УНП 123456789<br />
              220006, Республика Беларусь, г. Минск, ул. Примерная, д. 1<br />
              Свидетельство о государственной регистрации №123456789, выдано Минским горисполкомом 01.01.2015 г.<br />
              Интернет-магазин включен в Торговый реестр Республики Беларусь 01.01.2001 за №222222
            </p>
            <div className="space-y-2">
              <a href="tel:+375291234567" className="text-gray-400 hover:text-[var(--accent-color)] transition">+375 29 123-45-67</a>
              <a href="tel:+375331234567" className="text-gray-400 hover:text-[var(--accent-color)] transition">+375 33 123-45-67</a>
              <a href="tel:+375251234567" className="text-gray-400 hover:text-[var(--accent-color)] transition">+375 25 123-45-67</a>
              <a href="tel:+375171234567" className="text-gray-400 hover:text-[var(--accent-color)] transition">+375 17 123-45-67</a>
            </div>
          </div>

          {/* Блок информации */}
          <div>
            <div className="widget">
              <h4 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Информация</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://chinashopby.com/public-agreement" className="hover:text-[var(--accent-color)] transition">Публичный договор</a></li>
                <li><a href="https://chinashopby.com/delivery-payment" className="hover:text-[var(--accent-color)] transition">Доставка и оплата</a></li>
                <li><a href="https://chinashopby.com/privacy-policy" className="hover:text-[var(--accent-color)] transition">Политика обработки данных</a></li>
                <li><a href="https://chinashopby.com/user-agreement" className="hover:text-[var(--accent-color)] transition">Согласие на обработку данных</a></li>
              </ul>
            </div>
          </div>

          {/* Блок о компании */}
          <div>
            <div className="widget">
              <h4 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Наша компания</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://chinashopby.com/about" className="hover:text-[var(--accent-color)] transition">О компании</a></li>
                <li><a href="https://chinashopby.com/news" className="hover:text-[var(--accent-color)] transition">Новости</a></li>
                <li><a href="https://chinashopby.com/vacancies" className="hover:text-[var(--accent-color)] transition">Вакансии</a></li>
                <li><a href="https://chinashopby.com/contact" className="hover:text-[var(--accent-color)] transition">Контакты</a></li>
              </ul>
            </div>
          </div>

          
        </div>

        {/* Блок логотипов */}
        <div className="logo-container pt-7">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            <img src="/logos/color-21.png" alt="Visa" className="h-12 object-contain mx-auto" />
            <img src="/logos/color-22.png" alt="Visa Secure" className="h-12 object-contain mx-auto" />
            <img src="/logos/color-23.png" alt="MasterCard" className="h-12 object-contain mx-auto" />
            <img src="/logos/color-24.png" alt="MasterCard ID Check" className="h-12 object-contain mx-auto" />
            <img src="/logos/color-25.png" alt="Белкарт" className="h-12 object-contain mx-auto" />
            <img src="/logos/color-26.png" alt="Белкарт ИнтернетПароль" className="h-12 object-contain mx-auto" />
            <img src="/logos/color-28.png" alt="Samsung Pay" className="h-12 object-contain mx-auto" />
            <img src="/logos/color-29.png" alt="Альфа-Банк" className="h-12 object-contain mx-auto" />
            <img src="/logos/color-30.png" alt="Apple Pay" className="h-12 object-contain mx-auto" />
          </div>
        </div>

        {/* Разделитель и нижняя часть */}
        <hr className="my-6 border-gray-700" />
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">© 2025 ChinaShopBY</p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;