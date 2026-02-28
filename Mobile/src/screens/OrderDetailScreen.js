import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/axiosInstance';
import { theme } from '../config/theme';

const OrderDetailScreen = () => {
  const route = useRoute();
  const { orderId } = route.params;

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
      }
    },
  });

  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: theme.colors.purple,
      PAID: theme.colors.cyan,
      VERIFIED: theme.colors.cyan,
      PROCESSED: theme.colors.purple,
      SHIPPED: theme.colors.green,
      COMPLETED: theme.colors.green,
      REFUSED: theme.colors.error,
    };
    return statusColors[status] || theme.colors.text.muted;
  };

  const getStatusText = (status) => {
    const statusMap = {
      PENDING: 'В обработке',
      PAID: 'Оплачен',
      VERIFIED: 'Подтвержден',
      PROCESSED: 'Обработан',
      SHIPPED: 'Отправлен',
      COMPLETED: 'Завершен',
      REFUSED: 'Отклонен',
      RECEIVED: 'Получен',
    };
    return statusMap[status] || status;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.cyan} />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>Заказ не найден</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <LinearGradient
            colors={[theme.colors.gradient.from, theme.colors.gradient.via, theme.colors.gradient.to]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.orderNumberGradient}
          >
            <Text style={styles.orderNumberGradientText}>
              Заказ #{order.orderNumber || order.id}
            </Text>
          </LinearGradient>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(order.status)}20`, borderColor: getStatusColor(order.status) },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {getStatusText(order.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.orderDate}>
          {order.dateCreated
            ? new Date(order.dateCreated).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Дата не указана'}
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Товары</Text>
        {order.items?.map((item, index) => (
          <View key={item.id || index} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.productName || item.name || 'Товар'}
              </Text>
            </View>
            <View style={styles.itemDetails}>
              <View style={styles.itemDetailRow}>
                <Text style={styles.itemDetailLabel}>Количество:</Text>
                <Text style={styles.itemDetailValue}>{item.quantity || 1}</Text>
              </View>
              <View style={styles.itemDetailRow}>
                <Text style={styles.itemDetailLabel}>Цена:</Text>
                <Text style={styles.itemDetailValue}>
                  ${(item.priceAtTime || item.price || 0).toFixed(2)}
                </Text>
              </View>
            </View>
            {item.trackingNumber && (
              <View style={styles.trackingContainer}>
                <Ionicons name="location-outline" size={16} color={theme.colors.cyan} />
                <Text style={styles.trackingNumber}>
                  Трек-номер: {item.trackingNumber}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {order.deliveryAddress && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Адрес доставки</Text>
          <View style={styles.addressContainer}>
            <Ionicons name="home-outline" size={20} color={theme.colors.cyan} />
            <Text style={styles.addressText}>{order.deliveryAddress}</Text>
          </View>
        </View>
      )}

      {order.trackingNumber && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Трек-номер</Text>
          <View style={styles.trackingContainer}>
            <Ionicons name="location-outline" size={20} color={theme.colors.cyan} />
            <Text style={styles.trackingText}>{order.trackingNumber}</Text>
          </View>
        </View>
      )}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Стоимость</Text>
        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Товары:</Text>
            <Text style={styles.priceValue}>
              ${(order.totalClientPrice || 0).toFixed(2)}
            </Text>
          </View>
          {order.userDiscountApplied > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Скидка:</Text>
              <Text style={[styles.priceValue, styles.discount]}>
                -${order.userDiscountApplied.toFixed(2)}
              </Text>
            </View>
          )}
          {order.discountApplied > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Промокод:</Text>
              <Text style={[styles.priceValue, styles.discount]}>
                -${order.discountApplied.toFixed(2)}
              </Text>
            </View>
          )}
          {order.insuranceCost > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Страховка:</Text>
              <Text style={styles.priceValue}>
                ${order.insuranceCost.toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Итого:</Text>
            <LinearGradient
              colors={[theme.colors.gradient.from, theme.colors.gradient.via, theme.colors.gradient.to]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.totalGradient}
            >
              <Text style={styles.totalGradientText}>
                ${(order.totalClientPrice || 0).toFixed(2)}
              </Text>
            </LinearGradient>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
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
    textAlign: 'center',
  },
  headerCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...theme.shadows.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  orderNumberGradient: {
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  orderNumberGradientText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
  },
  statusText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  orderDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.muted,
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...theme.shadows.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  itemCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  itemHeader: {
    marginBottom: theme.spacing.sm,
  },
  itemName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  itemDetails: {
    gap: theme.spacing.xs,
  },
  itemDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemDetailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  itemDetailValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  trackingNumber: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.cyan,
    fontWeight: theme.typography.fontWeight.medium,
  },
  trackingText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.cyan,
    fontWeight: theme.typography.fontWeight.medium,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  addressText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    flex: 1,
    lineHeight: 22,
  },
  priceContainer: {
    gap: theme.spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  priceValue: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  discount: {
    color: theme.colors.success,
  },
  totalRow: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  totalGradient: {
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
  },
  totalGradientText: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
});

export default OrderDetailScreen;
