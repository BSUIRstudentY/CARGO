import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';

const fullService = [
  ['Добавление товара', 'Ссылка с 1688, Taobao или Pinduoduo в терминале либо товар из каталога. Укажите размер, цвет и количество.'],
  ['Оформление в корзине', 'Выберите отделение Европочты, при желании включите страховку 5 % и примените промокод.'],
  ['Проверка администратором', 'Проверяем цены и наличие у поставщика. Если что-то не так — предложим замену или отклоним позицию с причиной.'],
  ['Оплата заказа', 'После подтверждения оплатите заказ картой в течение 3 дней. Курс и стоимость фиксируются.'],
  ['Включение в сборный груз', 'Оплаченные заказы объединяются в партию. Статус заказа — «В сборном грузе».'],
  ['Выкуп у поставщиков', 'Выкупаем каждую позицию, в заказе появляются статусы «Выкуплен» и китайские трек-номера.'],
  ['Консолидация в Гуанчжоу', 'Посылки приходят на склад, взвешиваются, переупаковываются и фотографируются.'],
  ['Транспортировка', 'Партия едет в Беларусь и проходит таможню. Статус — «В пути», затем «Прибыл в Минск».'],
  ['Отправка Европочтой', 'В Минске заказ передаётся в Европочту, появляется локальный трек.'],
  ['Получение', 'В отделении оплачиваете доставку из Китая ($6/кг) и тариф Европочты.'],
];

const selfPurchase = [
  ['Покупка самостоятельно', 'Оплатите товар на площадке сами. В адресе доставки укажите наш склад и ваш код клиента.'],
  ['Заявка в разделе «Самовыкуп»', 'Добавьте трек-номера посылок и выберите отделение Европочты.'],
  ['Приёмка и партия', 'Посылки приходят на склад, сопоставляются по коду и включаются в ближайший сборный груз.'],
  ['Прибытие в Минск', 'Партия проходит таможню, заказ получает статус «Прибыл в Минск».'],
  ['Европочта и оплата', 'Отправляем в отделение, доставка оплачивается при получении.'],
  ['Получение', 'Заберите посылку в отделении Европочты.'],
];

function OrderInstructions() {
  const [mode, setMode] = useState('full');
  const steps = mode === 'full' ? fullService : selfPurchase;

  return (
    <div className="space-y-6">
      <PageHeader kicker="Инструкция" title="Как оформить заказ" subtitle="Два сценария: мы выкупаем за вас — или вы покупаете сами, а мы только везём." />

      <div className="seg glass sm:max-w-md">
        <button type="button" className={mode === 'full' ? 'is-on' : ''} onClick={() => setMode('full')}>
          Полный сервис · 10 шагов
        </button>
        <button type="button" className={mode === 'self' ? 'is-on' : ''} onClick={() => setMode('self')}>
          Самовыкуп · 6 шагов
        </button>
      </div>

      <div className="glass sheet" key={mode}>
        {steps.map(([title, text], i) => (
          <div key={title} className="row items-start">
            <span className="step-n w-9 shrink-0">{String(i + 1).padStart(2, '0')}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium">{title}</p>
              <p className="muted mt-1 leading-relaxed">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="glass sheet p-4">
          <p className="kicker">Оплата</p>
          <p className="mt-2 leading-relaxed">Карты Visa и Mastercard. Срок оплаты — 3 дня после подтверждения заказа.</p>
        </div>
        <div className="glass sheet p-4">
          <p className="kicker">Доставка по Беларуси</p>
          <p className="mt-2 leading-relaxed">Европочта до любого отделения. Тариф Европочты и доставка из Китая оплачиваются при получении.</p>
        </div>
        <div className="glass sheet p-4">
          <p className="kicker">Страховка</p>
          <p className="mt-2 leading-relaxed">5 % от стоимости товара. Полный возврат при утере — при наличии видео распаковки без пауз.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to={mode === 'full' ? '/terminal' : '/self-pickup'} className="btn btn-dark">
          {mode === 'full' ? 'Открыть терминал' : 'Оформить самовыкуп'}
        </Link>
        <Link to="/calculator" className="btn btn-light">Калькулятор</Link>
      </div>
    </div>
  );
}

export default OrderInstructions;
