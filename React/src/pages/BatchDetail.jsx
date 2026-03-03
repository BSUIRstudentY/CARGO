import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import ExcelJS from 'exceljs';
import api from '../api/axiosInstance';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import { PageHeader } from '../components/ui/PageHeader';
import { 
  TruckIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ArrowLeftIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/solid';

function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRefusalModal, setShowRefusalModal] = useState(false);
  const [refusalReason, setRefusalReason] = useState('');
  const [showItemRefusalModal, setShowItemRefusalModal] = useState(false);
  const [itemRefusalReason, setItemRefusalReason] = useState('');
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const basicReasons = [
    'Неверная ссылка',
    'Товар закончился',
    'Не понятно какую комплектацию выбирать',
    'Аномальный товар',
    'Товар продается только в составе набора/опта',
    'Ограниченные способы оплаты у поставщика',
    'Запрещено к пересылке',
    'Другое',
  ];

  useEffect(() => {
    setLoading(true);
    api.get(`/batch-cargos/${id}`)
      .then((response) => {
        console.log('Batch data:', response.data);
        setBatch(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching batch:', error);
        setError('Ошибка загрузки сборного груза');
        setLoading(false);
      });
  }, [id]);

  const handleProcessOrder = (orderId, order) => {
    navigate(`/admin/upcoming-purchases/${id}/order/${orderId}`, { state: { order } });
  };

  const handleRefuse = async () => {
    if (!refusalReason) {
      return;
    }
    setLoading(true);
    try {
      const updatedBatch = {
        status: 'REFUSED',
        reasonRefusal: refusalReason,
        photoUrl: batch.photoUrl || null,
        description: batch.description || null
      };
      await api.put(`/batch-cargos/${id}`, updatedBatch);
      // После обновления загружаем полные данные, чтобы получить orders
      const fullResponse = await api.get(`/batch-cargos/${id}`);
      if (fullResponse?.data) {
        setBatch(fullResponse.data);
        try {
          const notificationPromises = (fullResponse.data.orders || []).map((order) =>
            api.post('/notifications', {
              userEmail: order.userEmail,
              message: `Сборный груз #${fullResponse.data.id} был отклонён. Причина: ${refusalReason}`,
              relatedId: id,
              category: 'BATCH_UPDATE',
            })
          );
          await Promise.all(notificationPromises);
          console.log('Notifications sent for batch:', id);
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
        }
        navigate('/admin/upcoming-purchases');
      } else {
        throw new Error('Ответ сервера не содержит данных');
      }
    } catch (error) {
      console.error('Error refusing batch:', error);
      let errorMessage = 'Ошибка отклонения сборного груза';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Доступ запрещён (403). Проверьте права доступа или токен авторизации.';
        } else {
          errorMessage = error.response.data?.message || error.message || 'Неизвестная ошибка';
        }
      } else {
        errorMessage = error.message || 'Ошибка сети';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      setShowRefusalModal(false);
      setRefusalReason('');
    }
  };

  const handleDeleteBatch = async () => {
    setLoading(true);
    try {
      await api.delete(`/batch-cargos/${id}`);
      navigate('/admin/upcoming-purchases');
    } catch (error) {
      console.error('Error deleting batch:', error);
      let errorMessage = 'Ошибка удаления сборного груза';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Доступ запрещён (403). Проверьте права доступа или токен авторизации.';
        } else if (error.response.status === 404) {
          errorMessage = 'Сборный груз не найден';
        } else {
          errorMessage = error.response.data?.message || error.message || 'Неизвестная ошибка';
        }
      } else {
        errorMessage = error.message || 'Ошибка сети';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      setShowRefusalModal(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      return;
    }
    setLoading(true);
    try {
      const updatedBatch = {
        status: selectedStatus,
        reasonRefusal: batch.reasonRefusal || null,
        photoUrl: batch.photoUrl || null,
        description: batch.description || null
      };
      await api.put(`/batch-cargos/${id}`, updatedBatch);
      // После обновления статуса загружаем полные данные груза, чтобы получить orders
      const response = await api.get(`/batch-cargos/${id}`);
      if (response?.data) {
        setBatch(response.data);
        setShowStatusModal(false);
        setSelectedStatus('');
      } else {
        throw new Error('Ответ сервера не содержит данных');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      let errorMessage = 'Ошибка обновления статуса';
      if (error.response) {
        errorMessage = error.response.data?.message || error.message || 'Неизвестная ошибка';
      } else {
        errorMessage = error.message || 'Ошибка сети';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPurchased = async (orderId, itemId) => {
    setLoading(true);
    try {
      await api.put(`/batch-cargos/items/${itemId}`, { status: 'PURCHASED' });
      const response = await api.get(`/batch-cargos/${id}`);
      setBatch(response.data);
    } catch (error) {
      console.error('Error marking item as purchased:', error);
      setError('Ошибка при пометке товара как выкупленного');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkNotPurchased = async () => {
    if (!itemRefusalReason) {
      return;
    }
    setLoading(true);
    try {
      await api.put(`/batch-cargos/items/${selectedItemId}`, {
        status: 'NOT_PURCHASED',
        purchaseRefusalReason: itemRefusalReason,
      });
      const response = await api.get(`/batch-cargos/${id}`);
      setBatch(response.data);
    } catch (error) {
      console.error('Error marking item as not purchased:', error);
      setError('Ошибка при пометке товара как невыкупленного');
    } finally {
      setLoading(false);
      setShowItemRefusalModal(false);
      setItemRefusalReason('');
      setSelectedItemId(null);
      setSelectedOrderId(null);
    }
  };

  const openItemRefusalModal = (orderId, itemId) => {
    setSelectedOrderId(orderId);
    setSelectedItemId(itemId);
    setShowItemRefusalModal(true);
  };

  /** Загрузка изображения в ArrayBuffer для вставки в Excel */
  const loadImageAsBuffer = async (imageUrl) => {
    if (!imageUrl || (!String(imageUrl).startsWith('http') && !String(imageUrl).startsWith('data:'))) return null;
    try {
      const res = await fetch(imageUrl, { mode: 'cors', credentials: 'omit', cache: 'no-cache' });
      if (res.ok) {
        const blob = await res.blob();
        const buf = await blob.arrayBuffer();
        return buf && buf.byteLength > 0 ? buf : null;
      }
    } catch (_) {}
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      let done = false;
      const t = setTimeout(() => { if (!done) { done = true; resolve(null); } }, 8000);
      img.onload = () => {
        if (done) return;
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 400;
          canvas.height = img.height || 400;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((b) => {
            if (done || !b || b.size === 0) { if (!done) resolve(null); return; }
            b.arrayBuffer().then((buf) => { if (!done) { done = true; clearTimeout(t); resolve(buf); } });
          }, 'image/png', 0.95);
        } catch (_) { if (!done) { done = true; clearTimeout(t); resolve(null); } }
      };
      img.onerror = () => { if (!done) { done = true; clearTimeout(t); resolve(null); } };
      img.src = imageUrl;
    });
  };

  /** Экспорт всего сборного груза в Excel для карго (формат: ТОВАРЫ ДЛЯ ЗАКАЗА + ДОСТАВКА ИЗ КИТАЯ, с фото) */
  const handleExportBatchToExcel = async () => {
    if (!batch || !batch.orders || batch.orders.length === 0) return;
    setExportLoading(true);
    try {
      const orders = batch.orders || [];
      const flatItems = [];
      orders.forEach((order) => {
        (order.items || []).forEach((item) => flatItems.push({ order, item }));
      });
      if (flatItems.length === 0) return;

      const imagePromises = flatItems.map(({ item }, idx) =>
        (item.imageUrl ? loadImageAsBuffer(item.imageUrl) : Promise.resolve(null)).then((buf) => ({ index: idx, buffer: buf }))
      );
      const imageResults = await Promise.race([
        Promise.all(imagePromises),
        new Promise((r) => setTimeout(() => r(flatItems.map((_, i) => ({ index: i, buffer: null }))), 25000)),
      ]);

      const imageMap = new Map();
      imageResults.forEach((r) => { if (r.buffer && r.buffer.byteLength > 0) imageMap.set(r.index, r.buffer); });

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Fluvion Admin';
      const ws = workbook.addWorksheet('Сборный груз', { views: [{ state: 'frozen', ySplit: 2 }] });

      const sectionHeaderStyle = {
        font: { bold: true, size: 13, color: { argb: 'FF000000' } },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        border: { top: { style: 'medium' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } },
      };
      const headerStyle = {
        font: { bold: true, size: 11, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
        border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
      };
      const dataStyle = {
        alignment: { vertical: 'middle', horizontal: 'left', wrapText: true },
        border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
      };
      const totalStyle = {
        font: { bold: true, size: 12 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } },
        alignment: { vertical: 'middle', horizontal: 'right', wrapText: true },
        border: { top: { style: 'medium' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
      };

      const YUAN_TO_BYN = 0.65;

      let currentRow = 1;

      ws.mergeCells(currentRow, 1, currentRow, 10);
      ws.getCell(currentRow, 1).value = 'ТОВАРЫ ДЛЯ ЗАКАЗА';
      ws.getCell(currentRow, 1).style = sectionHeaderStyle;
      ws.mergeCells(currentRow, 11, currentRow, 13);
      ws.getCell(currentRow, 11).value = 'ДОСТАВКА ИЗ КИТАЯ (заполняется карго при получении груза в Минске)';
      ws.getCell(currentRow, 11).style = sectionHeaderStyle;
      ws.getRow(currentRow).height = 28;
      currentRow++;

      const headers1 = [
        '№',
        'название товара',
        'ссылка на товар (ничего страшного если она целиком не будет видна)',
        'цвет / размер / иные характеристики',
        'кол-во',
        'цена за 1 ед. в юанях',
        'цена за доставку по китаю в юанях (оставьте пустым, если платная — внесу)',
        'общая сумма в юанях',
        'общая сумма в byn',
        'ваш комментарий / можно прикрепить картинку',
      ];
      const headers2 = ['вес в кг', 'цена в $', 'цена в byn (по курсу продажи альфа банк на день оплаты)'];
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((col, i) => {
        ws.getCell(currentRow, col).value = headers1[i];
        ws.getCell(currentRow, col).style = headerStyle;
      });
      [11, 12, 13].forEach((col, i) => {
        ws.getCell(currentRow, col).value = headers2[i];
        ws.getCell(currentRow, col).style = headerStyle;
      });
      ws.getRow(currentRow).height = 50;
      currentRow++;

      const colWidths = [6, 32, 48, 32, 10, 18, 38, 20, 18, 28, 14, 14, 38];
      colWidths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });

      let totalYuan = 0;
      let totalByn = 0;

      flatItems.forEach(({ order, item }, index) => {
        const qty = item.quantity ?? 1;
        const price = item.priceAtTime ?? 0;
        const sumYuan = Math.round(qty * price * 100) / 100;
        const sumByn = Math.round(sumYuan * YUAN_TO_BYN * 100) / 100;
        totalYuan += sumYuan;
        totalByn += sumByn;

        const chars = (item.description || '').toString().slice(0, 200);
        const rowData = [
          index + 1,
          item.productName ?? 'Без названия',
          item.url ?? '',
          chars || '',
          qty,
          price,
          '', // доставка по Китаю — пусто
          sumYuan,
          sumByn,
          '', // картинка — вставим отдельно
          '', // вес — заполняет карго
          '', // цена $ — карго
          '', // цена byn — карго
        ];
        const row = ws.addRow(rowData);
        row.height = 130;
        row.eachCell((cell, colNumber) => {
          cell.style = dataStyle;
          if ([6, 8, 9].includes(colNumber)) cell.numFmt = '#,##0.00';
        });

        const imgBuffer = imageMap.get(index);
        if (imgBuffer && imgBuffer.byteLength > 0) {
          try {
            let ext = 'png';
            const url = (item.imageUrl || '').toLowerCase();
            if (url.includes('.jpg') || url.includes('.jpeg')) ext = 'jpeg';
            else if (url.includes('.gif')) ext = 'gif';
            else if (url.includes('.webp')) ext = 'webp';
            const imageId = workbook.addImage({ buffer: imgBuffer, extension: ext });
            ws.addImage(imageId, {
              tl: { col: 9, row: currentRow - 1 },
              ext: { width: 140, height: 140 },
              editAs: 'oneCell',
            });
            row.getCell(10).value = '';
          } catch (_) {}
        }
        currentRow++;
      });

      const totalRow = ws.addRow([
        flatItems.length + 1,
        'ИТОГО',
        '',
        '',
        '',
        '',
        '',
        Math.round(totalYuan * 100) / 100,
        Math.round(totalByn * 100) / 100,
        '',
        '',
        '',
        '',
      ]);
      totalRow.height = 28;
      totalRow.eachCell((cell, colNumber) => {
        if (colNumber === 1 || colNumber === 8 || colNumber === 9) cell.style = totalStyle;
        else cell.style = dataStyle;
        if (colNumber === 8 || colNumber === 9) cell.numFmt = '#,##0.00';
      });

      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `Сборный_груз_${batch.id}_${dateStr}.xlsx`;
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export batch to Excel:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const getStatusDisplay = (status) => {
    const statuses = {
      UNFINISHED: { 
        text: 'В процессе', 
        color: 'text-yellow-300', 
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/50',
        icon: <ClockIcon className="w-4 h-4" />
      },
      PURCHASING: { 
        text: 'Закупка товаров', 
        color: 'text-blue-300', 
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500/50',
        icon: <ClockIcon className="w-4 h-4" />
      },
      CHECKING: { 
        text: 'Проверка товаров', 
        color: 'text-purple-300', 
        bgColor: 'bg-purple-500/20',
        borderColor: 'border-purple-500/50',
        icon: <ClockIcon className="w-4 h-4" />
      },
      PACKAGING: { 
        text: 'Упаковка', 
        color: 'text-indigo-300', 
        bgColor: 'bg-indigo-500/20',
        borderColor: 'border-indigo-500/50',
        icon: <ClockIcon className="w-4 h-4" />
      },
      SHIPPED: { 
        text: 'Отправлен', 
        color: 'text-emerald-300', 
        bgColor: 'bg-emerald-500/20',
        borderColor: 'border-emerald-500/50',
        icon: <TruckIcon className="w-4 h-4" />
      },
      ARRIVED_IN_MINSK: { 
        text: 'В Минске', 
        color: 'text-cyan-300', 
        bgColor: 'bg-cyan-500/20',
        borderColor: 'border-cyan-500/50',
        icon: <TruckIcon className="w-4 h-4" />
      },
      COMPLETED: { 
        text: 'Доставлен', 
        color: 'text-green-300', 
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500/50',
        icon: <CheckCircleIcon className="w-4 h-4" />
      },
      FINISHED: { 
        text: 'Завершён', 
        color: 'text-emerald-300', 
        bgColor: 'bg-emerald-500/20',
        borderColor: 'border-emerald-500/50',
        icon: <CheckCircleIcon className="w-4 h-4" />
      },
      REFUSED: { 
        text: 'Отклонён', 
        color: 'text-red-300', 
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/50',
        icon: <XCircleIcon className="w-4 h-4" />
      }
    };
    return statuses[status] || { 
      text: status, 
      color: 'text-gray-300', 
      bgColor: 'bg-gray-500/20',
      borderColor: 'border-gray-500/50',
      icon: <ClockIcon className="w-4 h-4" />
    };
  };

  const getPurchaseStatusDisplay = (status) => {
    const statuses = {
      PURCHASED: { 
        text: 'Выкуплен', 
        color: 'text-emerald-300', 
        bgColor: 'bg-emerald-500/20',
        borderColor: 'border-emerald-500'
      },
      NOT_PURCHASED: { 
        text: 'Не выкуплен', 
        color: 'text-red-300', 
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500'
      },
      PENDING: { 
        text: 'Ожидает', 
        color: 'text-yellow-300', 
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500'
      }
    };
    return statuses[status] || statuses.PENDING;
  };

  if (loading && !batch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <Loading message="Загрузка сборного груза..." />
      </div>
    );
  }

  if (error && !batch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <Card className="p-8 bg-red-500/20 border-red-500/50">
          <p className="text-red-300 text-center">{error}</p>
        </Card>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <Card className="p-8">
          <p className="text-[#cdcdcd] text-center">Сборный груз не найден</p>
        </Card>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(batch.status);

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <PageHeader
              title={`Выкуп #${batch.id}`}
              subtitle={`Дата выкупа: ${new Date(batch.purchaseDate).toLocaleDateString('ru-RU')}`}
            />
          </div>
        </div>

        {/* Статус */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${statusDisplay.bgColor} ${statusDisplay.borderColor} ${statusDisplay.color}`}>
                  {statusDisplay.icon}
                  <span className="font-semibold">{statusDisplay.text}</span>
                </span>
                {batch.status === 'REFUSED' && batch.reasonRefusal && (
                  <span className="text-red-300 text-sm">Причина: {batch.reasonRefusal}</span>
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="p-4 bg-red-500/20 border-red-500/50">
              <p className="text-red-300">{error}</p>
            </Card>
          </motion.div>
        )}

        {/* Список заказов */}
        <div className="space-y-4">
          {batch.orders && batch.orders.length > 0 ? batch.orders.map((order, orderIndex) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: orderIndex * 0.05 }}
            >
              <Card className={`p-6 ${order.status === 'PROCESSED' ? 'opacity-70' : ''}`}>
                <div className="mb-4 flex items-center justify-between">
                  <h3
                    className="text-xl font-bold text-[#407CFF] cursor-pointer hover:text-[#5a8fff] transition-colors flex items-center gap-2"
                    onClick={() => handleProcessOrder(order.id, order)}
                  >
                    <TruckIcon className="w-6 h-6" />
                    Заказ #{order.orderNumber}
                  </h3>
                  <span className="text-sm text-[#808080]">Клиент: {order.userEmail}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="text-[#cdcdcd]">
                    <span className="text-[#808080]">Статус:</span>{' '}
                    <span className="text-white font-medium">{order.status}</span>
                  </div>
                  <div className="text-[#cdcdcd]">
                    <span className="text-[#808080]">Сумма:</span>{' '}
                    <span className="text-white font-medium">¥{order.totalClientPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                  {order.deliveryAddress && (
                    <div className="text-[#cdcdcd]">
                      <span className="text-[#808080]">Адрес:</span>{' '}
                      <span className="text-white font-medium">{order.deliveryAddress}</span>
                    </div>
                  )}
                </div>

                {/* Товары заказа */}
                <div className="mt-4">
                  {order.items && order.items.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {order.items.map((item, itemIndex) => {
                        const purchaseStatusDisplay = getPurchaseStatusDisplay(item.purchaseStatus);
                        return (
                          <Tilt key={item.id || `item-${itemIndex}`} tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1200}>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: itemIndex * 0.05 }}
                              whileHover={{ y: -5, transition: { duration: 0.2 } }}
                              className="p-4 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.1)] hover:border-[rgba(0,240,255,0.5)] hover:bg-[rgba(255,255,255,0.04)] transition-all duration-300"
                            >
                              {/* Изображение товара */}
                              <div className="w-full h-40 bg-[rgba(255,255,255,0.02)] rounded-lg mb-4 border border-[rgba(255,255,255,0.1)] flex items-center justify-center p-3 overflow-hidden">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.productName || 'Товар'}
                                    className="w-full h-full object-contain transform hover:scale-105 transition duration-300"
                                    onError={(e) => {
                                      e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-[rgba(255,255,255,0.02)] flex items-center justify-center text-xs text-[#9ca3af]">
                                    Нет фото
                                  </div>
                                )}
                              </div>

                              {/* Название товара */}
                              <h4 className="font-medium text-base sm:text-lg text-[#e5e7eb] mb-2 line-clamp-2 break-words">
                                {item.productName || 'Без названия'}
                              </h4>

                              {/* Статус выкупа */}
                              <div className="mb-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${purchaseStatusDisplay.bgColor} ${purchaseStatusDisplay.borderColor} ${purchaseStatusDisplay.color}`}>
                                  {purchaseStatusDisplay.text}
                                </span>
                              </div>

                              {/* Информация о товаре */}
                              <div className="space-y-2 text-sm mb-3">
                                <div className="flex items-center justify-between text-[#9ca3af]">
                                  <span>Количество:</span>
                                  <span className="text-white font-medium">{item.quantity || 1}</span>
                                </div>
                                <div className="flex items-center justify-between text-[#9ca3af]">
                                  <span>Цена:</span>
                                  <span className="text-white font-medium">¥{item.priceAtTime?.toFixed(2) || '0.00'}</span>
                                </div>
                                {item.supplierPrice && (
                                  <div className="flex items-center justify-between text-[#9ca3af]">
                                    <span>Цена поставщика:</span>
                                    <span className="text-white font-medium">¥{item.supplierPrice.toFixed(2)}</span>
                                  </div>
                                )}
                                {item.trackingNumber && (
                                  <div className="flex items-center justify-between text-[#9ca3af]">
                                    <span>Трек-номер:</span>
                                    <span className="text-white font-mono text-xs">{item.trackingNumber}</span>
                                  </div>
                                )}
                                {item.chinaDeliveryPrice > 0 && (
                                  <div className="flex items-center justify-between text-[#9ca3af]">
                                    <span>Доставка по Китаю:</span>
                                    <span className="text-white font-medium">¥{item.chinaDeliveryPrice.toFixed(2)}</span>
                                  </div>
                                )}
                              </div>

                              {/* Описание */}
                              {item.description && (
                                <p className="text-xs text-[#9ca3af] mb-3 line-clamp-2">
                                  {item.description}
                                </p>
                              )}

                              {/* Ссылка на товар */}
                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs text-[#00f0ff] hover:text-[#5a8fff] transition-colors block mb-3"
                                >
                                  Открыть ссылку →
                                </a>
                              )}

                              {/* Причина отказа */}
                              {item.purchaseRefusalReason && (
                                <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.1)]">
                                  <p className="text-xs text-red-300">
                                    <span className="font-semibold">Причина:</span> {item.purchaseRefusalReason}
                                  </p>
                                </div>
                              )}

                              {/* Кнопки действий */}
                              {item.purchaseStatus !== 'PURCHASED' && item.purchaseStatus !== 'NOT_PURCHASED' && (
                                <div className="mt-3 flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkPurchased(order.id, item.id);
                                    }}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                  >
                                    Выкуплен
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openItemRefusalModal(order.id, item.id);
                                    }}
                                    className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                  >
                                    Не выкуплен
                                  </Button>
                                </div>
                              )}
                            </motion.div>
                          </Tilt>
                        );
                      })}
                    </div>
                  ) : (
                    <Card className="p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)]">
                      <p className="text-[#9ca3af] text-center">Нет товаров в заказе</p>
                    </Card>
                  )}
                </div>
              </Card>
            </motion.div>
          )) : (
            <Card className="p-8 bg-[#1a1a1a] border border-[#333]">
              <p className="text-[#808080] text-center">Нет заказов в этом сборном грузе</p>
            </Card>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="mt-6 flex flex-wrap justify-end gap-4">
          <Button
            onClick={handleExportBatchToExcel}
            disabled={exportLoading || !batch?.orders?.length}
            variant="outline"
            className="border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white"
          >
            <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
            {exportLoading ? 'Экспорт...' : 'Скачать сборный груз в Excel'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedStatus(batch.status);
              setShowStatusModal(true);
            }}
            className="border-[#407CFF] text-[#407CFF] hover:bg-[#407CFF] hover:text-white"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Изменить статус
          </Button>
          {batch.status === 'UNFINISHED' && (
            <Button
              variant="outline"
              onClick={() => setShowRefusalModal(true)}
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              Отказать
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/upcoming-purchases')}
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Назад
          </Button>
          <Button
            variant="outline"
            onClick={handleDeleteBatch}
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            <TrashIcon className="w-5 h-5 mr-2" />
            Удалить
          </Button>
        </div>

        {/* Модальное окно отказа */}
        <AnimatePresence>
          {showRefusalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setShowRefusalModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 max-w-md w-full"
              >
                <h3 className="text-2xl font-bold text-white mb-4">Причина отказа</h3>
                <div className="space-y-4">
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'Другое') {
                        setRefusalReason('');
                      } else {
                        setRefusalReason(value);
                      }
                    }}
                    className="select-dark w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#407CFF] focus:outline-none"
                  >
                    <option value="">Выберите базовую причину</option>
                    {basicReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={refusalReason}
                    onChange={(e) => setRefusalReason(e.target.value)}
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:border-[#407CFF] focus:outline-none resize-none"
                    rows="4"
                    placeholder="Опишите причину отказа (можно добавить детали)..."
                  />
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowRefusalModal(false);
                        setRefusalReason('');
                      }}
                    >
                      Отмена
                    </Button>
                    <Button
                      onClick={handleRefuse}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Отказать
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Модальное окно изменения статуса */}
        <AnimatePresence>
          {showStatusModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowStatusModal(false);
                setSelectedStatus('');
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 max-w-md w-full"
              >
                <h3 className="text-2xl font-bold text-white mb-4">Изменить статус выкупа</h3>
                <div className="space-y-4">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="select-dark w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#407CFF] focus:outline-none"
                  >
                    <option value="">Выберите статус</option>
                    <option value="UNFINISHED">В процессе</option>
                    <option value="PURCHASING">Закупка товаров</option>
                    <option value="CHECKING">Проверка товаров</option>
                    <option value="PACKAGING">Упаковка</option>
                    <option value="SHIPPED">Отправлен</option>
                    <option value="ARRIVED_IN_MINSK">В Минске</option>
                    <option value="COMPLETED">Доставлен</option>
                  </select>
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowStatusModal(false);
                        setSelectedStatus('');
                      }}
                    >
                      Отмена
                    </Button>
                    <Button
                      onClick={handleUpdateStatus}
                      className="bg-[#407CFF] hover:bg-[#5a8fff]"
                      disabled={!selectedStatus}
                    >
                      Сохранить
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Модальное окно отказа товара */}
        <AnimatePresence>
          {showItemRefusalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowItemRefusalModal(false);
                setItemRefusalReason('');
                setSelectedItemId(null);
                setSelectedOrderId(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6 max-w-md w-full"
              >
                <h3 className="text-2xl font-bold text-white mb-4">Причина невыкупа товара</h3>
                <div className="space-y-4">
                  <select
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === 'Другое') {
                        setItemRefusalReason('');
                      } else {
                        setItemRefusalReason(value);
                      }
                    }}
                    className="select-dark w-full px-4 py-2 bg-[#1a1a1a] border border-[#333] rounded-lg text-white focus:border-[#407CFF] focus:outline-none"
                  >
                    <option value="">Выберите базовую причину</option>
                    {basicReasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={itemRefusalReason}
                    onChange={(e) => setItemRefusalReason(e.target.value)}
                    className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#333] rounded-lg text-white focus:border-[#407CFF] focus:outline-none resize-none"
                    rows="4"
                    placeholder="Опишите причину невыкупа (можно добавить детали)..."
                  />
                  <div className="flex justify-end gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setShowItemRefusalModal(false);
                        setItemRefusalReason('');
                        setSelectedItemId(null);
                        setSelectedOrderId(null);
                      }}
                    >
                      Отмена
                    </Button>
                    <Button
                      onClick={handleMarkNotPurchased}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Подтвердить
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default BatchDetail;
