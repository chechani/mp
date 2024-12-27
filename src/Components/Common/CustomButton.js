import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { textScale } from '../../styles/responsiveStyles';
import { spacing } from '../../styles/spacing';
import Colors from '../../theme/colors';
import TextComponent from './TextComponent';

// Green Theme Colors
const GRADIENT_COLORS = [
  'hsla(120, 100%, 25%, 1)',
  'hsla(120, 100%, 25%, 1)',
  'hsla(120, 100%, 25%, 1)',
];

// Green for text in outline button
const OUTLINE_TEXT_COLOR = 'hsla(120, 60%, 43%, 1)';
const OUTLINE_BORDER_COLOR = 'hsla(120, 67%, 47%, 1)';

const CustomButton = ({
  title,
  onPress,
  style,
  disabled = false,
  isLoading = false,
  type = 'LG',
  activeOpacity = 0.7,
  outline = false,
  gradientColors = GRADIENT_COLORS,
  gradientStart = {x: 0, y: 0},
  gradientEnd = {x: 1, y: 1},
  showFirstChildren = false,
  FirstChildren,
  textColor = Colors.default.white,
  textStyle
}) => {
  const renderButtonContent = () => {
    if (isLoading) {
      return (
        <ActivityIndicator
          color={outline ? OUTLINE_TEXT_COLOR :  Colors.default.white}
        />
      );
    }
    return (
      <TextComponent
        text={title}
        size={textScale(15)}
        fontWeight="700"
        style={[{
          color: outline ? OUTLINE_TEXT_COLOR : textColor,
        },textStyle]}
      />
    );
  };

  const buttonComponent = (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        style,
        {
          backgroundColor: 'transparent',
          opacity: disabled ? 0.5 : 1,
          borderWidth: outline ? 1 : 0,
          borderColor: outline ? OUTLINE_BORDER_COLOR : 'transparent',
          justifyContent: showFirstChildren ? 'flex-start' : 'center',
          paddingHorizontal: showFirstChildren ? 16 : 0,
        },
      ]}
      activeOpacity={activeOpacity}>
      {showFirstChildren && (
        <View style={styles.firstChildWrapper}>{FirstChildren}</View>
      )}
      {renderButtonContent()}
    </TouchableOpacity>
  );

  if (type === 'LG' && !outline) {
    return (
      <LinearGradient
        colors={disabled ? ['#D1D1D1', '#E1E1E1'] : gradientColors}
        start={gradientStart}
        end={gradientEnd}
        style={[styles.button, style]}>
        {buttonComponent}
      </LinearGradient>
    );
  }

  return buttonComponent;
};

const styles = StyleSheet.create({
  button: {
    height: spacing.HEIGHT_48,
    width: '100%',
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
  },
  firstChildWrapper: {
    marginRight: spacing.MARGIN_8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomButton;
