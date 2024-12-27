import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { textScale } from '../../styles/responsiveStyles';
import { fontNames } from '../../styles/typography';
import Colors from '../../theme/colors';

const TextComponent = ({
  text,
  color,
  size,
  flex,
  style,
  fontWeight,
  textAlign,
  font = fontNames.ROBOTO_FONT_FAMILY_REGULAR,
  numberOfLines,
  underline,
  lineHeight,
  showExpandButton = false,
  expandButtonColor = Colors.default.accent,
  expandButtonSize,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const shouldShowExpandButton =
    showExpandButton && numberOfLines !== undefined;

  const baseTextStyle = {
    color: color || Colors.default.background,
    textDecorationLine: underline ? 'underline' : 'none',
    fontSize: size || textScale(14),
    flex: flex || 0,
    fontWeight: fontWeight || 'normal',
    textAlign: textAlign || 'auto',
    fontFamily: font || fontNames.ROBOTO_FONT_FAMILY_REGULAR,
    lineHeight: lineHeight,
  };

  const expandButtonStyle = {
    color: expandButtonColor,
    fontSize: expandButtonSize || size || textScale(14),
    fontFamily: font,
    fontWeight: fontWeight || 'normal',
  };

  if (!shouldShowExpandButton) {
    return (
      <Text
        allowFontScaling={false}
        style={[baseTextStyle, style]}
        numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }

  return (
    <View style={styles.container}>
      <Text
        allowFontScaling={false}
        style={[baseTextStyle, style]}
        numberOfLines={isExpanded ? undefined : numberOfLines}>
        {text}
      </Text>
      <Pressable onPress={() => setIsExpanded(!isExpanded)}>
        <Text allowFontScaling={false} style={expandButtonStyle}>
          {isExpanded ? ' See less' : ' See more'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default TextComponent;
