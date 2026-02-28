import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/axiosInstance';

const NewsScreen = () => {
  const [page, setPage] = useState(0);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['news', page],
    queryFn: async () => {
      const response = await api.get('/news', {
        params: { page, size: 10 },
      });
      return response.data;
    },
  });

  const news = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const renderNewsItem = ({ item }) => (
    <TouchableOpacity style={styles.newsCard}>
      <View style={styles.newsHeader}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsDate}>
          {new Date(item.createdAt).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </View>
      {item.content && (
        <Text style={styles.newsContent} numberOfLines={3}>
          {item.content}
        </Text>
      )}
      <View style={styles.newsFooter}>
        <Ionicons name="time-outline" size={16} color="#6b7280" />
        <Text style={styles.newsTime}>
          {new Date(item.createdAt).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={news}
        renderItem={renderNewsItem}
        keyExtractor={(item, index) => item?.id?.toString() || `news-${index}`}
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
            <Ionicons name="newspaper-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Новости не найдены</Text>
          </View>
        }
      />
    </View>
  );
};

import { theme } from '../config/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  newsCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...theme.shadows.md,
  },
  newsHeader: {
    marginBottom: theme.spacing.md,
  },
  newsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  newsDate: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.muted,
  },
  newsContent: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  newsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newsTime: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.muted,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['3xl'],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.md,
  },
});

export default NewsScreen;

