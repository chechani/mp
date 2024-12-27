import React from 'react';
import {StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import * as SvgIcon from '../../assets/';
import {useTheme} from '../hooks';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import colors from '../../Utils/colors';
import RegularText from './RegularText';

const CustomHeader = ({
  title,
  showLeftIcon = false,
  onLeftIconPress,
  leftIcon = SvgIcon.BackIcon,
  showRightIcons = false,
  rightIcons = [],
  onRightIconPress = () => {},
  showNumber = false,
  number,
  onTitlePress,
}) => {
  const {theme} = useTheme();
  const commonColor = 'light';
  const LeftComponent = showLeftIcon && leftIcon ? leftIcon : null;
  const renderRightIcons = () => {
    return rightIcons.map((Icon, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => onRightIconPress(index)}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        style={{
          marginLeft: spacing.MARGIN_10,
        }}>
        <Icon
          width={spacing.WIDTH_24}
          height={spacing.HEIGHT_24}
          color={theme === commonColor ? colors.black : colors.white}
        />
      </TouchableOpacity>
    ));
  };
  return (
    <View
      style={[
        styles.headerContainer,
        {
          backgroundColor: theme === commonColor ? colors.white : colors.black,
          borderColor: theme === commonColor ? colors.grey300 : colors.grey500,
        },
      ]}>
      <StatusBar
        backgroundColor={theme === THEME_COLOR ? colors.white : colors.black}
        barStyle={theme === THEME_COLOR ? 'dark-content' : 'light-content'}
      />
      {/* Left Section */}
      <View style={styles.leftContainer}>
        {LeftComponent && (
          <TouchableOpacity
            onPress={onLeftIconPress}
            style={{
              marginVertical: spacing.MARGIN_16,
              padding: spacing.PADDING_10,
            }}
            hitSlop={{
              top: spacing.HEIGHT_28,
              bottom: spacing.HEIGHT_28,
              left: spacing.WIDTH_28,
              right: spacing.WIDTH_28,
            }}>
            <LeftComponent
              width={spacing.WIDTH_24}
              height={spacing.HEIGHT_24}
              color={theme === commonColor ? colors.grey700 : colors.white}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onTitlePress}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          style={{marginLeft: spacing.MARGIN_14}}>
          <RegularText
            style={[
              styles.titleStyle,
              {color: theme === commonColor ? colors.black : colors.white},
            ]}>
            {title}
          </RegularText>
          {showNumber && (
            <RegularText
              style={[
                styles.numberStyle,
                {color: theme === commonColor ? colors.black : colors.white},
              ]}>
              {number}
            </RegularText>
          )}
        </TouchableOpacity>
      </View>

      {/* Right Section */}
      <View style={styles.rightContainer}>
        {showRightIcons && renderRightIcons()}
      </View>
    </View>
  );
};

export default CustomHeader;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    height: spacing.HEIGHT_60,
    paddingHorizontal:spacing.MARGIN_6
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleStyle: {
    fontSize: textScale(16),
    textTransform: 'capitalize',
    color: colors.black,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
  },
  numberStyle: {
    fontSize: textScale(14),
    color: colors.black,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
  },
});
