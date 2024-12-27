import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import React from 'react';
import {SafeAreaView} from 'react-native';
import 'react-native-gesture-handler';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import {Provider} from 'react-redux';
import AppStack from '../src/Navigations/index';
import store from './api/store/store';
import {toastConfig} from './Config/toastConfig';
import {AuthProvider} from './Provider/AuthProvider';
import { SocketProvider } from './context/SocketContext';

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Provider store={store}>
        <AuthProvider>
          <BottomSheetModalProvider>
            <SafeAreaView style={{flex: 1}}>
              <SocketProvider>
              <AppStack />
              </SocketProvider>
              <Toast config={toastConfig} />
            </SafeAreaView>
          </BottomSheetModalProvider>
        </AuthProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default App;
