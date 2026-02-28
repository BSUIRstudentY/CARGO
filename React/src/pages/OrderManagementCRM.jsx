import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExcelJS from 'exceljs';
import api from '../api/axiosInstance';
import { PageHeader } from '../components/ui/PageHeader';
import { Alert } from '../components/ui/Alert';
import { Loading } from '../components/ui/Loading';
import { Button } from '../components/ui/Button';
import {
  ShoppingBagIcon,
  ClockIcon,
  TruckIcon,
  ChartBarIcon,
  PencilIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import {
  ShoppingBagIcon as ShoppingBagIconSolid,
  ClockIcon as ClockIconSolid,
  TruckIcon as TruckIconSolid,
  ChartBarIcon as ChartBarIconSolid
} from '@heroicons/react/24/solid';

function OrderManagementCRM() {
  const [activeTab, setActiveTab] = useState('orders'); // orders, history, batches, stats
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = [
    { id: 'orders', label: 'Активные заказы', icon: ShoppingBagIcon, iconSolid: ShoppingBagIconSolid },
    { id: 'history', label: 'История', icon: ClockIcon, iconSolid: ClockIconSolid },
    { id: 'batches', label: 'Сборные грузы', icon: TruckIcon, iconSolid: TruckIconSolid },
    { id: 'stats', label: 'Статистика', icon: ChartBarIcon, iconSolid: ChartBarIconSolid }
  ];

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageHeader 
          title="CRM - Управление заказами"
          subtitle="Комплексное управление заказами, сборными грузами и логистикой"
        />

        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError('')}
            className="mb-6"
          />
        )}

        {/* Табы */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b border-[rgba(255,255,255,0.1)]">
            {tabs.map((tab) => {
              const Icon = activeTab === tab.id ? tab.iconSolid : tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-all relative ${
                    activeTab === tab.id
                      ? 'text-[#00f0ff]'
                      : 'text-[#9ca3af] hover:text-[#e5e7eb]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981]"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Контент табов */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'orders' && <ActiveOrdersTab />}
            {activeTab === 'history' && <HistoryTab />}
            {activeTab === 'batches' && <BatchesTab />}
            {activeTab === 'stats' && <StatsTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Компонент таба активных заказов
function ActiveOrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders', {
        params: {
          status: statusFilter === 'ALL' ? null : statusFilter,
          page: currentPage,
          size: 20,
          sort: 'dateCreated,desc'
        }
      });
      if (response?.data) {
        setOrders(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleEditOrder = (order) => {
    setSelectedOrder({ ...order });
    setShowEditModal(true);
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(query) ||
      order.userEmail?.toLowerCase().includes(query) ||
      order.trackingNumber?.toLowerCase().includes(query) ||
      order.id?.toString().includes(query)
    );
  });

  if (loading) {
    return <Loading message="Загрузка заказов..." />;
  }

  return (
    <div className="space-y-6">
      {/* Фильтры и поиск */}
      <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Поиск по номеру, email, трек-номеру..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-[#9ca3af]" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="select-dark flex-1 px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            >
              <option value="ALL">Все статусы</option>
              <option value="PENDING">Ожидает</option>
              <option value="PAID">Оплачен</option>
              <option value="VERIFIED">Подтверждён</option>
              <option value="PROCESSED">Обработан</option>
              <option value="SHIPPED">Отправлен</option>
            </select>
          </div>
          <div className="text-right text-[#9ca3af] text-sm flex items-center justify-end">
            Всего: <span className="text-[#e5e7eb] font-medium ml-2">{filteredOrders.length}</span>
          </div>
        </div>
      </div>

      {/* Список заказов */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onEdit={() => handleEditOrder(order)}
          />
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#9ca3af] text-lg">Заказы не найдены</p>
        </div>
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            variant="outline"
          >
            Назад
          </Button>
          <span className="px-4 py-2 text-[#9ca3af]">
            {currentPage + 1} / {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1}
            variant="outline"
          >
            Вперёд
          </Button>
        </div>
      )}

      {/* Модальное окно редактирования */}
      {showEditModal && selectedOrder && (
        <EditOrderModal
          order={selectedOrder}
          onClose={() => {
            setShowEditModal(false);
            setSelectedOrder(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setSelectedOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}

// Карточка заказа
// Функция загрузки изображения (пробует несколько методов)
async function loadImageAsBuffer(imageUrl) {
  try {
    if (!imageUrl || (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:'))) {
      return null;
    }

    // Метод 1: Прямой fetch (самый быстрый и надежный для тех же доменов)
    try {
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache'
      });
      if (response.ok) {
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        if (arrayBuffer && arrayBuffer.byteLength > 0) {
          console.log('Изображение загружено через fetch:', imageUrl);
          return arrayBuffer;
        }
      }
    } catch (fetchError) {
      console.warn('Fetch не удался, пробуем canvas:', imageUrl);
    }

    // Метод 2: Canvas (для обхода CORS, но может не работать на некоторых доменах)
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      let resolved = false;
      
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.warn('Таймаут загрузки изображения:', imageUrl);
          resolve(null);
        }
      }, 8000); // 8 секунд таймаут
      
      img.onload = () => {
        if (resolved) return;
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 400;
          canvas.height = img.height || 400;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (resolved) return;
            if (blob && blob.size > 0) {
              blob.arrayBuffer().then(buffer => {
                if (!resolved && buffer && buffer.byteLength > 0) {
                  resolved = true;
                  clearTimeout(timeout);
                  console.log('Изображение загружено через canvas:', imageUrl);
                  resolve(buffer);
                } else if (!resolved) {
                  resolved = true;
                  clearTimeout(timeout);
                  resolve(null);
                }
              }).catch(() => {
                if (!resolved) {
                  resolved = true;
                  clearTimeout(timeout);
                  resolve(null);
                }
              });
            } else if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              resolve(null);
            }
          }, 'image/png', 0.95);
        } catch (error) {
          console.warn('Ошибка canvas:', imageUrl, error);
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            resolve(null);
          }
        }
      };
      
      img.onerror = () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          console.warn('Ошибка загрузки изображения:', imageUrl);
          resolve(null);
        }
      };
      
      img.src = imageUrl;
    });
  } catch (error) {
    console.warn('Критическая ошибка загрузки изображения:', imageUrl, error);
    return null;
  }
}

