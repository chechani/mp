import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

const NetworkStatusContext = createContext(null);

export function NetworkStatusProvider({ children }) {
  const [isConnected, setIsConnected] = useState(null);

  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const state = await NetInfo.fetch();
        setIsConnected(state.isConnected ?? false);
      } catch (error) {
        console.error('NetworkStatus Error:', error);
      }
    };

    fetchInitialState();

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <NetworkStatusContext.Provider value={isConnected}>
      {children}
    </NetworkStatusContext.Provider>
  );
}

export function useNetworkStatus() {
  const context = useContext(NetworkStatusContext);
  if (context === null) {
    console.warn('useNetworkStatus must be used within a NetworkStatusProvider');
  }
  return context;
}
