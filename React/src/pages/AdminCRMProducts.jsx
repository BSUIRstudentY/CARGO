import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';
import { Loading } from '../components/ui/Loading';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/solid';

const AdminCRMProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [createForm, setCreateForm] = useState({
    id: '',
    name: '',
    url: '',
    price: 0,
    description: '',
    imageUrl: '',
    status: 'PENDING',
    originCountry: 'China'
  });

  useEffect(() => {
    fetchProducts();
  }, [page, search, statusFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: '20'
      });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get(`/admin/crm/products?${params}`);
      setProducts(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (err) {
      setError('Ошибка загрузки товаров');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setEditForm({
      name: product.name || '',
      price: product.price || 0,
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      status: product.status || 'PENDING',
      originCountry: product.originCountry || 'China',
      weightKg: product.weightKg || 0,
      lengthCm: product.lengthCm || 0,
      widthCm: product.widthCm || 0,
      heightCm: product.heightCm || 0
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/admin/crm/products/${selectedProduct.id}`, editForm);
      setShowEditModal(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/admin/crm/products', createForm);
      setShowCreateModal(false);
      setCreateForm({
        id: '',
        name: '',
        url: '',
        price: 0,
        description: '',
        imageUrl: '',
        status: 'PENDING',
        originCountry: 'China'
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (productId) => {
    try {
      await api.delete(`/admin/crm/products/${productId}`);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const _handleUpdateStatus = async (productId, newStatus) => {
    try {
      await api.put(`/admin/crm/products/${productId}/status`, { status: newStatus });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-500/20 text-green-400',
      PENDING: 'bg-yellow-500/20 text-yellow-400',
      INACTIVE: 'bg-red-500/20 text-red-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  if (loading && products.length === 0) {
    return <Loading message="Загрузка товаров..." />;
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Управление товарами</h1>
          <p className="text-gray-400">Просмотр и управление всеми товарами системы</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Создать товар
        </Button>
      </motion.div>

      {/* Фильтры */}
      <Card className="bg-[#1a1a1a] border border-[#333333] p-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Поиск по названию или ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[#0a0a0a] border-[#333333] text-white"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-dark px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white"
          >
            <option value="">Все статусы</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING">PENDING</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </Card>

      {/* Таблица товаров */}
      <Card className="bg-[#1a1a1a] border border-[#333333] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0a0a0a]">
              <tr>
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-semibold">ID</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-semibold">Название</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-semibold">Цена</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-semibold">Статус</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-semibold">Продажи</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm font-semibold">Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-[#333333] hover:bg-[#0a0a0a]"
                >
                  <td className="px-4 py-3 text-white">{product.id}</td>
                  <td className="px-4 py-3 text-white">{product.name}</td>
                  <td className="px-4 py-3 text-white">${product.price?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(product.status)}`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{product.salesCount || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded transition"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded transition"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="p-4 flex justify-between items-center border-t border-[#333333]">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-[#0a0a0a] border border-[#333333] rounded text-white disabled:opacity-50"
            >
              Назад
            </button>
            <span className="text-gray-400">
              Страница {page + 1} из {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 bg-[#0a0a0a] border border-[#333333] rounded text-white disabled:opacity-50"
            >
              Вперед
            </button>
          </div>
        )}
      </Card>

      {/* Модальное окно редактирования */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-white mb-4">Редактировать товар</h2>
            <div className="space-y-4">
              <Input
                label="Название"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <Input
                type="number"
                label="Цена"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
              />
              <Input
                label="Описание"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
              <Input
                label="URL изображения"
                value={editForm.imageUrl}
                onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
              />
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="select-dark w-full px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded text-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PENDING">PENDING</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} className="flex-1">Сохранить</Button>
                <Button onClick={() => setShowEditModal(false)} variant="secondary" className="flex-1">
                  Отмена
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Модальное окно создания */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-white mb-4">Создать товар</h2>
            <div className="space-y-4">
              <Input
                label="ID товара"
                value={createForm.id}
                onChange={(e) => setCreateForm({ ...createForm, id: e.target.value })}
              />
              <Input
                label="Название"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
              <Input
                label="URL товара"
                value={createForm.url}
                onChange={(e) => setCreateForm({ ...createForm, url: e.target.value })}
              />
              <Input
                type="number"
                label="Цена"
                value={createForm.price}
                onChange={(e) => setCreateForm({ ...createForm, price: parseFloat(e.target.value) })}
              />
              <Input
                label="Описание"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              />
              <Input
                label="URL изображения"
                value={createForm.imageUrl}
                onChange={(e) => setCreateForm({ ...createForm, imageUrl: e.target.value })}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreate} className="flex-1">Создать</Button>
                <Button onClick={() => setShowCreateModal(false)} variant="secondary" className="flex-1">
                  Отмена
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminCRMProducts;




