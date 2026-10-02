import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalculatorIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import api from '../api/axiosInstance';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { StyledSelect } from '../components/ui/StyledSelect';

function CostCalculator({ embedded = false }) {
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

  const empty = byn <= 0;
  const goodsByn = yuan * rates.CNY_TO_BYN;
  const shippingByn = usd * rates.USD_TO_BYN;

  return (
    <section id={embedded ? 'calc' : undefined} className="space-y-4">
      <div className="flex items-end justify-between gap-3 px-0.5">
        <div>
          <p className="kicker">Калькулятор</p>
          <h2 className="title mt-1">Сколько будет стоить</h2>
          <p className="muted mt-1">Товар в юанях по курсу НБРБ, доставка ${shippingRate}/кг и упаковка — по курсу доллара.</p>
        </div>
      </div>
      <div className="glass sheet grid gap-3 p-3 sm:grid-cols-[1.1fr_0.9fr] sm:p-4">
        <form className="space-y-4 p-1 sm:p-2" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-2 gap-3">
            <label className="field">
              <span>Стоимость товара, ¥</span>
              <input className="input" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="500" />
            </label>
            <label className="field">
              <span>Вес, кг</span>
              <input className="input" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="3" />
            </label>
          </div>
          <div className="field">
            <span>Упаковка</span>
            <div className="seg" role="tablist">
              {Object.entries(packagingOptions).map(([key, option]) => (
                <button key={key} type="button" className={packaging === key ? 'is-on' : ''} onClick={() => setPackaging(key)}>
                  {key === 'standard' ? 'Стандарт' : 'Водонепроницаемая'} · ${option.cost}
                </button>
              ))}
            </div>
            <p className="faint text-[11px]">{packagingOptions[packaging].description}</p>
          </div>
          <div className="inset flex items-center justify-between gap-3 px-3.5 py-3">
            <div>
              <p className="text-[13px] font-medium">Страховка 5 %</p>
              <p className="faint text-[11px]">Полный возврат при утере — при видео распаковки</p>
            </div>
            <button type="button" role="switch" aria-checked={insurance} className={`switch ${insurance ? 'is-on' : 'is-off'}`} onClick={() => setInsurance((v) => !v)}>
              <span />
            </button>
          </div>
          {isLoading ? <p className="faint text-[11px]">Обновляем курсы НБРБ…</p> : null}
          {error ? <p className="text-[12px] text-[#b91c1c]">{error}</p> : null}
          <p className="faint text-[11px] leading-relaxed">
            Курс НБРБ: 1 ¥ = {rates.CNY_TO_BYN.toFixed(4)} BYN, 1 $ = {rates.USD_TO_BYN.toFixed(4)} BYN.
          </p>
        </form>
        <div className="glass-dark sheet flex flex-col justify-between gap-5 p-5">
          <div>
            <p className="kicker" style={{ color: 'rgba(255,255,255,0.45)' }}>Итого к оплате</p>
            <p className="price mt-3">{empty ? '—' : `${byn.toFixed(2)} BYN`}</p>
            <p className="mt-1 text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{empty ? 'Введите стоимость или вес' : 'ориентировочно, по сегодняшнему курсу'}</p>
          </div>
          <div className="kv text-white">
            <p>Товар{insurance ? ' + страховка' : ''}<strong>{yuan ? `¥${yuan.toFixed(2)} · ${goodsByn.toFixed(2)} BYN` : '—'}</strong></p>
            <p>Доставка + упаковка<strong>{usd ? `$${usd.toFixed(2)} · ${shippingByn.toFixed(2)} BYN` : '—'}</strong></p>
            <p>Ставка<strong>${shippingRate} / кг</strong></p>
          </div>
          <button type="button" className="btn btn-light" onClick={() => navigate('/terminal')}>Заказать товар</button>
        </div>
      </div>
    </section>
  );
}

export default CostCalculator;