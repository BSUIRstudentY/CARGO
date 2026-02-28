import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosInstance';

const AdminBatchCargosScreen = () => {
  const { data: batches, isLoading } = useQuery({
    queryKey: ['adminBatchCargos'],
    queryFn: async () => {
      const response = await api.get('/admin/crm/batch-cargos');
      return response.data || [];
    },
  });

  const renderBatch = ({ item }) => (
    <View style={styles.batchCard}>
      <Text style={styles.batchId}>Груз #{item.id}</Text>
      <Text style={styles.batchStatus}>Статус: {item.status}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={batches}
        renderItem={renderBatch}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Батч-карго не найдены</Text>
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
  batchCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  batchId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  batchStatus: {
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

export default AdminBatchCargosScreen;




