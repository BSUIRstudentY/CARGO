import React from 'react';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { CheckIcon, ClockIcon } from '@heroicons/react/24/solid';

const ShipmentsTab = ({ currentOrders, handleViewOrderDetails, handlePay }) => {
  const pendingOrders = currentOrders.filter((order) => order.status === 'PENDING');
  const verifiedOrders = currentOrders.filter((order) => order.status === 'VERIFIED');

  return (
    <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-8 shadow-xl border border-gray-700/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.3)_0%,transparent_70%)] pointer-events-none" />
      <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6 relative z-10">Мои отправления</h2>
      {pendingOrders.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <ClockIcon className="w-6 h-6 text-yellow-300" />
            Ожидающие подтверждения
          </h3>
          <div className="grid gap-4">
            {pendingOrders.map((order) => (
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
                  <p className="text-gray-300"><strong>Статус:</strong> <span className="text-yellow-300">Ожидает подтверждения</span></p>
                  {order.totalClientPrice > 0 && (
                    <p className="text-gray-300"><strong>Стоимость:</strong> ¥{order.totalClientPrice.toFixed(2)}</p>
                  )}
                </motion.div>
              </Tilt>
            ))}
          </div>
        </div>
      )}
      {verifiedOrders.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <CheckIcon className="w-6 h-6 text-emerald-300" />
            Подтверждённые отправления
          </h3>
          <div className="grid gap-4">
            {verifiedOrders.map((order) => (
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
                  <p className="text-gray-300"><strong>Статус:</strong> <span className="text-emerald-300">Подтверждён</span></p>
                  {order.totalClientPrice > 0 && (
                    <p className="text-gray-300"><strong>Стоимость:</strong> ¥{order.totalClientPrice.toFixed(2)}</p>
                  )}
                  {order.totalClientPrice > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePay(order.id);
                      }}
                      className="mt-2 px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition duration-300 transform hover:scale-105"
                      disabled={order.status === 'PAID'}
                    >
                      {order.status === 'PAID' ? 'Оплачено' : 'Оплатить'}
                    </button>
                  )}
                </motion.div>
              </Tilt>
            ))}
          </div>
        </div>
      )}
      {pendingOrders.length === 0 && verifiedOrders.length === 0 && (
        <p className="text-center text-gray-400 text-lg relative z-10">У вас пока нет текущих отправлений.</p>
      )}
    </div>
  );
};

export default ShipmentsTab;