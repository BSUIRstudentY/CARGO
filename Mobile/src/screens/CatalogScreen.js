import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/axiosInstance';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Toast from 'react-native-toast-message';
import { theme } from '../config/theme';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

const CatalogScreen = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch, error: queryError } = useQuery({
    queryKey: ['products', page, searchTerm, sortBy],
    queryFn: async () => {
      try {
        const params = {
          page: page || 0,
          size: 20,
        };
        
        if (searchTerm && searchTerm.trim()) {
          params.searchTerm = searchTerm.trim();
        }
        if (sortBy) {
          params.sortBy = sortBy;
        }

        const response = await api.get('/catalog', { params });

        if (!response || !response.data) {
          return { content: [], totalPages: 1, totalElements: 0 };
        }

        const responseData = response.data || {};
        
        let productsData = [];
        let totalPagesData = 1;
        
        if (Array.isArray(responseData)) {
          productsData = responseData;
        } else if (Array.isArray(responseData.content)) {
          productsData = responseData.content;
          totalPagesData = responseData.totalPages || 1;
        } else if (Array.isArray(responseData.products)) {
          productsData = responseData.products;
          totalPagesData = responseData.totalPages || 1;
        }
        
        productsData = productsData.filter(product => 
          product && 
          product.id != null && 
          product.name
        );
        
        return {
          content: productsData,
          totalPages: totalPagesData,
          totalElements: responseData.totalElements || productsData.length,
        };
      } catch (error) {
        console.error('[Catalog] Error:', error);
        return { content: [], totalPages: 1, totalElements: 0 };
      }
    },
    retry: 2,
    retryDelay: 1000,
  });

  const products = useMemo(() => {
    if (!data || !data.content) return [];
    if (!Array.isArray(data.content)) return [];
    return data.content.filter(item => item && item.id);
  }, [data]);
  
  const totalPages = useMemo(() => {
    if (!data) return 0;
    return data.totalPages || 0;
  }, [data]);

  const handleAddToCart = (product) => {
    if (!product || !product.id) return;
    
    if (!isAuthenticated) {
      Toast.show({
        type: 'info',
        text1: 'Требуется вход',
        text2: 'Войдите, чтобы добавить товар в корзину',
      });
      navigation.navigate('LoginRegister');
      return;
    }
    
    try {
      addToCart(product, 1);
      Toast.show({
        type: 'success',
        text1: 'Товар добавлен',
        text2: `${product.name || 'Товар'} добавлен в корзину`,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'Не удалось добавить товар в корзину',
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (e) {
      console.error('Error refreshing:', e);
    } finally {
      setRefreshing(false);
    }
  };

  const renderProduct = (item, index) => {
    if (!item || !item.id) return null;
    
    return (
      <TouchableOpacity
        key={item.id || index}
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <Image
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/200?text=No+Image' }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name || 'Без названия'}
          </Text>
          <Text style={styles.productPrice}>
            ${((item.price || 0).toFixed(2))}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(item)}
          >
            <Ionicons name="cart-outline" size={16} color={theme.colors.text.primary} />
            <Text style={styles.addButtonText}>В корзину</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={theme.colors.text.muted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск товаров..."
          placeholderTextColor={theme.colors.text.muted}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={() => {
            setPage(0);
            refetch();
          }}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'price_asc' && styles.sortButtonActive]}
          onPress={() => setSortBy(sortBy === 'price_asc' ? '' : 'price_asc')}
        >
          <Text style={[styles.sortText, sortBy === 'price_asc' && styles.sortTextActive]}>
            Цена ↑
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'price_desc' && styles.sortButtonActive]}
          onPress={() => setSortBy(sortBy === 'price_desc' ? '' : 'price_desc')}
        >
          <Text style={[styles.sortText, sortBy === 'price_desc' && styles.sortTextActive]}>
            Цена ↓
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'sales_desc' && styles.sortButtonActive]}
          onPress={() => setSortBy(sortBy === 'sales_desc' ? '' : 'sales_desc')}
        >
          <Text style={[styles.sortText, sortBy === 'sales_desc' && styles.sortTextActive]}>
            Популярные
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Display */}
      {queryError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color={theme.colors.error} />
          <Text style={styles.errorText}>
            {queryError.message || 'Ошибка загрузки товаров'}
          </Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Products List */}
      {isLoading && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.cyan} />
          <Text style={styles.loadingText}>Загрузка товаров...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color={theme.colors.text.muted} />
          <Text style={styles.emptyText}>Товары не найдены</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              tintColor={theme.colors.cyan}
            />
          }
        >
          <View style={styles.productsGrid}>
            {products.map((item, index) => renderProduct(item, index))}
          </View>
          {page < totalPages - 1 && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={() => setPage(page + 1)}
            >
              <Text style={styles.loadMoreText}>Загрузить еще</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    margin: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  sortButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  sortButtonActive: {
    backgroundColor: theme.colors.cyan,
    borderColor: theme.colors.cyan,
  },
  sortText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  sortTextActive: {
    color: theme.colors.text.primary,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: ITEM_WIDTH,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    ...theme.shadows.md,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: ITEM_WIDTH,
    backgroundColor: theme.colors.background.tertiary,
  },
  productInfo: {
    padding: theme.spacing.md,
  },
  productName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    minHeight: 36,
  },
  productPrice: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.cyan,
    marginBottom: theme.spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.cyan,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: 4,
  },
  addButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing['3xl'],
  },
  loadingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  loadMoreButton: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.cyan,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  loadMoreText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

export default CatalogScreen;
