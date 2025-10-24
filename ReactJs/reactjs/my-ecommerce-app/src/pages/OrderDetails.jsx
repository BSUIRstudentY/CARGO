import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';
import { ArrowLeftIcon, CreditCardIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import confetti from 'canvas-confetti';

const CNY_TO_BYN_RATE = 0.45;

// Append global styles for consistency with ProductDetail.jsx and DeliveryPayment.jsx
const styles = `
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in-down {
    animation: fadeInDown 0.6s ease-out;
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slide-up {
    animation: slideUp 0.5s ease-out;
  }
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading: loading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    },
    retry: 3,
    retryDelay: (attempt) => attempt * 1000,
    onError: (err) => {
      console.error('Error fetching order details:', err);
    },
  });

  const handlePayClick = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF2549', '#F87171', '#FECACA'],
    });
    navigate('/payment');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-accent-primary text-2xl bg-tertiary p-6 rounded-lg border border-primary/50 shadow-card hover:shadow-accent-primary/40 font-sans"
          style={{
            '@media (max-width: 640px)': {
              fontSize: '18px',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }
          }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-accent-primary mx-auto mb-4" style={{
            '@media (max-width: 640px)': {
              width: '40px',
              height: '40px',
              borderTopWidth: '3px',
              marginBottom: '16px',
            }
          }} />
          Загрузка деталей заказа...
        </motion.div>
      </div>
    );
  }

  if (error) {
    const errorMsg =
      error.response?.status === 403
        ? 'Доступ запрещён. Обратитесь к администратору.'
        : 'Ошибка загрузки деталей заказа: ' + (error.response?.data?.errorMessage || error.message);
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-red-400 text-2xl bg-red-500/20 p-6 rounded-lg border border-red-500/50 shadow-card font-sans"
          style={{
            '@media (max-width: 640px)': {
              fontSize: '18px',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }
          }}
        >
          {errorMsg}
        </motion.div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-accent-primary text-2xl bg-tertiary p-6 rounded-lg border border-primary/50 shadow-card hover:shadow-accent-primary/40 font-sans"
          style={{
            '@media (max-width: 640px)': {
              fontSize: '18px',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }
          }}
        >
          Заказ не найден
        </motion.div>
      </div>
    );
  }

  const isSelfPickup = order.totalClientPrice === 0;
  const totalItemsPrice = order.items?.reduce((sum, item) => {
    return sum + ((item.priceAtTime || 0) * (item.quantity || 1));
  }, 0) || 0;
  const totalChinaDeliveryPrice = order.items?.reduce((sum, item) => {
    return sum + (item.chinaDeliveryPrice || 0);
  }, 0) || 0;

  return (
    <div className="min-h-screen bg-primary text-secondary py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,37,73,0.3)_0%,transparent_70%)] pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.header
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
          style={{
            '@media (max-width: 640px)': {
              marginBottom: '24px',
              textAlign: 'center',
            }
          }}
        >
          <h2 className="text-4xl font-bold font-display text-accent-primary tracking-tight break-words animate-fade-in-down" style={{
            '@media (max-width: 640px)': {
              fontSize: '24px',
              fontWeight: '700',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }
          }}>
            Детали заказа #{order.orderNumber}
          </h2>
          <p className="text-lg text-secondary font-sans mt-2 break-words" style={{
            '@media (max-width: 640px)': {
              fontSize: '14px',
              marginTop: '8px',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }
          }}>
            Просмотрите информацию о вашем заказе
          </p>
        </motion.header>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
              className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center text-base font-medium font-sans shadow-card break-words"
              style={{
                '@media (max-width: 640px)': {
                  marginBottom: '16px',
                  padding: '12px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                }
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
          style={{
            '@media (max-width: 640px)': {
              gap: '16px',
              marginBottom: '24px',
            }
          }}
        >
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              className="bg-tertiary rounded-2xl p-6 shadow-card border border-primary/50 transition-shadow duration-300 hover:shadow-accent-primary/40 relative overflow-hidden"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                '@media (max-width: 640px)': {
                  padding: '16px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                  backgroundRepeat: 'repeat',
                }}
              />
              <h3 className="text-2xl font-bold font-display text-accent-primary mb-4 break-words" style={{
                '@media (max-width: 640px)': {
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                }
              }}>Информация о заказе</h3>
              <p className="text-secondary mb-3 font-sans"><strong>Дата создания:</strong> {new Date(order.dateCreated).toLocaleString('ru-RU')}</p>
              <p className="text-secondary mb-3 font-sans">
                <strong>Статус:</strong>{' '}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-sans ${
                    order.status === 'PENDING'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-green-500/20 text-green-300'
                  }`}
                >
                  {order.status}
                </span>
                {order.status === 'PENDING' && (
                  <p className="text-yellow-300 text-sm mt-2 font-sans">Заказ ждёт одобрения администратора.</p>
                )}
              </p>
              <p className="text-secondary font-sans"><strong>Адрес доставки:</strong> {order.deliveryAddress || 'Не указан'}</p>
              {order.trackingNumber && (
                <p className="text-secondary font-sans"><strong>Трек-номер:</strong> {order.trackingNumber}</p>
              )}
            </motion.div>
          </Tilt>
          <Tilt tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
            <motion.div
              className="bg-tertiary rounded-2xl p-6 shadow-card border border-primary/50 transition-shadow duration-300 hover:shadow-accent-primary/40 relative overflow-hidden"
              whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                '@media (max-width: 640px)': {
                  padding: '16px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
                  backgroundRepeat: 'repeat',
                }}
              />
              <h3 className="text-2xl font-bold font-display text-accent-primary mb-4 break-words" style={{
                '@media (max-width: 640px)': {
                  fontSize: '20px',
                  fontWeight: '700',
                  marginBottom: '16px',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                }
              }}>Финансовые детали</h3>
              {isSelfPickup ? (
                <p className="text-yellow-300 bg-yellow-500/20 p-3 rounded-lg mb-3 font-sans">
                  <strong>Примечание:</strong> Для самовыкупа оплата требуется только за доставку.
                </p>
              ) : (
                <>
                  <p className="text-secondary mb-3 font-sans"><strong>Сумма товаров:</strong> ¥{totalItemsPrice.toFixed(2)}</p>
                  {totalChinaDeliveryPrice > 0 && (
                    <p className="text-secondary mb-3 font-sans"><strong>Доставка по Китаю:</strong> ¥{totalChinaDeliveryPrice.toFixed(2)}</p>
                  )}
                  {order.insuranceCost > 0 && (
                    <p className="text-secondary mb-3 font-sans"><strong>Стоимость страховки:</strong> ¥{order.insuranceCost.toFixed(2)}</p>
                  )}
                  {order.supplierCost > 0 && (
                    <p className="text-secondary mb-3 font-sans"><strong>Стоимость поставщика:</strong> ¥{order.supplierCost.toFixed(2)}</p>
                  )}
                  {order.userDiscountApplied > 0 && (
                    <p className="text-green-400 mb-3 font-sans"><strong>Скидка пользователя:</strong> -¥{order.userDiscountApplied.toFixed(2)}</p>
                  )}
                  {order.discountValue > 0 && (
                    <p className="text-green-400 mb-3 font-sans">
                      <strong>Скидка по промокоду({order.discountType === "PERCENTAGE" && order.discountValue}%):</strong> -¥
                      {order.discountType === "PERCENTAGE" ? (totalItemsPrice * order.discountValue / 100).toFixed(2) : order.discountValue}
                    </p>
                  )}
                  <div className="mt-6 pt-4 border-t border-primary/50">
                    <p className="text-secondary font-semibold mb-2 font-sans"><strong>Итоговая сумма:</strong></p>
                    <div className="w-full bg-primary/50 rounded-full h-3">
                      <motion.div
                        className="bg-accent-primary h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                      />
                    </div>
                    <p className="text-3xl font-bold font-display text-accent-primary mt-2" style={{
                      '@media (max-width: 640px)': {
                        fontSize: '24px',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal',
                      }
                    }}>¥{(order.totalClientPrice + totalChinaDeliveryPrice).toFixed(2)}</p>
                  </div>
                </>
              )}
            </motion.div>
          </Tilt>
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-tertiary rounded-2xl p-6 shadow-card border border-primary/50 mb-12 relative overflow-hidden"
          style={{
            '@media (max-width: 640px)': {
              padding: '16px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }
          }}
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="none"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.3"/%3E%3C/svg%3E')`,
              backgroundRepeat: 'repeat',
            }}
          />
          <h3 className="text-2xl font-bold font-display text-accent-primary mb-6 break-words" style={{
            '@media (max-width: 640px)': {
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '16px',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }
          }}>
            {isSelfPickup ? 'Трек-номера' : 'Товары в заказе'}
          </h3>
          {isSelfPickup ? (
            order.items && order.items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {order.items.map((item, index) => (
                  <Tilt key={index} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
                    <motion.div
                      className="bg-tertiary rounded-lg border border-primary/50 shadow-card hover:shadow-accent-primary/40 p-4 transition-all duration-300 text-secondary font-sans"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        '@media (max-width: 640px)': {
                          padding: '12px',
                          borderRadius: '8px',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        }
                      }}
                    >
                      <p className="font-medium text-lg">{item.trackingNumber || 'Трек-номер не указан'}</p>
                    </motion.div>
                  </Tilt>
                ))}
              </div>
            ) : (
              <p className="text-center text-secondary text-base font-sans">Нет трек-номеров в заказе.</p>
            )
          ) : (
            order.items && order.items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {order.items.map((item, index) => (
                  <Tilt key={index} tiltMaxAngleX={8} tiltMaxAngleY={8} perspective={1200}>
                    <motion.div
                      className="bg-tertiary rounded-lg border border-primary/50 shadow-card hover:shadow-accent-primary/40 p-4 transition-all duration-300 cursor-pointer text-secondary font-sans"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{ y: -10, scale: 1.03, boxShadow: '0 10px 20px rgba(255, 37, 73, 0.3)' }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(`/product/${item.productId}`)}
                      style={{
                        '@media (max-width: 640px)': {
                          padding: '12px',
                          borderRadius: '8px',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        }
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 overflow-hidden rounded-md">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName || 'Товар'}
                              className="w-full h-full object-cover transform hover:scale-105 transition duration-300 border border-primary/50"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/80x80?text=Нет+фото';
                              }}
                              style={{
                                '@media (max-width: 640px)': {
                                  borderRadius: '6px',
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-tertiary flex items-center justify-center text-xs text-secondary border border-primary/50 font-sans">
                              Нет фото
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-lg">{item.productName || 'Без названия'}</p>
                          <p className="text-secondary mt-1 font-sans">x{item.quantity} • ¥{item.priceAtTime.toFixed(2)}</p>
                          {item.chinaDeliveryPrice > 0 && (
                            <p className="text-secondary mt-1 font-sans">Доставка по Китаю: ¥{item.chinaDeliveryPrice.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-primary/50 rounded-full h-2 mt-3">
                        <motion.div
                          className="bg-accent-primary h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.quantity / Math.max(...order.items.map(i => i.quantity), 1)) * 100}%` }}
                          transition={{ duration: 1, ease: 'easeInOut' }}
                        />
                      </div>
                    </motion.div>
                  </Tilt>
                ))}
              </div>
            ) : (
              <p className="text-center text-secondary text-base font-sans">Нет товаров в заказе.</p>
            )
          )}
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-4"
          style={{
            '@media (max-width: 640px)': {
              gap: '16px',
            }
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-tertiary text-secondary rounded-lg hover:bg-tertiary/80 transition duration-300 text-base font-semibold font-sans flex items-center justify-center gap-2 shadow-card"
            style={{
              '@media (max-width: 640px)': {
                padding: '10px 16px',
                fontSize: '14px',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                overflowWrap: 'break-word',
                whiteSpace: 'normal',
              }
            }}
          >
            <ArrowLeftIcon className="w-5 h-5" style={{
              '@media (max-width: 640px)': {
                width: '16px',
                height: '16px',
              }
            }} />
            Вернуться назад
          </motion.button>
          {order.status === 'VERIFIED' && order.totalClientPrice > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePayClick}
              className="px-6 py-3 bg-accent-primary text-primary rounded-lg hover:bg-accent-primary/90 transition duration-300 text-base font-semibold font-sans flex items-center justify-center gap-2 shadow-card"
              style={{
                '@media (max-width: 640px)': {
                  padding: '10px 16px',
                  fontSize: '14px',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal',
                }
              }}
            >
              <CreditCardIcon className="w-5 h-5" style={{
                '@media (max-width: 640px)': {
                  width: '16px',
                  height: '16px',
                }
              }} />
              Оплатить
            </motion.button>
          )}
        </motion.section>
      </div>
    </div>
  );
}

export default OrderDetails;