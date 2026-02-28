import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/axiosInstance';
import Toast from 'react-native-toast-message';

const SupportScreen = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: tickets } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await api.get('/tickets');
      return response.data || [];
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/tickets', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tickets']);
      setSubject('');
      setMessage('');
      Toast.show({
        type: 'success',
        text1: 'Успешно',
        text2: 'Тикет создан',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'Не удалось создать тикет',
      });
    },
  });

  const handleSubmit = () => {
    if (!subject || !message) {
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'Заполните все поля',
      });
      return;
    }

    createTicketMutation.mutate({
      subject,
      message,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return '#f59e0b';
      case 'RESOLVED':
        return '#059669';
      case 'CLOSED':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      OPEN: 'Открыт',
      RESOLVED: 'Решен',
      CLOSED: 'Закрыт',
    };
    return statusMap[status] || status;
  };

  const renderTicket = ({ item }) => (
    <TouchableOpacity style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketSubject}>{item.subject}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(item.status)}15` },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      <Text style={styles.ticketMessage} numberOfLines={2}>
        {item.message}
      </Text>
      <Text style={styles.ticketDate}>
        {new Date(item.createdAt).toLocaleDateString('ru-RU')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Создать обращение</Text>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Тема</Text>
          <TextInput
            style={styles.input}
            placeholder="Введите тему обращения"
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Сообщение</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Опишите вашу проблему"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            createTicketMutation.isPending && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={createTicketMutation.isPending}
        >
          <Text style={styles.submitButtonText}>
            {createTicketMutation.isPending ? 'Отправка...' : 'Отправить'}
          </Text>
        </TouchableOpacity>

        {tickets && tickets.length > 0 && (
          <View style={styles.ticketsSection}>
            <Text style={styles.sectionTitle}>Мои обращения</Text>
            <FlatList
              data={tickets}
              renderItem={renderTicket}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}
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
  submitButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  ticketsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ticketMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  ticketDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default SupportScreen;




