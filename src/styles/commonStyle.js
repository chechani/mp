import {StyleSheet, View} from 'react-native';
import {spacing} from './spacing';
import colors from '../Utils/colors';
import {useTheme} from '../Components/hooks';
import THEME_COLOR from '../Utils/Constant';
import Colors from '../theme/colors';

export const APP_PADDING_HORIZONTAL = spacing.PADDING_12;

const commonStyle = StyleSheet.create({
  flexRow: {
    flexDirection: 'row',
  },
  arrowImageSize: {
    width: spacing.WIDTH_12,
    height: spacing.WIDTH_12,
  },
  justifyALignCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  seprator: {
    height: spacing.HEIGHT_2,
    backgroundColor: colors.grey300,
    width: '100%',
    borderRadius: spacing.RADIUS_12,
    marginVertical: spacing.MARGIN_12,
  },
});

export default commonStyle;

export const Divider = () => {
  const {theme} = useTheme();
  const isDarkMode = theme === THEME_COLOR;
  return (
    <View
      style={[
        {
          backgroundColor: isDarkMode ? Colors.dark.black : Colors.light.white,
          height: 0.5,
          opacity: 0.1,
        },
      ]}
    />
  );
};
