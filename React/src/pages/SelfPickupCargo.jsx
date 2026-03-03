import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import PostOfficeSelect from '../components/PostOfficeSelect';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PlusIcon, XMarkIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const linkClass = 'text-[var(--ev-gold)] hover:underline';

function getInstructionSteps(navigate) {
  return [
    {
      step: 1,
      title: 'Адрес склада при оплате',
      short: 'Укажите адрес нашего склада продавцу на маркетплейсе.',
      content: (
        <p className="text-sm text-[var(--ev-text-muted)]">
          При оплате заказа на 1688, Taobao, Pinduoduo и т.д. укажите адрес нашего склада в Китае. Адрес склада есть в разделе{' '}
          <button type="button" onClick={() => navigate('/terminal')} className={linkClass}>Заказать товар</button>, в профиле после входа и в нашем{' '}
          <span className="text-[var(--ev-text)]">Telegram-канале</span>.
        </p>
      ),
    },
    {
      step: 2,
      title: 'Дождитесь прибытия на склад',
      short: 'Отслеживайте посылку до склада в Китае.',
      content: (
        <p className="text-sm text-[var(--ev-text-muted)]">
          Следите за трек-номером: когда посылка прибудет на наш склад, можно переходить к оформлению здесь.
        </p>
      ),
    },
    {
      step: 3,
      title: 'Оформите самовыкуп здесь',
      short: 'Добавьте трек-номера и выберите ОПС для получения.',
      content: (
        <p className="text-sm text-[var(--ev-text-muted)]">
          Нажмите «Добавить трек» и введите трек-номер. Затем выберите отделение Европочты и укажите телефон. Нажмите «Отправить трек-номера».
        </p>
      ),
    },
    {
      step: 4,
      title: 'Отслеживание',
      short: 'Статус — в профиле: «Заказы» и «Сборные грузы».',
      content: (
        <p className="text-sm text-[var(--ev-text-muted)]">
          После отправки заявки отслеживайте статус в личном кабинете. Когда груз будет в пути и прибудет в РБ, получите уведомление и трек Европочты.
        </p>
      ),
    },
  ];
}

