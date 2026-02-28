import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { theme } from '../../config/theme';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!email || !password || !username) {
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'Заполните все обязательные поля',
      });
      return;
    }

    if (password.length < 8) {
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'Пароль должен содержать минимум 8 символов',
      });
      return;
    }

    setLoading(true);
    const result = await register(email, password, username, referralCode || null);
    setLoading(false);

    if (result.success) {
      Toast.show({
        type: 'success',
        text1: 'Успешно',
        text2: 'Регистрация прошла успешно',
      });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Ошибка регистрации',
        text2: result.error || 'Не удалось зарегистрироваться',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Регистрация</Text>
          <Text style={styles.subtitle}>Создайте аккаунт в Fluvion</Text>

          <Input
            label="Имя пользователя"
            placeholder="Введите имя"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="words"
          />

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
            placeholder="Минимум 8 символов"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <Input
            label="Реферальный код (необязательно)"
            placeholder="Введите реферальный код"
            value={referralCode}
            onChangeText={setReferralCode}
            autoCapitalize="none"
          />

          <Button
            title={loading ? 'Регистрация...' : 'Зарегистрироваться'}
            onPress={handleRegister}
            disabled={loading}
            loading={loading}
            variant="primary"
            size="lg"
            style={styles.button}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Уже есть аккаунт? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Войти</Text>
            </TouchableOpacity>
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
  content: {
    width: '100%',
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing['2xl'],
    textAlign: 'center',
  },
  button: {
    marginTop: theme.spacing.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  loginText: {
    color: theme.colors.text.muted,
    fontSize: theme.typography.fontSize.sm,
  },
  loginLink: {
    color: theme.colors.primary.main,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

export default RegisterScreen;

