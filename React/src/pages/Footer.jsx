import React from 'react';
import { Link } from 'react-router-dom';

const Footer = ({ id }) => {
  return (
    <footer id={id} className="footer">
      <div className="hair flex flex-col gap-4 pt-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="display text-[13px] tracking-[0.16em] text-[#111]">Fluvion</p>
          <p className="mt-1 max-w-xs">Доставка товаров с китайских площадок в Беларусь. Склад в Гуанчжоу, выдача через Европочту.</p>
        </div>
        <nav className="grid grid-cols-2 gap-x-8 gap-y-1.5 sm:text-right">
          <Link to="/catalog">Каталог</Link>
          <Link to="/terminal">Терминал</Link>
          <Link to="/self-pickup">Самовыкуп</Link>
          <Link to="/order-instructions">Как заказать</Link>
          <Link to="/news">Новости</Link>
          <Link to="/support">Поддержка</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/reviews">Отзывы</Link>
          <Link to="/delivery-payment">Доставка и оплата</Link>
          <Link to="/public-offer">Оферта</Link>
          <Link to="/privacy-policy">Конфиденциальность</Link>
          <Link to="/user-agreement">Согласие</Link>
        </nav>
      </div>
      <div className="mt-5 flex flex-col gap-1 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Fluvion</p>
        <a href="https://t.me/FLUVIONN" target="_blank" rel="noopener noreferrer">Telegram</a>
      </div>
    </footer>
  );
};

export default Footer;
