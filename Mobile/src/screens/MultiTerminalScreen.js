import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { theme } from '../config/theme';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import Toast from 'react-native-toast-message';

const MultiTerminalScreen = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState({
    id: null,
    name: '',
    url: '',
    price: '',
    imageUrl: '',
    description: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadSavedProducts();
  }, []);

  useEffect(() => {
    saveProducts();
  }, [products]);

  const loadSavedProducts = async () => {
    try {
      const saved = await AsyncStorage.getItem('savedProducts');
      if (saved) {
        setProducts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved products:', error);
    }
  };

  const saveProducts = async () => {
    try {
      await AsyncStorage.setItem('savedProducts', JSON.stringify(products));
    } catch (error) {
      console.error('Error saving products:', error);
    }
  };

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleFieldChange = (field, value) => {
    setProduct((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!product.name.trim()) newErrors.name = 'Название обязательно';
    if (!product.url.trim()) newErrors.url = 'URL товара обязателен';
    if (product.price && isNaN(parseFloat(product.price))) newErrors.price = 'Цена должна быть числом';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveProduct = () => {
    if (!validateForm()) {
      return;
    }
    const productData = {
      id: product.id || generateId(),
      name: product.name.trim(),
      url: product.url.trim(),
      price: parseFloat(product.price) || 0,
      imageUrl: product.imageUrl.trim() || '',
      description: product.description.trim() || '',
    };
    setProducts((prev) => [productData, ...prev]);
    setProduct({
      id: null,
      name: '',
      url: '',
      price: '',
      imageUrl: '',
      description: '',
    });
    setErrors({});
    setIsFormVisible(false);
  };

  const cancelProduct = () => {
    setProduct({
      id: null,
      name: '',
      url: '',
      price: '',
      imageUrl: '',
      description: '',
    });
    setErrors({});
    setIsFormVisible(false);
  };

  const removeProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleAddToCart = async (item) => {
    if (!isAuthenticated) {
      Toast.show({
        type: 'info',
        text1: 'Требуется вход',
        text2: 'Войдите, чтобы добавить товар в корзину',
      });
      navigation.navigate('Login');
      return;
    }
    try {
      await addToCart({ ...item, id: item.id }, 1);
      Toast.show({
        type: 'success',
        text1: 'Товар добавлен',
        text2: `${item.name} добавлен в корзину`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'Не удалось добавить товар в корзину',
      });
    }
  };

  const addAllToCart = async () => {
    if (products.length === 0) return;
    if (!isAuthenticated) {
      Toast.show({
        type: 'info',
        text1: 'Требуется вход',
        text2: 'Войдите, чтобы добавить товары в корзину',
      });
      navigation.navigate('Login');
      return;
    }
    try {
      for (const item of products) {
        await addToCart({ ...item, id: item.id }, 1);
      }
      setProducts([]);
      Toast.show({
        type: 'success',
        text1: 'Успешно',
        text2: 'Все товары добавлены в корзину',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'Не удалось добавить товары в корзину',
      });
    }
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name || 'Без названия'}
        </Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeProduct(item.id)}
        >
          <Ionicons name="close-circle" size={24} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
      {item.imageUrl ? (
        <View style={styles.imageContainer}>
          <Text style={styles.imagePlaceholder}>📷 Изображение</Text>
        </View>
      ) : null}
      {item.price > 0 && (
        <Text style={styles.productPrice}>¥{item.price.toFixed(2)}</Text>
      )}
      {item.description && (
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      <TouchableOpacity
        style={styles.addToCartButton}
        onPress={() => handleAddToCart(item)}
      >
        <Ionicons name="cart-outline" size={16} color={theme.colors.text.primary} />
        <Text style={styles.addToCartText}>В корзину</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Многофункциональный терминал</Text>
          <Text style={styles.subtitle}>Добавляйте товары с китайских площадок</Text>
        </View>

        <View style={styles.instructionCard}>
          <View style={styles.instructionHeader}>
            <Ionicons name="document-text-outline" size={24} color={theme.colors.cyan} />
            <Text style={styles.instructionTitle}>Инструкция по использованию терминала</Text>
          </View>
          <View style={styles.instructionContent}>
            <Text style={styles.instructionText}>
              <Text style={styles.instructionBold}>1. Добавление товара</Text>{'\n'}
              Нажмите на кнопку "+" для открытия формы. Заполните название (обязательно) и URL (обязательно).
              Цена, фото и описание - необязательны.
            </Text>
            <Text style={styles.instructionText}>
              <Text style={styles.instructionBold}>2. Сохранение товара</Text>{'\n'}
              После заполнения нажмите "Сохранить". Товар будет сохранён локально.
            </Text>
            <Text style={styles.instructionText}>
              <Text style={styles.instructionBold}>3. Добавление в корзину</Text>{'\n'}
              Вы можете добавить товары в корзину по отдельности или все сразу.
            </Text>
          </View>
        </View>

        {!isFormVisible ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsFormVisible(true)}
          >
            <Ionicons name="add" size={24} color={theme.colors.text.primary} />
            <Text style={styles.addButtonText}>Добавить товар</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Новый товар</Text>
              <TouchableOpacity onPress={cancelProduct}>
                <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <Input
              label="Название *"
              placeholder="Скопируйте название с китайского сайта"
              value={product.name}
              onChangeText={(value) => handleFieldChange('name', value)}
              error={errors.name}
            />

            <Input
              label="URL *"
              placeholder="Вставьте прямую ссылку на товар"
              value={product.url}
              onChangeText={(value) => handleFieldChange('url', value)}
              keyboardType="url"
              autoCapitalize="none"
              error={errors.url}
            />

            <Input
              label="Цена (¥)"
              placeholder="Стоимость товара в юанях"
              value={product.price}
              onChangeText={(value) => handleFieldChange('price', value)}
              keyboardType="numeric"
              error={errors.price}
            />

            <Input
              label="Ссылка на фото"
              placeholder="URL изображения товара"
              value={product.imageUrl}
              onChangeText={(value) => handleFieldChange('imageUrl', value)}
              keyboardType="url"
              autoCapitalize="none"
            />

            <Input
              label="Описание"
              placeholder="Размер, цвет, количество и т.д."
              value={product.description}
              onChangeText={(value) => handleFieldChange('description', value)}
              multiline
              numberOfLines={3}
            />

            <View style={styles.formButtons}>
              <Button
                title="Сохранить"
                onPress={saveProduct}
                variant="primary"
                size="md"
                style={styles.formButton}
              />
              <Button
                title="Отмена"
                onPress={cancelProduct}
                variant="outline"
                size="md"
                style={styles.formButton}
              />
            </View>
          </View>
        )}

        {products.length > 0 && (
          <View style={styles.productsSection}>
            <View style={styles.productsHeader}>
              <Text style={styles.productsTitle}>
                Сохранённые товары ({products.length})
              </Text>
              <Button
                title="Добавить все в корзину"
                onPress={addAllToCart}
                variant="secondary"
                size="sm"
              />
            </View>

            <FlatList
              data={products}
              renderItem={renderProduct}
              keyExtractor={(item, index) => item?.id?.toString() || `product-${index}`}
              scrollEnabled={false}
              numColumns={1}
            />
          </View>
        )}

        {products.length === 0 && !isFormVisible && (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={theme.colors.text.muted} />
            <Text style={styles.emptyText}>Нет сохранённых товаров</Text>
            <Text style={styles.emptySubtext}>
              Добавьте товары с китайских маркетплейсов
            </Text>
          </View>
        )}
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
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  instructionCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  instructionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.cyan,
    marginLeft: theme.spacing.sm,
  },
  instructionContent: {
    gap: theme.spacing.md,
  },
  instructionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  instructionBold: {
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,240,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.3)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  addButtonText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.cyan,
    marginLeft: theme.spacing.sm,
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  formTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  formButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  formButton: {
    flex: 1,
  },
  productsSection: {
    marginTop: theme.spacing.lg,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  productsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  productCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  productName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  removeButton: {
    padding: theme.spacing.xs,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  imagePlaceholder: {
    fontSize: theme.typography.fontSize['2xl'],
  },
  productPrice: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.cyan,
    marginBottom: theme.spacing.sm,
  },
  productDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  addToCartText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['3xl'],
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.md,
    fontWeight: theme.typography.fontWeight.medium,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
});

export default MultiTerminalScreen;
