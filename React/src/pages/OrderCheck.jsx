import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Loading } from '../components/ui/Loading';
import { PageHeader } from '../components/ui/PageHeader';
import Tilt from 'react-parallax-tilt';
import { CheckCircleIcon, XCircleIcon, ShoppingCartIcon, UserIcon, MapPinIcon, TruckIcon, ClockIcon, CurrencyDollarIcon, PhoneIcon } from '@heroicons/react/24/solid';

function OrderCheck() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [editedOrder, setEditedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showRefusalModal, setShowRefusalModal] = useState(false);
  const [refusalReason, setRefusalReason] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [showItemRefusalModal, setShowItemRefusalModal] = useState(false);
  const [itemRefusalReason, setItemRefusalReason] = useState('');
  const [_activeTab, _setActiveTab] = useState('orderDetails');
  const [showContactEditModal, setShowContactEditModal] = useState(false);
  const [contactData, setContactData] = useState({ phone: '', lastName: '', firstName: '', middleName: '' });

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

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/orders/${id}`);
      if (response?.data) {
        setOrder(response.data);
        setEditedOrder(response.data);
      } else {
        setError('Данные заказа не найдены');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      let errorMessage = 'Ошибка загрузки заказа';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'Доступ запрещён (403). Проверьте, что вы авторизованы как ADMIN и токен действителен.';
        } else {
          errorMessage = error.response.data?.message || error.message || 'Неизвестная ошибка';
        }
      } else {
        errorMessage = error.message || 'Ошибка сети';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const isOrderFullyProcessed = () => {
    return editedOrder?.items?.every(
      (item) => item.purchaseStatus === 'PURCHASED' || item.purchaseStatus === 'NOT_PURCHASED'
    );
  };

  const handleConfirm = async () => {
    if (!editedOrder?.deliveryAddress || !editedOrder?.totalClientPrice) {
      setError('Укажите адрес доставки и общую цену для клиента');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updatedOrder = {
        ...editedOrder,
        status: 'VERIFIED',
      };
      const response = await api.put(`/orders/${id}`, updatedOrder);
      if (response?.data) {
        setOrder(response.data);
        setEditedOrder(response.data);
        navigate('/admin/orders');
      } else {
        throw new Error('Ответ сервера не содержит данных');
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      let errorMessage = 'Ошибка подтверждения заказа';
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
    }
  };

  const handleRefuse = async () => {
    if (!refusalReason) {
      setError('Укажите причину отказа');
      return;
    }
    if (!editedOrder?.totalClientPrice || !editedOrder?.deliveryAddress) {
      setError('Заполните все обязательные поля заказа (сумма и адрес доставки)');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updatedOrder = {
        ...editedOrder,
        status: 'REFUSED',
        reasonRefusal: refusalReason,
      };
      const response = await api.put(`/orders/${id}`, updatedOrder);
      if (response?.data) {
        setOrder(response.data);
        setEditedOrder(response.data);
        try {
          await api.post('/notifications', {
            userEmail: editedOrder.userEmail,
            message: `Ваш заказ #${editedOrder.orderNumber || id} был отклонён. Причина: ${refusalReason}`,
            relatedId: id,
            category: 'ORDER_UPDATE',
          });
        } catch (notificationError) {
          console.error('Ошибка при отправке уведомления:', notificationError);
        }
        navigate('/admin/orders');
      } else {
        throw new Error('Ответ сервера не содержит данных');
      }
    } catch (error) {
      console.error('Ошибка при отклонении заказа:', error);
      let errorMessage = 'Ошибка отклонения заказа';
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

  const handleItemNotPurchased = async () => {
    if (!itemRefusalReason) {
      setError('Укажите причину невыкупа');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updatedOrder = {
        ...editedOrder,
        items: editedOrder.items.map((item) =>
          item.productId === selectedItem.productId
            ? { ...item, purchaseStatus: 'NOT_PURCHASED', purchaseRefusalReason: itemRefusalReason }
            : item
        ),
      };
      const response = await api.put(`/orders/${id}`, updatedOrder);
      if (response?.data) {
        setOrder(response.data);
        setEditedOrder(response.data);
      } else {
        throw new Error('Ответ сервера не содержит данных');
      }
    } catch (error) {
      console.error('Ошибка при обновлении статуса товара:', error);
      setError(error.response?.data?.message || error.message || 'Ошибка обновления статуса товара');
    } finally {
      setLoading(false);
      setShowItemRefusalModal(false);
      setItemRefusalReason('');
      setSelectedItem(null);
    }
  };

  const handleItemPurchased = async () => {
    setLoading(true);
    setError(null);
    try {
      const updatedOrder = {
        ...editedOrder,
        items: editedOrder.items.map((item) =>
          item.productId === selectedItem.productId
            ? { ...item, purchaseStatus: 'PURCHASED', purchaseRefusalReason: null }
            : item
        ),
      };
      const response = await api.put(`/orders/${id}`, updatedOrder);
      if (response?.data) {
        setOrder(response.data);
        setEditedOrder(response.data);
      } else {
        throw new Error('Ответ сервера не содержит данных');
      }
    } catch (error) {
      console.error('Ошибка при обновлении статуса товара:', error);
      setError(error.response?.data?.message || error.message || 'Ошибка обновления статуса товара');
    } finally {
      setLoading(false);
      setSelectedItem(null);
    }
  };

  const handleSendMessage = async () => {
    if (!message) {
      setError('Введите сообщение');
      return;
    }
    try {
      await api.post('/notifications', {
        userEmail: editedOrder.userEmail,
        message: message,
        relatedId: id,
        category: 'ADMIN_MESSAGE',
      });
      setShowMessageModal(false);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.response?.data?.message || error.message || 'Ошибка отправки сообщения');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedOrder((prev) => ({
      ...prev,
      [name]: name.includes('Price') || name.includes('Cost') || name.includes('Duty') ? (value === '' ? 0 : parseFloat(value) || 0) : value,
    }));
  };

  const handleSaveOrder = async () => {
    if (!editedOrder?.deliveryAddress || !editedOrder?.totalClientPrice) {
      setError('Укажите адрес доставки и общую цену для клиента');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/orders/${id}`, editedOrder);
      if (response?.data) {
        setOrder(response.data);
        setEditedOrder(response.data);
        setError(null);
        // Показываем успешное сообщение
        alert('Изменения успешно сохранены!');
      } else {
        throw new Error('Ответ сервера не содержит данных');
      }
    } catch (error) {
      console.error('Ошибка при сохранении заказа:', error);
      let errorMessage = 'Ошибка сохранения заказа';
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
    }
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveContact = async () => {
    setLoading(true);
    setError(null);
    try {
      // Явно передаем phone, даже если он пустой, чтобы обновить его на сервере
      const updatedOrder = {
        ...editedOrder,
        phone: contactData.phone || '', // Всегда передаем phone, даже если пустой
        lastName: contactData.lastName || '',
        firstName: contactData.firstName || '',
        middleName: contactData.middleName || '',
      };
      const response = await api.put(`/orders/${id}`, updatedOrder);
      if (response?.data) {
        setOrder(response.data);
        setEditedOrder(response.data);
        setShowContactEditModal(false);
        setError(null);
      } else {
        throw new Error('Ответ сервера не содержит данных');
      }
    } catch (error) {
      console.error('Ошибка при сохранении контактных данных:', error);
      let errorMessage = 'Ошибка сохранения контактных данных';
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
    }
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setSelectedItem((prev) => ({
      ...prev,
      [name]: name === 'priceAtTime' || name === 'quantity' || name === 'chinaDeliveryPrice' || name === 'supplierPrice' ? (value === '' ? 0 : parseFloat(value) || 0) : value,
    }));
  };

  const handleItemEdit = (item) => {
    setSelectedItem({ ...item });
  };

  const handleItemSave = async () => {
    if (!selectedItem) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Обновляем товар в локальном состоянии
      const updatedItems = editedOrder.items.map((item) =>
        item.productId === selectedItem.productId ? { ...selectedItem } : item
      );
      
      const updatedOrder = {
        ...editedOrder,
        items: updatedItems,
      };
      
      // Сохраняем изменения на сервере
      const response = await api.put(`/orders/${id}`, updatedOrder);
      if (response?.data) {
        setOrder(response.data);
        setEditedOrder(response.data);
        setSelectedItem(null);
      } else {
        throw new Error('Ответ сервера не содержит данных');
      }
    } catch (error) {
      console.error('Ошибка при сохранении товара:', error);
      setError(error.response?.data?.message || error.message || 'Ошибка сохранения товара');
    } finally {
      setLoading(false);
    }
  };

  const handleItemCancel = () => {
    setSelectedItem(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'REFUSED':
        return 'text-red-500 bg-red-500/20 border-red-500/50';
      case 'PENDING':
        return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/50';
      case 'VERIFIED':
        return 'text-green-500 bg-green-500/20 border-green-500/50';
      case 'RECEIVED':
        return 'text-blue-500 bg-blue-500/20 border-blue-500/50';
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/50';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'REFUSED':
        return 'Отклонён';
      case 'PENDING':
        return 'Ожидает подтверждения';
      case 'VERIFIED':
        return 'Подтверждён';
      case 'RECEIVED':
        return 'Получен';
      default:
        return status;
    }
  };

  if (loading && !order) {
    return <Loading message="Загрузка заказа..." />;
  }

  if (error && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <Alert type="error" message={error} className="max-w-md" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
        <div className="text-center text-gray-400 text-2xl">Заказ не найден</div>
      </div>
    );
  }

  // Calculate totals
  const itemsTotal = editedOrder?.items?.reduce((sum, item) => sum + (item.priceAtTime || 0) * (item.quantity || 1), 0) || 0;
  const userDiscount = editedOrder?.userDiscountApplied || 0;
  const promocodeDiscount = editedOrder?.discountApplied || 0;
  const insuranceCost = editedOrder?.insuranceCost || 0;
  const _totalDiscount = userDiscount + promocodeDiscount;

  return (
    <div className="min-h-screen bg-transparent text-[#e5e7eb] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <PageHeader
          kicker="Заказ"
          title={`Заказ #${editedOrder?.orderNumber || id}`}
          subtitle="Проверка и подтверждение заказа"
        />

        <AnimatePresence>
          {error && (
            <Alert 
              type="error" 
              message={error} 
              onClose={() => setError('')}
              className="mb-8"
            />
          )}
        </AnimatePresence>

        {/* Status Badge */}
        <div className="flex items-center justify-center mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`px-6 py-3 rounded-full border-2 font-semibold flex items-center gap-2 ${getStatusColor(editedOrder?.status)}`}
          >
            {editedOrder?.status === 'VERIFIED' && <CheckCircleIcon className="w-5 h-5" />}
            {editedOrder?.status === 'REFUSED' && <XCircleIcon className="w-5 h-5" />}
            <span>Статус: {getStatusLabel(editedOrder?.status)}</span>
            {editedOrder?.status === 'REFUSED' && editedOrder?.reasonRefusal && (
              <span className="text-xs opacity-75">({editedOrder.reasonRefusal})</span>
            )}
          </motion.div>
          {isOrderFullyProcessed() && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-4"
            >
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </motion.div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Details Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information Card */}
            <Card>
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-[#333333] pb-4">
                  <ShoppingCartIcon className="w-6 h-6 text-[#e81e2d]" />
                  <h2 className="text-2xl font-bold text-white">Информация о заказе</h2>
                </div>

                {/* Read-only Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
                    <UserIcon className="w-5 h-5 text-[#407CFF]" />
                    <div>
                      <p className="text-xs text-[#808080]">Клиент</p>
                      <p className="text-sm font-semibold text-white">{editedOrder?.userEmail || 'Не указан'}</p>
                    </div>
                  </div>
                  <div 
                    className="flex items-center gap-3 p-4 bg-[#1a1a1a] rounded-lg border border-[#333333] cursor-pointer hover:border-[#407CFF] transition-colors group"
                    onClick={() => {
                      setContactData({
                        phone: editedOrder?.phone || '',
                        lastName: editedOrder?.lastName || '',
                        firstName: editedOrder?.firstName || '',
                        middleName: editedOrder?.middleName || ''
                      });
                      setShowContactEditModal(true);
                    }}
                  >
                    <PhoneIcon className="w-5 h-5 text-[#407CFF] group-hover:scale-110 transition-transform" />
                    <div className="flex-1">
                      <p className="text-xs text-[#808080]">Номер телефона</p>
                      <p className="text-sm font-semibold text-white group-hover:text-[#407CFF] transition-colors">
                        {editedOrder?.phone || 'Не указан'}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-[#808080] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div 
                    className="flex items-center gap-3 p-4 bg-[#1a1a1a] rounded-lg border border-[#333333] cursor-pointer hover:border-[#407CFF] transition-colors group"
                    onClick={() => {
                      setContactData({
                        phone: editedOrder?.phone || '',
                        lastName: editedOrder?.lastName || '',
                        firstName: editedOrder?.firstName || '',
                        middleName: editedOrder?.middleName || ''
                      });
                      setShowContactEditModal(true);
                    }}
                  >
                    <UserIcon className="w-5 h-5 text-[#407CFF] group-hover:scale-110 transition-transform" />
                    <div className="flex-1">
                      <p className="text-xs text-[#808080]">ФИО</p>
                      <p className="text-sm font-semibold text-white group-hover:text-[#407CFF] transition-colors">
                        {editedOrder?.lastName || editedOrder?.firstName || editedOrder?.middleName 
                          ? `${editedOrder?.lastName || ''} ${editedOrder?.firstName || ''} ${editedOrder?.middleName || ''}`.trim()
                          : 'Не указано'}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-[#808080] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#1a1a1a] rounded-lg border border-[#333333]">
                    <ClockIcon className="w-5 h-5 text-[#407CFF]" />
                    <div>
                      <p className="text-xs text-[#808080]">Дата создания</p>
                      <p className="text-sm font-semibold text-white">
                        {editedOrder?.dateCreated ? new Date(editedOrder.dateCreated).toLocaleString('ru-RU') : 'Не указана'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Editable Fields - Only necessary fields for order verification */}
                <div className="space-y-4 border-t border-[#333333] pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Поля для подтверждения заказа</h3>
                  
                  {/* Required Fields */}
                  <Input
                    label="Адрес доставки *"
                    name="deliveryAddress"
                    type="text"
                    value={editedOrder?.deliveryAddress || ''}
                    onChange={handleChange}
                    required
                    placeholder="Введите адрес доставки"
                    icon={MapPinIcon}
                  />

                  <Input
                    label="Общая цена для клиента (¥) *"
                    name="totalClientPrice"
                    type="number"
                    step="0.01"
                    value={editedOrder?.totalClientPrice || ''}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    icon={CurrencyDollarIcon}
                  />

                  {/* Optional Cost Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Стоимость поставщика (¥)"
                      name="supplierCost"
                      type="number"
                      step="0.01"
                      value={editedOrder?.supplierCost || ''}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                    <Input
                      label="Таможенная пошлина (¥)"
                      name="customsDuty"
                      type="number"
                      step="0.01"
                      value={editedOrder?.customsDuty || ''}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                    <Input
                      label="Стоимость доставки (¥)"
                      name="shippingCost"
                      type="number"
                      step="0.01"
                      value={editedOrder?.shippingCost || ''}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>

                  {/* Tracking Number */}
                  <Input
                    label="Трек-номер"
                    name="trackingNumber"
                    type="text"
                    value={editedOrder?.trackingNumber || ''}
                    onChange={handleChange}
                    placeholder="Введите трек-номер (опционально)"
                    icon={TruckIcon}
                  />
                </div>
              </div>
            </Card>

            {/* Items Tab */}
            <Card>
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#333333] pb-4">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <ShoppingCartIcon className="w-6 h-6 text-[#e81e2d]" />
                    Товары в заказе ({editedOrder?.items?.length || 0})
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {editedOrder?.items?.map((item, index) => (
                    <motion.div
                      key={`${item.productId}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} perspective={1000}>
                        <Card
                          className="cursor-pointer group"
                          onClick={() => handleItemEdit(item)}
                          hover={true}
                        >
                          <div className="flex gap-4">
                            {/* Product Image */}
                            <div className="w-24 h-24 bg-[#1a1a1a] rounded-lg border-2 border-[#333333] flex-shrink-0 flex items-center justify-center overflow-hidden group-hover:border-[#e81e2d]/50 transition-colors">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName || 'Товар'}
                                  className="w-full h-full object-contain p-2"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/128x128?text=Нет+фото';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-[#808080]">
                                  Нет фото
                                </div>
                              )}
                            </div>
                            
                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-white mb-1 truncate group-hover:text-[#e81e2d] transition-colors">
                                {item.productName || 'Без названия'}
                              </h4>
                              <p className="text-sm text-[#cdcdcd] mb-2">
                                ¥{(item.priceAtTime || 0).toFixed(2)} × {item.quantity || 1}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  item.purchaseStatus === 'PURCHASED' 
                                    ? 'bg-green-500/20 text-green-500' 
                                    : item.purchaseStatus === 'NOT_PURCHASED' 
                                    ? 'bg-red-500/20 text-red-500'
                                    : 'bg-yellow-500/20 text-yellow-500'
                                }`}>
                                  {item.purchaseStatus === 'PURCHASED' ? 'Выкуплен' : 
                                   item.purchaseStatus === 'NOT_PURCHASED' ? 'Не выкуплен' : 
                                   'Ожидает'}
                                </span>
                              </div>
                              {item.purchaseRefusalReason && (
                                <p className="text-xs text-red-500 mt-1">{item.purchaseRefusalReason}</p>
                              )}
                            </div>
                          </div>
                        </Card>
                      </Tilt>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Summary & Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Order Summary */}
              <Card>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white border-b border-[#333333] pb-4">
                    Сумма заказа
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-[#cdcdcd]">
                      <span>Товары:</span>
                      <span className="text-white font-semibold">¥{itemsTotal.toFixed(2)}</span>
                    </div>
                    {userDiscount > 0 && (
                      <div className="flex justify-between text-green-500">
                        <span>Скидка пользователя:</span>
                        <span className="font-semibold">-¥{userDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    {promocodeDiscount > 0 && (
                      <div className="flex justify-between text-green-500">
                        <span>Промокод:</span>
                        <span className="font-semibold">-¥{promocodeDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    {insuranceCost > 0 && (
                      <div className="flex justify-between text-[#cdcdcd]">
                        <span>Страховка:</span>
                        <span className="text-white font-semibold">+¥{insuranceCost.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-[#333333] pt-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-white">Итого:</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-[#e81e2d] to-[#ff4757] bg-clip-text text-transparent">
                          ¥{(editedOrder?.totalClientPrice || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <Card>
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white border-b border-[#333333] pb-4">
                    Действия
                  </h3>
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleSaveOrder}
                      disabled={loading}
                      className="w-full"
                    >
                      Сохранить изменения
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleConfirm}
                      disabled={editedOrder?.status !== 'PENDING' || loading}
                      className="w-full"
                    >
                      <CheckCircleIcon className="w-5 h-5 inline mr-2" />
                      Подтвердить заказ
                    </Button>
                    {editedOrder?.status === 'VERIFIED' && (
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => setShowMessageModal(true)}
                        className="w-full"
                      >
                        Связаться с клиентом
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setShowRefusalModal(true)}
                      disabled={editedOrder?.status !== 'PENDING' || loading}
                      className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <XCircleIcon className="w-5 h-5 inline mr-2" />
                      Отказать
                    </Button>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => navigate('/admin/orders')}
                      className="w-full"
                    >
                      Назад к списку
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Item Edit Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedItem(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] rounded-2xl border border-[#333333] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <h3 className="text-2xl font-bold text-white mb-6 border-b border-[#333333] pb-4">
                  Редактирование товара
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Input
                    label="ID товара"
                    name="productId"
                    value={selectedItem.productId || ''}
                    onChange={handleItemChange}
                    disabled
                  />
                  <Input
                    label="Название товара"
                    name="productName"
                    value={selectedItem.productName || ''}
                    onChange={handleItemChange}
                  />
                  <Input
                    label="URL товара"
                    name="url"
                    type="url"
                    value={selectedItem.url || ''}
                    onChange={handleItemChange}
                    className="md:col-span-2"
                  />
                  <Input
                    label="URL изображения"
                    name="imageUrl"
                    type="url"
                    value={selectedItem.imageUrl || ''}
                    onChange={handleItemChange}
                    className="md:col-span-2"
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#cdcdcd] mb-2">
                      Описание товара
                    </label>
                    <textarea
                      name="description"
                      value={selectedItem.description || ''}
                      onChange={handleItemChange}
                      className="w-full px-4 py-3 bg-[#1a1a1a] text-white rounded-lg border border-[#333333] focus:outline-none focus:ring-2 focus:ring-[#e81e2d] resize-none"
                      rows="3"
                      placeholder="Введите описание товара (опционально)"
                    />
                  </div>
                  <Input
                    label="Цена на момент заказа (¥)"
                    name="priceAtTime"
                    type="number"
                    step="0.01"
                    value={selectedItem.priceAtTime || ''}
                    onChange={handleItemChange}
                  />
                  <Input
                    label="Количество"
                    name="quantity"
                    type="number"
                    min="1"
                    value={selectedItem.quantity || ''}
                    onChange={handleItemChange}
                  />
                  <Input
                    label="Цена поставщика (¥)"
                    name="supplierPrice"
                    type="number"
                    step="0.01"
                    value={selectedItem.supplierPrice || ''}
                    onChange={handleItemChange}
                  />
                  <Input
                    label="Доставка по Китаю (¥)"
                    name="chinaDeliveryPrice"
                    type="number"
                    step="0.01"
                    value={selectedItem.chinaDeliveryPrice || ''}
                    onChange={handleItemChange}
                  />
                  <Input
                    label="Трек-номер товара"
                    name="trackingNumber"
                    value={selectedItem.trackingNumber || ''}
                    onChange={handleItemChange}
                    className="md:col-span-2"
                  />
                </div>
                <div className="flex flex-wrap justify-between gap-4 mb-4">
                  <Button
                    variant="primary"
                    onClick={handleItemPurchased}
                    className="flex-1"
                  >
                    Выкуплен
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowItemRefusalModal(true)}
                    className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    Не выкуплен
                  </Button>
                </div>
                <div className="flex justify-end gap-4">
                  <Button variant="ghost" onClick={handleItemCancel}>
                    Отмена
                  </Button>
                  <Button variant="primary" onClick={handleItemSave}>
                    Сохранить
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Refusal Modal */}
        <AnimatePresence>
          {showRefusalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowRefusalModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] rounded-2xl border border-[#333333] p-8 max-w-md w-full shadow-2xl"
              >
                <h3 className="text-xl font-bold text-white mb-4">Причина отказа</h3>
                <select
                  onChange={(e) => setRefusalReason(e.target.value === 'Другое' ? '' : e.target.value)}
                  className="select-dark w-full px-4 py-3 bg-[#1a1a1a] text-white rounded-lg mb-4 border border-[#333333] focus:outline-none focus:ring-2 focus:ring-[#e81e2d]"
                  value={refusalReason}
                >
                  <option value="">Выберите базовую причину</option>
                  {basicReasons.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
                <textarea
                  value={refusalReason}
                  onChange={(e) => setRefusalReason(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] text-white rounded-lg mb-4 border border-[#333333] focus:outline-none focus:ring-2 focus:ring-[#e81e2d] resize-none"
                  rows="4"
                  placeholder="Опишите причину отказа..."
                />
                <div className="flex justify-end gap-4">
                  <Button variant="ghost" onClick={() => setShowRefusalModal(false)}>
                    Отмена
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRefuse}
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    Отказать
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Item Refusal Modal */}
        <AnimatePresence>
          {showItemRefusalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowItemRefusalModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] rounded-2xl border border-[#333333] p-8 max-w-md w-full shadow-2xl"
              >
                <h3 className="text-xl font-bold text-white mb-4">Причина невыкупа товара</h3>
                <select
                  onChange={(e) => setItemRefusalReason(e.target.value === 'Другое' ? '' : e.target.value)}
                  className="select-dark w-full px-4 py-3 bg-[#1a1a1a] text-white rounded-lg mb-4 border border-[#333333] focus:outline-none focus:ring-2 focus:ring-[#e81e2d]"
                >
                  <option value="">Выберите базовую причину</option>
                  {basicReasons.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
                <textarea
                  value={itemRefusalReason}
                  onChange={(e) => setItemRefusalReason(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] text-white rounded-lg mb-4 border border-[#333333] focus:outline-none focus:ring-2 focus:ring-[#e81e2d] resize-none"
                  rows="4"
                  placeholder="Опишите причину невыкупа..."
                />
                <div className="flex justify-end gap-4">
                  <Button variant="ghost" onClick={() => setShowItemRefusalModal(false)}>
                    Отмена
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleItemNotPurchased}
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    Подтвердить
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contact Edit Modal */}
        <AnimatePresence>
          {showContactEditModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowContactEditModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] rounded-2xl border border-[#333333] p-8 max-w-md w-full shadow-2xl"
              >
                <h3 className="text-xl font-bold text-white mb-6 border-b border-[#333333] pb-4">
                  Редактирование контактной информации
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Номер телефона"
                    name="phone"
                    type="tel"
                    value={contactData.phone || ''}
                    onChange={handleContactChange}
                    placeholder="Введите номер телефона"
                    icon={PhoneIcon}
                  />
                  <Input
                    label="Фамилия"
                    name="lastName"
                    type="text"
                    value={contactData.lastName}
                    onChange={handleContactChange}
                    placeholder="Введите фамилию"
                  />
                  <Input
                    label="Имя"
                    name="firstName"
                    type="text"
                    value={contactData.firstName}
                    onChange={handleContactChange}
                    placeholder="Введите имя"
                  />
                  <Input
                    label="Отчество"
                    name="middleName"
                    type="text"
                    value={contactData.middleName}
                    onChange={handleContactChange}
                    placeholder="Введите отчество (опционально)"
                  />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <Button variant="ghost" onClick={() => setShowContactEditModal(false)}>
                    Отмена
                  </Button>
                  <Button variant="primary" onClick={handleSaveContact} disabled={loading}>
                    Сохранить
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Modal */}
        <AnimatePresence>
          {showMessageModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowMessageModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-[#1f1f1f] to-[#1a1a1a] rounded-2xl border border-[#333333] p-8 max-w-md w-full shadow-2xl"
              >
                <h3 className="text-xl font-bold text-white mb-4">Отправить сообщение</h3>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1a1a1a] text-white rounded-lg mb-4 border border-[#333333] focus:outline-none focus:ring-2 focus:ring-[#e81e2d] resize-none"
                  rows="4"
                  placeholder="Введите сообщение для пользователя..."
                />
                <div className="flex justify-end gap-4">
                  <Button variant="ghost" onClick={() => setShowMessageModal(false)}>
                    Отмена
                  </Button>
                  <Button variant="primary" onClick={handleSendMessage}>
                    Отправить
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default OrderCheck;
