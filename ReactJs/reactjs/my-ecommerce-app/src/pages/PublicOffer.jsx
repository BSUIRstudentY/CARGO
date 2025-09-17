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
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">1. Общие положения</h2>
            <div className="text-gray-300">
              Настоящий документ является публичной офертой индивидуального предпринимателя Ковалевского Ярослава Андреевича (далее — Посредник) в соответствии со статьями 405 и 407 Гражданского кодекса Республики Беларусь. Оферта адресована неопределенному кругу физических и юридических лиц (далее — Заказчик) и содержит все существенные условия договора на оказание посреднических услуг по заказу и доставке товаров из Китая через сайт Fluvion (www.fluvion.by). Оформление заказа через разделы «Каталог», «Терминал» или «Корзина» на сайте, либо оплата услуг является полным и безоговорочным акцептом условий настоящей оферты.
            </div>
            <div className="text-gray-300 mt-4">
              Дополнительные сведения о процессе заказа, доставки и оплаты приведены в разделах <a href="/order-instructions" className="text-[var(--accent-color)] underline">«Инструкции по заказу»</a>, <a href="/delivery-payment" className="text-[var(--accent-color)] underline">«Доставка и оплата»</a> и <a href="/faq" className="text-[var(--accent-color)] underline">«FAQ»</a> на сайте Fluvion.
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">2. Предмет договора</h2>
            <div className="text-gray-300">
              Посредник обязуется оказать Заказчику услуги по заказу конкретного товара, указанного Заказчиком, и организации его доставки из Китая, включая проверку целостности упаковки (базовая проверка), координацию логистики через транспортную компанию Карго. За дополнительную плату (от $5) возможна проверка качества, количества или тестирование техники. Заказчик обязуется предоставить достоверные данные о товаре (ссылка, описание, параметры) и доставке (ФИО, адрес, телефон, email) и оплатить услуги в порядке, установленном настоящей офертой.
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">3. Стоимость и порядок оплаты</h2>
            <div className="text-gray-300">
              Стоимость услуг Посредника включает:
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Комиссию за посреднические услуги: 10% от стоимости товара, рассчитанной по курсу BYN/CNY Альфа-Банка на момент заказа.</li>
                <li>Международную доставку: $6 за каждый килограмм товара (минимальный вес — 1 кг).</li>
                <li>Упаковку: $3 за стандартную упаковку, $5 для хрупких товаров.</li>
                <li>Услуги Европочты: зависят от региона и типа доставки (2–5 дней).</li>
              </ul>
            </div>
            <div className="text-gray-300 mt-4">
              Итоговая стоимость заказа отображается в разделе <span className="font-bold text-[var(--accent-color)]">Профиль</span> после проверки заказа администрацией. Оплата товара и комиссии производится через эквайринг Альфа-Банка (Visa, MasterCard) в течение 3 рабочих дней после подтверждения заказа. Стоимость доставки ($6/кг + услуги Европочты) оплачивается при получении в отделении Европочты. Все транзакции защищены 256-битным SSL-шифрованием.
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">4. Права и обязанности сторон</h2>
            <div className="text-gray-300">
              <strong>Посредник обязуется:</strong>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Заказать указанный Заказчиком товар и организовать его доставку в соответствии с предоставленными данными.</li>
                <li>Проверить целостность упаковки (базовая проверка) или качество товаров (по дополнительному запросу за плату от $5).</li>
                <li>Передать груз транспортной компании Карго для доставки в Беларусь и далее через Европочту.</li>
                <li>Уведомить Заказчика о статусе заказа через раздел <span className="font-bold text-[var(--accent-color)]">Отправления</span> в <span className="font-bold text-[var(--accent-color)]">Профиле</span>.</li>
              </ul>
            </div>
            <div className="text-gray-300 mt-4">
              <strong>Заказчик обязуется:</strong>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Предоставить достоверные данные о товаре (ссылка, описание, параметры) и доставке (ФИО, адрес, телефон, email).</li>
                <li>Оплатить товар и комиссию через эквайринг Альфа-Банка в течение 3 рабочих дней после проверки и подтверждения заказа администрацией.</li>
                <li>Проверить заказ в разделе <span className="font-bold text-[var(--accent-color)]">Профиль</span> после подтверждения администрацией.</li>
                <li>Оплатить стоимость доставки при получении в отделении Европочты.</li>
              </ul>
            </div>
            <div className="text-gray-300 mt-4">
              Посредник не несет ответственности за качество товаров, предоставленных китайским поставщиком, за исключением случаев, когда Заказчик оплатил дополнительную проверку качества. Посредник также не отвечает за задержки, вызванные действиями перевозчика.
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">5. Условия доставки</h2>
            <div className="text-gray-300">
              Доставка осуществляется в два этапа:
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Международная доставка: через транспортную компанию Карго из Китая в Минск (18–35 дней, $6/кг).</li>
                <li>Внутренняя доставка: через Европочту в выбранное Заказчиком отделение (2–5 дней, стоимость зависит от региона).</li>
              </ul>
            </div>
            <div className="text-gray-300 mt-4">
              Заказчик может отслеживать статус заказа в разделе <span className="font-bold text-[var(--accent-color)]">Отправления</span> в <span className="font-bold text-[var(--accent-color)]">Профиле</span>. Ответственность за сохранность груза после передачи в Европочту несет перевозчик.
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">6. Правила возврата и претензии</h2>
            <div className="text-gray-300">
              Возврат товаров невозможен, так как оплата производится после подтверждения полной стоимости заказа, и Заказчик должен быть уверен в своем выборе. Для товаров из <span className="font-bold text-[var(--accent-color)]">Каталога</span> рекомендуется ориентироваться на отзывы и дату последней покупки.
            </div>
            <div className="text-gray-300 mt-4">
              <strong>Претензии по качеству или повреждениям:</strong>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Если товар поврежден по вине Посредника и Заказчик выбрал страховку груза, Посредник компенсирует стоимость в течение 7 рабочих дней после проверки.</li>
                <li>Если виноват поставщик, Посредник содействует в составлении претензии к поставщику.</li>
                <li>Претензии принимаются в течение 15 дней с момента получения заказа. Обращайтесь в поддержку по email (<a href="mailto:support@fluvion.by" className="text-[var(--accent-color)] underline">support@fluvion.by</a>) или телефону (<a href="tel:+375291234567" className="text-[var(--accent-color)] underline">+375 29 123-45-67</a>) с указанием номера заказа и описанием проблемы.</li>
              </ul>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">7. Конфиденциальность</h2>
            <div className="text-gray-300">
              Оформляя заказ, Заказчик дает согласие на обработку персональных данных (ФИО, телефон, email, адрес) в соответствии с Законом Республики Беларусь «О защите персональных данных» (№ 99-З). Данные используются исключительно для выполнения заказа и не передаются третьим лицам, за исключением случаев, предусмотренных законодательством (например, для доставки).
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">8. Срок действия и юрисдикция</h2>
            <div className="text-gray-300">
              Настоящая оферта действует с момента публикации на сайте www.fluvion.by до ее отзыва или изменения Посредником. Изменения вступают в силу с момента публикации на сайте. Все споры регулируются законодательством Республики Беларусь. Место заключения договора — г. Солигорск.
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">9. Реквизиты Посредника</h2>
            <div className="text-gray-300">
              Исполнитель: ИП Ковалевский Ярослав Андреевич<br />
              Юридический адрес: 223710, Республика Беларусь, г. Солигорск, ул. Железнодорожная 6<br />
              УНП: 693299414<br />
              Свидетельство о государственной регистрации №755693886000, выдано Солигорским горисполкомом 18.06.2025 г.<br />
              Email: <a href="mailto:support@fluvion.by" className="text-[var(--accent-color)] underline">support@fluvion.by</a><br />
              Телефон: <a href="tel:+375291234567" className="text-[var(--accent-color)] underline">+375 29 123-45-67</a>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 hover:border-[var(--accent-color)] transition-all duration-300 text-center">
            <h2 className="text-2xl font-bold text-[var(--accent-color)] mb-4">Готовы оформить заказ?</h2>
            <div className="text-gray-300 mb-6">
              Ознакомьтесь с процессом заказа и начните закупку товаров из Китая прямо сейчас!
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/catalog')}
                className="bg-[var(--accent-color)] text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition duration-300"
                aria-label="Перейти в Каталог"
              >
                Перейти в Каталог
              </button>
              <button
                onClick={() => navigate('/terminal')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
                aria-label="Перейти в Терминал"
              >
                Перейти в Терминал
              </button>
            </div>
          </div>
        </div>
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 Fluvion. Все права защищены.</p>
          <p className="mt-1 animate-pulse text-[var(--accent-color)]">Обновлено: 17.09.2025 19:39 CEST</p>
        </div>
      </div>
    </section>
  );
};

export default PublicOffer;