// Функция экспорта заказа в Excel
async function exportOrderToExcel(orderId) {
  try {
    // Показываем уведомление о начале экспорта
    const startTime = Date.now();
    console.log('Начало экспорта заказа:', orderId);
    
    // Загружаем полную информацию о заказе
    const response = await api.get(`/orders/${orderId}`);
    const order = response.data;

    // Создаем новую книгу Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Заказ');

    // Стили
    const headerStyle = {
      font: { bold: true, size: 12, color: { argb: 'FFFFFFFF' } },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF00F0FF' } // Cyan
      },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    };

    const infoHeaderStyle = {
      font: { bold: true, size: 11, color: { argb: 'FFFFFFFF' } },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF6366F1' } // Purple
      },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    };

    const dataStyle = {
      alignment: { vertical: 'middle', horizontal: 'left', wrapText: true },
      border: {
        top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
        right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
      }
    };

    const totalStyle = {
      font: { bold: true, size: 11 },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFACD' } // Light yellow
      },
      alignment: { vertical: 'middle', horizontal: 'right', wrapText: true },
      border: {
        top: { style: 'medium', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'medium', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    };

    let currentRow = 1;

    // === Основная информация о заказе ===
    const infoHeaders = ['Email', 'Телефон', 'Адрес доставки'];
    const infoRow = worksheet.addRow(infoHeaders);
    infoRow.eachCell((cell, colNumber) => {
      cell.style = infoHeaderStyle;
    });
    worksheet.getRow(currentRow).height = 25;

    currentRow++;
    const infoData = [
      order.userEmail || '',
      order.phone || '',
      order.deliveryAddress || ''
    ];
    const infoDataRow = worksheet.addRow(infoData);
    infoDataRow.eachCell((cell, colNumber) => {
      cell.style = dataStyle;
    });
    worksheet.getRow(currentRow).height = 30;

    // Настройка ширины колонок для основной информации
    worksheet.getColumn(1).width = 35; // Email
    worksheet.getColumn(2).width = 20; // Телефон
    worksheet.getColumn(3).width = 50; // Адрес

    currentRow += 2; // Пустая строка

    // === Заголовки товаров ===
    const itemHeaders = [
      '№',
      'ID товара',
      'Название товара',
      'Описание',
      'Количество',
      'Цена на момент заказа',
      'Общая стоимость товара',
      'Цена поставщика',
      'Статус покупки',
      'Причина отказа',
      'Трек-номер',
      'Стоимость доставки из Китая',
      'URL товара',
      'Изображение товара'
    ];
    const headerRow = worksheet.addRow(itemHeaders);
    headerRow.eachCell((cell) => {
      cell.style = headerStyle;
    });
    worksheet.getRow(currentRow).height = 30;

    // Настройка ширины колонок для товаров
    worksheet.getColumn(1).width = 6;  // №
    worksheet.getColumn(2).width = 15; // ID товара
    worksheet.getColumn(3).width = 35; // Название товара
    worksheet.getColumn(4).width = 40; // Описание
    worksheet.getColumn(5).width = 12; // Количество
    worksheet.getColumn(6).width = 20; // Цена на момент заказа
    worksheet.getColumn(7).width = 22; // Общая стоимость товара
    worksheet.getColumn(8).width = 15; // Цена поставщика
    worksheet.getColumn(9).width = 18; // Статус покупки
    worksheet.getColumn(10).width = 25; // Причина отказа
    worksheet.getColumn(11).width = 20; // Трек-номер
    worksheet.getColumn(12).width = 28; // Стоимость доставки из Китая
    worksheet.getColumn(13).width = 35; // URL товара
    worksheet.getColumn(14).width = 20; // Изображение товара

    currentRow++;

    // === Данные товаров ===
    if (order.items && order.items.length > 0) {
      console.log(`Начинаем загрузку ${order.items.length} изображений...`);
      
      // Сначала загружаем все изображения параллельно
      const imagePromises = order.items.map((item, index) => {
        if (item.imageUrl) {
          return loadImageAsBuffer(item.imageUrl)
            .then(buffer => {
              console.log(`Изображение ${index + 1} загружено:`, buffer ? 'Успешно' : 'Не удалось', item.imageUrl);
              return {
                index,
                buffer,
                imageUrl: item.imageUrl
              };
            })
            .catch(error => {
              console.warn(`Ошибка загрузки изображения ${index + 1}:`, item.imageUrl, error);
              return { index, buffer: null, imageUrl: item.imageUrl };
            });
        }
        return Promise.resolve({ index, buffer: null, imageUrl: null });
      });

      // Ждем загрузки всех изображений с таймаутом
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 30000)); // 30 секунд максимум
      const imageResults = await Promise.race([
        Promise.all(imagePromises),
        timeoutPromise.then(() => {
          console.warn('Таймаут загрузки изображений');
          return order.items.map((item, index) => ({ index, buffer: null, imageUrl: item.imageUrl }));
        })
      ]);
      
      const imageMap = new Map();
      const loadedCount = imageResults.filter(r => r.buffer).length;
      console.log(`Загружено изображений: ${loadedCount} из ${order.items.length}`);
      
      imageResults.forEach(result => {
        // Проверяем, что buffer действительно есть и не пустой
        if (result.buffer && result.buffer.byteLength > 0) {
          imageMap.set(result.index, { buffer: result.buffer, imageUrl: result.imageUrl });
          console.log(`Изображение ${result.index + 1} готово к вставке (${result.buffer.byteLength} байт)`);
        } else {
          console.warn(`Изображение ${result.index + 1} не загружено или пустое`);
        }
      });

      // Теперь добавляем строки с данными
      for (let index = 0; index < order.items.length; index++) {
        const item = order.items[index];
        const totalItemPrice = ((item.priceAtTime || 0) * (item.quantity || 0)).toFixed(2);
        
        const rowData = [
          index + 1,
          item.productId || '',
          item.productName || 'Удалённый товар',
          item.description || '',
          item.quantity || 0,
          item.priceAtTime || 0,
          totalItemPrice,
          item.supplierPrice || 0,
          item.purchaseStatus || '',
          item.purchaseRefusalReason || '',
          item.trackingNumber || '',
          item.chinaDeliveryPrice || 0,
          item.url || '',
          '' // Изображение будет добавлено отдельно
        ];
        
        const row = worksheet.addRow(rowData);
        row.height = 100; // Высота строки для изображений
        
        // Применяем стили к ячейкам
        row.eachCell((cell, colNumber) => {
          cell.style = dataStyle;
          if (colNumber === 6 || colNumber === 7 || colNumber === 8 || colNumber === 12) {
            // Числовые колонки
            cell.numFmt = '#,##0.00';
            cell.alignment = { ...dataStyle.alignment, horizontal: 'right' };
          }
        });

        // Добавляем изображение, если оно было успешно загружено
        const imageData = imageMap.get(index);
        if (imageData && imageData.buffer && imageData.buffer.byteLength > 0) {
          try {
            // Определяем расширение файла по MIME типу или URL
            let extension = 'png';
            const imageUrl = (imageData.imageUrl || '').toLowerCase();
            
            // Пробуем определить по URL
            if (imageUrl.includes('.jpg') || imageUrl.includes('.jpeg')) {
              extension = 'jpeg';
            } else if (imageUrl.includes('.gif')) {
              extension = 'gif';
            } else if (imageUrl.includes('.webp')) {
              extension = 'webp';
            } else if (imageUrl.includes('.bmp')) {
              extension = 'bmp';
            }
            
            console.log(`Добавляем изображение ${index + 1} в Excel (${extension}, размер: ${imageData.buffer.byteLength} байт)`);
            
            const imageId = workbook.addImage({
              buffer: imageData.buffer,
              extension: extension
            });
            
            // Вставляем изображение в последнюю колонку (14, индекс 13)
            // Используем абсолютное позиционирование
            worksheet.addImage(imageId, {
              tl: { col: 13, row: currentRow - 1 }, // Индекс колонки и строки (0-based)
              ext: { width: 120, height: 120 },
              editAs: 'oneCell' // Изображение привязано к одной ячейке
            });
            
            // Очищаем текст в ячейке, чтобы там не было URL
            row.getCell(14).value = '';
            console.log(`Изображение ${index + 1} успешно добавлено в Excel`);
          } catch (error) {
            console.error('Ошибка при добавлении изображения в Excel:', item.productName, error);
            // Если не удалось добавить изображение, оставляем ячейку пустой (не показываем URL)
            row.getCell(14).value = '';
          }
        } else {
          // Если изображение не загрузилось, оставляем ячейку пустой
          row.getCell(14).value = '';
          if (item.imageUrl) {
            console.warn(`Изображение ${index + 1} не загружено:`, item.imageUrl);
          }
        }

        currentRow++;
      }

      // Итоговая строка
      currentRow++;
      const totalSum = order.items.reduce((sum, item) => {
        return sum + ((item.priceAtTime || 0) * (item.quantity || 0));
      }, 0);
      
      const totalRow = worksheet.addRow([
        'ИТОГО:',
        '',
        '',
        '',
        '',
        '',
        totalSum.toFixed(2),
        '',
        '',
        '',
        '',
        '',
        '',
        ''
      ]);
      
      totalRow.eachCell((cell, colNumber) => {
        if (colNumber === 1 || colNumber === 7) {
          cell.style = totalStyle;
          if (colNumber === 7) {
            cell.numFmt = '#,##0.00';
          }
        }
      });
      worksheet.getRow(currentRow).height = 25;
    }

    // Генерируем имя файла
    const fileName = `Заказ_${order.orderNumber || order.id}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Сохраняем файл
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка при экспорте заказа:', error);
  }
}

function OrderCard({ order, onEdit }) {
  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'text-[#a78bfa] bg-[#a78bfa]/20 border-[#a78bfa]/50',
      'PAID': 'text-[#00f0ff] bg-[#00f0ff]/20 border-[#00f0ff]/50',
      'VERIFIED': 'text-[#00f0ff] bg-[#00f0ff]/20 border-[#00f0ff]/50',
      'PROCESSED': 'text-[#a78bfa] bg-[#a78bfa]/20 border-[#a78bfa]/50',
      'SHIPPED': 'text-[#10b981] bg-[#10b981]/20 border-[#10b981]/50',
      'COMPLETED': 'text-[#10b981] bg-[#10b981]/20 border-[#10b981]/50',
      'REFUSED': 'text-[#ef4444] bg-[#ef4444]/20 border-[#ef4444]/50'
    };
    return colors[status] || 'text-[#9ca3af] bg-[#9ca3af]/20 border-[#9ca3af]/50';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': 'Ожидает',
      'PAID': 'Оплачен',
      'VERIFIED': 'Подтверждён',
      'PROCESSED': 'Обработан',
      'SHIPPED': 'Отправлен',
      'COMPLETED': 'Завершён',
      'REFUSED': 'Отклонён'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    try {
      return new Date(dateString).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const handleExport = async (e) => {
    e.stopPropagation();
    await exportOrderToExcel(order.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.04)] transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
              #{order.orderNumber || order.id}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[#9ca3af]">Клиент:</span>
              <span className="text-[#e5e7eb]">{order.userEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9ca3af]">Дата:</span>
              <span className="text-[#e5e7eb]">{formatDate(order.dateCreated)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9ca3af]">Сумма:</span>
              <span className="text-[#e5e7eb] font-medium">¥{order.totalClientPrice?.toFixed(2) || '0.00'}</span>
            </div>
            {order.trackingNumber && (
              <div className="flex justify-between">
                <span className="text-[#9ca3af]">Трек:</span>
                <span className="text-[#00f0ff] font-mono text-xs">{order.trackingNumber}</span>
              </div>
            )}
            {order.items && order.items.length > 0 && (
              <div className="flex justify-between">
                <span className="text-[#9ca3af]">Товаров:</span>
                <span className="text-[#e5e7eb]">{order.items.length}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 ml-4">
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
          >
            <PencilIcon className="w-4 h-4 mr-2" />
            Редактировать
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-[#10b981] hover:bg-[rgba(16,185,129,0.2)]"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Модальное окно редактирования заказа
function EditOrderModal({ order, onClose, onSave }) {
  const [formData, setFormData] = useState({
    status: order.status,
    totalClientPrice: order.totalClientPrice,
    supplierCost: order.supplierCost || 0,
    customsDuty: order.customsDuty || 0,
    shippingCost: order.shippingCost || 0,
    insurance: order.insurance || false,
    deliveryAddress: order.deliveryAddress || '',
    trackingNumber: order.trackingNumber || '',
    chinaTrackingNumber: order.chinaTrackingNumber || '',
    internationalTrackingNumber: order.internationalTrackingNumber || '',
    localTrackingNumber: order.localTrackingNumber || '',
    reasonRefusal: order.reasonRefusal || '',
    weight: order.weight || 0,
    customsStatus: order.customsStatus || 'PENDING',
    discountApplied: order.discountApplied || 0,
    userDiscountApplied: order.userDiscountApplied || 0
  });
  
  // Вычисляем базовую цену для расчёта страховки (5% от суммы товаров)
  const calculateBasePrice = () => {
    if (order.items && order.items.length > 0) {
      return order.items.reduce((sum, item) => {
        const price = item.priceAtTime || 0;
        const quantity = item.quantity || 1;
        return sum + (price * quantity);
      }, 0);
    }
    // Если items нет, используем totalClientPrice как базу
    return formData.totalClientPrice || 0;
  };
  
  const basePrice = calculateBasePrice();
  const calculatedInsuranceCost = formData.insurance ? basePrice * 0.05 : 0;
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Убираем insuranceCost из данных - backend сам рассчитает автоматически
      const { insuranceCost, ...dataToSend } = formData;
      await api.put(`/orders/${order.id}`, {
        ...dataToSend,
        items: order.items
      });
      onSave();
    } catch (error) {
      console.error('Error updating order:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[rgba(31,41,55,0.95)] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
            Редактирование заказа #{order.orderNumber}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-[#9ca3af]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Статус */}
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Статус</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            >
              <option value="PENDING">Ожидает</option>
              <option value="PAID">Оплачен</option>
              <option value="VERIFIED">Подтверждён</option>
              <option value="PROCESSED">Обработан</option>
              <option value="SHIPPED">Отправлен</option>
              <option value="COMPLETED">Завершён</option>
              <option value="REFUSED">Отклонён</option>
            </select>
          </div>

          {/* Трек-номер */}
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Основной трек-номер</label>
            <input
              type="text"
              value={formData.trackingNumber}
              onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            />
          </div>

          {/* Трек-номер из Китая */}
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Трек-номер из Китая</label>
            <input
              type="text"
              value={formData.chinaTrackingNumber}
              onChange={(e) => setFormData({ ...formData, chinaTrackingNumber: e.target.value })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            />
          </div>

          {/* Международный трек-номер */}
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Международный трек-номер</label>
            <input
              type="text"
              value={formData.internationalTrackingNumber}
              onChange={(e) => setFormData({ ...formData, internationalTrackingNumber: e.target.value })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            />
          </div>

          {/* Локальный трек-номер */}
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Локальный трек-номер</label>
            <input
              type="text"
              value={formData.localTrackingNumber}
              onChange={(e) => setFormData({ ...formData, localTrackingNumber: e.target.value })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            />
          </div>

          {/* Общая цена */}
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Общая цена (¥)</label>
            <input
              type="number"
              step="0.01"
              value={formData.totalClientPrice}
              onChange={(e) => setFormData({ ...formData, totalClientPrice: parseFloat(e.target.value) || 0 })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            />
          </div>

          {/* Стоимость поставщика */}
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Стоимость поставщика (¥)</label>
            <input
              type="number"
              step="0.01"
              value={formData.supplierCost}
              onChange={(e) => setFormData({ ...formData, supplierCost: parseFloat(e.target.value) || 0 })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            />
          </div>

          {/* Таможенная пошлина */}
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Таможенная пошлина (¥)</label>
            <input
              type="number"
              step="0.01"
              value={formData.customsDuty}
              onChange={(e) => setFormData({ ...formData, customsDuty: parseFloat(e.target.value) || 0 })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            />
          </div>

          {/* Доставка */}
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Стоимость доставки (¥)</label>
            <input
              type="number"
              step="0.01"
              value={formData.shippingCost}
              onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || 0 })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            />
          </div>

          {/* Страховка - только флажок, стоимость рассчитывается автоматически (5%) */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.insurance}
                onChange={(e) => setFormData({ ...formData, insurance: e.target.checked })}
                className="w-5 h-5 rounded border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.02)] text-[#00f0ff] focus:ring-2 focus:ring-[#00f0ff]/50"
              />
              <div className="flex-1">
                <span className="block text-sm font-medium text-[#9ca3af]">Страховка (5% от стоимости товаров)</span>
                {formData.insurance && calculatedInsuranceCost > 0 && (
                  <span className="text-xs text-[#00f0ff] mt-1 block">
                    Стоимость страховки: ¥{calculatedInsuranceCost.toFixed(2)}
                  </span>
                )}
              </div>
            </label>
          </div>

          {/* Вес */}
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Вес (кг)</label>
            <input
              type="number"
              step="0.01"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            />
          </div>

          {/* Статус таможни */}
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Статус таможни</label>
            <select
              value={formData.customsStatus}
              onChange={(e) => setFormData({ ...formData, customsStatus: e.target.value })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            >
              <option value="PENDING">Ожидает</option>
              <option value="CLEARED">Оформлен</option>
              <option value="HELD">Задержан</option>
              <option value="REJECTED">Отклонён</option>
            </select>
          </div>

          {/* Адрес доставки */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Адрес доставки</label>
            <textarea
              value={formData.deliveryAddress}
              onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
              rows={2}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            />
          </div>

          {/* Причина отказа */}
          {formData.status === 'REFUSED' && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#9ca3af] mb-2">Причина отказа</label>
              <textarea
                value={formData.reasonRefusal}
                onChange={(e) => setFormData({ ...formData, reasonRefusal: e.target.value })}
                rows={2}
                className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
              />
            </div>
          )}
        </div>

        {/* Товары */}
        {order.items && order.items.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-[#e5e7eb] mb-4">Товары в заказе</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {order.items.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#e5e7eb]">
                        {item.productName || `Товар #${item.id}`}
                      </p>
                      <p className="text-xs text-[#9ca3af]">
                        ¥{item.priceAtTime?.toFixed(2) || '0.00'} × {item.quantity || 0}
                        {item.trackingNumber && (
                          <span className="ml-2 text-[#00f0ff]">Трек: {item.trackingNumber}</span>
                        )}
                      </p>
                    </div>
                    {item.purchaseStatus && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.purchaseStatus === 'PURCHASED' ? 'bg-[#10b981]/20 text-[#10b981]' :
                        item.purchaseStatus === 'NOT_PURCHASED' ? 'bg-[#ef4444]/20 text-[#ef4444]' :
                        'bg-[#a78bfa]/20 text-[#a78bfa]'
                      }`}>
                        {item.purchaseStatus === 'PURCHASED' ? 'Выкуплен' :
                         item.purchaseStatus === 'NOT_PURCHASED' ? 'Не выкуплен' : 'Ожидает'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-[rgba(255,255,255,0.1)]">
          <Button 
            onClick={() => exportOrderToExcel(order.id)} 
            variant="outline"
            className="bg-[rgba(16,185,129,0.1)] border-[rgba(16,185,129,0.3)] text-[#10b981] hover:bg-[rgba(16,185,129,0.2)]"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Экспорт в Excel
          </Button>
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline">
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={saving} variant="primary">
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Компоненты для других табов
function HistoryTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Используем OrderController для получения всех заказов, включая завершенные
      const response = await api.get('/orders', {
        params: {
          status: statusFilter === 'ALL' ? null : statusFilter,
          page: currentPage,
          size: 20,
          sort: 'dateCreated,desc'
        }
      });
      if (response?.data) {
        setOrders(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleEditOrder = async (order) => {
    // Загружаем полную информацию о заказе
    try {
      const response = await api.get(`/orders/${order.id}`);
      setSelectedOrder(response.data);
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(query) ||
      order.userEmail?.toLowerCase().includes(query) ||
      order.trackingNumber?.toLowerCase().includes(query) ||
      order.id?.toString().includes(query)
    );
  });

  if (loading) {
    return <Loading message="Загрузка истории..." />;
  }

  return (
    <div className="space-y-6">
      {/* Фильтры и поиск */}
      <div className="p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Поиск по номеру, email, трек-номеру..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-[#9ca3af]" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(0);
              }}
              className="select-dark flex-1 px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/50"
            >
              <option value="ALL">Все статусы</option>
              <option value="PENDING">Ожидает</option>
              <option value="PAID">Оплачен</option>
              <option value="VERIFIED">Подтверждён</option>
              <option value="PROCESSED">Обработан</option>
              <option value="SHIPPED">Отправлен</option>
              <option value="COMPLETED">Завершён</option>
              <option value="RECEIVED">Получен</option>
              <option value="REFUSED">Отклонён</option>
            </select>
          </div>
          <div className="text-right text-[#9ca3af] text-sm flex items-center justify-end">
            Всего: <span className="text-[#e5e7eb] font-medium ml-2">{filteredOrders.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onEdit={() => handleEditOrder(order)}
          />
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#9ca3af] text-lg">История заказов пуста</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            variant="outline"
          >
            Назад
          </Button>
          <span className="px-4 py-2 text-[#9ca3af]">{currentPage + 1} / {totalPages}</span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1}
            variant="outline"
          >
            Вперёд
          </Button>
        </div>
      )}

      {/* Модальное окно редактирования */}
      {showEditModal && selectedOrder && (
        <EditOrderModal
          order={selectedOrder}
          onClose={() => {
            setShowEditModal(false);
            setSelectedOrder(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setSelectedOrder(null);
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}

function BatchesTab() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/batch-cargos/all?page=${currentPage}&size=20&sort=creationDate,desc`);
      if (response?.data) {
        setBatches(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);


  const handleEditBatch = async (batchId) => {
    try {
      const response = await api.get(`/batch-cargos/${batchId}`);
      setSelectedBatch(response.data);
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching batch:', error);
    }
  };

  if (loading) {
    return <Loading message="Загрузка сборных грузов..." />;
  }

  return (
    <div className="space-y-6">
      <div className="text-right mb-4">
        <Button onClick={() => window.location.href = '/admin/upcoming-purchases'} variant="primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Управление сборными грузами
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {batches.map((batch) => (
          <BatchCard
            key={batch.id}
            batch={batch}
            onEdit={() => handleEditBatch(batch.id)}
          />
        ))}
      </div>

      {batches.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#9ca3af] text-lg">Сборные грузы не найдены</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            variant="outline"
          >
            Назад
          </Button>
          <span className="px-4 py-2 text-[#9ca3af]">{currentPage + 1} / {totalPages}</span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1}
            variant="outline"
          >
            Вперёд
          </Button>
        </div>
      )}

      {showEditModal && selectedBatch && (
        <EditBatchModal
          batch={selectedBatch}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBatch(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setSelectedBatch(null);
            fetchBatches();
          }}
        />
      )}
    </div>
  );
}

