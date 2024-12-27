import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import {
  logoutUser,
  STORAGE_KEYS
} from '../../api/store/slice/authSlice';
import * as SvgIcon from '../../assets';
import commonStyle, { APP_PADDING_HORIZONTAL } from '../../styles/commonStyle';
import { textScale } from '../../styles/responsiveStyles';
import { spacing } from '../../styles/spacing';
import { fontNames } from '../../styles/typography';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import { closeDrawer } from '../../Utils/helperFunctions';
import RegularText from '../Common/RegularText';
import { useAppDispatch, useTheme } from '../hooks';

const DrawerComponent = props => {
  const {theme, toggleTheme} = useTheme();

  const dispatch = useAppDispatch();
 

  const [userInfo, setUserInfo] = useState({
    userName: '',
    companyName: '',
    number: '',
  });

  // Fetch the user info from storage and update state
  const getUserData = async () => {
    try {
      const storedData = await AsyncStorage.multiGet(
        Object.values(STORAGE_KEYS),
      );

      const parsedData = Object.fromEntries(
        storedData.map(([key, value]) => {
          try {
            // Parse JSON if the value looks like JSON
            return [
              key,
              (value && value.startsWith('{')) || value.startsWith('[')
                ? JSON.parse(value)
                : value,
            ];
          } catch {
            return [key, value || ''];
          }
        }),
      );

      setUserInfo({
        userName: parsedData[STORAGE_KEYS.FULL_NAME] || 'User Name',
        companyName: parsedData[STORAGE_KEYS.WHATSAPP_DISPLAY_NAME] || '',
        number: parsedData[STORAGE_KEYS.WHATSAPP_NUMBER] || '',
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      Toast.show({
        type: 'error',
        text1: 'error',
        text2: 'Failed to fetch user information',
      });
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const handleLogout = async (key) => {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      dispatch(logoutUser());
      Toast.show({
        type: 'success',
        text1: 'success',
        text2: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Error during logout:', error);
      Toast.show({
        type: 'error',
        text1: 'error',
        text2: 'Failed to log out. Please try again',
      });
    }
  };

  const renderDrawerHeader = () => (
    <View style={styles.subContainer}>
      <View style={{marginTop: spacing.MARGIN_12, flex: 1}}>
        {['userName', 'companyName', 'number'].map(field => (
          <RegularText
            key={field}
            style={[
              styles.userInfoTextStyle,
              field === 'userName' && styles.userNameTextStyle,
              {
                flexWrap: 'wrap',
                color: theme === THEME_COLOR ? colors.black : colors.white,
              },
            ]}>
            {userInfo[field]}
          </RegularText>
        ))}
      </View>
      <TouchableOpacity
        style={styles.headerContainer}
        hitSlop={{left: 20, right: 20, top: 20, bottom: 20}}
        onPress={closeDrawer}>
        <SvgIcon.Wrong
          width={spacing.WIDTH_30}
          height={spacing.HEIGHT_30}
          color={theme === THEME_COLOR ? colors.black : colors.white}
        />
      </TouchableOpacity>
    </View>
  );

  // Drawer Logout and Theme Selection Section
  const renderLogoutButton = () => {
    return (
      <View>
        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutContainer}
          onPress={handleLogout}
          hitSlop={{left: 20, right: 20, top: 20, bottom: 20}}>
          <SvgIcon.LogoutIcon
            width={spacing.WIDTH_24}
            height={spacing.HEIGHT_24}
            color={theme === THEME_COLOR ? colors.black : colors.white}
          />
          <RegularText
            style={[
              styles.menuItemContainer_title,
              {color: theme === THEME_COLOR ? colors.black : colors.white},
            ]}>
            Logout
          </RegularText>
        </TouchableOpacity>

        {/* Radio Buttons for Theme Selection */}
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => {
              if (theme !== 'light') toggleTheme();
            }}>
            <View
              style={[
                theme === 'light'
                  ? styles.radioSelected
                  : styles.radioUnselected,
                {
                  borderColor: theme === 'light' ? colors.black : colors.white,
                  backgroundColor: colors.black,
                },
              ]}
            />
            <RegularText
              style={[
                styles.radioLabel,
                {color: theme === 'light' ? colors.black : colors.white},
              ]}>
              Light Mode
            </RegularText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => {
              if (theme !== 'dark') toggleTheme();
            }}>
            <View
              style={[
                theme === 'dark'
                  ? styles.radioSelected
                  : styles.radioUnselected,
                {
                  borderColor: theme === 'dark' ? colors.white : colors.black,
                  backgroundColor: colors.white,
                },
              ]}
            />
            <RegularText
              style={[
                styles.radioLabel,
                {color: theme === 'dark' ? colors.white : colors.black},
              ]}>
              Dark Mode
            </RegularText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.mainContainer,
        {
          backgroundColor: theme === THEME_COLOR ? colors.white : '#000000ef',
        },
      ]}>
      <StatusBar
        backgroundColor={theme === THEME_COLOR ? colors.white : '#000000ef'}
        barStyle={theme === THEME_COLOR ? 'dark-content' : 'light-content'}
      />
      {renderDrawerHeader()}
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      {renderLogoutButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    paddingHorizontal: APP_PADDING_HORIZONTAL,
    flex: 1,
  },
  headerContainer: {
    ...commonStyle.flexRow,
    justifyContent: 'flex-end',
    marginTop: spacing.MARGIN_12,
  },
  logoutContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    gap: spacing.MARGIN_12,
    paddingVertical: spacing.PADDING_14,
    paddingLeft: spacing.PADDING_20,
    alignItems: 'center',
  },
  subContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: APP_PADDING_HORIZONTAL,
  },
  userInfoTextStyle: {
    fontSize: textScale(14),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_MEDIUM,
    color: colors.black,
    marginBottom: spacing.MARGIN_2,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  menuItemContainer_title: {
    fontSize: textScale(14),
    color: colors.grey700,
  },
  userNameTextStyle: {
    fontSize: textScale(20),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_BOLD,
    color: colors.black,
    marginBottom: spacing.MARGIN_4,
  },
  radioContainer: {
    marginVertical: spacing.MARGIN_20,
    paddingLeft: spacing.PADDING_20,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.MARGIN_6,
  },
  radioSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    marginRight: 10,
  },
  radioUnselected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    marginRight: 10,
  },
  radioLabel: {
    fontSize: 16,
  },
});

export default DrawerComponent;
