import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Colors from '../../theme/colors';

const LoadingScreen = ({color=Colors.dark.accent, containerStyle,size='large'}) => {
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
