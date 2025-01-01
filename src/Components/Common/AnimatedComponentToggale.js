import React, {useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Animated, {
  Layout,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as SvgIcon from '../../assets';
import {scale, textScale, verticalScale} from '../../styles/responsiveStyles';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import {useTheme} from '../hooks';
import RegularText from './RegularText';
import {fontNames} from '../../styles/typography';
import LinearGradient from 'react-native-linear-gradient';
import {spacing} from '../../styles/spacing';

const AnimatedComponentToggle = ({
  children,
  tabName,
  source = SvgIcon.DownArrow,
  AnimationBtnContainer,
  tabNameStyle,
  leftImage,
  isLeftImg = false,
  isRightIcon = true,
  isActive,
  onPress,
  defaultOpen = false,
  isExtraText = false,
  extraText = '',
  containerStyle,
  btnText,
  extraBtnStyle,
  extraBtnStyleLinearGradient,
  extraBtnStyleText,
  extraBtnStyleonPress,
  descrption,
  gradientColors,
  isEditEnable = false,
  onPressEditIcon,
}) => {
  const isControlled = isActive !== undefined;

  const [isExpanded, setIsExpanded] = useState(() => {
    return isControlled ? false : defaultOpen;
  });

  useEffect(() => {
    if (isControlled) {
      setIsExpanded(isActive);
    }
  }, [isActive, isControlled]);

  const rotation = useAnimatedStyle(() => ({
    transform: [
      {rotate: withTiming(isExpanded ? '180deg' : '0deg', {duration: 200})},
    ],
  }));

  const LeftComponent = isLeftImg ? leftImage : null;
  const RightComponent = isRightIcon ? source : null;

  const handlePress = () => {
    if (isControlled && onPress) {
      onPress();
    } else {
      setIsExpanded(prev => !prev);
    }
  };

  const {theme} = useTheme();

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.btnContainer, AnimationBtnContainer, containerStyle]}
        activeOpacity={0.8}>
        <View style={styles.row}>
          {LeftComponent && (
            <LeftComponent
              width={scale(30)} // Scaled based on width
              height={scale(30)}
              color={theme === THEME_COLOR ? colors.black : colors.white}
            />
          )}
          <View style={styles.column}>
            {isExtraText && (
              <RegularText
                style={[
                  styles.extraTextStyle,
                  {color: theme === THEME_COLOR ? colors.black : colors.white},
                ]}>
                Task Number: {extraText}
              </RegularText>
            )}
            {tabName && (
              <RegularText
                style={[
                  styles.tabNameStyle,
                  tabNameStyle,
                  {color: theme === THEME_COLOR ? colors.black : colors.white},
                ]}>
                {tabName}
              </RegularText>
            )}
            {descrption && (
              <RegularText
                style={[
                  styles.descrptionStyle,
                  {color: theme === THEME_COLOR ? colors.black : colors.white},
                ]}>
                {descrption}
              </RegularText>
            )}
          </View>
        </View>
        <View style={styles.rightContainer}>
          {isEditEnable && (
            <TouchableOpacity
              style={{
                padding: spacing.PADDING_10,
                backgroundColor:
                  theme === THEME_COLOR ? colors.grey900 : colors.grey300,
                marginRight: spacing.MARGIN_6,
                borderRadius: spacing.RADIUS_10,
                opacity: 0.8,
              }}
              onPress={onPressEditIcon}>
              <SvgIcon.EditIcon color={colors.green} />
            </TouchableOpacity>
          )}
          {!!btnText && (
            <TouchableOpacity
              style={[styles.extraBtnStyle, extraBtnStyle]}
              onPress={extraBtnStyleonPress}>
              <LinearGradient
                colors={false ? ['#D1D1D1', '#E1E1E1'] : gradientColors}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={[
                  styles.extraBtnStyleLinearGradient,
                  extraBtnStyleLinearGradient,
                ]}>
                <RegularText
                  style={[
                    extraBtnStyleText,
                    {fontSize: textScale(12), color: colors.white},
                  ]}>
                  {btnText}
                </RegularText>
              </LinearGradient>
            </TouchableOpacity>
          )}
          {RightComponent && (
            <Animated.View style={rotation}>
              <RightComponent
                width={scale(24)} // Scaled width
                height={scale(24)} // Scaled height
                color={theme === THEME_COLOR ? colors.black : colors.white}
              />
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
      {isExpanded && (
        <Animated.View
          style={styles.contentContainer}
          layout={Layout.springify()}
          entering={Animated.FadeIn}
          exiting={Animated.FadeOut}>
          {children}
        </Animated.View>
      )}
    </>
  );
};

export default AnimatedComponentToggle;

const styles = StyleSheet.create({
  btnContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: verticalScale(4),
    alignSelf: 'center',
    flexDirection: 'row',
  },
  tabNameStyle: {
    color: colors.black,
    fontSize: textScale(14),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
    textTransform: 'capitalize',
  },
  descrptionStyle: {
    color: colors.black,
    fontSize: textScale(12),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
  },
  contentContainer: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
  },
  column: {
    flexDirection: 'column',
  },
  extraTextStyle: {
    fontSize: textScale(16),
    fontFamily: fontNames.POPPINS_FONT_FAMILY_BOLD,
    color: colors.black,
    marginTop: verticalScale(8),
  },
  extraBtnStyle: {
    width: '50%',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '50%',
  },
  extraBtnStyleLinearGradient: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(8),
    paddingHorizontal: spacing.PADDING_6,
    borderRadius: scale(8),
  },
});
