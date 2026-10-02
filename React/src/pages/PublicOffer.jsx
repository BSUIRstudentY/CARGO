import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';

function PublicOffer() {
  return (
    <div className="space-y-4">
      <PageHeader
        kicker="Документы"
        title="Публичная оферта"
        subtitle="Условия выкупа и доставки товаров из Китая."
      />
      <div className="glass sheet space-y-3 p-4 leading-relaxed">
        <p>Fluvion организует выкуп и доставку товаров из Китая по поручению клиента. Сайт сам товары не продаёт.</p>
        <p>Заказ оформляется в терминале по ссылке или из каталога. После проверки администратором цена фиксируется, оплатить её нужно в течение 3 дней.</p>
        <p>Доставка до Минска считается по ставке $6 за килограмм. Выдача — через Европочту, тариф отделения оплачивается при получении.</p>
        <p>Вопросы по заказу — в разделе «Поддержка».</p>
      </div>
    </div>
  );
}

export default PublicOffer;
