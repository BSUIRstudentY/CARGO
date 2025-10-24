import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import api from '../api/axiosInstance';
import PostOfficeSelect from '../components/PostOfficeSelect';

function SelfPickupCargo() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [trackingNumbers, setTrackingNumbers] = useState(() => {
    const savedTrackingNumbers = localStorage.getItem('savedTrackingNumbers');
    return savedTrackingNumbers ? JSON.parse(savedTrackingNumbers) : [];
  });
  const [newTrackingNumber, setNewTrackingNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedOffice, setSelectedOffice] = useState(null);
  const [errors, setErrors] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('savedTrackingNumbers', JSON.stringify(trackingNumbers));
  }, [trackingNumbers]);

  const handleAddTrackingNumber = () => {
    if (!newTrackingNumber.trim()) {
      setErrors('Трек-номер обязателен');
      return;
    }
    if (trackingNumbers.includes(newTrackingNumber.trim())) {
      setErrors('Этот трек-номер уже добавлен');
      return;
    }
    setTrackingNumbers((prev) => [...prev, newTrackingNumber.trim()]);
    setNewTrackingNumber('');
    setErrors('');
    setIsFormVisible(false);
  };

  const removeTrackingNumber = (number) => {
    setTrackingNumbers(trackingNumbers.filter((n) => n !== number));
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
    try {
      const response = await api.post('/orders/self-pickup', {
        trackingNumbers,
        deliveryAddress,
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
          backgroundRepeat: 'repeat',
        }}
      />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-500 tracking-tight">
            Самовыкуп карго
          </h1>
        </motion.header>
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 rounded-2xl shadow-lg border border-cyan-500/30 hover:shadow-cyan-500/40 transition-all duration-300 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
              backgroundRepeat: 'repeat',
            }}
          />
          <h2 className="text-2xl font-semibold text-cyan-400 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            Инструкция по самовыкупу
          </h2>
          <p className="text-gray-300 mb-4">
            Если вы умеете самостоятельно выкупать товары с китайских площадок, следуйте этим шагам:
          </p>
          <ol className="list-decimal pl-6 space-y-4 text-gray-300">
            <li>
              <strong>Заполнение адреса склада:</strong> Укажите адрес склада на нужной площадке с вашим кодом клиента
              (последние 4 цифры вашего номера телефона, например, BL1234 без скобок и пробелов). Адрес:
              <br />
              <span className="block mt-2 bg-gray-800/80 p-2 rounded-lg text-sm break-words border border-cyan-500/30">
                广东省佛山市南海区大沥镇时代水岸二期教育路波子园林餐厅小路走到底的院子右手边Cargo DP 唛头BL(и 4 последние
                цифры вашего номера телефона) 刘云鹏 13976192260
              </span>
              <p className="mt-2 text-sm text-red-300">
                Код клиента обязателен в адресе. Если его нет, товар зачислится к потеряшкам.
              </p>
            </li>
            <li>
              <strong>Проверка адреса:</strong> После заполнения отправьте скриншот адреса на сайт для проверки.
            </li>
            <li>
              <strong>Выкуп и отслеживание:</strong> Выкупайте товары на наш склад и самостоятельно отслеживайте их
              перемещение по Китаю.
            </li>
            <li>
              <strong>Формирование консолидации:</strong> После прибытия всех товаров на склад сформируйте список
              трек-номеров (статус "получено") и отправьте его на сайт вместе с адресом доставки. Сдавайте консолидацию через 1-2 дня после
              прибытия последнего товара. Не отправляйте заранее, так как статус в логистике может быть ошибочным.
            </li>
            <li>
              <strong>Фото товаров:</strong> После получения треков на сборку, в разделе "Фото товара" с вашим кодом
              клиента появятся фото (накладная и товар). Фото загружаются в течение рабочего дня (если треки отправлены с
              16:00 до 9:00 — в ближайшее время). Качество может быть ниже ожидаемого, это бесплатно. Проверка на брак —
              платная услуга (см. раздел "Тарифы").
              <br />
              Если товар не соответствует, оформите возврат (5 юаней/трек) через сайт, отправив трек и скриншот. Возврат
              по Китаю оплачивается вами или продавцом.
            </li>
            <li>
              <strong>Подтверждение:</strong> Мониторьте фото в разделе "Фото товара" по коду клиента и дате. Если всё
              устраивает, подтвердите на сайте. Без ответа в течение рабочего дня считается "Всё ок", и треки передаются
              на сборку/отправку (1-2 дня, до 3 в пиковые периоды).
            </li>
            <li>
              <strong>Накладная:</strong> После упаковки (2-7 дней) сайт пришлёт накладную с данными: дата отправки, вес,
              кол-во мест, объём, плотность, цена/кг, страховка, упаковка, общая сумма ($, CNY). Оплатите в течение 7
              дней любым доступным способом.
            </li>
          </ol>
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap gap-4 mt-12"
        >
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
              className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-4 rounded-xl border border-cyan-500/30 shadow-md hover:shadow-cyan-500/40 transition-all duration-300 transform cursor-pointer w-48 h-32 flex flex-col justify-center items-center"
              onClick={() => setIsFormVisible(true)}
            >
              <div className="text-4xl text-cyan-400 font-bold">+</div>
              <p className="text-center text-gray-300 mt-2 text-sm">Добавить трек-номер</p>
            </motion.div>
          </Tilt>
          {trackingNumbers.map((number, index) => (
            <Tilt key={number} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(6, 182, 212, 0.3)' }}
                className="bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-4 rounded-xl border border-cyan-500/30 shadow-md hover:shadow-cyan-500/40 transition-all duration-300 w-48 h-32 flex flex-col justify-between"
              >
                <h4 className="text-lg font-semibold text-gray-200 truncate">{number}</h4>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-red-300 hover:text-red-400 text-sm font-medium transition duration-300 text-center"
                  onClick={() => removeTrackingNumber(number)}
                >
                  Удалить
                </motion.button>
              </motion.div>
            </Tilt>
          ))}
        </motion.section>
        <AnimatePresence>
          {isFormVisible && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="mt-12 bg-gradient-to-br from-gray-800/90 to-gray-700/90 p-6 rounded-xl shadow-md border border-cyan-500/30 w-full max-w-md mx-auto relative overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                  backgroundRepeat: 'repeat',
                }}
              />
              <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                Добавить трек-номер
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-md font-medium text-gray-300 mb-2">Трек-номер *</label>
                  <input
                    type="text"
                    value={newTrackingNumber}
                    onChange={(e) => setNewTrackingNumber(e.target.value)}
                    className={`w-full px-3 py-2 bg-gray-800/80 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300 ${
                      errors.includes('Трек-номер') ? 'border-red-500' : 'border-cyan-500/30'
                    }`}
                    placeholder="Введите трек-номер (например, BL1234)"
                  />
                  {errors.includes('Трек-номер') && <p className="text-red-300 text-xs mt-1 animate-pulse">{errors}</p>}
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gray-700/80 text-white font-medium rounded-lg hover:bg-gray-600/80 transition-all duration-300 shadow-sm text-sm"
                  onClick={() => {
                    setIsFormVisible(false);
                    setErrors('');
                  }}
                >
                  Отмена
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition-all duration-300 shadow-sm text-sm"
                  onClick={handleAddTrackingNumber}
                >
                  Добавить
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {trackingNumbers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 flex flex-col items-center space-y-4"
          >
            <PostOfficeSelect
              deliveryAddress={deliveryAddress}
              setDeliveryAddress={setDeliveryAddress}
              setError={setErrors}
              setSelectedOffice={setSelectedOffice}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 transition-all duration-300 shadow-sm"
              onClick={handleSubmitTrackingNumbers}
            >
              Отправить трек-номера
            </motion.button>
          </motion.div>
        )}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-emerald-500/80 text-white rounded-lg text-center"
            >
              {successMessage}
            </motion.div>
          )}
          {errors && !isFormVisible && !errors.includes('Трек-номер') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-4 bg-red-500/80 text-white rounded-lg text-center"
            >
              {errors}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center text-gray-300 text-sm"
        >
          <p>© 2025 ChinaShopBY. Все права защищены.</p>
          <p className="mt-1 text-cyan-400 animate-pulse">Обновлено: 08.09.2025 19:14 CEST</p>
        </motion.footer>
      </div>
    </div>
  );
}

export default SelfPickupCargo;