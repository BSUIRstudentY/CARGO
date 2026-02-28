import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import api from '../api/axiosInstance';
import Toast from 'react-native-toast-message';

const SelfPickupScreen = () => {
  const [trackingNumbers, setTrackingNumbers] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!trackingNumbers || !deliveryAddress) {
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'Заполните все поля',
      });
      return;
    }

    setLoading(true);
    try {
      const numbers = trackingNumbers.split('\n').filter(n => n.trim());
      const response = await api.post('/orders/self-pickup', {
        trackingNumbers: numbers,
        deliveryAddress,
      });

      if (response.data) {
        Toast.show({
          type: 'success',
          text1: 'Успешно',
          text2: 'Заказ создан',
        });
        setTrackingNumbers('');
        setDeliveryAddress('');
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'Не удалось создать заказ',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Самовыкуп</Text>
        <Text style={styles.subtitle}>Добавьте трек-номера ваших посылок</Text>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Трек-номера (каждый с новой строки)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Введите трек-номера"
            value={trackingNumbers}
            onChangeText={setTrackingNumbers}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Адрес доставки</Text>
          <TextInput
            style={styles.input}
            placeholder="Введите адрес доставки"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Создание...' : 'Создать заказ'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 120,
  },
  button: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SelfPickupScreen;




