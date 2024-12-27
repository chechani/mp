import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {spacing} from '../../styles/spacing';
import {textScale} from '../../styles/responsiveStyles';
import colors from '../../Utils/colors';
import RegularText from '../Common/RegularText';
import THEME_COLOR from '../../Utils/Constant';
import {useTheme} from '../hooks';
import {navigate} from '../../Utils/helperFunctions';
import NavigationString from '../../Navigations/NavigationString';

const BroadCastGroupColum = ({item}) => {
  const {theme} = useTheme();
  return (
    <View>
      <TouchableOpacity
        onPress={() =>
          navigate(NavigationString.broadCastGroupDetailScreen, {
            name: item?.name,
          })
        }
        style={[
          styles.card,
          {
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          },
        ]}>
        <RegularText
          style={[
            styles.groupName,
            {color: theme === THEME_COLOR ? colors.black : colors.white},
          ]}>
          {item.group_name}
        </RegularText>
        <RegularText
          style={[
            styles.groupTitle,
            {color: theme === THEME_COLOR ? colors.grey700 : colors.grey300},
          ]}>
          {item.title}
        </RegularText>
        <RegularText
          style={[
            styles.messageCount,
            {color: theme === THEME_COLOR ? colors.grey500 : colors.grey400},
          ]}>
          Messages: {item.message_count}
        </RegularText>
      </TouchableOpacity>
      <View
        style={[
          styles.divider,
          {
            backgroundColor:
              theme === THEME_COLOR ? colors.grey300 : colors.grey600,
          },
        ]}
      />
    </View>
  );
};

export default BroadCastGroupColum;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: spacing.RADIUS_8,
    padding: spacing.PADDING_16,
  },
  groupName: {
    fontSize: textScale(18),
    color: colors.white,
  },
  groupTitle: {
    fontSize: textScale(16),
    color: colors.grey200,
  },
  messageCount: {
    fontSize: textScale(14),
    color: colors.white,
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.grey300,
  },
});
