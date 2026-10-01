import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
/**
 * Главная: крупный заголовок, студийная карточка и группы в духе iOS.
 * Тексты, ссылки и структурированные данные прежние.
 * car.png в public — сплошной чёрный файл, в ротацию не входит.
 */
const HERO_FRAMES = ['/main.png', '/220.png', '/cart.png'];

function MarketTile({ marketplace }) {
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const showImage = Boolean(marketplace.hasImage && marketplace.logo) && !failed;

  return (
    <a
      href={marketplace.url}
      target="_blank"
      rel="noopener noreferrer"
      className="cat-tile"
      title={marketplace.name}
    >
      {showImage ? (
        <img
          src={marketplace.logo}
          alt=""
          style={{ visibility: ready ? 'visible' : 'hidden' }}
          onLoad={() => setReady(true)}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="cat-fallback">{marketplace.text}</div>
      )}
      <span>{marketplace.name}</span>
    </a>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    const id = window.setInterval(() => {
      setFrame((current) => (current + 1) % HERO_FRAMES.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  const marketplaces = [
    { name: 'Pinduoduo', url: 'https://www.pinduoduo.com', text: '拼多多', logo: '/logos/pinduoduo.svg', hasImage: false },
    { name: 'Taobao', url: 'https://www.taobao.com', text: '淘宝', logo: '/logos/taobao.svg', hasImage: true },
    { name: '1688', url: 'https://www.1688.com', text: '1688', hasImage: false },
    { name: 'GoFish', url: 'https://www.gofish.com', text: 'GoFish', hasImage: false },
    { name: 'WeChat', url: 'https://www.wechat.com', text: '微信', logo: '/logos/wechat.svg', hasImage: true },
    { name: 'Poizon', url: 'https://www.poizon.com', text: 'Poizon', hasImage: false },
    { name: '95', url: 'https://www.95.com', text: '95', hasImage: false },
  ];

  const advantages = [
    { title: 'Быстрая доставка', description: 'Доставка из Китая за 18–35 дней через Карго' },
    { title: 'Фиксированная цена', description: '$6 за кг + тарифы Европочты, без скрытых платежей' },
    { title: 'Страховка груза', description: 'Гарантия возврата полной стоимости груза, если что-то с ним случится по нашей вине' },
    { title: 'Проверка товаров', description: 'Проверка целостности и качества (от $5)' },
    { title: 'Упрощённая таможня', description: 'Помощь с таможенными процедурами' },
    { title: 'Отслеживание', description: 'Трек-номер и уведомления в Профиле' },
    { title: 'Прозрачная оплата', description: 'Оплата через Альфа-Банк (Visa, Mastercard)' },
    { title: 'Опыт', description: 'Более 5 лет успешной доставки из Китая' },
  ];

  const stats = [
    { number: '1000+', label: 'Товаров из Китая' },
    { number: '90%', label: 'Клиентов рекомендуют' },
    { number: '5', label: 'Складов-партнёров' },
    { number: '24/7', label: 'Поддержка клиентов' },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fluvion',
    url: 'https://fluvion.by',
    logo: 'https://fluvion.by/logo.png',
    description: 'Доставка товаров из Китая в Беларусь за 18-35 дней. Заказывайте с Pinduoduo, Taobao, 1688 и других маркетплейсов.',
    address: { '@type': 'PostalAddress', addressCountry: 'BY' },
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: ['Russian'] },
    sameAs: ['https://t.me/FLUVIONN'],
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.5', reviewCount: '1000' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: '6',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '6',
        priceCurrency: 'USD',
        unitCode: 'KGM',
      },
    },
  };

  const serviceStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Cargo Delivery',
    provider: { '@type': 'Organization', name: 'Fluvion' },
    areaServed: { '@type': 'Country', name: 'Belarus' },
    description: 'Доставка товаров из Китая в Беларусь за 18-35 дней',
    offers: { '@type': 'Offer', price: '6', priceCurrency: 'USD', unitCode: 'KGM' },
  };

  return (
    <div className="home-stack">
      <Helmet>
        <title>Fluvion - Доставка товаров из Китая в Беларусь | Карго доставка под ключ</title>
        <meta name="description" content="Доставка товаров из Китая в Беларусь за 18-35 дней. Заказывайте с Pinduoduo, Taobao, 1688, GoFish и других маркетплейсов. Фиксированная цена $6/кг, страховка груза, отслеживание заказа. Более 5 лет опыта, 1000+ товаров, 90% клиентов рекомендуют." />
        <meta name="keywords" content="доставка из Китая, карго доставка, доставка товаров из Китая в Беларусь, Pinduoduo доставка, Taobao доставка, 1688 доставка, карго из Китая, доставка из Китая в Минск, китайские товары, заказ из Китая, доставка под ключ, Fluvion" />
        <meta property="og:title" content="Fluvion - Доставка товаров из Китая в Беларусь | Карго доставка под ключ" />
        <meta property="og:description" content="Доставка товаров из Китая в Беларусь за 18-35 дней. Заказывайте с Pinduoduo, Taobao, 1688 и других маркетплейсов. Фиксированная цена $6/кг, страховка груза, отслеживание." />
        <meta property="og:image" content="https://fluvion.by/logo.png" />
        <meta property="og:url" content="https://fluvion.by/" />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Fluvion - Доставка товаров из Китая в Беларусь" />
        <meta property="twitter:description" content="Доставка товаров из Китая в Беларусь за 18-35 дней. Фиксированная цена $6/кг, страховка груза, отслеживание заказа." />
        <meta property="twitter:image" content="https://fluvion.by/logo.png" />
        <link rel="canonical" href="https://fluvion.by/" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(serviceStructuredData)}</script>
      </Helmet>

      <section className="hero" aria-label="Доставка из Китая">
        {HERO_FRAMES.map((src, index) => (
          <div key={src} className={`hero-slide${index === frame ? ' is-on' : ''}`}>
            <img src={src} alt="" />
          </div>
        ))}
        <div className="hero-photo-scrim" />
        <div className="hero-veil" />
        <div className="hero-copy">
          <div className="hero-card">
            <p className="hero-kicker">Карго в Беларусь</p>
            <h1 className="hero-title">Доставка из Китая под ключ</h1>
            <p className="hero-text">От выбора товара до двери в Беларуси.</p>
            <div className="hero-actions">
              <button type="button" className="card-hit pill glass" onClick={() => navigate('/terminal')}>
                Заказать товар
              </button>
              <button type="button" className="card-hit pill glass" onClick={() => navigate('/catalog')}>
                Примеры товаров
              </button>
            </div>
          </div>
        </div>
        <div className="hero-dots">
          {HERO_FRAMES.map((src, index) => (
            <button
              key={src}
              type="button"
              aria-label={index === 0 ? 'Склад' : index === 1 ? 'Доставка' : 'Корзина'}
              className={index === frame ? 'is-on' : ''}
              onClick={() => setFrame(index)}
            />
          ))}
        </div>
      </section>

      <section className="sheet glass home-note">
        <p>
          Заказывайте товары из Китая без хлопот: от выбора в примерах товаров (уже заказывали клиенты) или Терминале (любые товары по ссылке) до доставки в Беларусь за 18–35 дней по цене $6/кг.
        </p>
        <p>
          <strong>Важно.</strong> В «Примерах товаров» — только то, что уже заказывали. Чтобы заказать любой товар по ссылке, используйте «Заказать товар».
        </p>
      </section>

      <section>
        <div className="section-head">
          <h2>С нами вы можете заказывать с этих сайтов</h2>
        </div>
        <p className="section-lead">Мы работаем со всеми популярными китайскими маркетплейсами</p>
        <div className="cat-grid">
          {marketplaces.map((marketplace) => (
            <MarketTile key={marketplace.name} marketplace={marketplace} />
          ))}
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Преимущества доставки с нами</h2>
        </div>
        <p className="section-lead">Мы делаем доставку из Китая простой, быстрой и надежной</p>
        <div className="carousel">
          {advantages.map((advantage) => (
            <article key={advantage.title} className="sheet glass advantage-card">
              <h3>{advantage.title}</h3>
              <p>{advantage.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mid-banner" aria-label="Цифры">
        <img src="/220.png" alt="" />
        <div className="glass sheet">
          <p className="banner-kicker">Fluvion</p>
          <h2 className="banner-title">Доставка из Китая</h2>
          <ul className="stat-grid">
            {stats.map((stat) => (
              <li key={stat.label}>
                <b>{stat.number}</b>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default Home;