// Карточка сборного груза
function BatchCard({ batch, onEdit }) {
  const getStatusColor = (status) => {
    const colors = {
      'UNFINISHED': 'text-[#a78bfa] bg-[#a78bfa]/20 border-[#a78bfa]/50',
      'SHIPPED': 'text-[#10b981] bg-[#10b981]/20 border-[#10b981]/50',
      'ARRIVED_IN_MINSK': 'text-[#00f0ff] bg-[#00f0ff]/20 border-[#00f0ff]/50',
      'COMPLETED': 'text-[#10b981] bg-[#10b981]/20 border-[#10b981]/50',
      'REFUSED': 'text-[#ef4444] bg-[#ef4444]/20 border-[#ef4444]/50'
    };
    return colors[status] || 'text-[#9ca3af] bg-[#9ca3af]/20 border-[#9ca3af]/50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.2)] transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent mb-2">
            Сборный груз #{batch.id}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(batch.status)}`}>
            {batch.status}
          </span>
        </div>
        <Button onClick={onEdit} variant="outline" size="sm">
          <PencilIcon className="w-4 h-4 mr-2" />
          Редактировать
        </Button>
      </div>
    </motion.div>
  );
}

// Модальное окно редактирования сборного груза
function EditBatchModal({ batch, onClose, onSave }) {
  const [formData, setFormData] = useState({
    status: batch.status,
    batchTrackingNumber: batch.batchTrackingNumber || '',
    chinaWarehouseAddress: batch.chinaWarehouseAddress || '',
    consolidationWarehouse: batch.consolidationWarehouse || '',
    shippingMethod: batch.shippingMethod || '',
    carrierName: batch.carrierName || '',
    customsDeclarationNumber: batch.customsDeclarationNumber || '',
    customsStatus: batch.customsStatus || 'PENDING',
    totalBatchWeight: batch.totalBatchWeight || 0,
    totalBatchValue: batch.totalBatchValue || 0,
    description: batch.description || '',
    photoUrl: batch.photoUrl || '',
    reasonRefusal: batch.reasonRefusal || ''
  });
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (batch.orders) {
      setOrders(batch.orders);
    } else {
      // Загружаем заказы если их нет
      api.get(`/batch-cargos/${batch.id}`).then(response => {
        if (response.data && response.data.orders) {
          setOrders(response.data.orders);
        }
      });
    }
  }, [batch]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/batch-cargos/${batch.id}`, formData);
      onSave();
    } catch (error) {
      console.error('Error updating batch:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateItemTracking = async (itemId, trackingNumber) => {
    try {
      await api.put(`/batch-cargos/items/${itemId}/tracking`, { trackingNumber });
      // Обновляем локальное состояние
      setOrders(orders.map(order => ({
        ...order,
        items: order.items.map(item =>
          item.id === itemId ? { ...item, trackingNumber } : item
        )
      })));
    } catch (error) {
      console.error('Error updating item tracking:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[rgba(31,41,55,0.95)] border border-[rgba(255,255,255,0.1)] rounded-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
            Редактирование сборного груза #{batch.id}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-[rgba(255,255,255,0.1)] rounded-lg">
            <XMarkIcon className="w-6 h-6 text-[#9ca3af]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Статус</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb]"
            >
              <option value="UNFINISHED">В процессе</option>
              <option value="SHIPPED">Отправлен</option>
              <option value="ARRIVED_IN_MINSK">В Минске</option>
              <option value="COMPLETED">Завершён</option>
              <option value="REFUSED">Отклонён</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Трек-номер партии</label>
            <input
              type="text"
              value={formData.batchTrackingNumber}
              onChange={(e) => setFormData({ ...formData, batchTrackingNumber: e.target.value })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Метод доставки</label>
            <input
              type="text"
              value={formData.shippingMethod}
              onChange={(e) => setFormData({ ...formData, shippingMethod: e.target.value })}
              placeholder="Air, Sea, Express..."
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Перевозчик</label>
            <input
              type="text"
              value={formData.carrierName}
              onChange={(e) => setFormData({ ...formData, carrierName: e.target.value })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Номер таможенной декларации</label>
            <input
              type="text"
              value={formData.customsDeclarationNumber}
              onChange={(e) => setFormData({ ...formData, customsDeclarationNumber: e.target.value })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Статус таможни</label>
            <select
              value={formData.customsStatus}
              onChange={(e) => setFormData({ ...formData, customsStatus: e.target.value })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb]"
            >
              <option value="PENDING">Ожидает</option>
              <option value="CLEARED">Оформлен</option>
              <option value="HELD">Задержан</option>
              <option value="REJECTED">Отклонён</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Общий вес (кг)</label>
            <input
              type="number"
              step="0.01"
              value={formData.totalBatchWeight}
              onChange={(e) => setFormData({ ...formData, totalBatchWeight: parseFloat(e.target.value) || 0 })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Общая стоимость (¥)</label>
            <input
              type="number"
              step="0.01"
              value={formData.totalBatchValue}
              onChange={(e) => setFormData({ ...formData, totalBatchValue: parseFloat(e.target.value) || 0 })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb]"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#9ca3af] mb-2">URL фото</label>
            <input
              type="url"
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              className="select-dark w-full px-4 py-2.5 bg-[#1a1a1a] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb]"
            />
          </div>
        </div>

        {/* Заказы в сборном грузе */}
        {orders.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-[#e5e7eb] mb-4">Заказы в сборном грузе ({orders.length})</h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {orders.map((order) => (
                <OrderItemsInBatch
                  key={order.id}
                  order={order}
                  onUpdateTracking={handleUpdateItemTracking}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(255,255,255,0.1)]">
          <Button onClick={onClose} variant="outline">Отмена</Button>
          <Button onClick={handleSave} disabled={saving} variant="primary">
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// Компонент для отображения товаров заказа в сборном грузе
function OrderItemsInBatch({ order, onUpdateTracking }) {
  return (
    <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
      <div className="flex items-center justify-between mb-3">
        <h5 className="font-medium text-[#e5e7eb]">Заказ #{order.orderNumber}</h5>
        <span className="text-sm text-[#9ca3af]">{order.userEmail}</span>
      </div>
      {order.items && order.items.length > 0 && (
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={item.id || idx} className="flex items-center justify-between p-2 bg-[rgba(255,255,255,0.02)] rounded">
              <div className="flex-1">
                <p className="text-sm text-[#e5e7eb]">{item.productName || `Товар #${item.id}`}</p>
                <div className="flex items-center gap-4 mt-1">
                  <input
                    type="text"
                    placeholder="Трек-номер товара"
                    defaultValue={item.trackingNumber || ''}
                    onBlur={(e) => {
                      if (e.target.value && item.id) {
                        onUpdateTracking(item.id, e.target.value);
                      }
                    }}
                    className="text-xs px-2 py-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded text-[#e5e7eb] focus:outline-none focus:ring-1 focus:ring-[#00f0ff]/50"
                  />
                  <span className="text-xs text-[#9ca3af]">
                    {item.purchaseStatus === 'PURCHASED' ? '✓ Выкуплен' :
                     item.purchaseStatus === 'NOT_PURCHASED' ? '✗ Не выкуплен' : '⏳ Ожидает'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatsTab() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalBatches: 0,
    activeBatches: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    shippedOrders: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Получаем статистику по заказам
      const ordersResponse = await api.get('/orders?page=0&size=1000');
      const orders = ordersResponse.data?.content || [];
      
      // Получаем статистику по сборным грузам
      const batchesResponse = await api.get('/batch-cargos/all?page=0&size=1000');
      const batches = batchesResponse.data?.content || [];

      const statsData = {
        totalOrders: orders.length,
        activeOrders: orders.filter(o => ['PENDING', 'PAID', 'VERIFIED', 'PROCESSED'].includes(o.status)).length,
        pendingOrders: orders.filter(o => o.status === 'PENDING').length,
        shippedOrders: orders.filter(o => o.status === 'SHIPPED').length,
        completedOrders: orders.filter(o => o.status === 'COMPLETED').length,
        totalBatches: batches.length,
        activeBatches: batches.filter(b => b.status === 'UNFINISHED' || b.status === 'SHIPPED').length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.totalClientPrice || 0), 0)
      };
      
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Загрузка статистики..." />;
  }

  const statCards = [
    {
      title: 'Всего заказов',
      value: stats.totalOrders,
      color: 'from-[#00f0ff] to-[#00f0ff]/50',
      icon: ShoppingBagIconSolid
    },
    {
      title: 'Активных заказов',
      value: stats.activeOrders,
      color: 'from-[#a78bfa] to-[#a78bfa]/50',
      icon: ClockIconSolid
    },
    {
      title: 'Сборных грузов',
      value: stats.totalBatches,
      color: 'from-[#10b981] to-[#10b981]/50',
      icon: TruckIconSolid
    },
    {
      title: 'Общая выручка',
      value: `¥${stats.totalRevenue.toFixed(2)}`,
      color: 'from-[#00f0ff] via-[#a78bfa] to-[#10b981]',
      icon: ChartBarIconSolid
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-sm text-[#9ca3af] mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
                {stat.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
          <h3 className="text-sm text-[#9ca3af] mb-2">Ожидают обработки</h3>
          <p className="text-3xl font-bold text-[#a78bfa]">{stats.pendingOrders}</p>
        </div>
        <div className="p-6 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
          <h3 className="text-sm text-[#9ca3af] mb-2">Отправлено</h3>
          <p className="text-3xl font-bold text-[#10b981]">{stats.shippedOrders}</p>
        </div>
        <div className="p-6 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
          <h3 className="text-sm text-[#9ca3af] mb-2">Завершено</h3>
          <p className="text-3xl font-bold text-[#00f0ff]">{stats.completedOrders}</p>
        </div>
      </div>
    </div>
  );
}

export default OrderManagementCRM;

