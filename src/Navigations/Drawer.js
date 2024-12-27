import {createDrawerNavigator} from '@react-navigation/drawer';
import React from 'react';
import {StyleSheet, useWindowDimensions, View} from 'react-native';
import * as SvgIcon from '../assets';
import RegularText from '../Components/Common/RegularText';
import DrawerComponent from '../Components/module/DrawerComponent';
import * as Screens from '../Screens/index';
import {boxShadow} from '../styles/Mixins';
import {textScale} from '../styles/responsiveStyles';
import {spacing} from '../styles/spacing';
import {fontNames} from '../styles/typography';
import colors from '../Utils/colors';
import THEME_COLOR from '../Utils/Constant';
import NavigationString from './NavigationString';
import {useTheme} from '../Components/hooks';

const Drawer = createDrawerNavigator();
const MAIN_ITEMS = [
  {
    title: 'Complaints',
    icon: SvgIcon.complains,
    component: Screens.ComplainsScreen,
    name: NavigationString.ComplainsScreen,
  },
  {
    title: 'FeedBack',
    icon: SvgIcon.feedback,
    component: Screens.FeedbackScreen,
    name: NavigationString.FeedBackScreen,
  },
  {
    title: 'Projects',
    icon: SvgIcon.projects,
    component: Screens.ProjectsScreen,
    name: NavigationString.ProjectScreen,
  },
  {
    title: 'Message',
    icon: SvgIcon.ChatIcon,
    component: Screens.MessageScreen,
    name: NavigationString.MessageScreen,
  },
  {
    title: 'Contact',
    icon: SvgIcon.ContactIcon,
    component: Screens.ContactScreen,
    name: NavigationString.ContactScreen,
  },
  {
    title: 'Templates',
    icon: SvgIcon.TemplateIcon,
    component: Screens.TemplateScreen,
    name: NavigationString.TemplatesScreen,
  },
  {
    title: 'Forms',
    icon: SvgIcon.FormIcon,
    component: Screens.FormScreen,
    name: NavigationString.FormScreen,
  },
  // {
  //   title: 'Task',
  //   icon: SvgIcon.TaskIcon,
  //   component: Screens.TaskScreen,
  //   name: NavigationString.TaskScreen,
  // },
  {
    title: 'BroadCast Message',
    icon: SvgIcon.SendMessage,
    component: Screens.BroadCastMessage,
    name: NavigationString.broadCastMessageScreen,
  },
  {
    title: 'BroadCast Group',
    icon: SvgIcon.BroadCastGroup,
    component: Screens.BroadCastGroup,
    name: NavigationString.broadCastGroupScreen,
  },
  {
    title: 'Anniversary',
    icon: SvgIcon.AnniversaryIcon,
    component: Screens.AnniversaryScreen,
    name: NavigationString.AnniversaryScreen,
  },
  {
    title: 'Support',
    icon: SvgIcon.Support,
    component: Screens.SupportScreen,
    name: NavigationString.Support,
  },
  // {
  //   title: 'Dashboard',
  //   icon: SvgIcon.DashBordIcon,
  //   component: Screens.DashboardScreen,
  //   name: NavigationString.DashBordScreen,
  // },
];

const DrawerScreen = () => {
  // const { InitialScreen } = useContext(AuthContext);

  // const navigation = useNavigation();
  const {theme} = useTheme();
  // const [isReady, setIsReady] = useState(false);

  // useEffect(() => {
  //   if (!MAIN_ITEMS) {
  //     console.error('MAIN_ITEMS is undefined');
  //     setIsReady(true);
  //     return;
  //   }

  //   const isValidInitialScreen = InitialScreen && MAIN_ITEMS.some(item => item.name === InitialScreen);

  //   if (isValidInitialScreen) {
  //     navigation.dispatch(
  //       CommonActions.reset({
  //         index: 0,
  //         routes: [{ name: InitialScreen }],
  //       })
  //     );
  //   } else {
  //     navigation.dispatch(
  //       CommonActions.reset({
  //         index: 0,
  //         routes: [{ name: NavigationString.DashBordScreen }],
  //       })
  //     );
  //   }
  //   setIsReady(true);
  // }, [InitialScreen]);

  // if (!isReady) {
  //   return <LoadingScreen />;
  // }

  const renderDrawerIcon = (item, theme, isFocused) => {
    const iconColor = isFocused
      ? colors.white
      : theme === THEME_COLOR
      ? colors.black
      : colors.white;
    return (
      <View style={styles.iconContainer}>
        <item.icon
          width={spacing.WIDTH_24}
          height={spacing.HEIGHT_24}
          color={iconColor}
        />
        <RegularText
          style={[
            styles.titleStyle,
            {color: isFocused ? colors.white : iconColor},
          ]}>
          {item.title}
        </RegularText>
      </View>
    );
  };

  const dimensions = useWindowDimensions();

  return (
    <Drawer.Navigator
      drawerContent={props => <DrawerComponent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'left',
        drawerStyle: {
          width: '75%',
          ...boxShadow('#fff', {width: 0, height: 2}, 0.3, 6, 5),
        },
        drawerType: dimensions.width >= 768 ? 'permanent' : 'slide',
        drawerActiveBackgroundColor: '#26bd23',
        drawerActiveTintColor: 'white', // Active text color
        drawerLabelStyle: {
          fontSize: textScale(14),
          fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
        },
      }}
      initialRouteName={NavigationString.ComplainsScreen}>
      {MAIN_ITEMS.map((item, index) => (
        <Drawer.Screen
          key={`DrawerScreen${index}`}
          name={item.name}
          component={item.component}
          options={({focused}) => ({
            drawerLabel: () => null, 
            drawerIcon: () => renderDrawerIcon(item, theme, focused),
          })}
        />
      ))}
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  titleStyle: {
    fontSize: textScale(14),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
    paddingHorizontal: spacing.PADDING_12,
  },
  iconContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default DrawerScreen;
