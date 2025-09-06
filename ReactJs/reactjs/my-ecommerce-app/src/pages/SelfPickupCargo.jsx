import React, { useState, useEffect } from 'react';

function SelfPickupCargo() {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [trackingNumbers, setTrackingNumbers] = useState(() => {
    const savedTrackingNumbers = localStorage.getItem('savedTrackingNumbers');
    return savedTrackingNumbers ? JSON.parse(savedTrackingNumbers) : [];
  });
  const [newTrackingNumber, setNewTrackingNumber] = useState('');
  const [errors, setErrors] = useState('');

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

  return (
    <div className="mx-auto min-h-screen max-w-7xl bg-gradient-to-b from-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Background texture overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="none"%3E%3Crect width="100" height="100" fill="url(%23pattern0)" /%3E%3Cdefs%3E%3Cpattern id="pattern0" patternUnits="userSpaceOnUse" width="50" height="50"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.5"/%3E%3C/pattern%3E%3C/defs%3E%3C/svg%3E')`,
        backgroundRepeat: 'repeat',
        zIndex: 0,
      }}></div>

      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with animated title and decorative element */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--accent-color)] animate-fade-in-down relative">
            Самовыкуп карго
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[var(--accent-color)] rounded-full opacity-50 animate-pulse"></span>
          </h1>
        </div>

        <div className="max-w-7xl mx-auto space-y-12">
          {/* Instruction Section with Enhanced Styling */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700/50 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-semibold text-[var(--accent-color)] mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
              Инструкция по самовыкупу
            </h2>
            <p className="text-gray-300 mb-4">
              Если вы умеете самостоятельно выкупать товары с китайских площадок, следуйте этим шагам:
            </p>
            <ol className="list-decimal pl-6 space-y-4 text-gray-300">
              <li>
                <strong>Заполнение адреса склада:</strong> Укажите адрес склада на нужной площадке с вашим кодом клиента (последние 4 цифры вашего номера телефона, например, BL1234 без скобок и пробелов). Адрес:
                <br />
                <span className="block mt-2 bg-gray-700 p-2 rounded-lg text-sm break-words">
                  广东省佛山市南海区大沥镇时代水岸二期教育路波子园林餐厅小路走到底的院子右手边Cargo DP 唛头BL(и 4 последние цифры вашего номера телефона) 刘云鹏 13976192260
                </span>
                <p className="mt-2 text-sm text-red-400">
                  Код клиента обязателен в адресе. Если его нет, товар зачислится к потеряшкам.
                </p>
              </li>
              <li>
                <strong>Проверка адреса:</strong> После заполнения отправьте скриншот адреса на сайт для проверки.
              </li>
              <li>
                <strong>Выкуп и отслеживание:</strong> Выкупайте товары на наш склад и самостоятельно отслеживайте их перемещение по Китаю.
              </li>
              <li>
                <strong>Формирование консолидации:</strong> После прибытия всех товаров на склад сформируйте список трек-номеров (статус "получено") и отправьте его на сайт. Сдавайте консолидацию через 1-2 дня после прибытия последнего товара. Не отправляйте заранее, так как статус в логистике может быть ошибочным.
              </li>
              <li>
                <strong>Фото товаров:</strong> После получения треков на сборку, в разделе "Фото товара" с вашим кодом клиента появятся фото (накладная и товар). Фото загружаются в течение рабочего дня (если треки отправлены с 16:00 до 9:00 — в ближайшее время). Качество может быть ниже ожидаемого, это бесплатно. Проверка на брак — платная услуга (см. раздел "Тарифы").
                <br />
                Если товар не соответствует, оформите возврат (5 юаней/трек) через сайт, отправив трек и скриншот. Возврат по Китаю оплачивается вами или продавцом.
              </li>
              <li>
                <strong>Подтверждение:</strong> Мониторьте фото в разделе "Фото товара" по коду клиента и дате. Если всё устраивает, подтвердите на сайте. Без ответа в течение рабочего дня считается "Всё ок", и треки передаются на сборку/отправку (1-2 дня, до 3 в пиковые периоды).
              </li>
              <li>
                <strong>Накладная:</strong> После упаковки (2-7 дней) сайт пришлёт накладную с данными: дата отправки, вес, кол-во мест, объём, плотность, цена/кг, страховка, упаковка, общая сумма ($, CNY). Оплатите в течение 7 дней любым доступным способом.
              </li>
            </ol>
          </div>

          {/* Tracking Number Cards Section */}
          <div className="flex flex-wrap gap-4">
            <div
              className="bg-gray-700/80 p-4 rounded-xl border-2 border-gray-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer w-48 h-32 flex flex-col justify-center items-center"
              onClick={() => setIsFormVisible(true)}
            >
              <div className="text-4xl text-[var(--accent-color)] font-bold">+</div>
              <p className="text-center text-gray-300 mt-2 text-sm">Добавить трек-номер</p>
            </div>
            {trackingNumbers.map((number) => (
              <div
                key={number}
                className="bg-gray-700/80 p-4 rounded-xl border-2 border-gray-600 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 w-48 h-32 flex flex-col justify-between"
              >
                <h4 className="text-lg font-semibold text-gray-100 truncate">{number}</h4>
                <button
                  className="text-red-400 hover:text-red-600 text-sm font-medium transition duration-300 text-center"
                  onClick={() => removeTrackingNumber(number)}
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>

          {/* Add Tracking Number Form */}
          {isFormVisible && (
            <div className="bg-gray-700/80 p-6 rounded-xl shadow-md border-2 border-gray-600/50 animate-slide-up w-full max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-200 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
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
                    className={`w-full px-3 py-2 border-2 rounded-lg bg-gray-600/50 text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300 ${
                      errors ? 'border-red-500' : 'border-gray-500'
                    }`}
                    placeholder="Введите трек-номер (например, BL1234)"
                  />
                  {errors && <p className="text-red-400 text-xs mt-1 animate-pulse">{errors}</p>}
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-md text-sm"
                  onClick={() => {
                    setIsFormVisible(false);
                    setErrors('');
                  }}
                >
                  Отмена
                </button>
                <button
                  className="px-4 py-2 bg-[var(--accent-color)] text-white font-medium rounded-lg hover:bg-[var(--accent-hover-color)] transition-all duration-300 transform hover:scale-105 shadow-md text-sm"
                  onClick={handleAddTrackingNumber}
                >
                  Добавить
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Decorative Footer Accent */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 ChinaShopBY. Все права защищены.</p>
          <p className="mt-1 animate-pulse text-[var(--accent-color)]">Обновлено: 07.08.2025 18:28 BST</p>
        </div>
      </div>
    </div>
  );
}

// Добавление CSS-анимаций и кастомных стилей
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
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.animate-pulse {
  animation: pulse 1.5s infinite;
}
.car-animation {
  position: relative;
  transition: all 0.3s ease;
}
.car-animation.active .car {
  animation: drive 2s infinite linear;
}
@keyframes drive {
  0% { transform: translateX(0); }
  100% { transform: translateX(100px); }
}
.dust {
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 10px;
  height: 5px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: dustAnimation 1s infinite;
}
@keyframes dustAnimation {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0); opacity: 0; }
}
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default SelfPickupCargo;