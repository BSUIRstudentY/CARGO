// stompClient.js
import { Client } from '@stomp/stompjs';

// Определяем базовый URL для WebSocket в зависимости от окружения
const getWebSocketURL = () => {
  const hostname = window.location.hostname;
  
  // Если localhost или 127.0.0.1, используем localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
    return 'ws://localhost:8080/ws-pure';
  }
  
  // Иначе используем домен fluvion.by
  return 'ws://fluvion.by/ws-pure';
};

export const createStompClient = () => {
  const brokerURL = getWebSocketURL();
  console.log('Creating STOMP client with brokerURL:', brokerURL);
  
  return new Client({
    brokerURL: brokerURL,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log('Connected to STOMP WebSocket at:', brokerURL);
    },
    onStompError: (frame) => {
      console.error('STOMP Error:', frame);
    },
    onWebSocketClose: () => {
      console.log('WebSocket connection closed');
    },
    onDisconnect: () => {
      console.log('Disconnected from STOMP WebSocket');
    },
  });
};