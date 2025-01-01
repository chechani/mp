import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
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

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaView style={{flex: 1}}>
        <Provider store={store}>
          <BottomSheetModalProvider>
            <SocketInitializer />
            <AppStack />
            <Toast config={toastConfig} />
          </BottomSheetModalProvider>
        </Provider>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default App;
