import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import api from '../api/axiosInstance';
import { Helmet } from 'react-helmet-async';
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  CalculatorIcon,
  ChevronRightIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/solid';
import { Button } from '../components/ui/Button';

const linkClass = 'text-[var(--ev-gold)] hover:underline';
const strongClass = 'font-medium text-[var(--ev-text)]';

function Rate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const cnyToByn = 0.45; // ваш курс юаня при закупке
  const [usdToByn, setUsdToByn] = useState(null);
  const [shippingRate, setShippingRate] = useState(6);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const [usdRes, shipRes] = await Promise.all([
          axios.get('https://www.nbrb.by/api/exrates/rates/USD?parammode=2'),
          api.get('/exchange-rates/shipping/current').catch(() => null),
        ]);
        setUsdToByn(usdRes.data.Cur_OfficialRate);
        if (shipRes?.data?.rate != null) setShippingRate(Number(shipRes.data.rate));
      } catch (e) {
        setError('Курсы временно недоступны');
        setUsdToByn(3.0);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const exampleGoods = 500; // CNY
  const exampleWeight = 3; // kg
  const exampleGoodsByn = (exampleGoods * cnyToByn).toFixed(2);
  const exampleDeliveryUsd = exampleWeight * shippingRate;
  const exampleDeliveryByn = usdToByn != null ? (exampleDeliveryUsd * usdToByn).toFixed(0) : '—';
  const exampleTotal = usdToByn != null
    ? Math.round(exampleGoods * cnyToByn + exampleDeliveryUsd * usdToByn + 3 * usdToByn)
    : '—';

  return (
    <div className="min-h-screen bg-[var(--ev-void)] text-[var(--ev-text)] font-[var(--ev-font-body)] overflow-x-hidden">
      <Helmet>
        <title>Курс и тарифы | Fluvion</title>
        <meta name="description" content="Актуальный курс CNY/BYN, стоимость доставки из Китая за кг. Прозрачное ценообразование для заказов через Fluvion." />
      </Helmet>

      {/* Hero */}
      <div className="pt-8 pb-6 md:pt-12 md:pb-8 px-4 text-center">
        <p className="ev-label text-[var(--ev-gold)] mb-2">Тарифы</p>
        <h1 className="font-[var(--ev-font-display)] text-2xl md:text-4xl font-light tracking-tight text-[var(--ev-gold)] mb-2">
          Курс и доставка
        </h1>
        <p className="text-[var(--ev-text-muted)] text-sm md:text-base max-w-xl mx-auto">
          Актуальные курсы и тариф доставки — без скрытых платежей
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-20 md:pb-24 space-y-6 md:space-y-8">
        {/* Актуальные курсы — главный блок */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl bg-[var(--ev-glass)] backdrop-blur-[20px] md:backdrop-blur-[24px] border border-[var(--ev-gold)]/15 md:border-[var(--ev-gold)]/20 hover:border-[var(--ev-gold)]/40 transition-all duration-300 overflow-hidden"
        >
          <div className="p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10">
                <CurrencyDollarIcon className="w-5 h-5 md:w-6 md:h-6 text-[var(--ev-gold)]" />
              </div>
              <h2 className="font-[var(--ev-font-display)] text-lg md:text-xl font-medium text-[var(--ev-text)]">
                Актуальные курсы
              </h2>
            </div>
            {error && (
              <p className="text-amber-400/90 text-sm mb-4">{error}</p>
            )}
            {loading ? (
              <p className="text-[var(--ev-text-muted)] text-sm">Загрузка курсов...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[var(--ev-void)]/60 border border-[var(--ev-gold)]/10">
                  <p className="ev-label text-[var(--ev-gold)]/80 text-xs mb-1">Курс CNY → BYN</p>
                  <p className="text-xl md:text-2xl font-[var(--ev-font-display)] text-[var(--ev-gold)]">
                    1 ¥ = {cnyToByn.toFixed(2)} BYN
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--ev-void)]/60 border border-[var(--ev-gold)]/10">
                  <p className="ev-label text-[var(--ev-gold)]/80 text-xs mb-1">Доставка из Китая</p>
                  <p className="text-xl md:text-2xl font-[var(--ev-font-display)] text-[var(--ev-gold)]">
                    ${shippingRate} за 1 кг
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--ev-void)]/60 border border-[var(--ev-gold)]/10">
                  <p className="ev-label text-[var(--ev-gold)]/80 text-xs mb-1">Обновление</p>
                  <p className="text-lg font-[var(--ev-font-display)] text-[var(--ev-text)]">
                    Ежедневно
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* Из чего складывается стоимость */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="rounded-2xl bg-[var(--ev-glass)] backdrop-blur-[20px] md:backdrop-blur-[24px] border border-[var(--ev-gold)]/15 md:border-[var(--ev-gold)]/20 hover:border-[var(--ev-gold)]/40 transition-all duration-300 p-5 md:p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20">
              <BanknotesIcon className="w-5 h-5 md:w-6 md:h-6 text-[var(--ev-gold)]" />
            </div>
            <h2 className="font-[var(--ev-font-display)] text-lg md:text-xl font-medium text-[var(--ev-text)]">
              Из чего складывается сумма
            </h2>
          </div>
          <ul className="space-y-3 text-[var(--ev-text-muted)] text-sm md:text-base">
            <li><span className={strongClass}>Товар</span> — пересчёт из CNY в BYN по курсу НБРБ.</li>
            <li><span className={strongClass}>Доставка</span> — ${shippingRate} за 1 кг (мин. 1 кг) от Китая до Минска.</li>
            <li><span className={strongClass}>Упаковка</span> — по тарифу (стандарт от $3).</li>
            <li><span className={strongClass}>Страховка</span> — по желанию, 5% от стоимости груза.</li>
          </ul>
          <p className="text-[var(--ev-text-muted)] text-sm mt-4">
            Итог считаем после проверки заказа и показываем в <span className={linkClass}>Профиле</span> → «Отправления». После оплаты курс не пересчитывается.
          </p>
        </motion.section>

        {/* Пример расчёта */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="rounded-2xl bg-[var(--ev-glass)] backdrop-blur-[20px] md:backdrop-blur-[24px] border border-[var(--ev-gold)]/15 md:border-[var(--ev-gold)]/20 hover:border-[var(--ev-gold)]/40 transition-all duration-300 p-5 md:p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20">
              <CalculatorIcon className="w-5 h-5 md:w-6 md:h-6 text-[var(--ev-gold)]" />
            </div>
            <h2 className="font-[var(--ev-font-display)] text-lg md:text-xl font-medium text-[var(--ev-text)]">
              Пример расчёта
            </h2>
          </div>
          <p className="text-[var(--ev-text-muted)] text-sm mb-4">
            Товар {exampleGoods} ¥, вес {exampleWeight} кг, упаковка стандарт.
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[var(--ev-text-muted)]">
              <span>Товар</span>
              <span className="text-[var(--ev-text)]">{exampleGoodsByn} BYN</span>
            </div>
            <div className="flex justify-between text-[var(--ev-text-muted)]">
              <span>Доставка {exampleWeight} кг × ${shippingRate}</span>
              <span className="text-[var(--ev-text)]">~{exampleDeliveryByn} BYN</span>
            </div>
            <div className="flex justify-between text-[var(--ev-text-muted)]">
              <span>Упаковка</span>
              <span className="text-[var(--ev-text)]">~9 BYN</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--ev-gold)]/10 flex justify-between items-center">
            <span className="font-medium text-[var(--ev-text)]">Итого</span>
            <span className="text-xl font-[var(--ev-font-display)] text-[var(--ev-gold)]">≈ {exampleTotal} BYN</span>
          </div>
          <Button
            variant="ev-outline"
            size="md"
            onClick={() => navigate('/calculator')}
            className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <CalculatorIcon className="w-4 h-4" />
            Калькулятор
          </Button>
        </motion.section>

        {/* Как зафиксировать курс */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="rounded-2xl bg-[var(--ev-glass)] backdrop-blur-[20px] md:backdrop-blur-[24px] border border-[var(--ev-gold)]/15 md:border-[var(--ev-gold)]/20 hover:border-[var(--ev-gold)]/40 transition-all duration-300 p-5 md:p-6"
        >
          <h2 className="font-[var(--ev-font-display)] text-lg md:text-xl font-medium text-[var(--ev-text)] mb-4">
            Как зафиксировать курс
          </h2>
          <p className="text-[var(--ev-text-muted)] text-sm mb-4">
            Курс фиксируется при создании счёта и не меняется после оплаты.
          </p>
          <ol className="space-y-2 text-sm text-[var(--ev-text-muted)] mb-6 list-decimal list-inside">
            <li>Оформите заказ в <span className={linkClass}>Заказать товар</span> или выберите из примеров.</li>
            <li>Проверьте итог в профиле после проверки заказа.</li>
            <li>Оплатите в срок — курс зафиксируется.</li>
          </ol>
          <Button
            variant="ev-primary"
            size="md"
            onClick={() => navigate('/terminal')}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            Заказать товар
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
        </motion.section>

        {/* Краткий FAQ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="rounded-2xl bg-[var(--ev-glass)] backdrop-blur-[20px] md:backdrop-blur-[24px] border border-[var(--ev-gold)]/15 md:border-[var(--ev-gold)]/20 hover:border-[var(--ev-gold)]/40 transition-all duration-300 p-5 md:p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20">
              <QuestionMarkCircleIcon className="w-5 h-5 text-[var(--ev-gold)]" />
            </div>
            <h2 className="font-[var(--ev-font-display)] text-lg font-medium text-[var(--ev-text)]">
              Вопросы по курсу и тарифам
            </h2>
          </div>
          <div className="space-y-4 text-sm text-[var(--ev-text-muted)]">
            <div>
              <p className={strongClass}>Меняется ли сумма после оплаты?</p>
              <p>Нет. После оплаты стоимость фиксируется и не пересчитывается при изменении курса.</p>
            </div>
            <div>
              <p className={strongClass}>Есть ли скидки?</p>
              <p>Скидки по программе лояльности и промокодам. Актуальные предложения — в профиле.</p>
            </div>
          </div>
          <Button
            variant="ev-outline"
            size="md"
            onClick={() => navigate('/faq')}
            className="mt-4"
          >
            Все вопросы в FAQ
          </Button>
        </motion.section>
      </div>
    </div>
  );
}

export default Rate;
