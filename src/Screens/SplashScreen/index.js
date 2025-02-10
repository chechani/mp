import React from 'react';
import {StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../Components/hooks';
import THEME_COLOR from '../../Utils/Constant';
import * as SvgIcon from '../../assets/index';
import {spacing} from '../../styles/spacing';
import {gradientColorTokensMap} from '../../theme/colors';

const SplashScreen = () => {
  const {theme} = useTheme();
  const isDarkMode = theme === THEME_COLOR;
  return (
    <LinearGradient
      colors={
        isDarkMode
          ? gradientColorTokensMap.White
          : gradientColorTokensMap.DarkGR
      }
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={styles.container}>
      <SvgIcon.Logo height={spacing.HEIGHT_105} width={spacing.WIDTH_105} />
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
