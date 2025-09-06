import React from 'react';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { ClockIcon } from '@heroicons/react/24/solid';

const OrderHistoryTab = ({ orderHistory, handleViewOrderDetails }) => {
  return (
    <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-8 shadow-xl border border-gray-700/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.3)_0%,transparent_70%)] pointer-events-none" />
      <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6 relative z-10">История отправлений</h2>

      {orderHistory.length > 0 ? (
        <div className="grid gap-4">
          {orderHistory.map((order) => (
            <Tilt key={order.id} tiltMaxAngleX={10} tiltMaxAngleY={10} perspective={1000}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg border border-gray-600 p-4 transition-all duration-300 hover:shadow-[0_0_15px_#10b981] cursor-pointer"
                onClick={() => handleViewOrderDetails(order.id)}
              >
                <p className="text-gray-300"><strong>Дата:</strong> {new Date(order.dateCreated).toLocaleDateString()}</p>
                <p className="text-gray-300"><strong>Номер:</strong> {order.orderNumber}</p>
                <p className="text-gray-300"><strong>Статус:</strong> <span className="text-emerald-300">{order.status}</span></p>
                <p className="text-gray-300"><strong>Стоимость:</strong> ¥{order.totalClientPrice.toFixed(2)}</p>
              </motion.div>
            </Tilt>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 text-lg relative z-10">История отправлений пуста.</p>
      )}
    </div>
  );
};

export default OrderHistoryTab;