import React from 'react';
import { PageHeader } from './ui/PageHeader';

function UserAgreement() {
  return (
    <div className="space-y-4">
      <PageHeader
        kicker="Документы"
        title="Согласие на обработку персональных данных"
        subtitle="Нужно, чтобы оформить и довезти заказ."
      />
      <div className="glass sheet space-y-3 p-4 leading-relaxed">
        <p>Оформляя заказ, вы соглашаетесь, что имя, телефон и отделение Европочты будут использованы для доставки.</p>
        <p>Согласие можно отозвать в разделе «Поддержка». Без этих данных заказ довезти нельзя.</p>
      </div>
    </div>
  );
}

export default UserAgreement;
