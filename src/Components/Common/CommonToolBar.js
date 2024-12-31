import React, {useEffect} from 'react';
import {StatusBar, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useTheme} from '../hooks';
import THEME_COLOR from '../../Utils/Constant';
import colors from '../../Utils/colors';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import {registerBackHandler, unregisterBackHandler} from './BackHandlerManager';
import RegularText from './RegularText';

const CommonToolBar = ({
  title,
  count,
  onBackPress,
  showLeftIcons = false,
  leftIcons = [],
  onLeftIconPress = () => {},
  showRightIcons = false,
  rightIcons = [],
  onRightIconPress = () => {},
  onTitlePress,
}) => {
  const {theme} = useTheme();
  const commonColor = THEME_COLOR;

  useEffect(() => {
    const handleBackPress = () => {
      if (onBackPress) {
        onBackPress();
        return true;
      }
      return false;
    };

    registerBackHandler(handleBackPress);

    return () => {
      unregisterBackHandler(handleBackPress);
    };
  }, [onBackPress]);

  // Render all left icons, including the back button if needed
  const renderLeftIcons = () => {
    const iconsToRender = [...leftIcons];

    return iconsToRender.map((item, index) => {
      const IconComponent = item;
      const handlePress = () => onLeftIconPress(index);

      return (
        <TouchableOpacity
          key={index}
          onPress={handlePress}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          style={{marginLeft: spacing.MARGIN_10}}>
          <IconComponent
            width={spacing.WIDTH_24}
            height={spacing.HEIGHT_24}
            color={theme === commonColor ? colors.grey700 : colors.grey300}
          />
        </TouchableOpacity>
      );
    });
  };

  const renderRightIcons = () => {
    return rightIcons.map((Icon, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => onRightIconPress(index)}
        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        style={{marginRight: spacing.MARGIN_10}}>
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
        styles.topBar,
        {
          backgroundColor: theme === commonColor ? colors.white : colors.black,
          borderColor: theme === commonColor ? colors.grey300 : colors.grey500,
        },
      ]}>
      <StatusBar
        backgroundColor={
          theme === THEME_COLOR ? colors.white : colors.black
        }
        barStyle={theme === THEME_COLOR ? 'dark-content' : 'light-content'}
      />
      {/* Left Section */}
      <View style={styles.leftContainer}>
        {showLeftIcons && renderLeftIcons()}
        {count !== undefined && (
          <RegularText
            style={[
              styles.selectedMessageCountStyle,
              {color: theme === commonColor ? colors.grey800 : colors.grey200},
            ]}>
            {count}
          </RegularText>
        )}
      </View>

      {/* Title Section */}
      <View style={styles.titleContainer}>
        {title && (
          <TouchableOpacity onPress={onTitlePress}>
            <RegularText
              style={[
                styles.titleStyle,
                {color: theme === commonColor ? colors.black : colors.white},
              ]}>
              {title}
            </RegularText>
          </TouchableOpacity>
        )}
      </View>

      {/* Right Section */}
      <View style={styles.rightContainer}>
        {showRightIcons && renderRightIcons()}
      </View>
    </View>
  );
};

export default CommonToolBar;

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    height: spacing.HEIGHT_60,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedMessageCountStyle: {
    fontSize: textScale(16),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
    color: colors.black,
    marginLeft: spacing.MARGIN_16,
  },
  titleStyle: {
    fontSize: textScale(16),
    textTransform: 'capitalize',
    color: colors.black,
    fontFamily: fontNames.POPPINS_FONT_FAMILY_MEDIUM,
  },
});
