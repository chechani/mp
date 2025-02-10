import React from 'react';
import { SafeAreaView } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import AppStack from '../src/Navigations/index';
import store from './api/store/store';
import { toastConfig } from './Config/toastConfig';
import SocketInitializer from './Provider/SocketProvider ';
import { AppContextProviders } from './Provider';

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView style={{flex: 1}}>
          <Provider store={store}>
          <AppContextProviders>
            <SocketInitializer />
            <AppStack />
            <Toast config={toastConfig} />
            </AppContextProviders>
          </Provider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default App;
