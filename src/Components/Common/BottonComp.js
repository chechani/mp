import React from 'react';
import {ActivityIndicator, StyleSheet, TouchableOpacity} from 'react-native';
import {moderateScale, textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import colors from '../../Utils/colors';
import RegularText from './RegularText';

const ButtonComp = ({
  onPress = () => {},
  text = '',
  style = {},
  leftImg = false,
  rightImg = false,
  LeftSource = null, // Source prop for SVG icons
  RightSource = null, // Source prop for SVG icons
  IconStyle = {},
  textStyle = {},
  isLoading = false,
  disabled = false,
}) => {
  // Extract width and height from the IconStyle prop
  const {width = spacing.WIDTH_24, height = spacing.HEIGHT_24} = IconStyle;

  // Left and Right components for conditional rendering
  const LeftComponent = leftImg && LeftSource ? LeftSource : null;
  const RightComponent = rightImg && RightSource ? RightSource : null;

  return (
    <TouchableOpacity
      style={[styles.container, style, disabled ? styles.disabled : null]}
      onPress={!disabled ? onPress : null}
      activeOpacity={disabled ? 1 : 0.8}>
      {LeftComponent && (
        <LeftComponent
          width={width}
          height={height}
          style={[styles.iconStyle, IconStyle]}
        />
      )}
      {isLoading ? (
        <ActivityIndicator size={'small'} color={'white'} />
      ) : (
        <RegularText
          style={[
            styles.textStyle,
            textStyle,
            disabled ? {color: colors.grey600} : null,
          ]}>
          {text}
        </RegularText>
      )}
      {RightComponent && (
        <RightComponent
          width={width}
          height={height}
          style={[styles.iconStyle, IconStyle]}
        />
      )}
    </TouchableOpacity>
  );
};

export default ButtonComp;

const styles = StyleSheet.create({
  container: {
    borderRadius: moderateScale(6),
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: colors.grey600,
    flexDirection: 'row',
    maxHeight: spacing.HEIGHT_80,
    paddingHorizontal: spacing.WIDTH_16,
    paddingVertical: spacing.HEIGHT_8,
  },
  textStyle: {
    color: colors.black,
    fontSize: textScale(13),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_MEDIUM,
  },
  iconStyle: {
    resizeMode: 'contain',
    marginHorizontal: spacing.WIDTH_8,
  },
  disabled: {
    opacity: 0.5,
  },
});
