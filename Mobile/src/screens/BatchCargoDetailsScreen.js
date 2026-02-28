import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';

const BatchCargoDetailsScreen = () => {
  const route = useRoute();
  const { batchId } = route.params;

  const { data: batch, isLoading } = useQuery({
    queryKey: ['batchCargo', batchId],
    queryFn: async () => {
      const response = await api.get(`/batch-cargos/${batchId}`);
      return response.data;
    },
  });

  if (isLoading || !batch) {
    return (
      <View style={styles.container}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Груз #{batch.id}</Text>
        <Text style={styles.status}>Статус: {batch.status}</Text>
        {/* Добавьте больше деталей */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default BatchCargoDetailsScreen;




