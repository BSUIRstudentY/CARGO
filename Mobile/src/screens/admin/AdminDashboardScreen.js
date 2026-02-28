import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosInstance';

const AdminDashboardScreen = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await api.get('/admin/crm/dashboard/stats');
      return response.data;
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Админ панель - Dashboard</Text>
        {isLoading ? (
          <Text>Загрузка статистики...</Text>
        ) : (
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              Пользователей: {stats?.totalUsers || 0}
            </Text>
            <Text style={styles.statsText}>
              Заказов: {stats?.totalOrders || 0}
            </Text>
            <Text style={styles.statsText}>
              Товаров: {stats?.totalProducts || 0}
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
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
  },
  statsText: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 8,
  },
});

export default AdminDashboardScreen;




