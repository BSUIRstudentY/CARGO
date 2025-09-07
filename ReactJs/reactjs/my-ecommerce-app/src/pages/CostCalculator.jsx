
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalculatorIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

function CostCalculator() {
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [insurance, setInsurance] = useState(false);
  const [packaging, setPackaging] = useState('standard');
  const [error, setError] = useState(null);
  const [rates, setRates] = useState({
    USD_TO_BYN: 2.9994, // Fallback: 1 USD = 2.9994 BYN
    CNY_TO_BYN: 0.41859, // Fallback: 1 CNY = 4.1859 / 10 BYN
  });
  const navigate = useNavigate();

  const packagingOptions = {
    standard: { label: 'Стандартная упаковка', cost: 0 },
    reinforced: { label: 'Усиленная упаковка', cost: 2 },
    premium: { label: 'Премиум упаковка', cost: 5 },
  };

  // Fetch exchange rates from NBRB API
  useEffect(() => {
    const fetchRates = async () => {
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
      }
    };
    fetchRates();
  }, []);

  const { yuan, usd, byn } = useMemo(() => {
    const priceNum = parseFloat(price);
    const weightNum = parseFloat(weight);

    if (isNaN(priceNum) || priceNum < 0 || isNaN(weightNum) || weightNum < 0) {
      if (price !== '' || weight !== '') {
        setError('Введите корректные значения для стоимости и веса');
      }
      return { yuan: 0, usd: 0, byn: 0 };
    }

    setError(null);

    // Product cost: price + 10% service fee
    let totalYuan = priceNum * 1.1;

    // Insurance: 5% of (price + service fee)
    if (insurance) {
      totalYuan += totalYuan * 0.05;
    }

    // Shipping cost: 6 USD/kg + packaging cost
    const shippingCost = weightNum * 6 + packagingOptions[packaging].cost;

    // Convert to BYN
    const productByn = totalYuan * rates.CNY_TO_BYN;
    const shippingByn = shippingCost * rates.USD_TO_BYN;
    const totalByn = productByn + shippingByn;

    return { yuan: totalYuan, usd: shippingCost, byn: totalByn };
  }, [price, weight, insurance, packaging, rates]);

  return (
    <section id="calculator" className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 container mx-auto px-4 py-8">
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-emerald-500">
          Калькулятор стоимости
        </h2>
        <p className="text-lg text-gray-400 mt-2">Рассчитайте стоимость товара с доставкой</p>
        <p className="text-sm text-gray-500 mt-1">
          Стоимость товара: цена + 10% сервисный сбор + 5% страховка (опционально).<br />
          Доставка: $6 за кг + стоимость упаковки. Итог в BYN по курсу НБРБ.
        </p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-6 shadow-xl border border-gray-700/50 backdrop-blur-sm max-w-lg mx-auto"
      >
        <div className="flex flex-col gap-4">
          {/* Поле для стоимости товара */}
          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <CalculatorIcon className="w-4 h-4" />
              Стоимость товара (¥)
            </label>
            <input
              type="number"
              placeholder="Введите стоимость в юанях"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-900/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-all duration-300 hover:border-gray-500"
            />
          </div>

          {/* Поле для веса */}
          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <CalculatorIcon className="w-4 h-4" />
              Вес товара (кг)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="Введите вес в килограммах"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-900/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-all duration-300 hover:border-gray-500"
            />
          </div>

          {/* Чекбокс для страховки */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="insurance"
              checked={insurance}
              onChange={(e) => setInsurance(e.target.checked)}
              className="w-4 h-4 text-[var(--accent-color)] bg-gray-900 border-gray-600 rounded focus:ring-[var(--accent-color)]"
            />
            <label htmlFor="insurance" className="text-sm font-medium text-gray-300">
              Добавить страховку (5% от стоимости товара + сбора)
            </label>
          </div>

          {/* Выбор упаковки */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <CalculatorIcon className="w-4 h-4" />
              Вид упаковки
            </label>
            <select
              value={packaging}
              onChange={(e) => setPackaging(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-900/80 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] focus:border-transparent transition-all duration-300 hover:border-gray-500 appearance-none bg-no-repeat bg-right pr-8"
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
          </div>

          {/* Ошибка */}
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Итоговая стоимость */}
          <div className="text-center mt-4">
            <h3 className="text-xl font-semibold text-white">Итоговая стоимость:</h3>
            <p className="text-lg text-gray-300 mt-2">
              Товар (с учетом сбора и страховки): <span className="text-green-400 font-bold">¥{yuan.toFixed(2)}</span>
            </p>
            <p className="text-lg text-gray-300">
              Доставка (с учетом упаковки): <span className="text-green-400 font-bold">${usd.toFixed(2)}</span>
            </p>
            <p className="text-lg text-gray-300">
              Итого: <span className="text-green-400 font-bold">BYN {byn.toFixed(2)}</span>
            </p>
          </div>

          {/* Кнопки для перехода */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/catalog')}
              className="w-full p-3 bg-gradient-to-r from-[var(--accent-color)] to-emerald-500 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Перейти в каталог
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/terminal')}
              className="w-full p-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Перейти в терминал
            </motion.button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default CostCalculator;