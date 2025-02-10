import React, {useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Toast from 'react-native-toast-message';
import {loginUser} from '../../api/store/slice/authSlice';
import {
  selectUrl,
  setDomain,
  updateDomain,
} from '../../api/store/slice/domainSlice';
import * as SvgIcon from '../../assets/index';
import ContainerComponent from '../../Components/Common/ContainerComponent';
import CustomButton from '../../Components/Common/CustomButton';
import CustomInput from '../../Components/Common/CustomInput';
import {useAppDispatch, useAppSelector, useTheme} from '../../Components/hooks';
import NavigationString from '../../Navigations/NavigationString';

import {spacing} from '../../styles/spacing';
import Colors from '../../theme/colors';

import THEME_COLOR from '../../Utils/Constant';
import {replace} from '../../Utils/helperFunctions';

const LoginScreen = () => {
  const {theme} = useTheme();
  const dispatch = useAppDispatch();
  const domainState = useAppSelector(state => state.domains);

  const isDarkMode = theme === THEME_COLOR;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setIsLoading] = useState(false);
  const [updatedDomain, setUpdatedDomain] = useState('');
  const [selectedKey, setSelectedKey] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    if (domainState) {
      setUpdatedDomain(domainState.selectedDomain?.domain);
      setSelectedKey(domainState.selectedDomain?.key);
    }
  }, [domainState]);

  const isLoginEnabled =
    !isEditing && email.trim() !== '' && password.trim() !== '';

  const onPressLogin = async () => {
    const data = {usr: email.trim(), pwd: password.trim()};

    try {
      setIsLoading(true);
      const res = await dispatch(loginUser(data)).unwrap();

      // if (res?.key_details?.auth_token) {
      //   await AsyncStorage.setItem('@rememberMe', 'true');
      // }
      if (res?.message) {
        Toast.show({
          type: 'info',
          text1: 'Warning',
          text2: res?.message,
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.log('Error raised:', error);
      if (error === 'Domain not set') {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Domain not set',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Something went wrong',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    let trimmedDomain = updatedDomain.trim();

    // Validate if the domain is empty
    if (trimmedDomain === undefined) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Domain cannot be empty.',
      });
      return;
    }

    // Ensure the domain starts with http or https
    if (!/^https?:\/\//i.test(trimmedDomain)) {
      trimmedDomain = `https://${trimmedDomain}`;
    }

    try {
      if (selectedKey || selectedKey !== undefined) {
        await dispatch(
          updateDomain({
            key: selectedKey,
            newDomain: trimmedDomain,
          }),
        )
          .unwrap()
          .then(async res => {
            await dispatch(selectUrl(res[0]?.key)).unwrap();
          })
          .catch(error => {
            console.error('Error setting domain:', error);
          });
      } else {
        await dispatch(setDomain(trimmedDomain))
          .unwrap()
          .then(async newDomain => {
            await dispatch(selectUrl(newDomain?.key)).unwrap();
          })
          .catch(error => {
            console.error('Error setting domain:', error);
          });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating domain:', error);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  return (
    <ContainerComponent useScrollView={true} noPadding>
      <View style={styles.childContainer}>
        <View style={styles.logoContainer}>
          <SvgIcon.Logo height={spacing.HEIGHT_105} width={spacing.WIDTH_105} />
        </View>

        <View style={styles.loginContainer}>
          <CustomInput
            value={updatedDomain}
            onChange={value => setUpdatedDomain(value)}
            label="Domain"
            required={true}
            editable={isEditing}
            inputStyles={{
              color: isDarkMode ? Colors.dark.black : Colors.light.white,
            }}
            error={
              isEditing && !updatedDomain
                ? {exists: true, message: 'Domain is required'}
                : null
            }
            showFirstChildren={true}
            FirstChildren={
              <View style={{marginRight: 8}}>
                <SvgIcon.DomainIcon color={Colors.default.grey} />
              </View>
            }
            showSecondChildren={true}
            SecondChildren={
              <TouchableOpacity
                style={{marginRight: 8}}
                onPress={isEditing ? handleSave : handleEditClick}>
                {isEditing ? (
                  <SvgIcon.CheckIcon color={Colors.default.grey} />
                ) : (
                  <SvgIcon.EditIcon color={Colors.default.grey} />
                )}
              </TouchableOpacity>
            }
          />

          <CustomInput
            placeholder="Email"
            value={email}
            onChange={setEmail}
            label="Email"
            showFirstChildren={true}
            FirstChildren={
              <View style={{marginRight: 8}}>
                <SvgIcon.EmailIcon color={Colors.default.grey} />
              </View>
            }
            inputStyles={{
              color: isDarkMode ? Colors.dark.black : Colors.light.white,
            }}
          />

          <CustomInput
            placeholder="Password"
            value={password}
            onChange={setPassword}
            isSecure={true}
            label="Password"
            showFirstChildren={true}
            FirstChildren={
              <View style={{marginRight: 8}}>
                <SvgIcon.PasswordIcon color={Colors.default.grey} />
              </View>
            }
            inputStyles={{
              color: isDarkMode ? Colors.dark.black : Colors.light.white,
            }}
          />

          <CustomButton
            title="Login"
            onPress={onPressLogin}
            isLoading={loading}
            disabled={!isLoginEnabled}
          />
        </View>

        <View style={styles.bottomButtonContainer}>
          <CustomButton
            title={updatedDomain ? 'Change Domain' : 'Set Domain'}
            onPress={() => replace(NavigationString.InitialScreen)}
          />
        </View>
      </View>
    </ContainerComponent>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  childContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  loginContainer: {
    width: '100%',
    paddingHorizontal: spacing.PADDING_16,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.PADDING_16,
  },
});
