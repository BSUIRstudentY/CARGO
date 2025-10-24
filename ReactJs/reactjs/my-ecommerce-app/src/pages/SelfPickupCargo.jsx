import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import api from '../api/axiosInstance';
import PostOfficeSelect from '../components/PostOfficeSelect';

// Append global styles for consistency with OrderDetails.jsx
const styles = `
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-down {
    animation: fadeInDown 0.6s ease-out;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-up {
    animation: slideUp 0.5s ease-out;
  }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

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
    <div className="min-h-screen bg-primary text-secondary py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,37,73,0.3)_0%,transparent_70%)] pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
          style={{
            '@media (max-width: 640px)': {
              marginBottom: '24px',
              textAlign: 'center',
            }
          }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-accent-primary tracking-tight break-words animate-fade-in-down" style={{
            '@media (max-width: 640px)': {
              fontSize: '28px',
              fontWeight: '800',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }
          }}>
            Самовыкуп карго
          </h1>
        </motion.header>
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-tertiary p-6 rounded-2xl shadow-card border border-primary/50 hover:shadow-accent-primary/40 transition-all duration-300 relative overflow-hidden animate-slide-up"
          style={{
            '@media (max-width: 640px)': {
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
              backgroundRepeat: 'repeat',
            }}
          />
          <h2 className="text-2xl font-semibold font-display text-accent-primary mb-4 flex items-center" style={{
            '@media (max-width: 640px)': {
              fontSize: '20px',
              marginBottom: '16px',
            }
          }}>
            <svg className="w-6 h-6 mr-2 text-accent-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            Инструкция по самовыкупу
          </h2>
          <p className="text-secondary mb-4 font-sans">
            Если вы умеете самостоятельно выкупать товары с китайских площадок, следуйте этим шагам:
          </p>
          <ol className="list-decimal pl-6 space-y-4 text-secondary font-sans">
            <li>
              <strong>Заполнение адреса склада:</strong> Укажите адрес склада на нужной площадке с вашим кодом клиента
              (последние 4 цифры вашего номера телефона, например, BL1234 без скобок и пробелов). Адрес:
              <br />
              <span className="block mt-2 bg-tertiary p-2 rounded-lg text-sm break-words border border-primary/50">
                广东省佛山市南海区大沥镇时代水岸二期教育路波子园林餐厅小路走到底的院子右手边Cargo DP 唛头BL(и 4 последние
                цифры вашего номера телефона) 刘云鹏 13976192260
              </span>
              <p className="mt-2 text-sm text-red-400">
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
          style={{
            '@media (max-width: 640px)': {
              gap: '16px',
            }
          }}
        >
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
              className="bg-tertiary p-4 rounded-xl border border-primary/50 shadow-card hover:shadow-accent-primary/40 transition-all duration-300 transform cursor-pointer w-48 h-32 flex flex-col justify-center items-center animate-slide-up"
              onClick={() => setIsFormVisible(true)}
              style={{
                '@media (max-width: 640px)': {
                  width: '140px',
                  height: '100px',
                  padding: '12px',
                  borderRadius: '8px',
                }
              }}
            >
              <div className="text-4xl text-accent-primary font-bold">+</div>
              <p className="text-center text-secondary mt-2 text-sm font-sans">Добавить трек-номер</p>
            </motion.div>
          </Tilt>
          {trackingNumbers.map((number, index) => (
            <Tilt key={number} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
                className="bg-tertiary p-4 rounded-xl border border-primary/50 shadow-card hover:shadow-accent-primary/40 transition-all duration-300 w-48 h-32 flex flex-col justify-between animate-slide-up"
                style={{
                  '@media (max-width: 640px)': {
                    width: '140px',
                    height: '100px',
                    padding: '12px',
                    borderRadius: '8px',
                  }
                }}
              >
                <h4 className="text-lg font-semibold text-secondary truncate font-sans">{number}</h4>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-red-400 hover:text-red-500 text-sm font-medium transition duration-300 text-center font-sans"
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
              className="mt-12 bg-tertiary p-6 rounded-xl shadow-card border border-primary/50 w-full max-w-md mx-auto relative overflow-hidden animate-slide-up"
              style={{
                '@media (max-width: 640px)': {
                  padding: '16px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                  backgroundRepeat: 'repeat',
                }}
              />
              <h2 className="text-xl font-semibold font-display text-accent-primary mb-4 flex items-center" style={{
                '@media (max-width: 640px)': {
                  fontSize: '18px',
                  marginBottom: '12px',
                }
              }}>
                <svg className="w-5 h-5 mr-2 text-accent-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                Добавить трек-номер
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-md font-medium text-secondary mb-2 font-sans">Трек-номер *</label>
                  <input
                    type="text"
                    value={newTrackingNumber}
                    onChange={(e) => setNewTrackingNumber(e.target.value)}
                    className={`w-full text-black px-3 py-2 bg-tertiary border rounded-lg text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary transition duration-300 ${
                      errors.includes('Трек-номер') ? 'border-red-500' : 'border-primary/50'
                    }`}
                    placeholder="Введите трек-номер (например, BL1234)"
                    style={{
                      '@media (max-width: 640px)': {
                        padding: '8px',
                        fontSize: '14px',
                        borderRadius: '6px',
                      }
                    }}
                  />
                  {errors.includes('Трек-номер') && <p className="text-red-400 text-xs mt-1 animate-pulse font-sans">{errors}</p>}
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-tertiary text-secondary font-medium rounded-lg hover:bg-tertiary/80 transition-all duration-300 shadow-card text-sm font-sans"
                  onClick={() => {
                    setIsFormVisible(false);
                    setErrors('');
                  }}
                  style={{
                    '@media (max-width: 640px)': {
                      padding: '8px 12px',
                      fontSize: '14px',
                      borderRadius: '6px',
                    }
                  }}
                >
                  Отмена
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-accent-primary text-primary font-medium rounded-lg hover:bg-accent-primary/90 transition-all duration-300 shadow-card text-sm font-sans"
                  onClick={handleAddTrackingNumber}
                  style={{
                    '@media (max-width: 640px)': {
                      padding: '8px 12px',
                      fontSize: '14px',
                      borderRadius: '6px',
                    }
                  }}
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
              className="px-6 py-3 bg-accent-primary text-primary font-medium rounded-lg hover:bg-accent-primary/90 transition-all duration-300 shadow-card font-sans"
              onClick={handleSubmitTrackingNumbers}
              style={{
                '@media (max-width: 640px)': {
                  padding: '10px 16px',
                  fontSize: '14px',
                  borderRadius: '6px',
                }
              }}
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
              className="mt-4 p-4 bg-green-500/80 text-primary rounded-lg text-center font-sans"
              style={{
                '@media (max-width: 640px)': {
                  padding: '12px',
                  fontSize: '14px',
                  borderRadius: '8px',
                }
              }}
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
              className="mt-4 p-4 bg-red-500/80 text-primary rounded-lg text-center font-sans"
              style={{
                '@media (max-width: 640px)': {
                  padding: '12px',
                  fontSize: '14px',
                  borderRadius: '8px',
                }
              }}
            >
              {errors}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 text-center text-secondary text-sm font-sans"
          style={{
            '@media (max-width: 640px)': {
              fontSize: '12px',
            }
          }}
        >
          <p>© 2025 ChinaShopBY. Все права защищены.</p>
          <p className="mt-1 text-accent-primary animate-pulse">Обновлено: 20.10.2025 20:47 CEST</p>
        </motion.footer>
      </div>
    </div>
  );
}

export default SelfPickupCargo;