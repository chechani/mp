import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Colors from '../../theme/colors';

const CustomLoader = ({
  size = 40,
  color = Colors.default.white,
  style,
  strokeWidth = 4,
}) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1, // Infinite repeat
      false,
    );

    return () => {
      cancelAnimation(rotation);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${rotation.value}deg`}],
  }));

  return (
    <View style={[styles.container, style, {width: size, height: size}]}>
      {/* Background Circle */}
      <View style={styles.backgroundCircle}>
        <View
          style={[
            styles.circle,
            {
              borderColor: color,
              borderWidth: strokeWidth,
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: 0.2,
            },
          ]}
        />
      </View>

      {/* Rotating Foreground Arc */}
      <Animated.View style={[styles.foregroundCircle, animatedStyle]}>
        <View
          style={[
            styles.circleArc,
            {
              borderColor: color,
              borderWidth: strokeWidth,
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foregroundCircle: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    borderStyle: 'solid',
  },
  circleArc: {
    borderStyle: 'solid',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{rotate: '45deg'}],
  },
});

export default CustomLoader;
