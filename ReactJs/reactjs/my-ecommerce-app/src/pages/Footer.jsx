import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto border-t-4 border-[var(--accent-color)]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Блок адреса и телефонов */}
          <div className="md:col-span-2">
            <h4 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Наш адрес и телефоны</h4>
            <p className="text-gray-400 mb-4">
              <strong>Индивидуальный предприниматель Ковалевский Ярослав Андреевич</strong><br />
              УНП 693299414<br />
              223710, Республика Беларусь, г. Солигорск, ул. Железнодорожная 6<br />
              Свидетельство о государственной регистрации №755693886000, выдано Солигорским горисполкомом 18.06.2025 г.
            </p>
            <div className="space-y-2">
              <a href="tel:+375291234567" className="text-gray-400 hover:text-[var(--accent-color)] transition" aria-label="Позвонить по номеру +375 29 123-45-67">+375 29 123-45-67</a><br />
              <a href="tel:+375331234567" className="text-gray-400 hover:text-[var(--accent-color)] transition" aria-label="Позвонить по номеру +375 33 123-45-67">+375 33 123-45-67</a><br />
              <a href="tel:+375251234567" className="text-gray-400 hover:text-[var(--accent-color)] transition" aria-label="Позвонить по номеру +375 25 123-45-67">+375 25 123-45-67</a><br />
              <a href="tel:+375171234567" className="text-gray-400 hover:text-[var(--accent-color)] transition" aria-label="Позвонить по номеру +375 17 123-45-67">+375 17 123-45-67</a>
            </div>
          </div>
          {/* Блок информации */}
          <div>
            <div className="widget">
              <h4 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Информация</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    onClick={() => navigate('/public-offer')}
                    className="text-gray-400 hover:text-[var(--accent-color)] transition"
                    aria-label="Перейти к Публичной оферте"
                  >
                    Публичная оферта
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/delivery-payment')}
                    className="text-gray-400 hover:text-[var(--accent-color)] transition"
                    aria-label="Перейти к Доставке и оплате"
                  >
                    Доставка и оплата
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/privacy-policy')}
                    className="text-gray-400 hover:text-[var(--accent-color)] transition"
                    aria-label="Перейти к Политике обработки данных"
                  >
                    Политика обработки данных
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/user-agreement')}
                    className="text-gray-400 hover:text-[var(--accent-color)] transition"
                    aria-label="Перейти к Согласию на обработку данных"
                  >
                    Согласие на обработку данных
                  </button>
                </li>
              </ul>
            </div>
          </div>
          {/* Блок о компании */}
          <div>
            <div className="widget">
              <h4 className="text-xl font-semibold text-[var(--accent-color)] mb-4">Наша компания</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button
                    onClick={() => navigate('/about')}
                    className="text-gray-400 hover:text-[var(--accent-color)] transition"
                    aria-label="Перейти к странице О компании"
                  >
                    О компании
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/news')}
                    className="text-gray-400 hover:text-[var(--accent-color)] transition"
                    aria-label="Перейти к странице Новости"
                  >
                    Новости
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/vacancies')}
                    className="text-gray-400 hover:text-[var(--accent-color)] transition"
                    aria-label="Перейти к странице Вакансии"
                  >
                    Вакансии
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate('/contact')}
                    className="text-gray-400 hover:text-[var(--accent-color)] transition"
                    aria-label="Перейти к странице Контакты"
                  >
                    Контакты
                  </button>
                </li>
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
          <p className="text-gray-400 mb-4 md:mb-0">© 2025 Fluvion</p>
          <p className="text-gray-400 animate-pulse text-[var(--accent-color)]">Обновлено: 17.09.2025 20:33 CEST</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;