import React, { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import { PageHeader } from '../components/ui/PageHeader';

const ACTION_LABEL = {
  approve: 'Одобрить',
  reject: 'Отклонить',
  cancel: 'Отменить',
  'arrived-china': 'На складе в Китае',
  weight: 'Указать вес',
  'in-transit': 'В путь в Минск',
  ready: 'Готов к выдаче',
  complete: 'Завершить',
};

const STAGES = [
  { id: 'all', label: 'Все' },
  { id: 'CREATED', label: 'Создан' },
  { id: 'APPROVED', label: 'Одобрен' },
  { id: 'REJECTED', label: 'Отклонён' },
  { id: 'AWAITING_PURCHASE_PAYMENT', label: 'Оплата выкупа' },
  { id: 'PURCHASE_PAID', label: 'Выкуп оплачен' },
  { id: 'AT_CHINA_WAREHOUSE', label: 'Склад в Китае' },
  { id: 'AWAITING_WEIGHT_PAYMENT', label: 'Оплата по весу' },
  { id: 'WEIGHT_PAID', label: 'Вес оплачен' },
  { id: 'IN_TRANSIT_TO_MINSK', label: 'В пути' },
  { id: 'READY_FOR_PICKUP', label: 'К выдаче' },
  { id: 'COMPLETED', label: 'Завершён' },
  { id: 'CANCELLED', label: 'Отменён' },
];

const PURPOSE = { PURCHASE: 'Выкуп', WEIGHT: 'Доставка' };
const METHOD = { MANUAL: 'Вручную', BEPAID: 'bePaid' };
const PAY_STATUS = { PENDING: 'Ожидает', PAID: 'Оплачен', FAILED: 'Ошибка' };

function AdminOrderBoard() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [weights, setWeights] = useState({});
  const [fee, setFee] = useState('');
  const [stage, setStage] = useState('all');

  const load = async () => {
    const [board, setting] = await Promise.all([
      api.get('/admin/orders/board'),
      api.get('/admin/settings/intra-minsk-fee'),
    ]);
    setRows(board.data);
    setFee(String(setting.data.amountUsd ?? ''));
  };

  useEffect(() => {
    load().catch((err) => setError(err.response?.data?.error || 'Не удалось загрузить заказы'));
  }, []);

  const act = async (id, action, paymentId) => {
    setError('');
    try {
      if (action === 'weight') {
        await api.post(`/admin/orders/${id}/weight`, { weightKg: Number(weights[id]) });
      } else if (action === 'confirm-payment') {
        await api.post(`/admin/orders/${id}/payments/${paymentId}/confirm`);
      } else if (action === 'reject') {
        await api.post(`/admin/orders/${id}/reject`, { reason: 'Отклонено администратором' });
      } else {
        await api.post(`/admin/orders/${id}/${action}`);
      }
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Действие не выполнено');
    }
  };

  const saveFee = async () => {
    setError('');
    try {
      await api.put('/admin/settings/intra-minsk-fee', { amountUsd: Number(fee) });
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Не удалось сохранить сбор');
    }
  };

  const visible = stage === 'all' ? rows : rows.filter((row) => row.status === stage);

  return (
    <div className="space-y-4">
      <PageHeader kicker="Админ" title="Заказы" subtitle="Одобрение, вес и две оплаты" />
      {error ? <p className="muted">{error}</p> : null}
      <div className="glass sheet flex flex-wrap items-end gap-3 p-4">
        <label className="text-[13px]">
          <span className="mb-1 block text-black/45">Сбор по Минску, USD</span>
          <input className="input" value={fee} onChange={(event) => setFee(event.target.value)} />
        </label>
        <button type="button" className="btn btn-dark btn-sm" onClick={saveFee}>Сохранить</button>
      </div>
      <div className="chip-row">
        {STAGES.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={stage === item.id}
            className={`rounded-full px-3 py-1.5 text-[12px] ${stage === item.id ? 'pill-on' : 'glass'}`}
            onClick={() => setStage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {visible.map((row) => (
          <article key={row.id} className="glass sheet space-y-3 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[15px] font-medium">#{row.id} {row.statusLabel}</h2>
              <p className="text-[12px] text-black/50">{row.email}</p>
            </div>
            <p className="text-[13px] text-black/60">
              Выкуп {Number(row.totalClientPrice || 0).toFixed(2)} CNY
              {row.weightKg ? ` · ${row.weightKg} кг` : ''}
              {row.weightAmount ? ` · доставка ${Number(row.weightAmount).toFixed(2)} USD` : ''}
            </p>
            <p className="text-[13px]">{row.deliveryAddress}</p>
            <div className="space-y-2">
              <p className="text-[12px] text-black/45">Оплаты</p>
              {(row.payments || []).length === 0 ? <p className="text-[13px] text-black/45">Платежей пока нет</p> : null}
              {(row.payments || []).map((payment) => (
                <div key={payment.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px]">
                  <span>{PURPOSE[payment.purpose] || payment.purpose}</span>
                  <span className="text-black/45">{METHOD[payment.method] || payment.method}</span>
                  <span>{Number(payment.amount || 0).toFixed(2)} {payment.currency}</span>
                  <span className="text-black/45">{PAY_STATUS[payment.status] || payment.status}</span>
                  {payment.status === 'PENDING' && payment.method === 'MANUAL' ? (
                    <button type="button" className="btn btn-dark btn-sm" onClick={() => act(row.id, 'confirm-payment', payment.id)}>
                      Подтвердить
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(row.actions || []).filter((action) => action !== 'confirm-payment').map((action) => (
                action === 'weight' ? (
                  <div key={action} className="flex gap-2">
                    <input
                      className="input w-28"
                      placeholder="кг"
                      value={weights[row.id] || ''}
                      onChange={(event) => setWeights((prev) => ({ ...prev, [row.id]: event.target.value }))}
                    />
                    <button type="button" className="btn btn-dark btn-sm" onClick={() => act(row.id, action)}>{ACTION_LABEL[action]}</button>
                  </div>
                ) : (
                  <button
                    key={action}
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={() => act(row.id, action, row.pendingPaymentId)}
                  >
                    {ACTION_LABEL[action]}
                  </button>
                )
              ))}
            </div>
          </article>
        ))}
        {visible.length === 0 ? <p className="muted">{rows.length === 0 ? 'Заказов пока нет.' : 'В этом статусе заказов нет.'}</p> : null}
      </div>
    </div>
  );
}

export default AdminOrderBoard;
