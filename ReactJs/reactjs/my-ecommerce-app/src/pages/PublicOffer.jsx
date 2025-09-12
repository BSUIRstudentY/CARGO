import React from 'react';
import { useNavigate } from 'react-router-dom';

const PublicOffer = () => {
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-4 py-10 md:py-16 text-white min-h-screen relative overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 text-center">
          Публичная оферта
        </h1>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">1. Общие положения</h2>
            <p className="text-gray-300">
              Настоящий документ является публичной офертой ООО «ChinaShopBY» (далее — Посредник) в соответствии со ст. 405, 407 Гражданского кодекса Республики Беларусь. Оферта адресована неопределенному кругу физических и юридических лиц (далее — Заказчик) и содержит все существенные условия договора на оказание посреднических услуг по закупке и доставке товаров из Китая. Оформление заказа через сайт www.chinashopby.com, включая разделы «Каталог», «Терминал» или «Корзина», либо оплата услуг является полным и безоговорочным акцептом условий настоящей оферты.
            </p>
            <p className="text-gray-300 mt-4">
              Дополнительные сведения о процессе заказа, доставки и оплаты приведены в разделах «Инструкции по заказу», «Доставка и оплата» и «FAQ» на сайте.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">2. Предмет договора</h2>
            <p className="text-gray-300">
              Посредник обязуется оказать Заказчику услуги по организации закупки и доставки товаров из Китая, включая поиск поставщиков, проверку качества товаров (по запросу), координацию логистики и таможенное оформление. Заказчик обязуется предоставить достоверные данные (ФИО, телефон, адрес, параметры товара) и оплатить услуги в порядке, установленном настоящей офертой.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">3. Стоимость и порядок оплаты</h2>
            <p className="text-gray-300">
              Стоимость услуг Посредника для резидентов Республики Беларусь указывается в белорусских рублях (BYN) и включает:
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Комиссию за посреднические услуги: 10% от стоимости товара, но не менее 15 BYN за заказ.</li>
                <li>Международную доставку: от 12 BYN/кг (авиа, 7–12 дней) или 6 BYN/кг (авто/ЖД, 18–35 дней).</li>
                <li>Упаковку: от 2 BYN за единицу товара.</li>
                <li>Таможенные платежи: рассчитываются индивидуально в соответствии с законодательством РБ.</li>
              </ul>
            </p>
            <p className="text-gray-300 mt-4">
              Для расчетов с китайскими поставщиками применяется курс USD/CNY, установленный на момент заказа. Итоговая стоимость отображается в разделе «Терминал» или «Корзина» после оформления заказа. Оплата производится через банковские карты (Visa, Mastercard), электронные кошельки (WebMoney, ЮMoney, Qiwi) или банковский перевод (для юридических лиц) в течение 3 рабочих дней после подтверждения заказа администратором. Все платежи защищены 256-битным SSL-шифрованием.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">4. Права и обязанности сторон</h2>
            <p className="text-gray-300">
              <strong>Посредник обязуется:</strong>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Организовать закупку и доставку товаров в соответствии с данными, предоставленными Заказчиком.</li>
                <li>Проверить целостность упаковки (базовая проверка) или качество товаров (по дополнительному запросу).</li>
                <li>Передать груз логистической компании (СДЭК) для доставки в Беларусь.</li>
                <li>Уведомить Заказчика о статусе заказа через email, телефон или личный кабинет.</li>
              </ul>
            </p>
            <p className="text-gray-300 mt-4">
              <strong>Заказчик обязуется:</strong>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Предоставить достоверные данные о товаре (ссылка, описание, параметры) и доставке (ФИО, адрес, телефон).</li>
                <li>Оплатить услуги в установленные сроки.</li>
                <li>Проверить заказ в личном кабинете после подтверждения администратором.</li>
              </ul>
            </p>
            <p className="text-gray-300 mt-4">
              Посредник не несет ответственности за качество товаров, предоставленных китайским поставщиком, или за задержки, вызванные действиями перевозчика или таможенных органов.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">5. Условия доставки</h2>
            <p className="text-gray-300">
              Доставка осуществляется через логистическую компанию СДЭК после прибытия товаров на склад Посредника в Минске. Варианты доставки:
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Бесплатная доставка: для заказов от 100 BYN, 3–5 рабочих дней.</li>
                <li>Платная доставка: 10 BYN для заказов менее 100 BYN, 2–4 рабочих дня.</li>
              </ul>
            </p>
            <p className="text-gray-300 mt-4">
              Заказчик получает трек-номер для отслеживания. Ответственность за сохранность груза после передачи перевозчику несет СДЭК.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">6. Правила возврата и претензии</h2>
            <p className="text-gray-300">
              Возврат возможен в соответствии с Законом РБ «О защите прав потребителей»:
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Срок возврата: 14 календарных дней с момента получения товара, при условии сохранения оригинальной упаковки и отсутствия следов использования.</li>
                <li>Процесс: Заказчик обращается в поддержку по email (<a href="mailto:support@chinashopby.com" className="text-[var(--accent-color)] underline">support@chinashopby.com</a>) или телефону (<a href="tel:+375291234567" className="text-[var(--accent-color)] underline">+375 29 123-45-67</a>) с указанием трек-номера и описанием проблемы.</li>
                <li>Возврат средств: Производится в течение 7 рабочих дней после проверки товара.</li>
              </ul>
            </p>
            <p className="text-gray-300 mt-4">
              Претензии по качеству принимаются в течение 15 дней после получения. Посредник содействует в разрешении споров с китайским поставщиком, но не несет ответственности за качество товаров.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">7. Конфиденциальность</h2>
            <p className="text-gray-300">
              Оформляя заказ, Заказчик дает согласие на обработку персональных данных (ФИО, телефон, email, адрес) в соответствии с Законом РБ «О защите персональных данных» (№ 99-З). Данные используются исключительно для выполнения заказа и не передаются третьим лицам, кроме случаев, предусмотренных законодательством.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">8. Срок действия и юрисдикция</h2>
            <p className="text-gray-300">
              Настоящая оферта действует с момента публикации на сайте www.chinashopby.com до ее отзыва или изменения Посредником. Изменения вступают в силу с момента публикации на сайте. Все споры регулируются законодательством Республики Беларусь. Место заключения договора — г. Минск.
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">9. Реквизиты Посредника</h2>
            <p className="text-gray-300">
              Исполнитель: ООО «ChinaShopBY»<br />
              Юридический адрес: г. Минск, ул. Примерная, 10<br />
              ИНН: 123456789<br />
              Email: <a href="mailto:support@chinashopby.com" className="text-[var(--accent-color)] underline">support@chinashopby.com</a><br />
              Телефон: <a href="tel:+375291234567" className="text-[var(--accent-color)] underline">+375 29 123-45-67</a>
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 text-center">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">Готовы оформить заказ?</h2>
            <p className="text-gray-300 mb-6">
              Ознакомьтесь с процессом заказа и начните закупку товаров из Китая прямо сейчас!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/catalog')}
                className="bg-[var(--accent-color)] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition duration-300"
              >
                Перейти в Каталог
              </button>
              <button
                onClick={() => navigate('/terminal')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Перейти в Терминал
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicOffer;