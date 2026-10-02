import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import CostCalculator from './CostCalculator';

const slides = [
  {
    src: '/images/hero-warehouse.jpg',
    title: 'Доставка из Китая в Беларусь',
    text: 'Выкупаем на Taobao, 1688 и Pinduoduo, собираем партию в Гуанчжоу и выдаём через Европочту.',
  },
  {
    src: '/images/hero-parcels.jpg',
    title: '$6 за килограмм',
    text: 'Одна ставка на всё: международная доставка до склада в Минске, консолидация и фотоотчёт.',
  },
  {
    src: '/images/hero-truck.jpg',
    title: 'Партии каждые две недели',
    text: 'Статус заказа и партии виден в профиле: от выкупа до прибытия в Минск.',
  },
];

const entries = [
  { href: '/terminal', src: '/images/tile-buyer.jpg', label: 'Терминал', sub: 'заказ по ссылке' },
  { href: '/self-pickup', src: '/images/tile-consolidation.jpg', label: 'Самовыкуп', sub: 'только доставка' },
  { href: '/catalog', src: '/images/tile-warehouse.jpg', label: 'Каталог', sub: 'проверенные товары' },
];

const markets = ['Pinduoduo', 'Taobao', '1688', 'Poizon', 'GoFish'];

const steps = [
  { title: 'Добавьте товар', text: 'Ссылка с 1688 или Taobao в терминале — или готовый товар из каталога.' },
  { title: 'Проверка и оплата', text: 'Администратор проверяет цены и наличие. После подтверждения — оплата картой в течение 3 дней.' },
  { title: 'Выкуп и партия', text: 'Выкупаем у поставщиков, консолидируем на складе в Гуанчжоу, отправляем партией в Минск.' },
  { title: 'Европочта', text: 'В Минске заказ передаётся в Европочту. Доставку до отделения оплачиваете при получении.' },
];

const faq = [
  {
    q: 'Из чего складывается стоимость?',
    a: 'Цена товара в юанях (по курсу НБРБ на день оплаты), доставка $6 за килограмм от склада в Китае до Минска, упаковка $3 или $5 и, по желанию, страховка 5 % от стоимости товара. Тариф Европочты оплачивается при получении.',
  },
  {
    q: 'Когда фиксируется цена?',
    a: 'После проверки заказа администратором вы видите итоговую сумму в профиле. Оплатите её в течение 3 дней — курс и ставка больше не пересчитываются.',
  },
  {
    q: 'Как работает страховка?',
    a: 'Страховка 5 % покрывает полную стоимость груза при утере. Для выплаты нужно снять распаковку на видео без пауз — так требует перевозчик.',
  },
  {
    q: 'Что такое самовыкуп?',
    a: 'Если вы сами купили товар на китайской площадке, укажите адрес нашего склада при оплате и добавьте трек-номер посылки в разделе «Самовыкуп». Мы примем её в Гуанчжоу и довезём до Беларуси по той же ставке.',
  },
];

const Home = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    const id = window.setInterval(() => setIndex((value) => (value + 1) % slides.length), 6000);
    return () => window.clearInterval(id);
  }, []);

  const slide = slides[index];

  return (
    <div className="space-y-12">
      <Helmet>
        <title>Fluvion — доставка товаров из Китая в Беларусь</title>
        <meta name="description" content="Выкуп на Taobao, 1688, Pinduoduo и Poizon, консолидация в Гуанчжоу, доставка $6/кг до Минска и выдача через Европочту." />
      </Helmet>

      <section className="hero" id="top">
        {slides.map((item, i) => (
          <div key={item.src} className={`hero-slide${i === index ? ' is-on' : ''}`}>
            <img src={item.src} alt="" />
          </div>
        ))}
        <div className="hero-veil" />
        <div className="hero-dots">
          {slides.map((item, i) => (
            <button key={item.src} type="button" aria-label={item.title} className={i === index ? 'is-on' : ''} onClick={() => setIndex(i)} />
          ))}
        </div>
        <div className="hero-copy">
          <div className="hero-card glass">
            <p className="kicker">Fluvion · Китай → Беларусь</p>
            <h1 className="display h1 mt-2">{slide.title}</h1>
            <p className="muted mt-2 text-[14px]">{slide.text}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/terminal" className="btn btn-dark">Заказать товар</Link>
              <a href="#calc" className="btn btn-light">Рассчитать</a>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {entries.map((item, i) => (
            <Link key={item.href} to={item.href} className={`tile ${i === 2 ? 'col-span-2 sm:col-span-1' : ''}`}>
              <img src={item.src} alt="" />
              <span>
                {item.label}
                <small> · {item.sub}</small>
              </span>
            </Link>
          ))}
        </div>
        <p className="muted flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-[12px]">
          <span className="faint">Возим с площадок</span>
          {markets.map((name) => (
            <span key={name} className="glass pill px-2.5 py-1 text-[11px] text-[#111]">{name}</span>
          ))}
        </p>
      </section>

      <CostCalculator embedded />

      <section id="how" className="space-y-4">
        <div className="flex items-end justify-between gap-3 px-0.5">
          <div>
            <p className="kicker">Как это работает</p>
            <h2 className="title mt-1">Четыре шага до отделения Европочты</h2>
          </div>
          <Link to="/order-instructions" className="btn btn-ghost btn-sm">Подробная инструкция</Link>
        </div>
        <div className="glass sheet steps overflow-hidden">
          {steps.map((step, i) => (
            <div key={step.title} className="step">
              <p className="step-n">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="mt-2 text-[14px] font-semibold">{step.title}</h3>
              <p className="muted mt-1 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="banner">
        <img src="/images/banner-tracking.jpg" alt="" />
        <div className="glass sheet relative z-10 max-w-sm p-4">
          <p className="kicker">Статус</p>
          <h2 className="title mt-1">Где мой заказ</h2>
          <p className="muted mt-1 text-[13px]">Трек-номер и статусы партии смотрите в профиле после входа.</p>
          <Link to="/login" className="btn btn-dark btn-sm mt-3">Открыть профиль</Link>
        </div>
      </section>

      <section id="faq" className="space-y-4">
        <div className="px-0.5">
          <p className="kicker">FAQ</p>
          <h2 className="title mt-1">Частые вопросы</h2>
        </div>
        <div className="glass sheet faq">
          {faq.map((item, i) => (
            <details key={item.q} open={i === 0}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
        <Link to="/faq" className="btn btn-ghost btn-sm">Все вопросы</Link>
      </section>
    </div>
  );
};

export default Home;
