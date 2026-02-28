import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { theme } from '../config/theme';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Toast from 'react-native-toast-message';

const CartScreen = () => {
  const navigation = useNavigation();
  const { isAuthenticated, user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, clearCart, confirmOrder, loading } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountType, setDiscountType] = useState(null);
  const [discountValue, setDiscountValue] = useState(0);
  const [promoError, setPromoError] = useState(null);
  const [insurance, setInsurance] = useState(false);
  const [packaging, setPackaging] = useState('standard');
  const [userDiscountPercent, setUserDiscountPercent] = useState(0);
  const [localQuantities, setLocalQuantities] = useState({});
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const packagingOptions = {
    standard: { label: 'Стандартная упаковка', cost: 3 },
    premium: { label: 'Водонепроницаемая упаковка', cost: 5 },
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
    const initialQuantities = cartItems.reduce((acc, item) => {
      const id = item.product?.id || item.id;
      return {
        ...acc,
        [id]: item.quantity || 1,
      };
    }, {});
    setLocalQuantities(initialQuantities);
  }, [cartItems, isAuthenticated]);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/users/me');
      if (response?.data) {
        setUserDiscountPercent(response.data.totalDiscount || 0);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const validatePromocode = async (code) => {
    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setPromoError('Введите промокод');
      setPromoApplied(false);
      setDiscountType(null);
      setDiscountValue(0);
      return;
    }
    try {
      const response = await api.post('/promocodes/validate', { code: trimmedCode });
      if (response?.data) {
        setDiscountType(response.data.discountType);
        setDiscountValue(response.data.discountValue);
        setPromoApplied(true);
        setPromoError(null);
      }
    } catch (error) {
      const errorMessage = error.response?.data || 'Ошибка при проверке промокода';
      setPromoError(errorMessage);
      setDiscountType(null);
      setDiscountValue(0);
      setPromoApplied(false);
    }
  };

  const handlePromoCodeChange = async (text) => {
    setPromoCode(text);
    setDiscountValue(0);
    setPromoError(null);
    setPromoApplied(false);
    if (text.trim()) {
      await validatePromocode(text);
    }
  };

  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const id = item.product?.id || item.id;
      const qty = localQuantities[id] || item.quantity || 1;
      return sum + (item.product?.price || item.price || 0) * qty;
    }, 0);
  }, [cartItems, localQuantities]);

  const userDiscount = useMemo(() => total * (userDiscountPercent / 100), [total, userDiscountPercent]);
  const promocodeDiscount = useMemo(
    () => (discountType === 'PERCENTAGE' ? total * (discountValue / 100) : discountValue),
    [discountType, discountValue, total]
  );
  const totalDiscount = useMemo(() => userDiscount + promocodeDiscount, [userDiscount, promocodeDiscount]);
  const insuranceCost = useMemo(() => (insurance ? total * 0.05 : 0), [insurance, total]);
  const finalTotal = useMemo(() => Math.max(0, total - totalDiscount + insuranceCost), [total, totalDiscount, insuranceCost]);

  const handleQuantityChange = (productId, newQuantity) => {
    const qty = Math.max(1, parseInt(newQuantity, 10) || 1);
    setLocalQuantities((prev) => ({ ...prev, [productId]: qty }));
    updateQuantity(productId, qty);
  };

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Корзина пуста',
        text2: 'Добавьте товары в корзину',
      });
      return;
    }
    if (!deliveryAddress?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'Выберите отделение почты',
      });
      return;
    }
    if (!phone?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'Укажите номер телефона',
      });
      return;
    }
    if (!lastName?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'Укажите фамилию',
      });
      return;
    }
    if (!firstName?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'Укажите имя',
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const response = await confirmOrder(
        deliveryAddress,
        phone,
        lastName,
        firstName,
        middleName || null,
        promoApplied ? promoCode : null,
        insurance,
        discountType,
        discountValue,
        packaging
      );
      Toast.show({
        type: 'success',
        text1: 'Заказ создан',
        text2: 'Ваш заказ успешно создан',
      });
      navigation.navigate('OrderDetail', { orderId: response.orderId });
    } catch (err) {
      const errorMsg = err.message || 'Не удалось создать заказ';
      setError(errorMsg);
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderItem = ({ item, index }) => {
    const productId = item.product?.id || item.id;
    const currentQty = localQuantities[productId] || item.quantity || 1;
    const itemPrice = item.product?.price || item.price || 0;
    const itemTotal = itemPrice * currentQty;

    return (
      <View style={styles.cartItem}>
        <Image
          source={
            item.product?.imageUrl || item.imageUrl
              ? { uri: item.product?.imageUrl || item.imageUrl }
              : { uri: 'https://via.placeholder.com/200?text=No+Image' }
          }
          style={styles.itemImage}
          defaultSource={{ uri: 'https://via.placeholder.com/200?text=Loading' }}
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.product?.name || item.name || 'Товар'}
          </Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(productId, currentQty - 1)}
              disabled={currentQty <= 1}
            >
              <Ionicons name="remove" size={16} color={theme.colors.cyan} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{currentQty}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(productId, currentQty + 1)}
            >
              <Ionicons name="add" size={16} color={theme.colors.cyan} />
            </TouchableOpacity>
          </View>
          <Text style={styles.itemTotal}>¥{itemTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromCart(productId)}
        >
          <Ionicons name="close-circle" size={24} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={theme.colors.text.muted} />
          <Text style={styles.emptyTitle}>Корзина пуста</Text>
          <Text style={styles.emptyText}>Добавьте товары из каталога</Text>
          <Button
            title="Перейти в каталог"
            onPress={() => navigation.navigate('Catalog')}
            variant="primary"
            size="lg"
            iconLeft={<Ionicons name="grid-outline" size={20} color={theme.colors.text.primary} />}
            style={styles.emptyButton}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <LinearGradient
            colors={[theme.colors.gradient.from, theme.colors.gradient.via, theme.colors.gradient.to]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}
          >
            <Text style={styles.titleGradientText}>Корзина</Text>
          </LinearGradient>
          <Text style={styles.subtitle}>Проверьте и оформите заказ</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Товары ({cartItems.length})</Text>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item, index) => (item.product?.id || item.id || index).toString()}
            scrollEnabled={false}
          />
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Сумма товаров:</Text>
            <Text style={styles.totalValue}>¥{total.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.checkoutSection}>
          <Text style={styles.checkoutTitle}>Оформление заказа</Text>

          <Input
            label="Отделение европочты *"
            placeholder="Введите адрес отделения"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
          />

          <Input
            label="Номер телефона *"
            placeholder="+375 (XX) XXX-XX-XX"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <View style={styles.nameRow}>
            <Input
              label="Фамилия *"
              placeholder="Фамилия"
              value={lastName}
              onChangeText={setLastName}
              style={styles.nameInput}
            />
            <Input
              label="Имя *"
              placeholder="Имя"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.nameInput}
            />
          </View>

          <Input
            label="Отчество (необязательно)"
            placeholder="Отчество"
            value={middleName}
            onChangeText={setMiddleName}
          />

          <View style={styles.packagingContainer}>
            <Text style={styles.label}>Тип упаковки *</Text>
            <View style={styles.packagingButtons}>
              {Object.entries(packagingOptions).map(([key, option]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.packagingButton,
                    packaging === key && styles.packagingButtonActive,
                  ]}
                  onPress={() => setPackaging(key)}
                >
                  <Text
                    style={[
                      styles.packagingButtonText,
                      packaging === key && styles.packagingButtonTextActive,
                    ]}
                  >
                    {option.label} (${option.cost})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.checkboxContainer}>
            <Switch
              value={insurance}
              onValueChange={setInsurance}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.cyan }}
              thumbColor={insurance ? theme.colors.cyan : '#f4f3f4'}
            />
            <View style={styles.checkboxLabelContainer}>
              <Text style={styles.checkboxLabel}>Страховка</Text>
              <Text style={styles.checkboxDescription}>+5% от стоимости товаров</Text>
            </View>
          </View>

          <View style={styles.promoContainer}>
            <Input
              label="Промокод (необязательно)"
              placeholder="Введите промокод"
              value={promoCode}
              onChangeText={handlePromoCodeChange}
              error={promoError}
            />
            {promoApplied && (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                <Text style={styles.successText}>Промокод применён!</Text>
              </View>
            )}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Итого</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Товары:</Text>
              <Text style={styles.summaryValue}>¥{total.toFixed(2)}</Text>
            </View>
            {userDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Скидка:</Text>
                <Text style={[styles.summaryValue, styles.discount]}>-¥{userDiscount.toFixed(2)}</Text>
              </View>
            )}
            {promoApplied && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Промокод:</Text>
                <Text style={[styles.summaryValue, styles.discount]}>-¥{promocodeDiscount.toFixed(2)}</Text>
              </View>
            )}
            {insuranceCost > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Страховка:</Text>
                <Text style={styles.summaryValue}>+¥{insuranceCost.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.finalRow]}>
              <Text style={styles.finalLabel}>К оплате:</Text>
              <LinearGradient
                colors={[theme.colors.gradient.from, theme.colors.gradient.via, theme.colors.gradient.to]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.finalGradient}
              >
                <Text style={styles.finalGradientText}>¥{finalTotal.toFixed(2)}</Text>
              </LinearGradient>
            </View>
            <Text style={styles.paymentNote}>
              Оплата взимается не в момент оформления, а после проверки заказа администратором
            </Text>
          </View>

          <Button
            title={isSubmitting ? 'Оформление...' : 'Оформить заказ'}
            onPress={handleConfirmOrder}
            disabled={isSubmitting || loading || !deliveryAddress || !phone || !lastName || !firstName}
            loading={isSubmitting || loading}
            variant="primary"
            size="lg"
            style={styles.submitButton}
          />

          <Button
            title="Очистить корзину"
            onPress={clearCart}
            disabled={isSubmitting || loading}
            variant="outline"
            size="md"
            style={styles.clearButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
  },
  header: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  titleGradient: {
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  titleGradientText: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.sm,
    flex: 1,
  },
  productsSection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...theme.shadows.md,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.tertiary,
  },
  itemInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  itemName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.cyan,
    backgroundColor: 'rgba(0,240,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    minWidth: 24,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.cyan,
  },
  removeButton: {
    justifyContent: 'center',
    paddingLeft: theme.spacing.sm,
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  totalValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  checkoutSection: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...theme.shadows.lg,
  },
  checkoutTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  nameInput: {
    flex: 1,
    marginBottom: 0,
  },
  packagingContainer: {
    marginTop: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  packagingButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  packagingButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  packagingButtonActive: {
    borderColor: theme.colors.cyan,
    backgroundColor: 'rgba(0,240,255,0.1)',
  },
  packagingButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  packagingButtonTextActive: {
    color: theme.colors.cyan,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  checkboxLabelContainer: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  checkboxDescription: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.xs,
  },
  promoContainer: {
    marginTop: theme.spacing.md,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  successText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.success,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  summaryTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  discount: {
    color: theme.colors.success,
  },
  finalRow: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,240,255,0.3)',
  },
  finalLabel: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  finalGradient: {
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
  },
  finalGradientText: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  paymentNote: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
  clearButton: {
    marginTop: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: theme.spacing.md,
  },
});

export default CartScreen;
