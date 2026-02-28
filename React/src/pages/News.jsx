import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  ClockIcon, 
  MegaphoneIcon,
  TruckIcon,
  GiftIcon,
  InformationCircleIcon
} from '@heroicons/react/24/solid';
import { PageHeader } from '../components/ui/PageHeader';
import { Loading } from '../components/ui/Loading';
import api from '../api/axiosInstance';

/**
 * Страница новостей и анонсов о совместных выкупах
 */
const News = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await api.get('/news');
        if (response.data) {
          // Преобразуем данные из API в формат для отображения
          const formattedNews = response.data.map(item => {
            let icon, accentColor;
            
            switch(item.type) {
              case 'batch':
                icon = <TruckIcon className="w-6 h-6" />;
                accentColor = '#10b981';
                break;
              case 'announcement':
                icon = <InformationCircleIcon className="w-6 h-6" />;
                accentColor = '#00f0ff';
                break;
              case 'promotion':
                icon = <GiftIcon className="w-6 h-6" />;
                accentColor = '#a78bfa';
                break;
              default:
                icon = <MegaphoneIcon className="w-6 h-6" />;
                accentColor = '#9ca3af';
            }
            
            const createdAt = new Date(item.createdAt);
            const dateStr = createdAt.toLocaleDateString('ru-RU', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            });
            const timeStr = createdAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            
            return {
              id: item.id,
              type: item.type,
              title: item.title,
              description: item.description,
              date: dateStr,
              time: timeStr,
              status: item.status,
              icon,
              accentColor,
              imageUrl: item.imageUrl
            };
          });
          setNewsItems(formattedNews);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Не удалось загрузить новости');
        setNewsItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <Loading message="Загрузка новостей..." />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      active: { text: 'Активен', accentColor: '#10b981' },
      info: { text: 'Информация', accentColor: '#00f0ff' },
      promo: { text: 'Акция', accentColor: '#a78bfa' },
      completed: { text: 'Завершен', accentColor: '#9ca3af' }
    };
    return badges[status] || badges.info;
  };

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-6xl mx-auto relative z-10">
        <PageHeader
          title="Новости и анонсы"
          subtitle="Следите за актуальными новостями о совместных выкупах и важных обновлениях"
        />

        {/* Ошибка */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="p-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)]">
              <p className="text-[#ef4444] text-center">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Баннер с призывом к действию */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-12"
        >
          <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] flex items-center justify-center">
                  <MegaphoneIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#10b981]" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl sm:text-2xl font-bold mb-1.5 sm:mb-2 text-[#10b981]">
                  Следующий совместный выкуп
                </h2>
                <p className="text-[#9ca3af] text-sm sm:text-lg">
                  Присоединяйтесь к совместным выкупам и экономьте на доставке! 
                  Следите за обновлениями на этой странице.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Лента новостей */}
        <div className="space-y-6">
          {newsItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="p-8 sm:p-12 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-center">
                <MegaphoneIcon className="w-12 h-12 sm:w-16 sm:h-16 text-[#9ca3af] mx-auto mb-3 sm:mb-4" />
                <p className="text-lg sm:text-xl text-[#e5e7eb] mb-1.5 sm:mb-2">Новостей пока нет</p>
                <p className="text-[#9ca3af] text-xs sm:text-base">Следите за обновлениями!</p>
              </div>
            </motion.div>
          ) : (
            newsItems.map((item, index) => {
              const badge = getStatusBadge(item.status);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div 
                    className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border-l-4 transition-all duration-300 cursor-pointer group
                      bg-[rgba(18,18,22,0.85)] border border-[rgba(255,255,255,0.12)]
                      backdrop-blur-md
                      hover:border-[rgba(255,255,255,0.22)] hover:bg-[rgba(24,24,28,0.9)] hover:shadow-lg hover:shadow-black/30"
                    style={{ borderLeftColor: item.accentColor }}
                  >
                    <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                      {/* Иконка */}
                      <div className="flex-shrink-0">
                        <div 
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                          style={{
                            background: `${item.accentColor}15`,
                            border: `1px solid ${item.accentColor}30`,
                          }}
                        >
                          <div style={{ color: item.accentColor }}>
                          {item.icon}
                          </div>
                        </div>
                      </div>

                      {/* Контент */}
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-base sm:text-xl font-bold text-white group-hover:text-[#00f0ff] transition-colors">
                              {item.title}
                            </h3>
                            <span 
                              className="px-3 py-1 rounded-full text-xs font-semibold border"
                              style={{
                                background: `${badge.accentColor}15`,
                                borderColor: `${badge.accentColor}30`,
                                color: badge.accentColor,
                              }}
                            >
                              {badge.text}
                            </span>
                          </div>
                        </div>

                        <p className="text-[#b8c0cc] mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                          {item.description}
                        </p>

                        {/* Метаданные */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[#94a3b8]">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{item.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4" />
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Информационный блок */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12"
        >
          <div className="p-4 sm:p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] flex-shrink-0">
                <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[#00f0ff]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[#e5e7eb] mb-1.5 sm:mb-2">
                  Как это работает?
                </h3>
                <ul className="text-[#9ca3af] space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <li>• Совместные выкупы позволяют объединить несколько заказов в одну партию</li>
                  <li>• Это значительно снижает стоимость доставки для каждого участника</li>
                  <li>• Следите за новостями на этой странице, чтобы не пропустить следующий выкуп</li>
                  <li>• Все обновления о статусе вашего заказа приходят в уведомления</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default News;
