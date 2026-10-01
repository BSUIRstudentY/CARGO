import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  TruckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  CreditCardIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

/**
 * Главная: крупный заголовок, студийная карточка и группы в духе iOS.
 * Тексты, ссылки и структурированные данные прежние.
 */
const Home = () => {
  const navigate = useNavigate();

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
    { icon: ClockIcon, title: 'Быстрая доставка', description: 'Доставка из Китая за 18–35 дней через Карго' },
    { icon: CurrencyDollarIcon, title: 'Фиксированная цена', description: '$6 за кг + тарифы Европочты, без скрытых платежей' },
    { icon: ShieldCheckIcon, title: 'Страховка груза', description: 'Гарантия возврата полной стоимости груза, если что-то с ним случится по нашей вине' },
    { icon: MagnifyingGlassIcon, title: 'Проверка товаров', description: 'Проверка целостности и качества (от $5)' },
    { icon: GlobeAltIcon, title: 'Упрощённая таможня', description: 'Помощь с таможенными процедурами' },
    { icon: TruckIcon, title: 'Отслеживание', description: 'Трек-номер и уведомления в Профиле' },
    { icon: CreditCardIcon, title: 'Прозрачная оплата', description: 'Оплата через Альфа-Банк (Visa, Mastercard)' },
    { icon: StarIcon, title: 'Опыт', description: 'Более 5 лет успешной доставки из Китая' },
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
    <div className="c-page">
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

      <section className="c-hero">
        <div>
          <p className="c-kicker">Карго в Беларусь</p>
          <h1 className="c-large-title">
            Доставка из Китая
            <span className="c-large-title-secondary">под ключ</span>
          </h1>
          <p className="c-lead">
            Заказывайте товары из Китая без хлопот: от выбора в{' '}
            <strong>примерах товаров</strong> (уже заказывали клиенты) или{' '}
            <strong>Терминале</strong> (любые товары по ссылке) до доставки в Беларусь за 18–35 дней по цене $6/кг
          </p>
          <div className="cupertino-note mt-5">
            <p className="text-sm leading-relaxed">
              <span className="font-semibold">Важно.</span> В «Примерах товаров» — только то, что уже заказывали. Чтобы заказать любой товар по ссылке, используйте «Заказать товар».
            </p>
          </div>
          <div className="c-hero-actions">
            <button type="button" className="cupertino-btn cupertino-btn-fill cupertino-btn-lg" onClick={() => navigate('/terminal')}>
              Заказать товар
            </button>
            <button type="button" className="cupertino-btn cupertino-btn-gray cupertino-btn-lg" onClick={() => navigate('/catalog')}>
              Примеры товаров
            </button>
          </div>
        </div>

        <div className="c-stage">
          <p className="c-kicker" style={{ marginBottom: 0 }}>Fluvion · карго</p>
          <p className="c-stage-price">$6 <span>/ кг</span></p>
          <p className="c-stage-meta">18–35 дней до Беларуси</p>
        </div>
      </section>

      <section>
        <h2 className="c-section-title">Преимущества доставки с нами</h2>
        <p className="c-section-lead">Мы делаем доставку из Китая простой, быстрой и надежной</p>
        <div className="c-advantage-grid">
          {advantages.map((advantage) => {
            const Icon = advantage.icon;
            return (
              <article key={advantage.title} className="c-advantage">
                <div className="c-advantage-icon">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3>{advantage.title}</h3>
                  <p>{advantage.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="c-stats" style={{ marginTop: 28 }} aria-label="Цифры">
        {stats.map((stat) => (
          <div className="c-stat" key={stat.label}>
            <b>{stat.number}</b>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section>
        <h2 className="c-section-title">С нами вы можете заказывать с этих сайтов</h2>
        <p className="c-section-lead">Мы работаем со всеми популярными китайскими маркетплейсами</p>
        <div className="c-markets">
          {marketplaces.map((marketplace) => (
            <a
              key={marketplace.name}
              href={marketplace.url}
              target="_blank"
              rel="noopener noreferrer"
              className="c-market"
              title={marketplace.name}
            >
              <span className="c-market-sub">{marketplace.name}</span>
              {marketplace.hasImage ? (
                <img
                  src={marketplace.logo}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.replaceWith(Object.assign(document.createElement('span'), {
                      className: 'c-market-name',
                      textContent: marketplace.text,
                    }));
                  }}
                />
              ) : (
                <span className="c-market-name">{marketplace.text}</span>
              )}
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
