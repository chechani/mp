import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

const LoadingScreen = ({color = '#000', containerStyle,size='large'}) => {
  return (
    <View
      style={[
        styles.container,
        containerStyle,
      ]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
