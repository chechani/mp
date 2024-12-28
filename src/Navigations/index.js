import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { initializeApp } from '../api/store/slice/initialization';
import LoadingScreen from '../Components/Common/Loader';
import { useAppDispatch, useAppSelector } from '../Components/hooks/index';
import { navigationRef } from '../NavigationServies';
import { SplashScreen } from '../Screens';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';

const Stack = createNativeStackNavigator();

function AppStack() {
  const dispatch = useAppDispatch();
  const [showSplash, setShowSplash] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await dispatch(initializeApp()).unwrap();
      } catch (error) {
        console.error('Initialization failed:', error);
      } finally {
        setInitialized(true);
      }
    };
    const splashTimeout = setTimeout(() => {
      setShowSplash(false);
      initialize();
    }, 3000);

    // Cleanup timeout on component unmount
    return () => clearTimeout(splashTimeout);
  }, [dispatch]);

  const {isAuthenticated} = useAppSelector(state => state.auth);

  if (showSplash) {
    return <SplashScreen />;
  }
  if (!initialized) {
    return <LoadingScreen color="green" />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'vertical',
          animation: 'slide_from_right',
        }}>
        {isAuthenticated ? MainStack(Stack) : AuthStack(Stack)}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppStack;

const styles = StyleSheet.create({});
