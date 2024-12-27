import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {io} from 'socket.io-client';
import {STORAGE_KEYS} from '../api/store/slice/authSlice';
import {useAppSelector} from '../Components/hooks';

const getSocket = async domainState => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    console.error('❌ Missing token: Cannot connect to the WebSocket');
    return null;
  }

  const socket = io(domainState, {
    withCredentials: true,
    auth: {token},
    transports: ['websocket'],
    autoConnect: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
  });

  socket.on('connect_error', err => {
    console.error('❌ Detailed Socket connection error:', {
      message: err.message,
      code: err.code,
      data: err.data,
    });
  });

  socket.on('disconnect', reason => {
    console.warn('⚠️ Socket disconnected:', reason);
  });

  return socket;
};

// Create a context for the socket
const SocketContext = createContext({
  socket: null,
});

const useSocket = () => useContext(SocketContext);

// Create a provider component for Socket
const SocketProvider = ({children}) => {
  const domainState = useAppSelector(
    state => state?.domains?.selectedDomain?.domain,
  );

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let socketInstance = null;

    const initializeSocket = async () => {
      if (!domainState) {
        console.error('❌ Domain state is undefined');
        return;
      }

      socketInstance = await getSocket(domainState);

      if (socketInstance) {
        setSocket(socketInstance);
      }
    };

    initializeSocket();

    // Disconnect the socket when the component unmounts
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        console.log('⚠️ Socket disconnected on unmount');
      }
    };
  }, [domainState]);

  return (
    <SocketContext.Provider value={{socket}}>{children}</SocketContext.Provider>
  );
};

export {SocketProvider, useSocket};
