import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { textScale } from '../../styles/responsiveStyles';
import { spacing } from '../../styles/spacing';
import { fontNames } from '../../styles/typography';
import Colors, { gradientColorTokensMap } from '../../theme/colors';
import TextComponent from './TextComponent';

const { height } = Dimensions.get('window');

const Header = ({
  title,
  leftComponent,
  rightComponent,
  onPress,
  headerBackgroundColor,
}) => {
  const navigation = useNavigation();

  const handleBackNavigation = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={
        headerBackgroundColor === 'white'
          ? gradientColorTokensMap.White
          : gradientColorTokensMap.HomeGR
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={handleBackNavigation}
          style={styles.sideContainer}
        >
          {leftComponent}
        </TouchableOpacity>
        <TextComponent style={styles.title} text={title} />
      </View>
      <TouchableOpacity onPress={onPress} style={styles.leftSideContainer}>
        {rightComponent}
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: height * 0.06,
    backgroundColor: Colors.default.white,
    width: '100%',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: textScale(16),
    fontWeight: '600',
    color: Colors.default.black,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
  },
  sideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftSideContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: spacing.PADDING_20,
  },
});

export default Header;
