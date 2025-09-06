import React from 'react';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { CreditCardIcon } from '@heroicons/react/24/solid';

const PaymentMethodsTab = () => {
  const [paymentMethods, setPaymentMethods] = useState([]); // Placeholder for future implementation

  return (
    <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-8 shadow-xl border border-gray-700/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.3)_0%,transparent_70%)] pointer-events-none" />
      <h2 className="text-3xl font-bold text-[var(--accent-color)] mb-6 relative z-10">Способы оплаты</h2>

      {paymentMethods.length > 0 ? (
        <div className="grid gap-4">
          {paymentMethods.map((method, index) => (
            <Tilt key={index} tiltMaxAngleX={10} tiltMaxAngleY={10} perspective={1000}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg border border-gray-600 p-4 transition-all duration-300 hover:shadow-[0_0_15px_#10b981]"
              >
                <p className="text-gray-300"><strong>Тип:</strong> {method.type}</p>
                <p className="text-gray-300"><strong>Номер:</strong> **** **** **** {method.lastFourDigits}</p>
                <p className="text-gray-300"><strong>Срок действия:</strong> {method.expiryDate}</p>
              </motion.div>
            </Tilt>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 text-lg relative z-10">Способы оплаты отсутствуют.</p>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => alert('Функция добавления способа оплаты пока не реализована')}
        className="mt-6 px-6 py-3 bg-[var(--accent-color)] text-white rounded-lg hover:bg-opacity-90 transition flex items-center gap-2 mx-auto"
      >
        <CreditCardIcon className="w-5 h-5" />
        Добавить способ оплаты
      </motion.button>
    </div>
  );
};

export default PaymentMethodsTab;