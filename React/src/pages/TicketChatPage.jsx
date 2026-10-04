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
  const [userEmail, _setUserEmail] = useState(localStorage.getItem('userEmail'));
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState('');
  const messagesEndRef = useRef(null);
  const [_theme, _setTheme] = useState('dark'); // Всегда используем dark тему
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [_reactions, setReactions] = useState({});
  const [_showReactions, _setShowReactions] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
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
      });
  }, [ticketId, userEmail]);

  // WebSocket for messages and typing indicators
  useEffect(() => {
    if (!userEmail) return;

    const stompClient = createStompClient();
    stompClientRef.current = stompClient;

    stompClient.onConnect = () => {
      console.log('Connected to STOMP WebSocket for ticket:', ticketId);
      setIsConnected(true);
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
      setIsConnected(false);
      if (stompClient.active) {
        stompClient.deactivate();
        console.log('Disconnected from STOMP WebSocket for ticket:', ticketId);
      }
    };
  }, [ticketId, userEmail]);

  // Auto-scroll to latest message only when new messages arrive from other users (not on initial load or when sending own message)
  const prevMessagesLengthRef = useRef(0);
  const isInitialLoadRef = useRef(true);
  const scrollTimeoutRef = useRef(null);
  const lastMessageRef = useRef(null);
  
  useEffect(() => {
    // Skip scroll on initial load - just set initial state
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      prevMessagesLengthRef.current = messages.length;
      if (messages.length > 0) {
        lastMessageRef.current = messages[messages.length - 1];
      }
      return;
    }
    
    // Only scroll if messages count increased AND the new message is from another user
    if (messages.length > prevMessagesLengthRef.current && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Check if the new message is from another user (not the current user)
      const isMessageFromOtherUser = lastMessage.sender && lastMessage.sender.email !== userEmail;
      
      // Only scroll if message is from another user
      if (isMessageFromOtherUser) {
        scrollTimeoutRef.current = setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
      
      lastMessageRef.current = lastMessage;
    }
    prevMessagesLengthRef.current = messages.length;
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages, userEmail]);

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
    if (!newMessage.trim()) return;
    
    const messageToSend = newMessage.trim();
    setNewMessage('');
    setEmojiPickerVisible(false);
    
    const stompClient = stompClientRef.current;
    if (stompClient && isConnected) {
      try {
        stompClient.publish({
          destination: `/app/chat/${ticketId}`,
          body: JSON.stringify({ message: messageToSend, ticketId: parseInt(ticketId), email: userEmail }),
        });
      } catch (error) {
        console.error('Error sending message via WebSocket:', error);
        setNewMessage(messageToSend); // Восстанавливаем текст сообщения
      }
    } else {
      console.warn('STOMP client not connected, waiting for connection...');
      setNewMessage(messageToSend); // Восстанавливаем текст сообщения
    }
  };

  // Change ticket status (admin only)
  const handleStatusChange = (newStatus) => {
    if (!isAdmin) return;
    api.patch(`/tickets/${ticketId}/status?status=${newStatus}`)
      .then((res) => {
        setTicket(res.data);
        setStatus(newStatus);
      })
      .catch((error) => {
        console.error('Error updating status:', error);
      });
  };

  // Toggle theme - убрано, всегда используем dark тему
  const _toggleTheme = () => {
    // Функция оставлена для совместимости, но ничего не делает
  };

  // Select emoji
  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji);
  };


  // React to message
  const _handleReactToMessage = (messageId, emoji) => {
    setReactions((prev) => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), emoji],
    }));
  };

  const getAvatar = (email) => {
    return `https://ui-avatars.com/api/?name=${email}&background=random&color=fff`;
  };

  const themeClasses = 'bg-transparent text-[#e5e7eb]';

  if (!ticket) {
    return (
      <div className="min-h-screen bg-transparent text-[#e5e7eb] flex items-center justify-center relative overflow-hidden">
        <div className="text-center relative z-10">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses} py-8 relative overflow-hidden`}>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10 max-w-6xl">
        {/* Информация о тикете */}
        <div className="mb-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#a78bfa] to-[#10b981] bg-clip-text text-transparent">
              {ticket.title}
            </h1>
            <div className="text-right">
              <p className="text-sm text-[#9ca3af] mb-1">
                {ticket.admin ? `Администратор: ${ticket.admin.username}` : 'Администратор не назначен'}
              </p>
              <p className="text-xs text-[#9ca3af]">
                Создан: {new Date(ticket.createdAt).toLocaleString('ru-RU')}
              </p>
            </div>
          </div>
          {ticket.description && (
            <div className="mt-4 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
              <p className="text-sm font-semibold text-[#9ca3af] mb-2">Описание запроса:</p>
              <p className="text-[#9ca3af] leading-relaxed">{ticket.description}</p>
            </div>
          )}
        </div>
        {/* Панель управления и поиска */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4 flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 bg-[rgba(255,255,255,0.02)] text-[#e5e7eb] border border-[rgba(255,255,255,0.1)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/30 focus:border-[#00f0ff] transition duration-300 placeholder-[#9ca3af]"
              placeholder="Поиск сообщений..."
            />
          </div>
        </div>
        
        {/* Окно чата */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-6 rounded-2xl mb-8">
          {/* Статус и управление */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-[rgba(255,255,255,0.1)]">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#9ca3af]">Статус:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                status === 'OPEN' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50' :
                status === 'IN_PROGRESS' ? 'bg-[rgba(0,240,255,0.2)] text-[#00f0ff] border border-[rgba(0,240,255,0.3)]' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
              }`}>
                {status === 'OPEN' ? 'Ожидает ответа' : status === 'IN_PROGRESS' ? 'В процессе' : 'Решено'}
              </span>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  className="px-4 py-2 bg-[rgba(0,240,255,0.1)] text-[#00f0ff] border border-[rgba(0,240,255,0.3)] rounded-xl hover:bg-[rgba(0,240,255,0.15)] transition duration-300 text-sm font-semibold"
                  disabled={status === 'IN_PROGRESS'}
                >
                  В процесс
                </button>
                <button
                  onClick={() => handleStatusChange('CLOSED')}
                  className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 rounded-xl hover:bg-emerald-500/30 transition duration-300 text-sm font-semibold"
                  disabled={status === 'CLOSED'}
                >
                  Решено
                </button>
              </div>
            )}
          </div>
          
          {/* Область сообщений */}
          <div className="h-96 overflow-y-auto bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] p-4 rounded-xl space-y-4 mb-4">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender.email === userEmail ? 'items-end' : 'items-start'} mb-4`}
              >
                <div className={`flex items-start gap-3 max-w-[70%] ${msg.sender.email === userEmail ? 'flex-row-reverse' : 'flex-row'}`}>
                  <img src={getAvatar(msg.sender.email)} alt="Avatar" className="w-10 h-10 rounded-full flex-shrink-0 border border-[rgba(255,255,255,0.1)]" />
                  <div className={`flex flex-col ${msg.sender.email === userEmail ? 'items-end' : 'items-start'}`}>
                    <p className="text-xs text-[#9ca3af] mb-1 px-2">{msg.sender.username || msg.sender.email}</p>
                    <div className={`px-4 py-3 rounded-2xl ${
                      msg.sender.email === userEmail 
                        ? 'bg-[rgba(0,240,255,0.15)] border border-[rgba(0,240,255,0.3)] text-[#e5e7eb]' 
                        : 'bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] text-[#9ca3af]'
                    }`}>
                      <p className="break-words">{msg.message}</p>
                      <small className={`text-xs block mt-2 ${
                        msg.sender.email === userEmail ? 'text-[#9ca3af]' : 'text-[#9ca3af]'
                      }`}>
                        {msg.timestamp && isValidDate(new Date(msg.timestamp))
                          ? formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true, locale: ru })
                          : 'Время неизвестно'}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {typingUsers.length > 0 && (
              <p className="text-[#9ca3af] text-sm italic">
                Пользователь {typingUsers.join(', ')} печатает...
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Форма отправки сообщения */}
          <form onSubmit={handleSendMessage} className="flex gap-2 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/30 focus:border-[#00f0ff] transition duration-300 placeholder-[#9ca3af]"
              placeholder="Введите сообщение..."
              onFocus={() => {
                const client = stompClientRef.current;
                if (client && isConnected) {
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
              className="px-4 py-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] text-[#e5e7eb] hover:bg-[rgba(255,255,255,0.05)] transition duration-300 rounded-xl"
              title="Эмодзи"
            >
              😊
            </button>
            {emojiPickerVisible && (
              <div className="absolute bottom-16 left-0 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-3 rounded-xl shadow-xl z-50 flex gap-2">
                {emojis.map((emoji) => (
                  <button 
                    key={emoji} 
                    onClick={() => {
                      handleEmojiSelect(emoji);
                      setEmojiPickerVisible(false);
                    }} 
                    className="text-2xl hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-6 py-3 bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.3)] text-[#00f0ff] rounded-xl hover:bg-[rgba(0,240,255,0.15)] transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отправить
            </button>
          </form>
        </div>
        <div className="mt-12 text-center text-[#9ca3af] text-sm">
          <p>© 2025 Fluvion. Все права защищены.</p>
          <p className="mt-1 animate-pulse text-[#00f0ff]">Обновлено: 13.08.2025 22:08 BST</p>
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