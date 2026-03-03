import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/axiosInstance';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { theme } from '../config/theme';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  const { getTotalItems } = useCart();
  const cartItemsCount = isAuthenticated ? getTotalItems() : 0;
  const [fadeAnim] = useState(new Animated.Value(0));

  const { data: news } = useQuery({
    queryKey: ['news', 'latest'],
    queryFn: async () => {
      const response = await api.get('/news', { params: { page: 0, size: 3 } });
      return response.data.content || [];
    },
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const advantages = [
    {
      icon: 'time-outline',
      title: 'Быстрая доставка',
      description: 'Доставка из Китая за 18–35 дней через Карго',
      accent: theme.colors.cyan,
    },
    {
      icon: 'cash-outline',
      title: 'Фиксированная цена',
      description: '$7 за кг + тарифы Европочты, без скрытых платежей',
      accent: theme.colors.purple,
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Страховка груза',
      description: 'Гарантия возврата полной стоимости груза, если что-то с ним случится по нашей вине',
      accent: theme.colors.green,
    },
    {
      icon: 'search-outline',
      title: 'Проверка товаров',
      description: 'Проверка целостности и качества (от $5)',
      accent: theme.colors.cyan,
    },
    {
      icon: 'globe-outline',
      title: 'Упрощённая таможня',
      description: 'Помощь с таможенными процедурами',
      accent: theme.colors.purple,
    },
    {
      icon: 'car-outline',
      title: 'Отслеживание',
      description: 'Трек-номер и уведомления в Профиле',
      accent: theme.colors.green,
    },
    {
      icon: 'card-outline',
      title: 'Прозрачная оплата',
      description: 'Оплата через Альфа-Банк (Visa, Mastercard)',
      accent: theme.colors.cyan,
    },
    {
      icon: 'star-outline',
      title: 'Опыт',
      description: 'Более 5 лет успешной доставки из Китая',
      accent: theme.colors.purple,
    },
  ];

  const stats = [
    { number: '1000+', label: 'Товаров из Китая' },
    { number: '90%', label: 'Клиентов рекомендуют' },
    { number: '5', label: 'Складов-партнёров' },
    { number: '24/7', label: 'Поддержка клиентов' },
  ];

  const marketplaces = [
    { name: 'Pinduoduo', text: '拼多多' },
    { name: 'Taobao', text: '淘宝' },
    { name: '1688', text: '1688' },
    { name: 'GoFish', text: 'GoFish' },
    { name: 'WeChat', text: '微信' },
    { name: 'Poizon', text: 'Poizon' },
    { name: '95', text: '95' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
        <View style={styles.heroContent}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Title with Gradient */}
          <View style={styles.titleContainer}>
            <LinearGradient
              colors={[theme.colors.gradient.from, theme.colors.gradient.via, theme.colors.gradient.to]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientText}
            >
              <Text style={styles.heroTitleGradient}>Доставка из Китая</Text>
            </LinearGradient>
            <Text style={styles.heroSubtitle}>под ключ</Text>
          </View>

          {/* Description */}
          <Text style={styles.heroDescription}>
            Заказывайте товары из Китая без хлопот: от выбора в{' '}
            <Text style={styles.heroDescriptionAccent}>Каталоге</Text> (проверенные товары, которые уже заказывали) или{' '}
            <Text style={styles.heroDescriptionAccentPurple}>Терминале</Text> (любые товары по ссылке) до доставки в Беларусь за 18–35 дней по цене $7/кг
          </Text>

          {/* Info Notice */}
          <View style={styles.infoNotice}>
            <Text style={styles.infoNoticeText}>
              <Text style={styles.infoNoticeBold}>💡 Важно:</Text> Каталог содержит только товары, которые уже заказывали наши клиенты. Для заказа других товаров используйте Терминал.
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.heroButtons}>
            <TouchableOpacity
              style={styles.heroButtonPrimary}
              onPress={() => navigation.navigate('Catalog')}
            >
              <Text style={styles.heroButtonPrimaryText}>Перейти в каталог</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.heroButtonSecondary}
              onPress={() => navigation.navigate('MultiTerminal')}
            >
              <Text style={styles.heroButtonSecondaryText}>Заказать товар</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Advantages Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <LinearGradient
            colors={[theme.colors.gradient.from, theme.colors.gradient.via, theme.colors.gradient.to]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionTitleGradient}
          >
            <Text style={styles.sectionTitleGradientText}>Преимущества</Text>
          </LinearGradient>
          <Text style={styles.sectionTitleSuffix}> доставки с нами</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Мы делаем доставку из Китая простой, быстрой и надежной
        </Text>

        <View style={styles.advantagesGrid}>
          {advantages.map((advantage, index) => (
            <View key={index} style={styles.advantageCard}>
              <View style={[styles.advantageIconContainer, { borderColor: `${advantage.accent}30` }]}>
                <Ionicons name={advantage.icon} size={28} color={advantage.accent} />
              </View>
              <Text style={styles.advantageTitle}>{advantage.title}</Text>
              <Text style={styles.advantageDescription}>{advantage.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <LinearGradient
                colors={[theme.colors.gradient.from, theme.colors.gradient.via]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.statNumberGradient}
              >
                <Text style={styles.statNumber}>{stat.number}</Text>
              </LinearGradient>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Marketplaces Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <LinearGradient
            colors={[theme.colors.gradient.from, theme.colors.gradient.via, theme.colors.gradient.to]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionTitleGradient}
          >
            <Text style={styles.sectionTitleGradientText}>С нами вы можете заказывать</Text>
          </LinearGradient>
          <Text style={styles.sectionTitleSuffix}> с этих сайтов</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Мы работаем со всеми популярными китайскими маркетплейсами
        </Text>

        <View style={styles.marketplacesContainer}>
          {marketplaces.map((marketplace, index) => (
            <TouchableOpacity key={index} style={styles.marketplaceCard}>
              <Text style={styles.marketplaceText}>{marketplace.text}</Text>
            </TouchableOpacity>
          ))}
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
  heroSection: {
    minHeight: Dimensions.get('window').height * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing.lg,
  },
  heroContent: {
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: theme.spacing['2xl'],
  },
  logo: {
    width: 160,
    height: 160,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  gradientText: {
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  heroTitleGradient: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.light,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
  },
  heroDescriptionAccent: {
    color: theme.colors.cyan,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  heroDescriptionAccentPurple: {
    color: theme.colors.purple,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  infoNotice: {
    backgroundColor: 'rgba(255,193,7,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.3)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    width: '100%',
  },
  infoNoticeText: {
    fontSize: theme.typography.fontSize.sm,
    color: '#ffeaa7',
    textAlign: 'center',
  },
  infoNoticeBold: {
    fontWeight: theme.typography.fontWeight.bold,
    color: '#ffc107',
  },
  heroButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  heroButtonPrimary: {
    flex: 1,
    backgroundColor: 'rgba(0,240,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.3)',
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  heroButtonPrimaryText: {
    color: theme.colors.cyan,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
  },
  heroButtonSecondary: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  heroButtonSecondaryText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.medium,
  },
  section: {
    paddingVertical: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitleGradient: {
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
  },
  sectionTitleGradientText: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  sectionTitleSuffix: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  advantagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  advantageCard: {
    width: (width - 48) / 2,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  advantageIconContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: 'rgba(0,240,255,0.05)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  advantageTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  advantageDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsSection: {
    paddingVertical: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  statItem: {
    width: (width - 48) / 2,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  statNumberGradient: {
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  statNumber: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  marketplacesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  marketplaceCard: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: 'rgba(0,240,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  marketplaceText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.cyan,
  },
});

export default HomeScreen;
