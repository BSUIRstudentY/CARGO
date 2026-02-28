import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { theme } from '../../config/theme';
import api from '../../api/axiosInstance';

const LoginRegisterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(route.params?.mode !== 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isReferralValid, setIsReferralValid] = useState(false);
  const [referralMessage, setReferralMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (route.params?.ref) {
      setReferralCode(route.params.ref);
      setIsLogin(false);
      validateReferralCode(route.params.ref);
    }
  }, [route.params]);

  useEffect(() => {
    if (password && !isLogin) {
      setPasswordStrength(checkPasswordStrength(password));
    } else {
      setPasswordStrength({ score: 0, message: '' });
    }
  }, [password, isLogin]);

  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = '';
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 0:
      case 1:
        message = 'Слабый пароль';
        break;
      case 2:
        message = 'Средний пароль';
        break;
      case 3:
        message = 'Хороший пароль';
        break;
      case 4:
        message = 'Отличный пароль';
        break;
      default:
        message = '';
    }
    return { score, message };
  };

  const validateReferralCode = async (code) => {
    if (!code || code.trim() === '') {
      setIsReferralValid(false);
      setReferralMessage('');
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get('/auth/validate-referral', { params: { code: code.trim() } });
      if (res.data === true) {
        setIsReferralValid(true);
        setReferralMessage('Реферальный код действителен!');
        setError('');
      } else {
        setIsReferralValid(false);
        setReferralMessage('Неверный реферальный код');
        setError('Неверный реферальный код');
      }
    } catch (err) {
      setIsReferralValid(false);
      setReferralMessage('Ошибка при проверке кода');
      setError('Ошибка при проверке кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyReferral = async () => {
    if (!referralCode) {
      setReferralMessage('Введите реферальный код');
      setError('Введите реферальный код');
      return;
    }
    await validateReferralCode(referralCode);
  };

  const handleSubmit = async () => {
    setError('');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Введите действительный email');
      return;
    }
    if (!password) {
      setError('Введите пароль');
      return;
    }
    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('Пароли не совпадают');
        return;
      }
      if (passwordStrength.score < 2) {
        setError('Пароль слишком слабый. Используйте минимум 8 символов, включая заглавные буквы и цифры.');
        return;
      }
      if (!username) {
        setError('Введите логин');
        return;
      }
      if (referralCode && !isReferralValid) {
        setError('Пожалуйста, примените действительный реферальный код или оставьте поле пустым');
        return;
      }
      if (!termsAccepted) {
        setError('Пожалуйста, примите условия использования');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          Toast.show({
            type: 'success',
            text1: 'Успешно',
            text2: 'Вы успешно вошли',
          });
        } else {
          setError(result.error || 'Неверный email или пароль');
        }
      } else {
        const result = await register(email, password, username, referralCode || null);
        if (result.success) {
          Toast.show({
            type: 'success',
            text1: 'Успешно',
            text2: 'Регистрация прошла успешно',
          });
        } else {
          setError(result.error || 'Не удалось зарегистрироваться');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Ошибка аутентификации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Ionicons name="person" size={40} color={theme.colors.cyan} />
            <LinearGradient
              colors={[theme.colors.gradient.from, theme.colors.gradient.via, theme.colors.gradient.to]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.titleGradient}
            >
              <Text style={styles.titleGradientText}>
                {isLogin ? 'Вход' : 'Регистрация'}
              </Text>
            </LinearGradient>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={theme.colors.cyan} />
            </View>
          )}

          <View style={styles.form}>
            {!isLogin && (
              <Input
                label="Имя пользователя"
                placeholder="Введите имя"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="words"
              />
            )}

            <Input
              label="Email"
              placeholder="Введите email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label="Пароль"
              placeholder={isLogin ? 'Введите пароль' : 'Минимум 8 символов'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />

            {!isLogin && passwordStrength.message && (
              <View style={styles.passwordStrengthContainer}>
                <Text style={styles.passwordStrengthText}>
                  {passwordStrength.message}
                </Text>
              </View>
            )}

            {!isLogin && (
              <Input
                label="Подтвердите пароль"
                placeholder="Повторите пароль"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            )}

            {!isLogin && (
              <View style={styles.referralContainer}>
                <Input
                  label="Реферальный код (необязательно)"
                  placeholder="Введите реферальный код"
                  value={referralCode}
                  onChangeText={setReferralCode}
                  autoCapitalize="characters"
                />
                {referralCode && (
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={handleApplyReferral}
                    disabled={isLoading}
                  >
                    <Text style={styles.applyButtonText}>Применить</Text>
                  </TouchableOpacity>
                )}
                {referralMessage && (
                  <Text
                    style={[
                      styles.referralMessage,
                      isReferralValid && styles.referralMessageValid,
                    ]}
                  >
                    {referralMessage}
                  </Text>
                )}
              </View>
            )}

            {!isLogin && (
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setTermsAccepted(!termsAccepted)}
              >
                <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                  {termsAccepted && (
                    <Ionicons name="checkmark" size={16} color={theme.colors.text.primary} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  Я принимаю условия использования и политику конфиденциальности
                </Text>
              </TouchableOpacity>
            )}

            <Button
              title={isLoading ? (isLogin ? 'Вход...' : 'Регистрация...') : (isLogin ? 'Войти' : 'Зарегистрироваться')}
              onPress={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              variant="primary"
              size="lg"
              style={styles.submitButton}
            />

            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>
                {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.switchLink}>
                  {isLogin ? 'Зарегистрироваться' : 'Войти'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  titleGradient: {
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
  },
  titleGradientText: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
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
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10,13,20,0.8)',
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  form: {
    gap: theme.spacing.md,
  },
  passwordStrengthContainer: {
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  passwordStrengthText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.muted,
  },
  referralContainer: {
    marginTop: theme.spacing.sm,
  },
  applyButton: {
    backgroundColor: 'rgba(0,240,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,240,255,0.3)',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
    alignItems: 'center',
  },
  applyButtonText: {
    color: theme.colors.cyan,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  referralMessage: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  referralMessageValid: {
    color: theme.colors.success,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.cyan,
    borderColor: theme.colors.cyan,
  },
  checkboxLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  switchText: {
    color: theme.colors.text.muted,
    fontSize: theme.typography.fontSize.sm,
  },
  switchLink: {
    color: theme.colors.cyan,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

export default LoginRegisterScreen;




