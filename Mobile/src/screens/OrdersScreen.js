import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/axiosInstance';

const OrdersScreen = () => {
  const navigation = useNavigation();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['orders', page, status],
    queryFn: async () => {
      const params = {
        page,
        size: 10,
        sort: 'dateCreated,desc',
        ...(status && status !== 'ALL' && { status }),
      };
      const response = await api.get('/orders', { params });
      return response.data;
    },
  });

  const orders = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'VERIFIED':
        return '#059669';
      case 'PENDING':
        return '#f59e0b';
      case 'REFUSED':
        return '#ef4444';
      case 'RECEIVED':
        return '#2563eb';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      PENDING: 'В обработке',
      VERIFIED: 'Подтвержден',
      REFUSED: 'Отклонен',
      RECEIVED: 'Получен',
    };
    return statusMap[status] || status;
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Заказ #{item.orderNumber}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(item.status)}15` },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      <Text style={styles.orderDate}>
        {new Date(item.dateCreated).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </Text>
      <View style={styles.orderFooter}>
        <Text style={styles.orderPrice}>
          ${item.totalClientPrice?.toFixed(2) || '0.00'}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['ALL', 'PENDING', 'VERIFIED', 'RECEIVED', 'REFUSED'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.filterButton,
                status === s && styles.filterButtonActive,
              ]}
              onPress={() => {
                setStatus(s === 'ALL' ? null : s);
                setPage(0);
              }}
            >
              <Text
                style={[
                  styles.filterText,
                  status === s && styles.filterTextActive,
                ]}
              >
                {s === 'ALL' ? 'Все' : getStatusText(s)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        onEndReached={() => {
          if (page < totalPages - 1) {
            setPage(page + 1);
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Заказы не найдены</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#f3f4f6',
  },
  filterButtonActive: {
    backgroundColor: '#dc2626',
  },
  filterText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
});

export default OrdersScreen;

