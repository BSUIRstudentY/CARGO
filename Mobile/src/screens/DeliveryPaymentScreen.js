import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const DeliveryPaymentScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Доставка и оплата</Text>
        <Text style={styles.text}>Информация о доставке и оплате</Text>
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
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#6b7280',
  },
});

export default DeliveryPaymentScreen;




