import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axiosInstance';

const AdminNewsScreen = () => {
  const { data: news, isLoading } = useQuery({
    queryKey: ['adminNews'],
    queryFn: async () => {
      const response = await api.get('/admin/crm/news');
      return response.data || [];
    },
  });

  const renderNews = ({ item }) => (
    <View style={styles.newsCard}>
      <Text style={styles.newsTitle}>{item.title}</Text>
      <Text style={styles.newsDate}>
        {new Date(item.createdAt).toLocaleDateString('ru-RU')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={news}
        renderItem={renderNews}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Новости не найдены</Text>
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
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  newsDate: {
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

export default AdminNewsScreen;




