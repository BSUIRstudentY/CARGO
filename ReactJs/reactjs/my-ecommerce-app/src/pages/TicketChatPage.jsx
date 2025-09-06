import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import api from '../api/axiosInstance';
import { createStompClient } from '../api/stompClient';

function TicketChatPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState('');
  const messagesEndRef = useRef(null);
  const [theme, setTheme] = useState('dark');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [file, setFile] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedMessage, setEditedMessage] = useState('');
  const [reactions, setReactions] = useState({});
  const [showReactions, setShowReactions] = useState(null);
  const stompClientRef = useRef(null);
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  // Function to validate date
  const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date);
  };

  // Function to normalize timestamp (handles array format and string)
  const normalizeTimestamp = (timestamp) => {
    try {
      if (Array.isArray(timestamp)) {
        // Handle array format [year, month, day, hour, minute, second, nanosecond]
        const [year, month, day, hour, minute, second, nanosecond] = timestamp;
        // JavaScript months are 0-based, so subtract 1 from month
        const date = new Date(year, month - 1, day, hour || 0, minute || 0, second || 0, nanosecond ? Math.floor(nanosecond / 1000000) : 0);
        console.log('Normalized array timestamp:', timestamp, 'to', date.toISOString()); // Debug
        return isValidDate(date) ? date.toISOString() : new Date().toISOString();
      } else if (typeof timestamp === 'string') {
        // Handle ISO string or other string formats
        const date = new Date(timestamp);
        console.log('Normalized string timestamp:', timestamp, 'to', date.toISOString()); // Debug
        return isValidDate(date) ? date.toISOString() : new Date().toISOString();
      }
      console.warn('Invalid timestamp format:', timestamp);
      return new Date().toISOString();
    } catch (error) {
      console.error('Error normalizing timestamp:', timestamp, error);
      return new Date().toISOString();
    }
  };

  // Load ticket and messages
  useEffect(() => {
    if (!userEmail) {
      alert('Пожалуйста, войдите в систему.');
      return;
    }

    api.get(`/tickets/${ticketId}`)
      .then((res) => {
        const fetchedTicket = res.data;
        setTicket(fetchedTicket);
        setStatus(fetchedTicket.status);
        if (fetchedTicket.admin && fetchedTicket.admin.email === userEmail) {
          setIsAdmin(true);
        }
        return api.get(`/tickets/${ticketId}/messages`);
      })
      .then((res) => {
        const normalizedMessages = res.data
          ? res.data
              .map((msg) => {
                console.log('API Message timestamp:', msg.timestamp); // Debug
                return {
                  ...msg,
                  timestamp: normalizeTimestamp(msg.timestamp),
                };
              })
              .sort((a, b) => {
                try {
                  const dateA = new Date(a.timestamp);
                  const dateB = new Date(b.timestamp);
                  return isValidDate(dateA) && isValidDate(dateB) ? dateA - dateB : 0;
                } catch (error) {
                  console.error('Error sorting messages:', error);
                  return 0;
                }
              })
          : [];
        setMessages(normalizedMessages);
      })
      .catch((error) => {
        console.error('Error fetching ticket or messages:', error.response ? error.response.data : error.message);
        if (error.response?.status === 403 || error.response?.status === 401) {
          alert('Доступ запрещен. Пожалуйста, войдите в систему.');
        }
      });
  }, [ticketId, userEmail]);

  // WebSocket for messages and typing indicators
  useEffect(() => {
    if (!userEmail) return;

    const stompClient = createStompClient();
    stompClientRef.current = stompClient;

    stompClient.onConnect = () => {
      console.log('Connected to STOMP WebSocket for ticket:', ticketId);
      const messageSubscription = stompClient.subscribe(`/topic/ticket/${ticketId}`, (message) => {
        const newMsg = JSON.parse(message.body);
        console.log('WebSocket Message timestamp:', newMsg.timestamp); // Debug
        const normalizedMsg = {
          ...newMsg,
          timestamp: normalizeTimestamp(newMsg.timestamp),
        };
        setMessages((prev) => [...prev.filter(m => m.id !== normalizedMsg.id), normalizedMsg]);
      });

      const typingSubscription = stompClient.subscribe(`/topic/ticket/${ticketId}/typing`, (message) => {
        const typingUser = JSON.parse(message.body);
        setTypingUsers((prev) => {
          if (!prev.includes(typingUser.email) && typingUser.email !== userEmail) {
            return [...prev, typingUser.email];
          }
          return prev;
        });
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter(email => email !== typingUser.email));
        }, 3000);
      });

      return () => {
        messageSubscription.unsubscribe();
        typingSubscription.unsubscribe();
      };
    };
    stompClient.onStompError = (frame) => {
      console.error('STOMP Error:', frame);
    };
    stompClient.activate();

    return () => {
      if (stompClient.active) {
        stompClient.deactivate();
        console.log('Disconnected from STOMP WebSocket for ticket:', ticketId);
      }
    };
  }, [ticketId, userEmail]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter messages by search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = messages.filter((msg) =>
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages(messages);
    }
  }, [searchTerm, messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const stompClient = stompClientRef.current;
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: `/app/chat/${ticketId}`,
          body: JSON.stringify({ message: newMessage, ticketId: ticketId, email: userEmail }),
        });
        setNewMessage('');
        setEmojiPickerVisible(false);
      } else {
        console.warn('STOMP client not connected, attempting to reconnect...');
        const newClient = createStompClient();
        stompClientRef.current = newClient;
        newClient.onConnect = () => {
          console.log('Reconnected to STOMP WebSocket for ticket:', ticketId);
          newClient.publish({
            destination: `/app/chat/${ticketId}`,
            body: JSON.stringify({ message: newMessage, ticketId: ticketId, email: userEmail }),
          });
          setNewMessage('');
          setEmojiPickerVisible(false);
        };
        newClient.onStompError = (frame) => {
          console.error('STOMP Reconnect Error:', frame);
          alert('Не удалось отправить сообщение: WebSocket не подключен');
        };
        newClient.activate();
      }
    }
  };

  // Change ticket status (admin only)
  const handleStatusChange = (newStatus) => {
    if (!isAdmin) return;
    api.patch(`/tickets/${ticketId}/status?status=${newStatus}`)
      .then((res) => {
        setTicket(res.data);
        setStatus(newStatus);
        alert('Статус обновлен');
      })
      .catch((error) => {
        console.error('Error updating status:', error);
        alert('Ошибка обновления статуса');
      });
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Select emoji
  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji);
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSendFile = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await api.post(`/tickets/${ticketId}/files`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: { email: userEmail },
            message: `File uploaded: ${file.name}`,
            timestamp: new Date().toISOString(),
          },
        ]);
        setFile(null);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  // Edit message
  const handleEditMessage = (messageId, message) => {
    setEditingMessageId(messageId);
    setEditedMessage(message);
  };

  const handleSaveEditedMessage = async (e, messageId) => {
    e.preventDefault();
    if (editedMessage.trim()) {
      try {
        await api.put(`/tickets/${ticketId}/messages/${messageId}`, { content: editedMessage });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, message: editedMessage } : msg
          )
        );
        setEditingMessageId(null);
        setEditedMessage('');
      } catch (error) {
        console.error('Error editing message:', error);
      }
    }
  };

  // React to message
  const handleReactToMessage = (messageId, emoji) => {
    setReactions((prev) => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), emoji],
    }));
  };

  const getAvatar = (email) => {
    return `https://ui-avatars.com/api/?name=${email}&background=random&color=fff`;
  };

  const themeClasses = theme === 'dark'
    ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-200'
    : 'bg-gradient-to-br from-[#f0f4f8] to-[#e0e7ee] text-gray-800';

  if (!ticket) {
    return <div className={`text-center ${themeClasses}`}>Загрузка...</div>;
  }

  return (
    <div className={`min-h-screen ${themeClasses} py-8 relative overflow-hidden`}>
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="none"%3E%3Crect width="100" height="100" fill="url(%23pattern0)" /%3E%3Cdefs%3E%3Cpattern id="pattern0" patternUnits="userSpaceOnUse" width="50" height="50"%3E%3Cpath d="M0 0h50v50H0z" fill="none"/%3E%3Cpath d="M10 10h30v30H10z" stroke="%23ffffff" stroke-width="2" stroke-opacity="0.5"/%3E%3C/pattern%3E%3C/defs%3E%3C/svg%3E')`,
          backgroundRepeat: 'repeat',
          zIndex: 0,
        }}
      ></div>
      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-12 text-[var(--accent-color)] animate-fade-in-down relative">
          Чат по запросу: {ticket.title} {ticket.admin ? `(Админ: ${ticket.admin.username})` : '(Не назначен)'}
          <span className="absolute inset-x-0 -bottom-2 mx-auto w-16 h-1 bg-[var(--accent-color)] rounded-full opacity-50 animate-pulse"></span>
        </h1>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition duration-300"
          >
            Переключить тему ({theme === 'dark' ? 'Светлая' : 'Тёмная'})
          </button>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            placeholder="Поиск сообщений..."
          />
        </div>
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border-l-4 border-[var(--accent-color)] mb-8">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-300">
              Статус: {status === 'OPEN' ? 'Ожидает ответа' : status === 'IN_PROGRESS' ? 'В процессе' : 'Решено'}
            </p>
            {isAdmin && (
              <div className="space-x-2">
                <button
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  В процесс
                </button>
                <button
                  onClick={() => handleStatusChange('CLOSED')}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
                >
                  Решено
                </button>
              </div>
            )}
          </div>
          <div className="h-96 overflow-y-auto bg-gray-700 p-4 rounded-lg space-y-4">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender.email === userEmail ? 'items-end' : 'items-start'} animate-slide-up`}
              >
                <div className="flex items-center mb-1">
                  <img src={getAvatar(msg.sender.email)} alt="Avatar" className="w-8 h-8 rounded-full mr-2" />
                  <div className="max-w-xs px-4 py-2 rounded-lg shadow-md bg-[var(--accent-color)] text-white">
                    <p className="font-medium">{msg.sender.username || msg.sender.email}</p>
                    {editingMessageId === msg.id ? (
                      <form onSubmit={(e) => handleSaveEditedMessage(e, msg.id)} className="flex">
                        <input
                          type="text"
                          value={editedMessage}
                          onChange={(e) => setEditedMessage(e.target.value)}
                          className="flex-1 px-2 py-1 bg-gray-600 text-white rounded-l-lg focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="px-2 py-1 bg-green-600 text-white rounded-r-lg hover:bg-green-700"
                        >
                          Сохранить
                        </button>
                      </form>
                    ) : (
                      <p>{msg.message}</p>
                    )}
                    <small className="text-xs text-gray-400 block mt-1">
                      {msg.timestamp && isValidDate(new Date(msg.timestamp))
                        ? formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true, locale: ru })
                        : 'Время неизвестно'}
                    </small>
                    <div className="flex space-x-1 mt-1">
                      {(reactions[msg.id] || []).map((reaction, index) => (
                        <span key={index} className="text-lg">{reaction}</span>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowReactions(msg.id)}
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Реагировать
                    </button>
                    {showReactions === msg.id && (
                      <div className="flex space-x-1 mt-1">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReactToMessage(msg.id, emoji)}
                            className="text-lg"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                    {msg.sender.email === userEmail && (
                      <button
                        onClick={() => handleEditMessage(msg.id, msg.message)}
                        className="text-xs text-gray-400 hover:text-white ml-2"
                      >
                        Редактировать
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {typingUsers.length > 0 && (
              <p className="text-gray-400 text-sm italic">
                Пользователь {typingUsers.join(', ')} печатает...
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="mt-4 flex relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-600/50 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition duration-300"
              placeholder="Введите сообщение..."
              onFocus={() => {
                const client = stompClientRef.current;
                if (client && client.connected) {
                  client.publish({
                    destination: `/app/typing/${ticketId}`,
                    body: JSON.stringify({ email: userEmail }),
                  });
                }
              }}
            />
            <button
              type="button"
              onClick={() => setEmojiPickerVisible((prev) => !prev)}
              className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 transition duration-300"
            >
              😊
            </button>
            {emojiPickerVisible && (
              <div className="absolute bottom-12 left-0 bg-gray-800 p-2 rounded-lg shadow-lg z-50 flex space-x-2">
                {emojis.map((emoji) => (
                  <button key={emoji} onClick={() => handleEmojiSelect(emoji)} className="text-2xl">
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <label className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 transition duration-300 cursor-pointer">
              📎
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>
            {file && (
              <button
                type="button"
                onClick={handleSendFile}
                className="px-4 py-2 bg-green-600 text-white hover:bg-gray-700 transition duration-300"
              >
                Загрузить файл
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-r-lg hover:bg-opacity-90 transition-all duration-300"
            >
              Отправить
            </button>
          </form>
        </div>
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 ChinaShopBY. Все права защищены.</p>
          <p className="mt-1 animate-pulse text-[var(--accent-color)]">Обновлено: 13.08.2025 22:08 BST</p>
        </div>
      </div>
    </div>
  );
}

// CSS animations
const styles = `
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-down {
  animation: fadeInDown 0.6s ease-out;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-up {
  animation: slideUp 0.5s ease-out;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.animate-pulse {
  animation: pulse 1.5s infinite;
}
`;
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default TicketChatPage;