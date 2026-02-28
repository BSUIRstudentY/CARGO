import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosInstance';

const AdminStatsScreen = () => {
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
        <Text style={styles.title}>Статистика</Text>
        {isLoading ? (
          <Text>Загрузка...</Text>
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Пользователей</Text>
              <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Заказов</Text>
              <Text style={styles.statValue}>{stats?.totalOrders || 0}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Товаров</Text>
              <Text style={styles.statValue}>{stats?.totalProducts || 0}</Text>
            </View>
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
    gap: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#dc2626',
  },
});

export default AdminStatsScreen;




