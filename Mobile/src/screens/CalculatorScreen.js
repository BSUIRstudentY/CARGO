import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/axiosInstance';
import { theme } from '../config/theme';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const CalculatorScreen = () => {
  const navigation = useNavigation();
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('');
  const [insurance, setInsurance] = useState(false);
  const [packaging, setPackaging] = useState('standard');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rates, setRates] = useState({
    USD_TO_BYN: 2.9994,
    CNY_TO_BYN: 0.41859,
  });
  const [shippingRate, setShippingRate] = useState(6.0);

  const packagingOptions = {
    standard: { label: 'Стандартная упаковка', cost: 3, description: 'Базовая упаковка для стандартных грузов' },
    premium: { label: 'Водонепроницаемая упаковка', cost: 5, description: 'Максимальная защита для ценных грузов' },
  };

  useEffect(() => {
    const fetchRates = async () => {
      setIsLoading(true);
      try {
        const [usdResponse, cnyResponse, shippingResponse] = await Promise.all([
          fetch('https://www.nbrb.by/api/exrates/rates/USD?parammode=2').then(r => r.json()),
          fetch('https://www.nbrb.by/api/exrates/rates/CNY?parammode=2').then(r => r.json()),
          api.get('/exchange-rates/shipping/current').catch(() => null),
        ]);
        setRates({
          USD_TO_BYN: usdResponse.Cur_OfficialRate,
          CNY_TO_BYN: cnyResponse.Cur_OfficialRate / cnyResponse.Cur_Scale,
        });
        if (shippingResponse && shippingResponse.data && shippingResponse.data.rate) {
          setShippingRate(shippingResponse.data.rate);
        }
        setError(null);
      } catch (err) {
        setError('Не удалось загрузить курсы валют, используются стандартные значения');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRates();
  }, []);

  const { yuan, usd, byn } = useMemo(() => {
    const priceNum = parseFloat(price);
    const weightNum = parseFloat(weight);
    let totalYuan = 0;
    let totalUsd = 0;
    let totalByn = 0;

    if ((isNaN(priceNum) || priceNum < 0) && (isNaN(weightNum) || weightNum < 0)) {
      if (price !== '' || weight !== '') {
        setError('Введите корректные значения для стоимости (не менее 0) или веса (не менее 0)');
      }
      return { yuan: 0, usd: 0, byn: 0 };
    }

    setError(null);

    if (!isNaN(priceNum) && priceNum >= 0) {
      totalYuan = priceNum;
      if (insurance) {
        totalYuan += totalYuan * 0.05;
      }
      totalByn += totalYuan * rates.CNY_TO_BYN;
    }

    if (!isNaN(weightNum) && weightNum >= 0) {
      totalUsd = weightNum * shippingRate + packagingOptions[packaging].cost;
      totalByn += totalUsd * rates.USD_TO_BYN;
    }

    return { yuan: totalYuan, usd: totalUsd, byn: totalByn };
  }, [price, weight, insurance, packaging, rates, shippingRate]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.card}>
        <View style={styles.header}>
          <LinearGradient
            colors={[theme.colors.gradient.from, theme.colors.gradient.via, theme.colors.gradient.to]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}
          >
            <Text style={styles.titleGradientText}>Калькулятор стоимости</Text>
          </LinearGradient>
          <Text style={styles.subtitle}>
            Рассчитайте стоимость доставки вашего товара из Китая в Беларусь
          </Text>
        </View>

        <Text style={styles.description}>
          Включает цену товара, страховку (5%, опционально), доставку по актуальному курсу и упаковку.{'\n'}
          Введите стоимость или вес для частичного расчета. Курсы валют обновляются через НБРБ.
        </Text>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.cyan} />
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Input
            label="Стоимость товара (¥)"
            placeholder="Введите стоимость в юанях"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            style={styles.input}
          />

          <Input
            label="Вес товара (кг)"
            placeholder="Введите вес в килограммах"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            style={styles.input}
          />

          <View style={styles.checkboxContainer}>
            <Switch
              value={insurance}
              onValueChange={setInsurance}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.colors.cyan }}
              thumbColor={insurance ? theme.colors.cyan : '#f4f3f4'}
            />
            <Text style={styles.checkboxLabel}>
              Добавить страховку (5% от стоимости товара)
            </Text>
          </View>

          <View style={styles.packagingContainer}>
            <Text style={styles.label}>Вид упаковки</Text>
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
                  <Text style={styles.packagingDescription}>{option.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.resultsCard}>
            <LinearGradient
              colors={[theme.colors.gradient.from, theme.colors.gradient.via, theme.colors.gradient.to]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.resultsTitleGradient}
            >
              <Text style={styles.resultsTitleGradientText}>Итоговая стоимость</Text>
            </LinearGradient>

            <View style={styles.resultsContent}>
              {yuan > 0 && (
                <Text style={styles.resultItem}>
                  Товар {insurance ? '(с учетом страховки)' : ''}:{' '}
                  <Text style={styles.resultValueCyan}>¥{yuan.toFixed(2)}</Text>
                </Text>
              )}
              {usd > 0 && (
                <Text style={styles.resultItem}>
                  Доставка (с учетом упаковки):{' '}
                  <Text style={styles.resultValuePurple}>${usd.toFixed(2)}</Text>
                </Text>
              )}
              <Text style={styles.resultTotal}>
                Итого:{' '}
                <LinearGradient
                  colors={[theme.colors.gradient.from, theme.colors.gradient.via, theme.colors.gradient.to]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.resultTotalGradient}>BYN {byn.toFixed(2)}</Text>
                </LinearGradient>
              </Text>
            </View>
          </View>

          <Button
            title="Перейти в каталог"
            onPress={() => navigation.navigate('Catalog')}
            variant="primary"
            size="lg"
            style={styles.button}
          />
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
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...theme.shadows.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  titleGradient: {
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  titleGradientText: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10,13,20,0.7)',
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  errorContainer: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.base,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
  form: {
    gap: theme.spacing.lg,
  },
  input: {
    marginBottom: 0,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  checkboxLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
    flex: 1,
  },
  packagingContainer: {
    marginTop: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  packagingButtons: {
    gap: theme.spacing.md,
  },
  packagingButton: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  packagingButtonActive: {
    borderColor: theme.colors.cyan,
    backgroundColor: 'rgba(0,240,255,0.1)',
  },
  packagingButtonText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  packagingButtonTextActive: {
    color: theme.colors.cyan,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  packagingDescription: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.muted,
    marginTop: theme.spacing.xs,
  },
  resultsCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginTop: theme.spacing.md,
  },
  resultsTitleGradient: {
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    alignSelf: 'center',
  },
  resultsTitleGradientText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  resultsContent: {
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  resultItem: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  resultValueCyan: {
    color: theme.colors.cyan,
    fontWeight: theme.typography.fontWeight.bold,
  },
  resultValuePurple: {
    color: theme.colors.purple,
    fontWeight: theme.typography.fontWeight.bold,
  },
  resultTotal: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  resultTotalGradient: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  button: {
    marginTop: theme.spacing.md,
  },
});

export default CalculatorScreen;
