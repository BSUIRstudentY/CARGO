import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalculatorIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import api from '../api/axiosInstance';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { StyledSelect } from '../components/ui/StyledSelect';

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
  const [shippingRate, setShippingRate] = useState(6.0); // Fallback: $6 per kg
  const navigate = useNavigate();

  // Packaging options with labels and costs
  const packagingOptions = {
    standard: { label: 'Стандартная упаковка', cost: 3, description: 'Базовая упаковка для стандартных грузов' },
    premium: { label: 'Водонепроницаемая упаковка', cost: 5, description: 'Максимальная защита для ценных грузов' },
  };

  // Fetch exchange rates from NBRB API and shipping rate from backend on component mount
  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      try {
        const [usdResponse, cnyResponse, shippingResponse] = await Promise.all([
          axios.get('https://www.nbrb.by/api/exrates/rates/USD?parammode=2', { timeout: 4000 }),
          axios.get('https://www.nbrb.by/api/exrates/rates/CNY?parammode=2', { timeout: 4000 }),
          api.get('/exchange-rates/shipping/current', { timeout: 4000 }).catch(() => null),
        ]);
        setRates({
          USD_TO_BYN: usdResponse.data.Cur_OfficialRate,
          CNY_TO_BYN: cnyResponse.data.Cur_OfficialRate / cnyResponse.data.Cur_Scale,
        });
        // Set shipping rate from backend if available
        if (shippingResponse && shippingResponse.data && shippingResponse.data.rate) {
          setShippingRate(shippingResponse.data.rate);
        }
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
      totalYuan = priceNum; // Price without service fee
      if (insurance) {
        totalYuan += totalYuan * 0.05; // Add 5% insurance
      }
      productByn = totalYuan * rates.CNY_TO_BYN;
      totalByn += productByn;
    }

    // Calculate shipping cost if weight is provided
    if (!isNaN(weightNum) && weightNum >= 0) {
      totalUsd = weightNum * shippingRate + packagingOptions[packaging].cost; // shippingRate USD/kg + packaging
      shippingByn = totalUsd * rates.USD_TO_BYN;
      totalByn += shippingByn;
    }

    return {
      yuan: totalYuan,
      usd: totalUsd,
      byn: totalByn,
    };
  }, [price, weight, insurance, packaging, rates, shippingRate]);

  return (
    <section className="min-h-screen flex items-center justify-center bg-transparent p-3 sm:p-4 relative overflow-hidden">
      <div className="relative max-w-lg w-full mx-auto relative z-10">
        <div className="c-sheet p-4 sm:p-6 md:p-8">
          <PageHeader 
            title="Калькулятор стоимости"
            subtitle="Рассчитайте стоимость доставки вашего товара из Китая в Беларусь"
          />
          
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6 text-xs sm:text-sm text-[#9ca3af] text-center"
          >
            Включает цену товара, страховку (5%, опционально), доставку по актуальному курсу и упаковку. <br />
            Введите стоимость или вес для частичного расчета. Курсы валют обновляются через НБРБ.
          </motion.div>

        {isLoading && (
          <p className="mb-4 text-center text-xs sm:text-sm" style={{ color: '#1d1d1f' }}>
            Обновляем курсы…
          </p>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl text-sm sm:text-base font-medium bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#ef4444]"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <div className="space-y-4 sm:space-y-6">
          {/* Price Input */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#9ca3af] mb-1.5 sm:mb-2">
              Стоимость товара (¥)
              <span className="inline-block ml-2 group relative">
                <InformationCircleIcon className="w-4 h-4 text-[#00f0ff]" />
                <div className="absolute hidden group-hover:block bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] text-xs p-2 rounded-xl w-48 -top-10 left-6 z-10 border border-[rgba(255,255,255,0.1)]">
                  Введите стоимость товара в юанях (¥).
                </div>
              </span>
            </label>
            <div className="relative">
              <CalculatorIcon className="absolute top-2.5 sm:top-3 left-3 w-5 h-5 sm:w-6 sm:h-6 text-[#00f0ff]" />
              <input
                type="number"
                placeholder="Введите стоимость в юанях"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-[#00f0ff] focus:ring-2 focus:ring-[#00f0ff]/50 transition duration-300 placeholder-[#9ca3af]"
              />
            </div>
          </div>

          {/* Weight Input */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#9ca3af] mb-1.5 sm:mb-2">
              Вес товара (кг)
              <span className="inline-block ml-2 group relative">
                <InformationCircleIcon className="w-4 h-4 text-[#00f0ff]" />
                <div className="absolute hidden group-hover:block bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] text-xs p-2 rounded-xl w-48 -top-10 left-6 z-10 border border-[rgba(255,255,255,0.1)]">
                  Введите вес товара в килограммах. Доставка рассчитывается по тарифу ${shippingRate}/кг.
                </div>
              </span>
            </label>
            <div className="relative">
              <CalculatorIcon className="absolute top-2.5 sm:top-3 left-3 w-5 h-5 sm:w-6 sm:h-6 text-[#00f0ff]" />
              <input
                type="number"
                step="0.1"
                placeholder="Введите вес в килограммах"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="0"
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-[#00f0ff] focus:ring-2 focus:ring-[#00f0ff]/50 transition duration-300 placeholder-[#9ca3af]"
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
              className="w-5 h-5 rounded bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] text-[#00f0ff] focus:ring-[#00f0ff] focus:ring-2"
            />
            <label htmlFor="insurance" className="text-xs sm:text-sm font-medium text-[#9ca3af]">
              Добавить страховку (5% от стоимости товара)
              <span className="inline-block ml-2 group relative">
                <InformationCircleIcon className="w-4 h-4 text-[#00f0ff]" />
                <div className="absolute hidden group-hover:block bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] text-xs p-2 rounded-xl w-56 -top-12 left-6 z-10 border border-[rgba(255,255,255,0.1)]">
                  Страховка работает только если товар утерян и вы полностью засняли процесс распаковки товара на видео без пауз. В таком случае мы вернём полную стоимость груза.
                </div>
              </span>
            </label>
          </div>

          {/* Packaging Select */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#9ca3af] mb-1.5 sm:mb-2">
              Вид упаковки
              <span className="inline-block ml-2 group relative">
                <InformationCircleIcon className="w-4 h-4 text-[#00f0ff]" />
                <div className="absolute hidden group-hover:block bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] text-xs p-2 rounded-xl w-48 -top-10 left-6 z-10 border border-[rgba(255,255,255,0.1)]">
                  Выберите тип упаковки: стандартная ($3) или водонепроницаемая ($5).
                </div>
              </span>
            </label>
            <div className="relative">
              <StyledSelect
                value={packaging}
                onChange={setPackaging}
                options={Object.entries(packagingOptions).map(([key, { label, cost }]) => ({
                  value: key,
                  label: `${label} ($${cost})`,
                }))}
                placeholder="Вид упаковки"
                className="text-sm sm:text-base"
              />
              <div className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-[#9ca3af]">
                {packagingOptions[packaging].description}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="p-4 sm:p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
              Итоговая стоимость
            </h3>
            <div className="space-y-2 sm:space-y-3 text-center">
              {yuan > 0 && (
                <p className="text-sm sm:text-base text-[#9ca3af]">
                  Товар {insurance ? '(с учетом страховки)' : ''}:{' '}
                  <span className="text-[#00f0ff] font-bold">¥{yuan.toFixed(2)}</span>
                </p>
              )}
              {usd > 0 && (
                <p className="text-sm sm:text-base text-[#9ca3af]">
                  Доставка (с учетом упаковки):{' '}
                  <span className="text-[#a78bfa] font-bold">${usd.toFixed(2)}</span>
                </p>
              )}
              <p className="text-sm sm:text-base text-[#9ca3af]">
                Итого: <span className="bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent font-bold text-lg sm:text-xl">BYN {byn.toFixed(2)}</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
            <Button
              variant="primary"
              onClick={() => navigate('/terminal')}
              disabled={isLoading}
              className="w-full"
            >
              Заказать товар
            </Button>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 sm:mt-6 text-center text-[#9ca3af] text-xs sm:text-sm"
          >
            <p>
              Рассчитайте стоимость доставки и начните покупки! <br />
              Для оформления заказа необходимо <a href="/login" className="text-[#00f0ff] hover:underline">войти</a> или{' '}
              <a href="/login" className="text-[#00f0ff] hover:underline">зарегистрироваться</a>.
            </p>
          </motion.div>
        </div>
        </div>
      </div>
    </section>
  );
}

export default CostCalculator;