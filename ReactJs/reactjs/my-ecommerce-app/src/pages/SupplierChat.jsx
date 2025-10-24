// Новый компонент SupplierChat.jsx (упрощенная версия чата, аналогично TicketChatPage)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../components/AuthProvider';
import { ArrowLeftIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

function SupplierChat() {
  const { id } = useParams(); // ID поставщика
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Поллинг каждые 5 сек
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/supplier-chats/${id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await api.post(`/supplier-chats/${id}/messages`, {
        content: newMessage,
        senderId: user.id,
        receiverId: id,
      });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  if (loading) {
    return <div>Загрузка чата...</div>;
  }

  return (
    <section className="min-h-screen bg-gray-900 p-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(`/supplier/${id}`)}
        className="mb-4 flex items-center text-cyan-400"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Назад
      </motion.button>
      <div className="bg-gray-800 rounded-lg h-[70vh] flex flex-col">
        <div className="p-4 border-b border-gray-700 flex-1 overflow-y-auto">
          {messages.map((msg, index) => (
            <motion.div
              key={msg.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-2 p-2 rounded-lg ${msg.senderId === user.id ? 'bg-cyan-500 ml-auto' : 'bg-gray-700'}`}
            >
              <p>{msg.content}</p>
              <span className="text-xs text-gray-400">{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </motion.div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-700 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Напишите сообщение..."
            className="flex-1 p-2 bg-gray-700 text-white rounded"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} className="p-2 bg-cyan-500 text-white rounded">
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default SupplierChat;