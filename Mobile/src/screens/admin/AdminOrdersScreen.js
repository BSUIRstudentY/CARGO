import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosInstance';

const AdminOrdersScreen = () => {
  const navigation = useNavigation();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: async () => {
      const response = await api.get('/admin/crm/orders');
      return response.data || [];
    },
  });

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
    >
      <Text style={styles.orderNumber}>Заказ #{item.orderNumber}</Text>
      <Text style={styles.orderStatus}>Статус: {item.status}</Text>
      <Text style={styles.orderPrice}>${item.totalClientPrice?.toFixed(2) || '0.00'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
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
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  orderStatus: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 18,
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
  },
});

export default AdminOrdersScreen;




