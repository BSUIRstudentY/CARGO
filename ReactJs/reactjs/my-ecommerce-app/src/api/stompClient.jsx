// stompClient.js
import { Client } from '@stomp/stompjs';

export const createStompClient = () => {
  return new Client({
    brokerURL: 'ws://fluvion.by/ws-pure',
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log('Connected to STOMP WebSocket');
    },
    onStompError: (frame) => {
      console.error('STOMP Error:', frame);
    },
  });
};