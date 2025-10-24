import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalculatorIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

function CostCalculator() {
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [insurance, setInsurance] = useState(false);
  const [packaging, setPackaging] = useState('standard');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rates, setRates] = useState({
    USD_TO_BYN: 2.9994, // Fallback: 1 USD = 2.9994 BYN
    CNY_TO_BYN: 0.41859, // Fallback: 1 CNY = 4.1859 / 10 BYN
  });
  const navigate = useNavigate();

  // Packaging options with labels and costs
  const packagingOptions = {
    standard: { label: 'Стандартная упаковка', cost: 0, description: 'Базовая упаковка для стандартных грузов' },
    reinforced: { label: 'Усиленная упаковка', cost: 2, description: 'Дополнительная защита для хрупких товаров' },
    premium: { label: 'Премиум упаковка', cost: 5, description: 'Максимальная защита для ценных грузов' },
  };

  // Fetch exchange rates from NBRB API on component mount
  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      try {
        const [usdResponse, cnyResponse] = await Promise.all([
          axios.get('https://www.nbrb.by/api/exrates/rates/USD?parammode=2'),
          axios.get('https://www.nbrb.by/api/exrates/rates/CNY?parammode=2'),
        ]);
        setRates({
          USD_TO_BYN: usdResponse.data.Cur_OfficialRate,
          CNY_TO_BYN: cnyResponse.data.Cur_OfficialRate / cnyResponse.data.Cur_Scale,
        });
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить курсы валют, используются стандартные значения');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRates();
  }, []);

  // Memoized calculation of costs
  const { yuan, usd, byn } = useMemo(() => {
    const priceNum = parseFloat(price);
    const weightNum = parseFloat(weight);
    let productByn = 0;
    let shippingByn = 0;
    let totalYuan = 0;
    let totalUsd = 0;
    let totalByn = 0;

    // Validation: Allow calculation if at least one input is valid
    if ((isNaN(priceNum) || priceNum < 0) && (isNaN(weightNum) || weightNum < 0)) {
      if (price !== '' || weight !== '') {
        setError('Введите корректные значения для стоимости (не менее 0) или веса (не менее 0)');
      }
      return { yuan: 0, usd: 0, byn: 0 };
    }

    setError(null);

    // Calculate product cost if price is provided
    if (!isNaN(priceNum) && priceNum >= 0) {
      totalYuan = priceNum * 1.1; // Price + 10% service fee
      if (insurance) {
        totalYuan += totalYuan * 0.05; // Add 5% insurance
      }
      productByn = totalYuan * rates.CNY_TO_BYN;
      totalByn += productByn;
    }

    // Calculate shipping cost if weight is provided
    if (!isNaN(weightNum) && weightNum >= 0) {
      totalUsd = weightNum * 6 + packagingOptions[packaging].cost; // $6/kg + packaging
      shippingByn = totalUsd * rates.USD_TO_BYN;
      totalByn += shippingByn;
    }

    return {
      yuan: totalYuan,
      usd: totalUsd,
      byn: totalByn,
    };
  }, [price, weight, insurance, packaging, rates]);

  return (
    <section className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <style>
        {`
          .shimmer-border {
            position: relative;
            border: 2px solid transparent;
            animation: shimmer 2s infinite linear;
          }
          .shimmer-border::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            width: calc(100% + 4px);
            height: calc(100% + 4px);
            background: linear-gradient(45deg, transparent, var(--accent-primary), transparent);
            background-size: 200% 200%;
            animation: shimmer-gradient 2s infinite linear;
            z-index: -1;
            border-radius: inherit;
          }
          @keyframes shimmer {
            0% { border-color: rgba(232, 30, 45, 0.5); }
            50% { border-color: var(--accent-primary); }
            100% { border-color: rgba(232, 30, 45, 0.5); }
          }
          @keyframes shimmer-gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-lg w-full bg-bg-secondary/90 backdrop-blur-lg rounded-xl p-8 border border-accent-primary/20 shadow-modal hover:shadow-accent-primary/20 transition-shadow duration-300 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <CalculatorIcon className="w-10 h-10 text-accent-primary" />
          </motion.div>
          <h2 className="text-4xl font-display font-bold text-text-primary tracking-tight">
            Калькулятор стоимости
          </h2>
        </div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 text-sm text-text-secondary text-center"
        >
          Рассчитайте стоимость доставки вашего товара из Китая в Беларусь. <br />
          Включает цену товара, сервисный сбор (10%), страховку (5%, опционально), доставку ($6/кг) и упаковку. <br />
          Введите стоимость или вес для частичного расчета. Курсы валют обновляются через НБРБ.
        </motion.div>

        {/* Loading Overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-bg-primary/70 flex items-center justify-center z-50 rounded-xl"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-accent-primary" />
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-4 rounded-lg text-center text-base font-medium bg-bg-accent/20 border border-accent-primary/50 text-accent-primary"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Price Input */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Стоимость товара (¥)
              <span className="inline-block ml-2 group relative">
                <InformationCircleIcon className="w-4 h-4 text-accent-primary" />
                <div className="absolute hidden group-hover:block bg-bg-secondary text-text-primary text-xs p-2 rounded-lg w-48 -top-10 left-6 z-10">
                  Введите стоимость товара в юанях (¥). Сервисный сбор (10%) будет добавлен автоматически.
                </div>
              </span>
            </label>
            <div className="relative">
              <CalculatorIcon className="absolute top-3 left-3 w-6 h-6 text-accent-primary" />
              <input
                type="number"
                placeholder="Введите стоимость в юанях"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                className="w-full pl-12 pr-4 py-3 bg-white text-black border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition duration-300 text-base"
              />
            </div>
          </div>

          {/* Weight Input */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Вес товара (кг)
              <span className="inline-block ml-2 group relative">
                <InformationCircleIcon className="w-4 h-4 text-accent-primary" />
                <div className="absolute hidden group-hover:block bg-bg-secondary text-text-primary text-xs p-2 rounded-lg w-48 -top-10 left-6 z-10">
                  Введите вес товара в килограммах. Доставка рассчитывается по тарифу $6/кг.
                </div>
              </span>
            </label>
            <div className="relative">
              <CalculatorIcon className="absolute top-3 left-3 w-6 h-6 text-accent-primary" />
              <input
                type="number"
                step="0.1"
                placeholder="Введите вес в килограммах"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="0"
                className="w-full pl-12 pr-4 py-3 bg-white text-black border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition duration-300 text-base"
              />
            </div>
          </div>

          {/* Insurance Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="insurance"
              checked={insurance}
              onChange={(e) => setInsurance(e.target.checked)}
              className="w-5 h-5 bg-bg-tertiary/50 border-border-primary text-accent-primary focus:ring-accent-primary rounded"
            />
            <label htmlFor="insurance" className="text-sm font-medium text-text-secondary">
              Добавить страховку (5% от стоимости товара + сбора)
              <span className="inline-block ml-2 group relative">
                <InformationCircleIcon className="w-4 h-4 text-accent-primary" />
                <div className="absolute hidden group-hover:block bg-bg-secondary text-text-primary text-xs p-2 rounded-lg w-48 -top-10 left-6 z-10">
                  Страховка покрывает 5% от стоимости товара и сервисного сбора для защиты от потерь.
                </div>
              </span>
            </label>
          </div>

          {/* Packaging Select */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Вид упаковки
              <span className="inline-block ml-2 group relative">
                <InformationCircleIcon className="w-4 h-4 text-accent-primary" />
                <div className="absolute hidden group-hover:block bg-bg-secondary text-text-primary text-xs p-2 rounded-lg w-48 -top-10 left-6 z-10">
                  Выберите тип упаковки. Усиленная и премиум упаковка обеспечивают дополнительную защиту.
                </div>
              </span>
            </label>
            <div className="relative">
              <select
                value={packaging}
                onChange={(e) => setPackaging(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-white text-black border border-border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-primary transition duration-300 text-base appearance-none bg-no-repeat bg-right"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                }}
              >
                {Object.entries(packagingOptions).map(([key, { label, cost }]) => (
                  <option key={key} value={key}>
                    {label} (${cost})
                  </option>
                ))}
              </select>
              <div className="mt-2 text-sm text-text-secondary">
                {packagingOptions[packaging].description}
              </div>
            </div>
          </div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-bg-tertiary/50 rounded-lg p-6 border border-border-primary/20"
          >
            <h3 className="text-xl font-semibold text-text-primary mb-4 text-center">Итоговая стоимость</h3>
            <div className="space-y-3 text-center">
              {yuan > 0 && (
                <p className="text-base text-text-secondary">
                  Товар (с учетом сбора и страховки):{' '}
                  <span className="text-accent-primary font-bold">¥{yuan.toFixed(2)}</span>
                </p>
              )}
              {usd > 0 && (
                <p className="text-base text-text-secondary">
                  Доставка (с учетом упаковки):{' '}
                  <span className="text-accent-primary font-bold">${usd.toFixed(2)}</span>
                </p>
              )}
              <p className="text-base text-text-secondary">
                Итого: <span className="text-accent-primary font-bold">BYN {byn.toFixed(2)}</span>
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/catalog')}
              disabled={isLoading}
              className="w-full py-3 bg-accent-primary text-text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-medium disabled:bg-text-muted shimmer-border flex items-center justify-center gap-2"
            >
              Перейти в каталог
            </motion.button>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mt-6 text-center text-text-secondary text-sm"
          >
            <p>
              Рассчитайте стоимость доставки и начните покупки! <br />
              Для оформления заказа необходимо <a href="/login" className="text-accent-primary hover:underline">войти</a> или{' '}
              <a href="/login" className="text-accent-primary hover:underline">зарегистрироваться</a>.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default CostCalculator;