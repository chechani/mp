import React, {forwardRef, useState} from 'react';
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import * as SvgIcon from '../../assets/index';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import Colors from '../../theme/colors';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import {useTheme} from '../hooks';
import TextComponent from './TextComponent';

const TextInputComp = forwardRef(
  (
    {
      inputStyle = {},
      textStyle = {},
      value = '',
      onChangeText,
      placeholder = '',
      secureTextEntry = false,
      textInputLeftIcon,
      editable = true,
      placeholderTextColor,
      istextInputLeftIcon = false,
      error = '',
      isRightIcon = false,
      rightIcon,
      onPressContainer,
      rightIconPress,
      containerStyle,
      ...props
    },
    ref,
  ) => {
    const {theme} = useTheme();
    const [isSecureTextVisible, setIsSecureTextVisible] =
      useState(secureTextEntry);

    const LeftComponent =
      istextInputLeftIcon && textInputLeftIcon ? textInputLeftIcon : null;
    const RightComponent = isRightIcon && rightIcon ? rightIcon : null;

    const calculatedPlaceholderTextColor =
      placeholderTextColor || (editable ? colors.grey600 : colors.white);

    return (
      <View style={[styles.container, containerStyle]}>
        <TouchableOpacity
          style={[
            styles.inputStyle,
            inputStyle,
            {
              borderColor: error ? colors.red900 : colors.grey500,
            },
          ]}
          activeOpacity={1}
          onPress={onPressContainer}>
          {LeftComponent && (
            <LeftComponent
              width={spacing.WIDTH_24}
              height={spacing.HEIGHT_24}
              color={theme === THEME_COLOR ? colors.black : colors.white}
            />
          )}

          <TextInput
            ref={ref}
            style={[
              styles.textStyle,
              textStyle,
              {color: theme === THEME_COLOR ? colors.black : colors.white},
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={
              error ? colors.red900 : calculatedPlaceholderTextColor
            }
            editable={editable}
            secureTextEntry={secureTextEntry && isSecureTextVisible}
            autoCorrect={false}
            keyboardType={props.keyboardType || 'default'}
            {...props}
          />

          {secureTextEntry && (
            <TouchableOpacity
              onPress={() => setIsSecureTextVisible(!isSecureTextVisible)}
              hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
              {isSecureTextVisible ? (
                <SvgIcon.Eye
                  width={spacing.WIDTH_24}
                  height={spacing.WIDTH_24}
                  color={
                    theme === THEME_COLOR ? colors.grey700 : colors.grey400
                  }
                />
              ) : (
                <SvgIcon.CloseEye
                  width={spacing.WIDTH_24}
                  height={spacing.WIDTH_24}
                  color={
                    theme === THEME_COLOR ? colors.grey700 : colors.grey400
                  }
                />
              )}
            </TouchableOpacity>
          )}

          {RightComponent && (
            <TouchableOpacity
              onPress={rightIconPress}
              hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
              <RightComponent
                width={spacing.WIDTH_22}
                height={spacing.WIDTH_22}
                color={theme === THEME_COLOR ? colors.grey800 : colors.grey600}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {error && (
          <TextComponent
            text={error}
            style={{marginTop: spacing.MARGIN_4, marginLeft: spacing.MARGIN_4}}
            color={Colors.default.error}
          />
        )}
      </View>
    );
  },
);

export default TextInputComp;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.MARGIN_16,
  },
  inputStyle: {
    borderRadius: spacing.RADIUS_8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.PADDING_16,
    borderWidth: 2,
  },
  textStyle: {
    fontSize: textScale(14),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
    flex: 1,
  },
  errorText: {
    fontSize: textScale(14),
    color: colors.red900,
    marginTop: spacing.MARGIN_4,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
    marginLeft: spacing.MARGIN_4,
  },
});
