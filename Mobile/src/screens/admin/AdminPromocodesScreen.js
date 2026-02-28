import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosInstance';

const AdminPromocodesScreen = () => {
  const { data: promocodes, isLoading } = useQuery({
    queryKey: ['adminPromocodes'],
    queryFn: async () => {
      const response = await api.get('/admin/crm/promocodes');
      return response.data || [];
    },
  });

  const renderPromocode = ({ item }) => (
    <View style={styles.promocodeCard}>
      <Text style={styles.promocodeCode}>{item.code}</Text>
      <Text style={styles.promocodeDiscount}>
        Скидка: {item.discountValue} {item.discountType === 'PERCENTAGE' ? '%' : '$'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={promocodes}
        renderItem={renderPromocode}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Промокоды не найдены</Text>
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
  promocodeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  promocodeCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 4,
  },
  promocodeDiscount: {
    fontSize: 14,
    color: '#6b7280',
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

export default AdminPromocodesScreen;




