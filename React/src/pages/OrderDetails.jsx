import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosInstance';
import { PageHeader } from '../components/ui/PageHeader';

const PAYABLE = {
  APPROVED: 'PURCHASE',
  AWAITING_PURCHASE_PAYMENT: 'PURCHASE',
  AWAITING_WEIGHT_PAYMENT: 'WEIGHT',
};

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [flow, setFlow] = useState(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await api.get(`/orders/${orderId}/timeline`);
    setFlow(response.data);
  }, [orderId]);

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.error || 'Не удалось открыть заказ'));
  }, [load]);

  const pay = async (method) => {
    const purpose = PAYABLE[flow.status];
    if (!purpose) return;
    setBusy(true);
    setError('');
    setInfo('');
    try {
      await api.post(`/orders/${orderId}/pay`, { purpose, method });
      if (method === 'BEPAID') {
        const amount = purpose === 'WEIGHT' ? flow.weightAmount : flow.totalClientPrice;
        const checkout = await api.post('/payment/create', { orderId: Number(orderId), amount });
        const url = checkout.data?.formUrl;
        if (url) {
          window.location.href = url;
          return;
        }
        setError(checkout.data?.error || 'Платёжная форма не открылась');
      } else {
        setInfo('Заявка на оплату отправлена. Администратор подтвердит её.');
      }
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Не удалось начать оплату');
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    setBusy(true);
    setError('');
    try {
      await api.post(`/orders/${orderId}/cancel`, {});
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Не удалось отменить заказ');
    } finally {
      setBusy(false);
    }
  };

  if (!flow) {
    return <p className="muted">{error || 'Загрузка заказа...'}</p>;
  }

  const receivedDate = flow.receivedAt ? new Date(flow.receivedAt) : null;
  const receivedLabel = flow.status === 'COMPLETED' && receivedDate && !Number.isNaN(receivedDate.getTime())
    ? `Получен ${receivedDate.toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
    : '';
  const purpose = PAYABLE[flow.status];
  const amount = purpose === 'WEIGHT'
    ? `${Number(flow.weightAmount || 0).toFixed(2)} USD`
    : `${Number(flow.totalClientPrice || 0).toFixed(2)} CNY`;
  const canCancel = ['CREATED', 'APPROVED', 'AWAITING_PURCHASE_PAYMENT'].includes(flow.status);

  return (
    <div className="space-y-4">
      <PageHeader
        kicker="Заказ"
        title={flow.statusLabel || 'Заказ'}
        subtitle={[receivedLabel, flow.deliveryAddress].filter(Boolean).join(' · ') || 'Отделение Европочты'}
        action={<button type="button" className="btn btn-light btn-sm" onClick={() => navigate('/profile')}>К заказам</button>}
      />

      {error ? <p className="muted">{error}</p> : null}
      {info ? <p className="muted">{info}</p> : null}

      <ol className="glass sheet space-y-0 p-2">
        {flow.steps.map((step) => (
          <li key={step.index} className={`flex items-center gap-3 px-3 py-3 ${step.state === 'current' ? 'rounded-[14px] bg-white/70' : ''}`}>
            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-[12px] ${step.state === 'upcoming' ? 'bg-black/5 text-black/40' : 'bg-[#111] text-white'}`}>
              {step.index + 1}
            </span>
            <span className={step.state === 'upcoming' ? 'text-black/40' : 'font-medium text-[#111]'}>{step.title}</span>
            {step.state === 'current' ? <span className="ml-auto text-[12px] text-black/55">Сейчас</span> : null}
            {step.state === 'done' ? <span className="ml-auto text-[12px] text-black/40">Готово</span> : null}
          </li>
        ))}
      </ol>

      <div className="glass sheet space-y-2 p-4 text-[13px]">
        <p><span className="text-black/45">Номер </span>{flow.orderNumber}</p>
        <p><span className="text-black/45">Выкуп </span>{Number(flow.totalClientPrice || 0).toFixed(2)} CNY</p>
        {flow.weightKg ? <p><span className="text-black/45">Вес </span>{flow.weightKg} кг</p> : null}
        {flow.weightAmount ? <p><span className="text-black/45">Доставка </span>{Number(flow.weightAmount).toFixed(2)} {flow.weightCurrency}</p> : null}
        {flow.reasonRefusal ? <p><span className="text-black/45">Причина </span>{flow.reasonRefusal}</p> : null}
      </div>

      {purpose ? (
        <div className="glass sheet space-y-3 p-4">
          <p className="font-medium">Оплата {purpose === 'WEIGHT' ? 'доставки' : 'выкупа'}: {amount}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-dark btn-sm" disabled={busy} onClick={() => pay('MANUAL')}>Подтвердит администратор</button>
            <button type="button" className="btn btn-light btn-sm" disabled={busy} onClick={() => pay('BEPAID')}>Картой через bePaid</button>
          </div>
        </div>
      ) : null}

      {canCancel ? (
        <button type="button" className="btn btn-light btn-sm" disabled={busy} onClick={cancel}>Отменить заказ</button>
      ) : null}

      {flow.events?.length ? (
        <div className="glass sheet p-4">
          <p className="kicker mb-2">История</p>
          <ul className="space-y-2 text-[13px]">
            {flow.events.map((event, index) => (
              <li key={`${event.at}-${index}`} className="text-black/70">{event.message}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default OrderDetails;
