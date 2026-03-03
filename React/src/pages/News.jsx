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
                accentColor = 'emerald';
                break;
              case 'announcement':
                icon = <InformationCircleIcon className="w-6 h-6" />;
                accentColor = 'gold';
                break;
              case 'promotion':
                icon = <GiftIcon className="w-6 h-6" />;
                accentColor = 'purple';
                break;
              default:
                icon = <MegaphoneIcon className="w-6 h-6" />;
                accentColor = 'muted';
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
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center text-[var(--ev-gold)] bg-[var(--ev-glass)] p-8 rounded-2xl border border-[var(--ev-gold)]/20"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--ev-gold)]/30 border-t-[var(--ev-gold)] mx-auto mb-4" />
          <p className="text-[var(--ev-text-muted)]">Загрузка новостей...</p>
        </motion.div>
      </div>
    );
  }

  const getAccentClasses = (accentColor) => {
    switch (accentColor) {
      case 'emerald': return { bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', text: 'text-emerald-400' };
      case 'gold': return { bg: 'bg-[var(--ev-gold)]/15', border: 'border-[var(--ev-gold)]/30', text: 'text-[var(--ev-gold)]' };
      case 'purple': return { bg: 'bg-purple-500/15', border: 'border-purple-500/30', text: 'text-purple-300' };
      default: return { bg: 'bg-[var(--ev-text-muted)]/15', border: 'border-[var(--ev-text-muted)]/30', text: 'text-[var(--ev-text-muted)]' };
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { text: 'Активен', classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
      info: { text: 'Информация', classes: 'bg-[var(--ev-gold)]/20 text-[var(--ev-gold)] border-[var(--ev-gold)]/40' },
      promo: { text: 'Акция', classes: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
      completed: { text: 'Завершен', classes: 'bg-[var(--ev-text-muted)]/20 text-[var(--ev-text-muted)] border-[var(--ev-text-muted)]/40' }
    };
    return badges[status] || badges.info;
  };

  return (
    <div className="min-h-screen bg-transparent text-[var(--ev-text)] py-6 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--ev-text)] flex items-center gap-3">
            <MegaphoneIcon className="w-8 h-8 text-[var(--ev-gold)]" />
            Новости и анонсы
          </h1>
          <p className="text-[var(--ev-text-muted)] text-sm sm:text-base mt-1">
            Следите за актуальными новостями о совместных выкупах и важных обновлениях
          </p>
        </motion.div>

        {/* Ошибка */}
        {error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-300 text-center">{error}</p>
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
          <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 hover:bg-[var(--ev-gold)]/5 transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/25 flex items-center justify-center">
                  <MegaphoneIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--ev-gold)]" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl sm:text-2xl font-semibold mb-1.5 sm:mb-2 text-[var(--ev-text)]">
                  Следующий совместный выкуп
                </h2>
                <p className="text-[var(--ev-text-muted)] text-sm sm:text-lg">
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="p-8 sm:p-12 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 text-center">
                <MegaphoneIcon className="w-12 h-12 sm:w-16 sm:h-16 text-[var(--ev-text-muted)]/60 mx-auto mb-3 sm:mb-4" />
                <p className="text-lg sm:text-xl text-[var(--ev-text)] mb-1.5 sm:mb-2">Новостей пока нет</p>
                <p className="text-[var(--ev-text-muted)] text-xs sm:text-base">Следите за обновлениями!</p>
              </div>
            </motion.div>
          ) : (
            newsItems.map((item, index) => {
              const badge = getStatusBadge(item.status);
              const accent = getAccentClasses(item.accentColor);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div 
                    className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-l-4 transition-all duration-300 cursor-pointer group
                      bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 border-l-[var(--ev-gold)]
                      hover:border-[var(--ev-gold)]/30 hover:bg-[var(--ev-gold)]/5`}
                  >
                    <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${accent.bg} border ${accent.border}`}>
                          <div className={accent.text}>{item.icon}</div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-base sm:text-xl font-semibold text-[var(--ev-text)] group-hover:text-[var(--ev-gold)] transition-colors">
                              {item.title}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.classes}`}>
                              {badge.text}
                            </span>
                          </div>
                        </div>
                        <p className="text-[var(--ev-text-muted)] mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[var(--ev-text-muted)]">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-[var(--ev-gold)]/70" />
                            <span>{item.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-[var(--ev-gold)]/70" />
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
          <div className="p-4 sm:p-6 rounded-2xl bg-[var(--ev-glass)] border border-[var(--ev-gold)]/15 hover:border-[var(--ev-gold)]/25 transition-all duration-300">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-[var(--ev-gold)]/10 border border-[var(--ev-gold)]/20 flex-shrink-0">
                <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--ev-gold)]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[var(--ev-text)] mb-1.5 sm:mb-2">
                  Как это работает?
                </h3>
                <ul className="text-[var(--ev-text-muted)] space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
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
