import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axiosInstance';

const STATUS_LABEL = {
  CREATED: 'Создан',
  APPROVED: 'Одобрен',
  REJECTED: 'Отклонён',
  AWAITING_PURCHASE_PAYMENT: 'Оплата выкупа',
  PURCHASE_PAID: 'Выкуп оплачен',
  AT_CHINA_WAREHOUSE: 'Склад в Китае',
  AWAITING_WEIGHT_PAYMENT: 'Оплата по весу',
  WEIGHT_PAID: 'Доставка оплачена',
  IN_TRANSIT_TO_MINSK: 'В пути в Минск',
  READY_FOR_PICKUP: 'Готов к выдаче',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отменён',
  PENDING: 'Ожидает подтверждения',
  VERIFIED: 'Подтверждён',
  PAID: 'Оплачен',
  PROCESSED: 'Обработан',
  REFUSED: 'Отклонён',
  REFUNDED: 'Возвращён',
};

const ShipmentsTab = ({ handleViewOrderDetails, refresh }) => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const observer = useRef();
  const containerRef = useRef(null);
  const isInitialLoad = useRef(true);

  const debounce = useCallback((func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  const lastOrderElementRef = useCallback(
    (node) => {
      if (loading || !node) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            debounce(() => setPage((prevPage) => prevPage + 1), 300)();
          }
        },
        {
          root: containerRef.current,
          rootMargin: '100px',
          threshold: 0.1,
        }
      );
      observer.current.observe(node);
    },
    [loading, hasMore, debounce]
  );

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/orders?page=${page - 1}&size=10&sort=dateCreated,desc`);
        const { content, last } = response.data;

        setOrders((prevOrders) =>
          page === 1 ? content : [...prevOrders, ...content]
        );
        setHasMore(!last);
        setError(null);
      } catch (err) {
        console.error('API Error:', err);
        setError(
          'Ошибка загрузки заказов: ' +
            (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
        isInitialLoad.current = false;
      }
    };

    fetchOrders();
  }, [page, refresh]);

  return (
    <div className="space-y-3">
      <h2 className="text-[18px] font-medium text-[#111]">Заказы</h2>
      {error ? <p className="muted">{error}</p> : null}
      <div ref={containerRef} className="max-h-[60vh] space-y-3 overflow-y-auto">
        {orders.length > 0 ? orders.map((order, index) => {
          const totalChinaDeliveryPrice = order.items?.reduce((sum, item) => {
            return sum + (item.chinaDeliveryPrice || 0) * (item.quantity || 1);
          }, 0) || 0;
          const totalOrderPrice = (order.totalClientPrice || 0) + totalChinaDeliveryPrice;
          const payable = ['APPROVED', 'AWAITING_PURCHASE_PAYMENT', 'AWAITING_WEIGHT_PAYMENT', 'VERIFIED'].includes(order.status);
          return (
            <button
              key={order.id}
              type="button"
              ref={index === orders.length - 1 ? lastOrderElementRef : null}
              className="glass sheet w-full p-4 text-left"
              onClick={() => handleViewOrderDetails(order.id)}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium text-[#111]">Заказ #{order.orderNumber}</p>
                <p className="text-[12px] text-black/50">{STATUS_LABEL[order.status] || order.status}</p>
              </div>
              <p className="mt-1 text-[13px] text-black/55">
                {order.items?.length || 0} шт.
                {order.dateCreated ? ` · ${new Date(order.dateCreated).toLocaleDateString('ru-RU')}` : ''}
                {totalOrderPrice > 0 ? ` · ${totalOrderPrice.toFixed(2)} CNY` : ''}
              </p>
              {payable ? <p className="mt-2 text-[13px] font-medium">Оплатить</p> : null}
            </button>
          );
        }) : (!loading && <p className="muted">Заказов пока нет.</p>)}
      </div>
      {loading ? <p className="muted">Загрузка...</p> : null}
    </div>
  );
};

export default ShipmentsTab;
