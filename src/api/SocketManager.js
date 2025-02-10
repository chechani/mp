import { io } from 'socket.io-client';

let socket;

export const initializeSocket = ({ domainState, token }) => {
  if (!socket) {
    socket = io(domainState, {
      withCredentials: true,
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected with ID:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err);
    });
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log('⚠️ Socket disconnected');
    socket = null;
  }
};

export const getSocket = () => socket;