function SelfPickupCargo() {
  const navigate = useNavigate();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [trackingNumbers, setTrackingNumbers] = useState(() => {
    try {
      const saved = localStorage.getItem('savedTrackingNumbers');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newTrackingNumber, setNewTrackingNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [errors, setErrors] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('savedTrackingNumbers', JSON.stringify(trackingNumbers));
    } catch (_) {}
  }, [trackingNumbers]);

  const handleAddTrackingNumber = () => {
    const trimmed = newTrackingNumber.trim();
    if (!trimmed) {
      setErrors('Трек-номер обязателен');
      return;
    }
    if (trackingNumbers.includes(trimmed)) {
      setErrors('Этот трек-номер уже добавлен');
      return;
    }
    setTrackingNumbers((prev) => [...prev, trimmed]);
    setNewTrackingNumber('');
    setErrors('');
    setIsFormVisible(false);
  };

  const removeTrackingNumber = (number) => {
    setTrackingNumbers((prev) => prev.filter((n) => n !== number));
  };

  const handleSubmitTrackingNumbers = async () => {
    if (trackingNumbers.length === 0) {
      setErrors('Добавьте хотя бы один трек-номер');
      return;
    }
    if (!deliveryAddress || !selectedOffice) {
      setErrors('Выберите отделение доставки (ОПС)');
      return;
    }
    if (!phone?.trim()) {
      setErrors('Укажите номер телефона');
      return;
    }
    try {
      const response = await api.post('/orders/self-pickup', {
        trackingNumbers,
        deliveryAddress,
        phone,
        warehouseIdFinish: selectedOffice.warehouseId,
      });
      setSuccessMessage(`Заказ создан. ID: ${response.data.id}`);
      setTrackingNumbers([]);
      setDeliveryAddress('');
      setSelectedOffice(null);
      setErrors('');
      try {
        localStorage.removeItem('savedTrackingNumbers');
      } catch (_) {}
    } catch (error) {
      setErrors('Ошибка: ' + (error.response?.data?.message || error.message));
      setSuccessMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--ev-void)] text-[var(--ev-text)] py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden pb-24 sm:pb-12 font-[var(--ev-font-body)]">
      <Helmet>
        <title>Самовыкуп | Fluvion</title>
        <meta name="description" content="Купили на маркетплейсе — отправьте на наш склад. Добавьте трек-номера и выберите отделение для получения." />
      </Helmet>

      <div className="max-w-screen-xl mx-auto relative z-10">
        {/* Hero — как в Терминале */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-6 sm:mb-8"
        >
          <p className="ev-label text-[var(--ev-gold)] mb-2">Самовыкуп</p>
          <h1 className="font-[var(--ev-font-display)] text-2xl sm:text-3xl md:text-4xl font-light tracking-[-0.02em] text-[var(--ev-gold)]">
            Трек-номера → отделение → заявка
          </h1>
          <p className="ev-label text-[var(--ev-text-muted)] mt-2 text-sm">
            Добавьте треки посылок и выберите ОПС для получения
          </p>
        </motion.div>

        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl border border-[var(--ev-gold)]/20 bg-[var(--ev-glass)] backdrop-blur-md"
            >
              <p className="text-sm text-[var(--ev-text)]">{successMessage}</p>
              <button type="button" onClick={() => setSuccessMessage('')} className="mt-2 text-xs text-[var(--ev-gold)] hover:underline">Закрыть</button>
            </motion.div>
          )}
          {errors && !isFormVisible && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-[var(--ev-glass)] backdrop-blur-md text-amber-200/90 text-sm"
            >
              {errors}
              <button type="button" onClick={() => setErrors('')} className="mt-2 block text-xs text-[var(--ev-gold)] hover:underline">Закрыть</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Как пользоваться — по образцу Терминала */}
        <div className={isMobile ? 'mb-4' : 'mb-10'}>
          <div className={isMobile ? 'mb-2' : 'mb-4'}>
            <h2 className="ev-label text-[var(--ev-gold)]">Как пользоваться</h2>
            <p className="ev-label text-[var(--ev-text-muted)] mt-0.5 sm:mt-2 text-sm font-normal">
              {isMobile ? 'Склад → треки → ОПС → заявка' : 'Пошагово: укажите адрес склада при оплате → дождитесь прибытия → добавьте треки и выберите ОПС.'}
            </p>
          </div>

          {isMobile ? (
            <div className="space-y-1.5">
              {getInstructionSteps(navigate).map((s) => (
                <details
                  key={s.step}
                  className="group rounded-lg border border-[var(--ev-gold)]/10 bg-[var(--ev-glass)] backdrop-blur-md px-3 py-2"
                >
                  <summary className="cursor-pointer list-none flex items-start gap-2">
                    <span className="mt-0.5 w-5 h-5 rounded bg-[var(--ev-gold)]/20 text-[var(--ev-gold)] font-normal text-[10px] flex items-center justify-center flex-shrink-0">{s.step}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-normal text-[var(--ev-text)]">{s.title}</span>
                      <span className="block text-[10px] text-[var(--ev-text-muted)] mt-0.5">{s.short}</span>
                    </span>
                    <span className="text-[var(--ev-text-muted)] group-open:text-[var(--ev-gold)] transition-colors text-xs">▼</span>
                  </summary>
                  <div className="pt-2 pl-7">{s.content}</div>
                </details>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getInstructionSteps(navigate).map((s) => (
                <div key={s.step} className="p-5 rounded-2xl bg-[var(--ev-glass)] backdrop-blur-md border border-[var(--ev-gold)]/10">
                  <div className="flex items-start gap-3 mb-2">
                    <span className="w-8 h-8 rounded-xl bg-[var(--ev-gold)]/20 text-[var(--ev-gold)] font-normal text-sm flex items-center justify-center flex-shrink-0">{s.step}</span>
                    <div className="min-w-0">
                      <h3 className="ev-label text-[var(--ev-gold)]">{s.title}</h3>
                      <p className="text-sm text-[var(--ev-text-muted)] mt-0.5 font-normal">{s.short}</p>
                    </div>
                  </div>
                  {s.content}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Трек-номера — по образцу «Добавить товар» в Терминале */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="space-y-4">
          <p className="ev-label text-[var(--ev-gold)] mb-3 sm:mb-4">Трек-номера</p>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsFormVisible(true)}
              className="min-h-[100px] sm:min-h-[140px] rounded-xl sm:rounded-2xl border border-[var(--ev-gold)]/20 bg-[var(--ev-glass)] backdrop-blur-md hover:border-[var(--ev-gold)]/40 transition-all flex flex-col items-center justify-center gap-2"
            >
              <span className="text-3xl sm:text-5xl text-[var(--ev-gold)] font-light">+</span>
              <span className="text-[var(--ev-text-muted)] ev-label font-normal text-center">Добавить трек</span>
            </motion.button>
            <AnimatePresence>
              {trackingNumbers.map((number, index) => (
                <motion.div
                  key={number}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="min-h-[100px] sm:min-h-[140px] rounded-xl sm:rounded-2xl border border-[var(--ev-gold)]/20 bg-[var(--ev-glass)] backdrop-blur-md p-3 sm:p-4 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs sm:text-sm font-medium text-[var(--ev-text)] truncate flex-1">{number}</p>
                    <button
                      type="button"
                      onClick={() => removeTrackingNumber(number)}
                      className="p-1 rounded text-[var(--ev-text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      aria-label="Удалить"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] sm:text-xs text-[var(--ev-text-muted)]">Добавлен</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Отделение доставки — показывается при наличии треков */}
        {trackingNumbers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-[var(--ev-gold)]/20 bg-[var(--ev-glass)] backdrop-blur-md"
          >
            <p className="ev-label text-[var(--ev-gold)] mb-2">Отделение доставки</p>
            <p className="text-sm text-[var(--ev-text-muted)] mb-4">Выберите ОПС Европочты для получения. Укажите телефон для связи.</p>
            <PostOfficeSelect
              deliveryAddress={deliveryAddress}
              setDeliveryAddress={setDeliveryAddress}
              setError={setErrors}
              setSelectedOffice={setSelectedOffice}
            />
            <div className="mt-4">
              <label className="block ev-label text-[var(--ev-text-muted)] mb-1.5">Телефон *</label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+375 (XX) XXX-XX-XX" />
            </div>
            <Button
              variant="ev-primary"
              size="lg"
              onClick={handleSubmitTrackingNumbers}
              disabled={!deliveryAddress || !selectedOffice || !phone?.trim()}
              className="w-full mt-6"
            >
              Отправить трек-номера
            </Button>
          </motion.div>
        )}
      </div>

      {/* Модалка добавления трека — как форма в Терминале */}
      <AnimatePresence>
        {isFormVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => { setIsFormVisible(false); setErrors(''); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-xl sm:rounded-2xl border border-[var(--ev-gold)]/20 bg-[var(--ev-glass)] backdrop-blur-md p-4 sm:p-6 relative"
            >
              <button
                type="button"
                className="absolute top-2 right-2 sm:top-4 sm:right-4 text-[var(--ev-text-muted)] hover:text-[var(--ev-gold)] transition-colors p-1"
                onClick={() => { setIsFormVisible(false); setErrors(''); }}
              >
                <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <h2 className="ev-label text-[var(--ev-gold)] mb-4 sm:mb-6 pr-8">Добавить трек-номер</h2>
              <Input
                label="Трек-номер"
                type="text"
                value={newTrackingNumber}
                onChange={(e) => { setNewTrackingNumber(e.target.value); setErrors(''); }}
                placeholder="Например: BL123456789CN"
                error={errors && errors.includes('Трек') ? errors : ''}
              />
              <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                <Button variant="ev-outline" onClick={() => { setIsFormVisible(false); setErrors(''); setNewTrackingNumber(''); }} className="flex-1">Отмена</Button>
                <Button variant="ev-primary" onClick={handleAddTrackingNumber} className="flex-1">Добавить</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SelfPickupCargo;
