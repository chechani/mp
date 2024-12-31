import React from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { spacing } from '../../styles/spacing';
import Colors, { gradientColorTokensMap } from '../../theme/colors';
import THEME_COLOR from '../../Utils/Constant';
import { useTheme } from '../hooks';
import Header from './HeaderComponent';

const ContainerComponent = ({
  children,
  useScrollView = true,
  style,
  keyboardAvoidingViewProps = {},
  scrollViewProps = {},
  safeAreaViewProps = {},
  containerStyle = {},
  keyboardAvoidingStyle = {},
  rightComponent,
  scrollViewStyle = {},
  safeAreaStyle = {},
  showHeader = false,
  headerTitle = '',
  headerLeft,
  noPadding = false,
  headerOnPress,
  statusBarBackgroundColor,
  headerBackgroundColor,
  ...rest
}) => {
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const isDarkMode = theme === THEME_COLOR;

  const content = (
    <View
      style={[
        styles.container,
        containerStyle,
        style,
        noPadding && {padding: 0},
        {
          backgroundColor: isDarkMode
            ? Colors.light.white
            : Colors.dark.black,
        },
      ]}
      {...rest}>
      {children}
    </View>
  );

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'dark-content' : 'light-content'}
        backgroundColor={
          statusBarBackgroundColor ||
          (isDarkMode ? Colors.light.white : Colors.dark.black)
        }
      />
      <LinearGradient
        colors={
          isDarkMode
            ? gradientColorTokensMap.DarkGR
            : gradientColorTokensMap.White
        }
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={[{flex: 1, paddingTop: insets.top}, style]}>
        <SafeAreaView
          style={[styles.safeArea, safeAreaStyle, safeAreaViewProps.style]}
          {...safeAreaViewProps}>
          <KeyboardAvoidingView
            style={[
              styles.keyboardAvoiding,
              keyboardAvoidingStyle,
              keyboardAvoidingViewProps.style,
            ]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            {...keyboardAvoidingViewProps}>
            {showHeader && (
              <Header
                leftComponent={headerLeft}
                headerBackgroundColor={
                  headerBackgroundColor ||
                  (isDarkMode
                    ? Colors.light.white : Colors.dark.black)
                }
                title={headerTitle}
                rightComponent={rightComponent}
                onPress={headerOnPress}
              />
            )}
            {useScrollView ? (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                style={[
                  styles.scrollView,
                  scrollViewStyle,
                  scrollViewProps.style,
                  {
                    backgroundColor: isDarkMode
                      ? Colors.light.white : Colors.dark.black,
                  },
                ]}
                {...scrollViewProps}>
                {content}
              </ScrollView>
            ) : (
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                {content}
              </TouchableWithoutFeedback>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: spacing.PADDING_12,
  },
});

export default ContainerComponent;
