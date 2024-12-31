import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../Components/hooks';
import { STORAGE_KEYS } from '../api/store/slice/authSlice';
import {
  disconnectSocket,
  initializeSocket,
} from '../api/store/slice/socketSlice';

const SocketInitializer = () => {
  const dispatch = useAppDispatch();
  const domainState = useAppSelector(
    state => state.domains.selectedDomain?.domain,
  );
  const { isAuthenticated } = useAppSelector(state => state.auth);

  useEffect(() => {
    const initializeSocketConnection = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (domainState && token) {
          console.log('Initializing socket...');
          dispatch(initializeSocket({ domainState, token }));
        } else {
          console.log('Disconnecting socket due to missing token or domain...');
          dispatch(disconnectSocket());
        }
      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    };

    initializeSocketConnection();
  }, [domainState, dispatch, isAuthenticated]);

  return null;
};

export default SocketInitializer;
