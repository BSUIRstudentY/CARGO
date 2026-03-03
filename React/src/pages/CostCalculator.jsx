import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalculatorIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import api from '../api/axiosInstance';
import { Button } from '../components/ui/Button';
import { StyledSelect } from '../components/ui/StyledSelect';
import { Helmet } from 'react-helmet-async';

function CostCalculator() {
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [insurance, setInsurance] = useState(false);
  const [packaging, setPackaging] = useState('standard');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rates, setRates] = useState({
    USD_TO_BYN: 2.9994,
    CNY_TO_BYN: 0.45,
  });
  const [shippingRate, setShippingRate] = useState(6.0);
  const navigate = useNavigate();

  const packagingOptions = {
    standard: { label: 'Стандартная', cost: 3, description: 'Базовая упаковка для обычных грузов' },
    premium: { label: 'Водонепроницаемая', cost: 5, description: 'Защита для ценных грузов' },
  };

  const quickWeights = [0.5, 1, 2, 5];

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      try {
        const [usdResponse, shippingResponse] = await Promise.all([
          axios.get('https://www.nbrb.by/api/exrates/rates/USD?parammode=2'),
          api.get('/exchange-rates/shipping/current').catch(() => null),
        ]);
        setRates((prev) => ({
          ...prev,
          USD_TO_BYN: usdResponse.data.Cur_OfficialRate,
        }));
        if (shippingResponse?.data?.rate) setShippingRate(shippingResponse.data.rate);
        setError(null);
      } catch (err) {
        setError('Курсы валют не загружены — используются стандартные значения');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRates();
  }, []);

  const { yuan, usd, byn } = useMemo(() => {
    const priceNum = parseFloat(price);
    const weightNum = parseFloat(weight);
    let totalYuan = 0;
    let totalUsd = 0;
    let totalByn = 0;

    if ((isNaN(priceNum) || priceNum < 0) && (isNaN(weightNum) || weightNum < 0)) {
      if (price !== '' || weight !== '') setError('Введите стоимость (¥) или вес (кг) — не менее 0');
      return { yuan: 0, usd: 0, byn: 0 };
    }
    setError(null);

    if (!isNaN(priceNum) && priceNum >= 0) {
      totalYuan = insurance ? priceNum * 1.05 : priceNum;
      totalByn += totalYuan * rates.CNY_TO_BYN;
    }
    if (!isNaN(weightNum) && weightNum >= 0) {
      totalUsd = weightNum * shippingRate + packagingOptions[packaging].cost;
      totalByn += totalUsd * rates.USD_TO_BYN;
    }

    return { yuan: totalYuan, usd: totalUsd, byn: totalByn };
  }, [price, weight, insurance, packaging, rates, shippingRate]);

  return (
    <section className="min-h-screen bg-[var(--ev-void)] text-[var(--ev-text)] font-[var(--ev-font-body)] overflow-x-hidden">
      <Helmet>
        <title>Калькулятор доставки из Китая | Fluvion</title>
        <meta name="description" content="Рассчитайте стоимость доставки груза из Китая в Беларусь: товар, доставка $7/кг, упаковка. Актуальные курсы НБРБ." />
      </Helmet>

      {/* Hero */}
      <div className="relative pt-8 pb-6 md:pt-12 md:pb-8 px-4 text-center">
        <p className="ev-label text-[var(--ev-gold)] mb-2">Калькулятор</p>
        <h1 className="font-[var(--ev-font-display)] text-2xl md:text-4xl font-light tracking-tight text-[var(--ev-gold)] mb-2">
          Стоимость доставки
        </h1>
        <p className="text-[var(--ev-text-muted)] text-sm md:text-base max-w-md mx-auto">
          Цена товара, доставка $7/кг и упаковка — итог в рублях по курсу НБРБ
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-16 md:pb-24">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center py-8"
          >
            <div className="w-10 h-10 rounded-full border-2 border-[var(--ev-gold)]/30 border-t-[var(--ev-gold)] animate-spin" />
          </motion.div>
        )}

        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/20 text-[var(--ev-text-muted)] text-sm"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          {/* Блок параметров */}
          <div className="rounded-2xl bg-[var(--ev-glass)] backdrop-blur-[24px] border border-[var(--ev-gold)]/15 p-5 md:p-6">
            <h2 className="ev-label text-[var(--ev-gold)] mb-4">Параметры</h2>

            {/* Стоимость товара */}
            <div className="mb-5">
              <label className="flex items-center gap-2 text-sm text-[var(--ev-text-muted)] mb-2">
                Стоимость товара (¥)
                <span className="group relative">
                  <InformationCircleIcon className="w-4 h-4 text-[var(--ev-gold)]/70" />
                  <span className="absolute left-0 top-full mt-1 hidden group-hover:block w-44 p-2 rounded-lg bg-[var(--ev-void)] border border-[var(--ev-gold)]/20 text-xs text-[var(--ev-text)] z-10">
                    Стоимость в юанях с маркетплейса
                  </span>
                </span>
              </label>
              <div className="relative">
                <CalculatorIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ev-gold)]/50" />
                <input
                  type="number"
                  placeholder="Например 299"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--ev-void)]/80 border border-[var(--ev-gold)]/15 text-[var(--ev-text)] placeholder-[var(--ev-text-muted)]/50 focus:outline-none focus:border-[var(--ev-gold)]/50 focus:ring-1 focus:ring-[var(--ev-gold)]/30 transition-colors"
                />
              </div>
            </div>

            {/* Вес — с быстрыми кнопками */}
            <div className="mb-5">
              <label className="block text-sm text-[var(--ev-text-muted)] mb-2">Вес (кг)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {quickWeights.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeight(String(w))}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      parseFloat(weight) === w
                        ? 'bg-[var(--ev-gold)]/25 border border-[var(--ev-gold)]/50 text-[var(--ev-gold)]'
                        : 'bg-[var(--ev-void)]/60 border border-[var(--ev-gold)]/15 text-[var(--ev-text-muted)] hover:border-[var(--ev-gold)]/30'
                    }`}
                  >
                    {w} кг
                  </button>
                ))}
              </div>
              <div className="relative">
                <CalculatorIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ev-gold)]/50" />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Или введите свой вес"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min="0"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--ev-void)]/80 border border-[var(--ev-gold)]/15 text-[var(--ev-text)] placeholder-[var(--ev-text-muted)]/50 focus:outline-none focus:border-[var(--ev-gold)]/50 focus:ring-1 focus:ring-[var(--ev-gold)]/30 transition-colors"
                />
              </div>
            </div>

            {/* Страховка */}
            <div className="flex items-start gap-3 mb-5">
              <input
                type="checkbox"
                id="insurance"
                checked={insurance}
                onChange={(e) => setInsurance(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[var(--ev-gold)]/30 bg-[var(--ev-void)] text-[var(--ev-gold)] focus:ring-[var(--ev-gold)]/50"
              />
              <label htmlFor="insurance" className="text-sm text-[var(--ev-text-muted)] flex-1">
                Страховка +5% от стоимости товара
                <span className="block text-xs mt-0.5 text-[var(--ev-text-muted)]/80">
                  Возврат полной стоимости при утрате при наличии видео распаковки
                </span>
              </label>
            </div>

            {/* Упаковка */}
            <div>
              <label className="block text-sm text-[var(--ev-text-muted)] mb-2">Упаковка</label>
              <StyledSelect
                value={packaging}
                onChange={setPackaging}
                options={Object.entries(packagingOptions).map(([key, { label, cost }]) => ({
                  value: key,
                  label: `${label} ($${cost})`,
                }))}
                placeholder="Выберите упаковку"
                className="text-sm"
              />
              <p className="mt-1.5 text-xs text-[var(--ev-text-muted)]/80">
                {packagingOptions[packaging].description}
              </p>
            </div>
          </div>

          {/* Блок результата */}
          <div className="rounded-2xl bg-[var(--ev-glass)] backdrop-blur-[24px] border border-[var(--ev-gold)]/20 p-5 md:p-6 text-center">
            <h2 className="ev-label text-[var(--ev-gold)] mb-3">Итого к оплате</h2>
            <p className="text-3xl md:text-4xl font-[var(--ev-font-display)] font-light text-[var(--ev-gold)] mb-4">
              {byn > 0 ? `${byn.toFixed(2)} BYN` : '—'}
            </p>
            {(yuan > 0 || usd > 0) && (
              <div className="space-y-1 text-sm text-[var(--ev-text-muted)]">
                {yuan > 0 && (
                  <p>Товар {insurance ? '(со страховкой)' : ''}: <span className="text-[var(--ev-gold)]">¥{yuan.toFixed(2)}</span></p>
                )}
                {usd > 0 && (
                  <p>Доставка и упаковка: <span className="text-[var(--ev-gold)]">${usd.toFixed(2)}</span></p>
                )}
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="pt-2">
            <Button
              variant="ev-primary"
              size="lg"
              onClick={() => navigate('/terminal')}
              disabled={isLoading}
              className="w-full"
            >
              Заказать товар
            </Button>
          </div>

          <p className="text-center text-xs text-[var(--ev-text-muted)]">
            Для оформления заказа{' '}
            <a href="/login" className="text-[var(--ev-gold)] hover:underline">войдите</a>
            {' '}или{' '}
            <a href="/login" className="text-[var(--ev-gold)] hover:underline">зарегистрируйтесь</a>.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default CostCalculator;
