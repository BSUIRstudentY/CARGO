import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';

const BatchCargoListScreen = () => {
  const navigation = useNavigation();

  const { data: batches, isLoading } = useQuery({
    queryKey: ['batchCargos'],
    queryFn: async () => {
      const response = await api.get('/batch-cargos');
      return response.data || [];
    },
  });

  const renderBatch = ({ item }) => (
    <TouchableOpacity
      style={styles.batchCard}
      onPress={() => navigation.navigate('BatchCargoDetails', { batchId: item.id })}
    >
      <Text style={styles.batchTitle}>Груз #{item.id}</Text>
      <Text style={styles.batchStatus}>Статус: {item.status}</Text>
    </TouchableOpacity>
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
            <Text style={styles.emptyText}>Сборные грузы не найдены</Text>
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
  batchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
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

export default BatchCargoListScreen;




