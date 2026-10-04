import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';

const notes = [
  ['Оплата', 'Карты Visa и Mastercard. Срок оплаты — 3 дня после подтверждения заказа. Курс и стоимость после этого не пересчитываются.'],
  ['Доставка по Беларуси', 'Европочта до любого отделения. Тариф Европочты и доставка из Китая ($6/кг) оплачиваются при получении.'],
  ['Страховка', '5 % от стоимости товара. Полный возврат при утере — при наличии видео распаковки без пауз.'],
];

function DeliveryPayment() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Доставка"
        title="Доставка и оплата"
        subtitle="Цена товара, доставка до Минска и выдача через Европочту."
      />
      <div className="grid gap-2 sm:grid-cols-3">
        {notes.map(([title, text]) => (
          <div key={title} className="glass sheet p-4">
            <p className="kicker">{title}</p>
            <p className="mt-2 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DeliveryPayment;
