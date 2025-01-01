import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import THEME_COLOR from '../../Utils/Constant';
import {useTheme} from '../hooks';
import {spacing} from '../../styles/spacing';
import {textScale} from '../../styles/responsiveStyles';
import colors from '../../Utils/colors';
import {fontNames} from '../../styles/typography';
import RegularText from '../Common/RegularText';

const BroadCastGroupDetailColum = ({item}) => {
  const {theme} = useTheme();
  const isDarkMode = theme !== THEME_COLOR;

  return (
    <View
      style={[
        styles.container,
        isDarkMode ? styles.containerDark : styles.containerLight,
      ]}>
      {item?.contact_name && (
        <RegularText
          style={[
            styles.contactName,
            isDarkMode ? styles.contactNameDark : styles.contactNameLight,
          ]}>
          {item?.contact_name || 'No Name'}
        </RegularText>
      )}
      {item?.mobile_no && (
        <RegularText
          style={[
            styles.text,
            isDarkMode ? styles.textDark : styles.textLight,
          ]}>
          📱 {item?.mobile_no || 'No Mobile Number'}
        </RegularText>
      )}
      {item?.group_member && (
        <RegularText
          style={[
            styles.text,
            isDarkMode ? styles.textDark : styles.textLight,
          ]}>
          👥 Group Member: {item?.group_member || 'Not Available'}
        </RegularText>
      )}
      <RegularText
        style={[
          styles.status,
          item?.enable === 1
            ? isDarkMode
              ? styles.activeStatusDark
              : styles.activeStatus
            : isDarkMode
            ? styles.inactiveStatusDark
            : styles.inactiveStatus,
        ]}>
        {item?.enable === 1 ? 'Active' : 'Inactive'}
      </RegularText>
    </View>
  );
};

export default BroadCastGroupDetailColum;

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.PADDING_4,
    paddingHorizontal: spacing.PADDING_16,
    marginVertical: spacing.MARGIN_4,
    borderBottomWidth: 1,
  },
  containerLight: {
    borderBottomColor: colors.grey200,
  },
  containerDark: {
    borderBottomColor: colors.grey900,
  },
  contactName: {
    fontSize: textScale(18),
    marginBottom: spacing.MARGIN_4,
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
  },
  contactNameLight: {
    color: colors.black,
  },
  contactNameDark: {
    color: colors.white,
  },
  text: {
    fontSize: textScale(14),
    marginBottom: 2,
  },
  textLight: {
    color: colors.grey900,
  },
  textDark: {
    color: colors.grey200,
  },
  status: {
    marginTop: spacing.MARGIN_8,
    fontSize: textScale(14),
    fontWeight: 'bold',
    textAlign: 'left',
  },
  activeStatus: {
    color: '#155724',
  },
  inactiveStatus: {
    color: '#721c24',
  },
  activeStatusDark: {
    color: '#a5d6a7',
  },
  inactiveStatusDark: {
    color: '#ef9a9a',
  },
});
