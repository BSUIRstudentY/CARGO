import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [isImageVisible, setIsImageVisible] = useState(false);

  useEffect(() => {
    // Активируем анимацию при загрузке
    setIsImageVisible(true);
  }, []);

  const handleSiteClick = (url) => {
    window.open(url, '_blank');
  };

  return (
    <section className="max-w-7xl mx-auto  px-4 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen relative overflow-hidden">
      {/* Геройский блок */}
      <section className="section-frame overflow-hidden">
        <div
          className="wrapper bg-soft-primary mask-bg"
          style={{
            backgroundImage: "ur[](https://via.placeholder.com/1920x600?text=China+Shop+Background)",
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: '50% 50%',
          }}
        >
          <div className="container py-12 py-md-16 text-center">
            <div className="row">
              <div className="col-md-7 col-lg-6 col-xl-5 mx-auto">
                <h1 className="text-5xl sm:text-6xl font-bold mb-4 text-white">О ChinaShopBY</h1>
                <div className="lead px-4 sm:px-10 mb-4 text-white text-lg sm:text-xl">
                  <p>Ваш путь к лучшим товарам из Китая</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Блок о компании */}
      <div className="container py-6 py-md-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1 flex justify-center">
            <div className={`img-mask rounded-xl overflow-hidden ${isImageVisible ? 'animate-image-in' : 'animate-image-out'}`}>
              <img
                src="/220.jpg"
                alt="ChinaShopBY Team"
                className="w-full h-64 lg:h-80 object-cover transition-opacity duration-500"
              />
            </div>
          </div>
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">О нашей компании</h2>
            <p className="text-lg sm:text-xl mb-6 text-gray-300 max-w-prose mx-auto lg:mx-0">
              ChinaShopBY специализируется на поставках качественных товаров из Китая, предлагая широкий ассортимент электроники, аксессуаров и товаров для дома. Мы гордимся своим уникальным терминалом для удобных покупок и надежной доставкой, обеспечивая лучшие цены и поддержку клиентов 24/7. Начните прямо сейчас!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate('/catalog')}
                className="bg-[var(--accent-color)] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition duration-300 w-full sm:w-auto"
              >
                Перейти в каталог
              </button>
              <button
                onClick={() => navigate('/terminal')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 w-full sm:w-auto"
              >
                Попробовать терминал
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* История развития */}
      <div className="container py-12 py-md-16">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-center">Наша история развития</h2>
        <div className="text-center text-lg sm:text-xl mb-8 text-gray-300">
          <p>ChinaShopBY начал свой путь в 2020 году, стремясь упростить покупки из Китая для каждого.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 process-wrapper">
          <div className="text-center">
            <span className="inline-block bg-gray-800 rounded-full p-4 mb-4">
              <span className="text-2xl font-bold text-[var(--accent-color)]">1</span>
            </span>
            <h4 className="text-xl font-semibold mb-2">2020 — Начало пути</h4>
            <p className="text-gray-400">Запуск платформы для закупок из Китая.</p>
          </div>
          <div className="text-center">
            <span className="inline-block bg-gray-800 rounded-full p-4 mb-4">
              <span className="text-2xl font-bold text-[var(--accent-color)]">2</span>
            </span>
            <h4 className="text-xl font-semibold mb-2">2021 — Уникальный терминал</h4>
            <p className="text-gray-400">Внедрение инновационного терминала для покупок.</p>
          </div>
          <div className="text-center">
            <span className="inline-block bg-gray-800 rounded-full p-4 mb-4">
              <span className="text-2xl font-bold text-[var(--accent-color)]">3</span>
            </span>
            <h4 className="text-xl font-semibold mb-2">2022 — Расширение ассортимента</h4>
            <p className="text-gray-400">Добавление тысяч новых товаров в каталог.</p>
          </div>
          <div className="text-center">
            <span className="inline-block bg-gray-800 rounded-full p-4 mb-4">
              <span className="text-2xl font-bold text-[var(--accent-color)]">4</span>
            </span>
            <h4 className="text-xl font-semibold mb-2">2023 — Улучшение доставки</h4>
            <p className="text-gray-400">Оптимизация логистики для быстрой доставки.</p>
          </div>
          <div className="text-center">
            <span className="inline-block bg-gray-800 rounded-full p-4 mb-4">
              <span className="text-2xl font-bold text-[var(--accent-color)]">5</span>
            </span>
            <h4 className="text-xl font-semibold mb-2">2024 — Поддержка клиентов</h4>
            <p className="text-gray-400">Запуск 24/7 службы поддержки.</p>
          </div>
          <div className="text-center">
            <span className="inline-block bg-gray-800 rounded-full p-4 mb-4">
              <span className="text-2xl font-bold text-[var(--accent-color)]">6</span>
            </span>
            <h4 className="text-xl font-semibold mb-2">2025 — Рост и инновации</h4>
            <p className="text-gray-400">Продолжение развития с новыми технологиями.</p>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="container mb-12">
        <div className="bg-gray-800 rounded-t-lg p-6 sm:p-10 shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <h3 className="text-4xl font-bold text-white">50,000</h3>
              <p className="text-gray-400">Клиентов ChinaShopBY</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-white">75%</h3>
              <p className="text-gray-400">Довольных покупателей</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-white">30</h3>
              <p className="text-gray-400">Профессионалов в команде</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-white">24/7</h3>
              <p className="text-gray-400">Техническая поддержка</p>
            </div>
          </div>
        </div>
      </div>

      {/* Блок с сайтами закупки */}
      <div className="container py-8 py-md-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">Где мы закупаем товары</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <img
              src="data:image/png;base64,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"
              alt="1688"
              className="mx-auto mb-4 w-36 h-36 object-cover rounded-lg cursor-pointer"
              onClick={() => handleSiteClick('https://1688.com')}
            />
            <h4 className="text-xl font-semibold mb-2">1688</h4>
            
          </div>
          <div className="text-center">
            <img
              src="https://otcommerce.ru/wp-content/uploads/2023/04/5f10aa0684a834485488f873_Webflow-Episode-PDD-1.jpg"
              alt="Pinduoduo"
              className="mx-auto mb-4 w-36 h-36 object-cover rounded-lg cursor-pointer"
              onClick={() => handleSiteClick('https://www.pinduoduo.com')}
            />
            <h4 className="text-xl font-semibold mb-2">Pinduoduo</h4>
            
          </div>
          <div className="text-center">
            <img
              src="data:image/jpeg;base64,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"
              alt="Taobao"
              className="mx-auto mb-4 w-36 h-36 object-cover rounded-lg cursor-pointer"
              onClick={() => handleSiteClick('https://www.taobao.com')}
            />
            <h4 className="text-xl font-semibold mb-2">Taobao</h4>
            
          </div>
          <div className="text-center">
            <img
              src="data:image/png;base64,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"
              alt="WeChat"
              className="mx-auto mb-4 w-36 h-36 object-cover rounded-lg cursor-pointer"
              onClick={() => handleSiteClick('https://www.wechat.com')}
            />
            <h4 className="text-xl font-semibold mb-2">WeChat</h4>
            
          </div>
          <div className="text-center">
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAsVBMVEX/5g8iIiL/6A8AACP/6g4AACQhISL/7A4ZGiI/OCHPuxdsYR/k0RL74xAMEiL/7w0oJCLCsRXw2RBGQCAJDSPr0xLXwxQACCL/9At+cB6tnRgcHSKGeRxPRyGKfhvx2xKShxwUFiLdyBQxLCErJyG5qhdiWB8SFCKzpBiRgh1USyCnmRkABSKBdR16bh5tYx5aUSA6NCGdjhtCPCHCrxc0LyFeVSAsKyKcjB0ADSJ2ah+XW/3IAAAKvElEQVR4nO2ciXaqvBpANVBCkUERoYqKWAXnAU9b6/s/2A0ggxoUlJ5j//vtM6ylhJAtEPJloFIBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/p9ALELpTxhjFqW3I/Ym6RwuD1ASd/qxWLIshOOPrCg0GsPUF/7220gsppcAYSyVBMbUI9wAq51luz3Qj+XD1ny9+9g6e/GYG7YmZHvCivwh/4e0V8eP7XbXEySaI2L1eb+bg/4tutPOMONXvCo4bNcXxuJ7NgmMWGtqGq7tatphGHyBxWWdMRY3MQy+udLZiwIgdt/jDSZPBrdYaNxnp/ClyrZWLl+tVjntVcD+DePx/sdq1XSXEskMSSs5/OImpr1oChcFeJsuZJPLsTt3kypnaqMOW9RwzpnhAdxaBZEzOtOOR7Q/xkqlonTqZj5BPw/jY3hmyLaYnD9QPrSNWEwRScvFcV9+Ry5LPPmICsTJfVJBsgctzwmIYIITn0LpMGUKVvmvSbHahhXX0TnjyWXqX6TxKTMOEkKWo2UciwrHiKeGb6tyDU1+UOxOZMXamaGZGK6IoVQrZFh9mZ/+xG/rcg05t195xLCCG1v7+Nm09+Q+fOvLRa7SKnM4vU1KN7QfNGRb8We5p2P/YdJzi5TAZE5vxKczrODxNjhpnP09Da43ZbKV+eucVLbnhrXEkDNJWpP8LQ5XniHCnR4vu7L90T/e0UrD2b2PCO9fX+9UODeXIWfWRxTq9Xr4P5VqPdyVK82QKA6njuMsBTa6oRRJH08I4yy8Xqo2esk0dGfzCYUOnXmafTN+hvEPG5ILlbVU0hJP8kFYuY4eV0+XhofYkOncyicTHD+1uQefFkcjdD0WugCnHutnhso82sQxf+6NfirKNGp3mKN5sTYN1ZAC8kPG7K3DTEPcejlu0HrnLbr8kIfY8TJ1m3rRNk0eQ6SowlhQMx1RizEzDCtKN9xma3PpbkMkdbUgF57fF8wllyHCk1rvo1mbWxmKSDQyDUk4xviMPPVuQT+G6y/8XLR9VhmyyGOIsBeEjEY9K/trhkSxsT8cSHj8gGCYS622F4oK5jLEOh9WlTzfodfUSPzONiQVl2RZ0t2dLFFJw1yKCuYxRDhOwqzpwRlqXTMMO6KKloxylLtyyWOIRlHx+S/hLsNKjr66PNzzM+UxVOMon2MadxgiRbHUHLRuYilKYcmyDOUrNQ2a80xJmJ3KD9Q0DxoiqflikwZJGX85+2Wmlv+0eNBQ+SwzQOSYQwlP/KBZmoCttCFOb4vu/SuGePhSL9Gwau+utC1zGrJIFYdphGocnBnzky1DUQocUcvOMlS8knuiqt6jLW/W+tPeNE9IYnjz9WRDr+aJNwyfrxeDtTyeMeQ0bqoryj7ZojGM4wcM1wxrT2aI2E7dLnJApmaha/fh0xmyomMUO6JfveY2NKk9WalrhLvV1fWwIRZ2diHDKjPF19o0aUOTMWldUaNq0pPGjWi9VW4y9vG4YSPV5ZLPcJnX0OT3gk5BaCddOUuRmqKbPLD+0TnMjg9ThszSwpTmNJamSZL9G63FjZN+6hL6vIuNxJBC+fehmNmLkTakd2MgK2U4UGilROwyqh1K6PPucIXG+xhHQtf6adKGnQcM497Ex/u8UZ+Rz8deE862mMxWRFd7osoxRCUakmhO+DiPWRJB7WzTQAr2+VWGFYTfpHTYqQ65uCIzJieRqqooQSMxp+HktEkfNd/TNc3gjTqPpsyrNPzNTiqyk9hCofUqEMP4Ur5W09Ajd7GbJOlb9DSH0upSCnniQzGPIb9t0vmKLwDz/VaSpzas8jIVN9UoM+lJkkbhcxuWARjmNPRnJybVCNUwSPJrDUk7UNfFaHIi1ZCtkCayGv0Kv80QW/vabOZMj5MTaYZ4uHRmm1rnOE7yywyxerA119XcWjgWSTHEetMgSYzR1EK/zxChdjgYacrLoPyXhkj6WARGvDsJfH6XIdZf7fALe9vAVENlEo1cL2bBYFROQ+aFCpOkqGckeZFLNFTimW0m7/nDWZeGb05UJlMT8p9DZi/Q0IVlkqQ9pMX4ulCLFMswHEQ9Q5zRl+iGve/kiwKGf1hayxtL+3SMT2t4Y9QuLwJOG36XbDimjnCitGFG9CStfrfhAAyJYYnR0983zBHj/xZDT6L3Jg7SNQ21N1EtrzfxJw3lXkOkDNart2J8VRXn23hu4jMbVrWvQ5vCqmlHKezekpbC4eIUz21Y5Re06QcLO0lhUycoaKnevuc2LAEwLGaolWHoPLPhf/8clmGoTMs1NDmv2PS2HzfEesnzaV4bj86nKdmw8rZ+yb+877Yg0y04BfPnDZHifZcwZ+8I1ym6TPbnDYmipE/m4QqRzvHfxcfOPGNhyQkTXSo8/fIvGOZYkZJ/ZUlRv79k+E8Bw5INg6FXHBMOs+b9RS7f9fBkhr6dP7FTGEer1sYNXRRVyXe+rYkwqbAmY7HoNOi/ZUh+f9QSOvvlerN1o6rf/erV1suBNxGGVuW6JvETBjOySzxW8lyGCLNqY3+YmQxjaHa0WpIzeVkziOmo56z6ncbQkjBNEyGMLWHaYzSuajJVr9iN/lcMMTv0ajt7IWc0bkwiuqjvNoduqEmeCjjsPCYXsKIgS5+veu5xxbX8Sh+l/YeGSBlOZ5xh31gSbtqy5n5tZ856OieXrd8943fS6ON51+mNkmm8nDYtdBJ/3hBLgx3v5muakuvWlmWTG22bvd6M0OvtPqq8bKd3N9atIifxxyNgVnp37WJNb840ed4+wvPnrw3RMhZf/aNziPD7otAbC27DdJ/qKsV/yg2ASfz0Pi4UIP604Vvtu3oBZc5jbviLt6c8YigHtRZK5rWZkWE8EnQ0zJy59zY7fedEcIu5/kIGWXaDu8zM9XqeaHd5NJAKvp/GWiXvp9HDMeBoKqJpBl0iCL1Hxbe3wukYMG/rgaG6i8Zoz96L8ZZ+NQp5wvOj12ZvPd17njdtO83m6/uId12bz1MXcbw8+tSvLCmnGyIvqsldJyhbMo7vhl0iCMevmGHa6uk4PvNphVMX4v4mZnlSAmWcTNzTuObGa7RSTW8WtfSGt970XqsaOaXXzibRk3eOgItHiOzQCRfzy2b48h6EumHbw7T74enAw/fgRHDy15+gTYWkXXjf2dxxwAzpH0EunDzSTwxRZRYm5Y0PxxtiJVgZFv26yA8XSKNFFOar2mbHGaHnmShHGgMG0evq90TA/mL+jabJGvMevY0Bq23X0LSF3Y7eZ6aMXxmSxHiNJvlifcZomsZ8ROvXkTTeLfxvdpOzMuDhZkFyMz7WEymrgMhvm0lEs3uozbZ1Xlv4u2j+3Ur2XMjc9vMwaKj3+fnZ69Pa7HM5jsMSrHqH2ebgRYL+xOilM3O6jfgmx8N+beYsx/EXSBK6/jeX7/pSxMHh01lOrBvl8zWxRVppE6+/bB9qnxvSptk46/Zy4LdW77g8E7Ak6sN0AVhW1XU1vTDcTyKm3zfnz2sbWqlwFLHnSeJ9keqv4stTQYRXLStZFokjg2kmw5ZlVe6Ie88zZs+yOJmbmJnk7LCX38QbCq7CDoOKqBegjIXuAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwC/lf0nVwHr+hhP5AAAAAElFTkSuQmCC"
              alt="GoFish"
              className="mx-auto mb-4 w-36 h-36 object-cover rounded-lg cursor-pointer"
              onClick={() => handleSiteClick('https://gofish.com')} // Замените на актуальный URL, если есть
            />
            <h4 className="text-xl font-semibold mb-2">GoFish</h4>
            
          </div>
          <div className="text-center">
            <img
              src="data:image/png;base64,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"
              alt="Poizon"
              className="mx-auto mb-4 w-36 h-36 object-cover rounded-lg cursor-pointer"
              onClick={() => handleSiteClick('https://www.poizon.com')} // Замените на актуальный URL, если есть
            />
            <h4 className="text-xl font-semibold mb-2">Poizon</h4>
            
          </div>
        </div>
      </div>

      {/* Форма обратной связи */}
      <div className="container py-8 py-md-12">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Задать вопрос или получить консультацию</h2>
          <div className="max-w-3xl mx-auto mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Ваше имя"
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                  aria-required="true"
                />
              </div>
              <div className="mb-4">
                <input
                  type="tel"
                  placeholder="Ваш телефон"
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                  aria-required="true"
                />
              </div>
              <div className="md:col-span-2 mb-4">
                <textarea
                  placeholder="Ваше сообщение"
                  className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] h-32"
                  aria-required="true"
                ></textarea>
              </div>
              <div className="md:col-span-2 mb-4 flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  id="agree"
                  aria-invalid="false"
                />
                <label htmlFor="agree" className="text-gray-400">
                  Выражаю свое <a href="/user-agreement" className="text-[var(--accent-color)] hover:underline">согласие</a> на обработку персональных данных
                </label>
              </div>
              <div className="md:col-span-2 text-center">
                <button
                  className="bg-[var(--accent-color)] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition duration-300"
                  type="submit"
                >
                  Отправить
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Карта */}
      <div className="container mb-12">
        <div className="map map-style-1">
          <iframe
            src="https://yandex.ru/map-widget/v1/-/CCUZiIhIDB"
            width="100%"
            height="400"
            frameBorder="0"
            allowFullScreen
            className="rounded-lg"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default Home;