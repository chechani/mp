import React from 'react';
import {StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as SvgIcon from '../../assets/index';
import {spacing} from '../../styles/spacing';

const SplashScreen = () => {
  return (
    <LinearGradient
      colors={['#FFFFFF', '#FFFFFF']}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={styles.container}>
      <SvgIcon.Logo height={spacing.HEIGHT_230} width={spacing.WIDTH_200} />
    </LinearGradient>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
