import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosInstance';
import PostOfficeSelect from '../components/PostOfficeSelect';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, XMarkIcon, DocumentCheckIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

function SelfPickupCargo() {
  const _navigate = useNavigate();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [trackingNumbers, setTrackingNumbers] = useState(() => {
    const saved = localStorage.getItem('savedTrackingNumbers');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTrackingNumber, setNewTrackingNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [errors, setErrors] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [phone, setPhone] = useState('');

  // Сохраняем трек-номера в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('savedTrackingNumbers', JSON.stringify(trackingNumbers));
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
    setTrackingNumbers(prev => [...prev, trimmed]);
    setNewTrackingNumber('');
    setErrors('');
    setIsFormVisible(false);
  };

  const removeTrackingNumber = (number) => {
    setTrackingNumbers(prev => prev.filter(n => n !== number));
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
        warehouseIdFinish: selectedOffice.warehouseId
      });

      setSuccessMessage(`Заказ успешно создан! ID: ${response.data.id}`);
      setTrackingNumbers([]);
      setDeliveryAddress('');
      setSelectedOffice(null);
      setErrors('');
      localStorage.removeItem('savedTrackingNumbers');
    } catch (error) {
      setErrors('Ошибка при создании заказа: ' + (error.response?.data?.message || error.message));
      setSuccessMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] relative overflow-hidden pb-20 sm:pb-12">
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
        <PageHeader
          kicker="Самовыкуп" 
          title="Самовыкуп карго" 
          subtitle="Самостоятельный выкуп товаров с китайских площадок"
          className="mb-4 sm:mb-12"
        />

        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-3 sm:mb-6"
            >
              <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
            </motion.div>
          )}

          {errors && !isFormVisible && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-3 sm:mb-6"
            >
              <Alert type="error" message={errors} onClose={() => setErrors('')} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Инструкция — компактно на мобильных */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-4 sm:mb-8"
        >
          <details className="sm:block group rounded-xl sm:rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] overflow-hidden">
            <summary className="list-none cursor-pointer p-3 sm:p-6 flex items-center gap-2 hover:bg-[rgba(255,255,255,0.02)]">
              <DocumentCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#00f0ff] flex-shrink-0" />
              <span className="text-sm sm:text-xl font-bold text-[#00f0ff]">Инструкция по самовыкупу</span>
              <span className="ml-auto text-[#9ca3af] text-sm sm:hidden">▼</span>
            </summary>
            <div className="px-3 pb-3 pt-0 sm:px-6 sm:pb-6 sm:pt-0 border-t border-[rgba(255,255,255,0.05)]">
              <div className="space-y-3 sm:space-y-4 text-xs sm:text-base text-[#9ca3af]">
                <div>
                  <h3 className="font-semibold text-[#e5e7eb] mb-1 sm:mb-2 text-xs sm:text-base">1. Адрес склада при оплате</h3>
                  <p className="mb-1 sm:mb-2">Укажите адрес нашего склада при оплате на маркетплейсах. Он есть в терминале и в профиле.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#e5e7eb] mb-1 sm:mb-2 text-xs sm:text-base">2. Дождитесь прибытия на склад</h3>
                  <p className="mb-1 sm:mb-2">Отслеживайте посылку до склада в Китае.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#e5e7eb] mb-1 sm:mb-2 text-xs sm:text-base">3. Оформите самовыкуп</h3>
                  <p className="mb-1 sm:mb-2">Введите трек-номера и выберите ОПС здесь.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-[#e5e7eb] mb-1 sm:mb-2 text-xs sm:text-base">4. Отслеживайте в «Заказах»</h3>
                  <p className="mb-0">Статус — в профиле, «Заказы» и «Сборные грузы».</p>
                </div>
              </div>
            </div>
          </details>
        </motion.section>

        {/* Добавление трек-номеров */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-4 sm:mb-8"
        >
          <div className="mb-2 sm:mb-4">
            <h3 className="text-base sm:text-2xl font-bold text-white mb-0.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
              <TruckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#00f0ff]" />
              Трек-номера
            </h3>
            <p className="text-[#9ca3af] text-xs sm:text-sm">
              Посылки уже на складе — добавьте треки
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsFormVisible(true)}
              className="h-24 sm:h-36 rounded-lg sm:rounded-xl bg-[rgba(255,255,255,0.02)] border-2 border-dashed border-[rgba(0,240,255,0.3)] hover:border-[rgba(0,240,255,0.5)] hover:bg-[rgba(0,240,255,0.05)] transition-all duration-300 flex flex-col items-center justify-center gap-1 sm:gap-2 group"
            >
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#a78bfa] flex items-center justify-center group-hover:scale-110 transition-transform">
                <PlusIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xs sm:text-sm text-[#9ca3af] group-hover:text-[#00f0ff] transition-colors text-center px-1">
                Добавить трек
              </span>
            </motion.button>

            <AnimatePresence>
              {trackingNumbers.map((number, index) => (
                <motion.div
                  key={number}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className="h-24 sm:h-36 rounded-lg sm:rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(0,240,255,0.3)] transition-all duration-300 p-2 sm:p-4 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="relative z-10 flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-xs sm:text-base font-medium text-white truncate flex-1">{number}</p>
                      <button
                        onClick={() => removeTrackingNumber(number)}
                        className="flex-shrink-0 p-1 rounded text-[#9ca3af] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        aria-label="Удалить"
                      >
                        <XMarkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-[#9ca3af]">
                      <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                      <span>Добавлен</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Форма добавления трек-номера */}
        <AnimatePresence>
          {isFormVisible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => {
                setIsFormVisible(false);
                setErrors('');
              }}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md"
              >
                <Card className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                    Добавить трек-номер
                  </h3>

                  <div className="space-y-3 sm:space-y-4">
                    <Input
                      label="Трек-номер"
                      type="text"
                      value={newTrackingNumber}
                      onChange={(e) => {
                        setNewTrackingNumber(e.target.value);
                        setErrors('');
                      }}
                      placeholder="Введите трек-номер (например, BL1234)"
                      error={errors.includes('Трек-номер') ? errors : ''}
                    />
                  </div>

                  <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsFormVisible(false);
                        setErrors('');
                        setNewTrackingNumber('');
                      }}
                      className="flex-1"
                    >
                      Отмена
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleAddTrackingNumber}
                      className="flex-1"
                    >
                      Добавить
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Выбор отделения и отправка */}
        {trackingNumbers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="space-y-4 sm:space-y-6"
          >
            <Card className="p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-2xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-1.5 sm:gap-2">
                  <TruckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#00f0ff]" />
                  Отделение доставки
                </h3>
                <p className="text-[#9ca3af] text-xs sm:text-sm">
                  Выберите ОПС для получения
                </p>
              </div>

              <PostOfficeSelect
                deliveryAddress={deliveryAddress}
                setDeliveryAddress={setDeliveryAddress}
                setError={setErrors}
                setSelectedOffice={setSelectedOffice}
              />

              <div className="mt-3 sm:mt-4">
                <label className="block text-xs sm:text-sm font-semibold text-[#00f0ff] mb-1.5 sm:mb-2">
                  Телефон <span className="text-[#00f0ff] text-xs">*</span>
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+375 (XX) XXX-XX-XX"
                  className="w-full"
                />
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1 sm:mt-2">
                  Для связи по заказу
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmitTrackingNumbers}
                disabled={!deliveryAddress || !selectedOffice || !phone?.trim()}
                className="w-full mt-4 sm:mt-6 text-sm sm:text-base py-2.5 sm:py-3"
              >
                Отправить трек-номера
              </Button>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default SelfPickupCargo;
