import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/axiosInstance';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { theme } from '../config/theme';
import { Button } from '../components/ui/Button';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { productId } = route.params;
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      try {
        const response = await api.get(`/products/${productId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
      }
    },
  });

  const { data: similarProducts } = useQuery({
    queryKey: ['similarProducts', productId],
    queryFn: async () => {
      try {
        const response = await api.get(`/products/similar/${productId}`);
        return response.data || [];
      } catch (error) {
        console.error('Error fetching similar products:', error);
        return [];
      }
    },
    enabled: !!productId,
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'info',
        text1: 'Требуется вход',
        text2: 'Войдите, чтобы добавить товар в корзину',
      });
      navigation.navigate('Login');
      return;
    }
    if (product) {
      addToCart(product, quantity);
      Toast.show({
        type: 'success',
        text1: 'Товар добавлен',
        text2: `${product.name} добавлен в корзину`,
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.cyan} />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>Товар не найден</Text>
        <Button
          title="Вернуться назад"
          onPress={() => navigation.goBack()}
          variant="primary"
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Image
        source={
          product.imageUrl
            ? { uri: product.imageUrl }
            : { uri: 'https://via.placeholder.com/400?text=No+Image' }
        }
        style={styles.image}
        resizeMode="cover"
        defaultSource={{ uri: 'https://via.placeholder.com/400?text=Loading' }}
      />

      <View style={styles.content}>
        <LinearGradient
          colors={[theme.colors.gradient.from, theme.colors.gradient.via, theme.colors.gradient.to]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.nameGradient}
        >
          <Text style={styles.nameGradientText}>{product.name}</Text>
        </LinearGradient>

        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Цена:</Text>
          <Text style={styles.price}>${product.price?.toFixed(2) || '0.00'}</Text>
        </View>

        {product.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Описание</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        )}

        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Количество:</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Ionicons name="remove" size={20} color={theme.colors.cyan} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Ionicons name="add" size={20} color={theme.colors.cyan} />
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title="Добавить в корзину"
          onPress={handleAddToCart}
          variant="primary"
          size="lg"
          iconLeft={<Ionicons name="cart-outline" size={20} color={theme.colors.text.primary} />}
          style={styles.addToCartButton}
        />

        {similarProducts && similarProducts.length > 0 && (
          <View style={styles.section}>
            <LinearGradient
              colors={[theme.colors.gradient.from, theme.colors.gradient.via, theme.colors.gradient.to]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sectionTitleGradient}
            >
              <Text style={styles.sectionTitleGradientText}>Похожие товары</Text>
            </LinearGradient>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.similarScroll}>
              {similarProducts.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.similarCard}
                  onPress={() => {
                    navigation.replace('ProductDetail', { productId: item.id });
                  }}
                >
                  <Image
                    source={
                      item.imageUrl
                        ? { uri: item.imageUrl }
                        : { uri: 'https://via.placeholder.com/200?text=No+Image' }
                    }
                    style={styles.similarImage}
                    defaultSource={{ uri: 'https://via.placeholder.com/200?text=Loading' }}
                  />
                  <Text style={styles.similarName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.similarPrice}>
                    ${item.price?.toFixed(2) || '0.00'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.error,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  image: {
    width: width,
    height: width,
    backgroundColor: theme.colors.background.tertiary,
  },
  content: {
    padding: theme.spacing.lg,
  },
  nameGradient: {
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  nameGradientText: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  priceLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  price: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.cyan,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  sectionTitleGradient: {
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    alignSelf: 'flex-start',
  },
  sectionTitleGradientText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  description: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quantityLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.cyan,
    backgroundColor: 'rgba(0,240,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    minWidth: 32,
    textAlign: 'center',
  },
  addToCartButton: {
    marginBottom: theme.spacing.xl,
  },
  similarScroll: {
    marginTop: theme.spacing.md,
  },
  similarCard: {
    width: 150,
    marginRight: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  similarImage: {
    width: '100%',
    height: 150,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.tertiary,
    marginBottom: theme.spacing.sm,
  },
  similarName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    minHeight: 36,
  },
  similarPrice: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.cyan,
  },
});

export default ProductDetailScreen;
