import React from 'react';
import { PageHeader } from './ui/PageHeader';

function PrivacyPolicy() {
  return (
    <div className="space-y-4">
      <PageHeader
        kicker="Документы"
        title="Политика обработки персональных данных"
        subtitle="Какие данные нужны, чтобы довезти заказ."
      />
      <div className="glass sheet space-y-3 p-4 leading-relaxed">
        <p>Для доставки мы храним имя, телефон и выбранное отделение Европочты. Эти данные видны в профиле и используются только чтобы принять и выдать заказ.</p>
        <p>Платёжные реквизиты карты на сайте не сохраняются.</p>
        <p>Изменить или удалить данные можно в профиле или через раздел «Поддержка».</p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
