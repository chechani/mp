import React from 'react';
import {Keyboard, StyleSheet, TouchableWithoutFeedback} from 'react-native';
import Animated, {interpolate, useAnimatedStyle} from 'react-native-reanimated';

const BackDrop = ({
  topAnimation,
  openHeight,
  closeHeight,
  backDropColor,
  close,
}) => {
  const backDropAnimation = useAnimatedStyle(() => {
    const opacity = interpolate(
      topAnimation.value,
      [closeHeight, openHeight],
      [0, 0.5],
    );
    const display = opacity === 0 ? 'none' : 'flex';
    return {
      opacity,
      display,
    };
  });

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        close(), Keyboard.dismiss();
      }}>
      <Animated.View
        style={[
          styles.backDrop,
          backDropAnimation,
          {backgroundColor: backDropColor},
        ]}
      />
    </TouchableWithoutFeedback>
  );
};

export default BackDrop;

const styles = StyleSheet.create({
  backDrop: {
    ...StyleSheet.absoluteFillObject,
    display: 'none',
  },
});
