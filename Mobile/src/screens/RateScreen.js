import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axiosInstance';

const RateScreen = () => {
  const { data: rate, isLoading } = useQuery({
    queryKey: ['shippingRate'],
    queryFn: async () => {
      const response = await api.get('/exchange-rates/shipping/current');
      return response.data;
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Курс доставки</Text>
        {isLoading ? (
          <Text style={styles.text}>Загрузка...</Text>
        ) : (
          <View style={styles.rateCard}>
            <Text style={styles.rateLabel}>Текущий курс:</Text>
            <Text style={styles.rateValue}>
              ${rate?.value?.toFixed(2) || '0.00'} за кг
            </Text>
          </View>
        )}
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
    marginBottom: 16,
  },
  rateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
  },
  rateLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  rateValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  text: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default RateScreen;




