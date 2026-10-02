import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '../components/ui/PageHeader';

const faq = [
  {
    q: 'Из чего складывается стоимость?',
    a: 'Цена товара в юанях (по курсу НБРБ на день оплаты), доставка $6 за килограмм от склада в Китае до Минска, упаковка $3 или $5 и, по желанию, страховка 5 % от стоимости товара. Тариф Европочты оплачивается при получении.',
  },
  {
    q: 'Когда фиксируется цена?',
    a: 'После проверки заказа администратором вы видите итоговую сумму в профиле. Оплатите её в течение 3 дней — курс и ставка больше не пересчитываются.',
  },
  {
    q: 'Как работает страховка?',
    a: 'Страховка 5 % покрывает полную стоимость груза при утере. Для выплаты нужно снять распаковку на видео без пауз — так требует перевозчик.',
  },
  {
    q: 'Что такое самовыкуп?',
    a: 'Если вы сами купили товар на китайской площадке, укажите адрес нашего склада при оплате и добавьте трек-номер посылки в разделе «Самовыкуп». Мы примем её и довезём по той же ставке.',
  },
];

function FAQSection() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <PageHeader kicker="FAQ" title="Частые вопросы" subtitle="Коротко о цене, оплате, страховке и самовыкупе." />
      <div className="glass sheet faq">
        {faq.map((item, i) => (
          <details key={item.q} open={i === 0}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
      <button type="button" className="n-support-fab nav-icon" aria-label="Открыть поддержку" onClick={() => navigate('/support')} style={{ background: '#111', color: '#fff' }}>
        <ChatBubbleLeftRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

export default FAQSection;
