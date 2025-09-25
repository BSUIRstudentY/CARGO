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

    // Validation for negative or invalid inputs
    if (isNaN(priceNum) || priceNum < 0 || isNaN(weightNum) || weightNum < 0) {
      if (price !== '' || weight !== '') {
        setError('Введите корректные значения для стоимости (не менее 0) и веса (не менее 0)');
      }
      return { yuan: 0, usd: 0, byn: 0 };
    }

    setError(null);

    // Calculate product cost: price + 10% service fee
    let totalYuan = priceNum * 1.1;

    // Add insurance: 5% of (price + service fee)
    if (insurance) {
      totalYuan += totalYuan * 0.05;
    }

    // Calculate shipping cost: 6 USD/kg + packaging cost
    const shippingCost = weightNum * 6 + packagingOptions[packaging].cost;

    // Convert to BYN using exchange rates
    const productByn = totalYuan * rates.CNY_TO_BYN;
    const shippingByn = shippingCost * rates.USD_TO_BYN;
    const totalByn = productByn + shippingByn;

    return {
      yuan: totalYuan,
      usd: shippingCost,
      byn: totalByn,
    };
  }, [price, weight, insurance, packaging, rates]);

  return (
    <section
      id="calculator"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-lg w-full bg-gray-800/90 backdrop-blur-lg rounded-xl p-8 border border-cyan-400/20 shadow-lg hover:shadow-cyan-400/20 transition-shadow duration-300 overflow-hidden"
      >
        {/* Decorative Background Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.5"/%3E%3C/svg%3E')`,
            backgroundRepeat: 'repeat',
          }}
        ></div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <CalculatorIcon className="w-10 h-10 text-cyan-400" />
          </motion.div>
          <h2 className="text-4xl font-bold text-white tracking-tight">Калькулятор стоимости</h2>
        </div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6 text-sm text-gray-300 text-center"
        >
          Рассчитайте стоимость доставки вашего товара из Китая в Беларусь. <br />
          Включает цену товара, сервисный сбор (10%), страховку (5%, опционально), доставку ($6/кг) и упаковку. <br />
          Курсы валют обновляются автоматически через НБРБ.
        </motion.div>

        {/* Loading Overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 rounded-xl"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-cyan-400" />
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-4 rounded-lg text-center text-base font-medium bg-red-500/20 border-red-500/50 text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* Price Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Стоимость товара (¥)
              <span className="inline-block ml-2 group relative">
                <InformationCircleIcon className="w-4 h-4 text-cyan-400" />
                <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs p-2 rounded-lg w-48 -top-10 left-6 z-10">
                  Введите стоимость товара в юанях (¥). Сервисный сбор (10%) будет добавлен автоматически.
                </div>
              </span>
            </label>
            <div className="relative">
              <CalculatorIcon className="absolute top-3 left-3 w-6 h-6 text-cyan-400" />
              <input
                type="number"
                placeholder="Введите стоимость в юанях"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 text-white border border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-300 text-base"
              />
            </div>
          </div>

          {/* Weight Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Вес товара (кг)
              <span className="inline-block ml-2 group relative">
                <InformationCircleIcon className="w-4 h-4 text-cyan-400" />
                <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs p-2 rounded-lg w-48 -top-10 left-6 z-10">
                  Введите вес товара в килограммах. Доставка рассчитывается по тарифу $6/кг.
                </div>
              </span>
            </label>
            <div className="relative">
              <CalculatorIcon className="absolute top-3 left-3 w-6 h-6 text-cyan-400" />
              <input
                type="number"
                step="0.1"
                placeholder="Введите вес в килограммах"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="0"
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 text-white border border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-300 text-base"
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
              className="w-5 h-5 bg-gray-900/50 border-gray-700/20 text-cyan-400 focus:ring-cyan-400 rounded"
            />
            <label htmlFor="insurance" className="text-sm font-medium text-gray-300">
              Добавить страховку (5% от стоимости товара + сбора)
              <span className="inline-block ml-2 group relative">
                <InformationCircleIcon className="w-4 h-4 text-cyan-400" />
                <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs p-2 rounded-lg w-48 -top-10 left-6 z-10">
                  Страховка покрывает 5% от стоимости товара и сервисного сбора для защиты от потерь.
                </div>
              </span>
            </label>
          </div>

          {/* Packaging Select */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Вид упаковки
              <span className="inline-block ml-2 group relative">
                <InformationCircleIcon className="w-4 h-4 text-cyan-400" />
                <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs p-2 rounded-lg w-48 -top-10 left-6 z-10">
                  Выберите тип упаковки. Усиленная и премиум упаковка обеспечивают дополнительную защиту.
                </div>
              </span>
            </label>
            <div className="relative">
              <select
                value={packaging}
                onChange={(e) => setPackaging(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-900/50 text-white border border-gray-700/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition duration-300 text-base appearance-none bg-no-repeat bg-right"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                }}
              >
                {Object.entries(packagingOptions).map(([key, { label, cost, description }]) => (
                  <option key={key} value={key}>
                    {label} (${cost})
                  </option>
                ))}
              </select>
              <div className="mt-2 text-sm text-gray-400">
                {packagingOptions[packaging].description}
              </div>
            </div>
          </div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/20"
          >
            <h3 className="text-xl font-semibold text-white mb-4 text-center">Итоговая стоимость</h3>
            <div className="space-y-3 text-center">
              <p className="text-base text-gray-300">
                Товар (с учетом сбора и страховки):{' '}
                <span className="text-green-400 font-bold">¥{yuan.toFixed(2)}</span>
              </p>
              <p className="text-base text-gray-300">
                Доставка (с учетом упаковки):{' '}
                <span className="text-green-400 font-bold">${usd.toFixed(2)}</span>
              </p>
              <p className="text-base text-gray-300">
                Итого: <span className="text-green-400 font-bold">BYN {byn.toFixed(2)}</span>
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
              className="w-full py-3 bg-cyan-400 text-white rounded-lg hover:bg-cyan-500 transition duration-300 text-base font-medium disabled:bg-gray-500 flex items-center justify-center gap-2"
            >
              Перейти в каталог
            </motion.button>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mt-6 text-center text-gray-300 text-sm"
          >
            <p>
              Рассчитайте стоимость доставки и начните покупки! <br />
              Для оформления заказа необходимо <a href="/login" className="text-cyan-400 hover:underline">войти</a> или{' '}
              <a href="/login" className="text-cyan-400 hover:underline">зарегистрироваться</a>.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default CostCalculator;