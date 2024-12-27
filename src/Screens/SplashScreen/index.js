import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, ImageBackground, StyleSheet } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import LinearGradient from 'react-native-linear-gradient';
import { useAppSelector } from '../../Components/hooks';
import NavigationString from '../../Navigations/NavigationString';
import { replace } from '../../Utils/helperFunctions';
import { Images } from '../../Utils/ImagePath';

const STORAGE_KEYS = {
  SPLASH_VISITED: '@splashScreenVisited',
};

const ANIMATION_CONFIG = {
  FADE_DURATION: 800,
  SPRING_FRICTION: 5,
  INITIAL_DELAY: 3000,
  NAVIGATION_DELAY: 2000,
  INITIAL_SCALE: 0.85,
};

const useAnimatedValues = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(
    new Animated.Value(ANIMATION_CONFIG.INITIAL_SCALE),
  ).current;

  const animate = () => {
    return Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATION_CONFIG.FADE_DURATION,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: ANIMATION_CONFIG.SPRING_FRICTION,
        useNativeDriver: true,
      }),
    ]);
  };

  return {
    fadeAnim,
    scaleAnim,
    animate,
  };
};

const useNavigationHandler = hasSelectedDomain => {
  
  return useCallback(async () => {
    try {
      const visited = await EncryptedStorage.getItem(
        STORAGE_KEYS.SPLASH_VISITED,
      );

      if (!visited) {
        await EncryptedStorage.setItem(STORAGE_KEYS.SPLASH_VISITED, 'true');
      }

      replace(
        hasSelectedDomain
          ? NavigationString.LoginScreen
          : NavigationString.InitialScreen,
      );
    } catch (error) {
      console.error('Navigation error:', error);
      replace(NavigationString.InitialScreen); 
    }
  }, [hasSelectedDomain]);
};

const SplashScreen = () => {
  const domainState = useAppSelector(state => state.domains);
  const [imageLoaded, setImageLoaded] = useState(false);

  const hasSelectedDomain =
    domainState.selectedDomain && domainState.domains.length > 0;

  const {fadeAnim, scaleAnim, animate} = useAnimatedValues();
  const navigateToNextScreen = useNavigationHandler(hasSelectedDomain);

  useEffect(() => {
    if (imageLoaded) {
      const timer = setTimeout(() => {
        animate().start(() => {
          setTimeout(navigateToNextScreen, ANIMATION_CONFIG.NAVIGATION_DELAY);
        });
      }, ANIMATION_CONFIG.INITIAL_DELAY);

      return () => clearTimeout(timer);
    }
  }, [animate, navigateToNextScreen, imageLoaded]);

  return (
    <LinearGradient
      colors={['#FFA726', '#FFCC80', '#FFFFFF', '#FF5722']}
      start={{x: 0.5, y: 0}}
      end={{x: 0.5, y: 1}}
      style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <ImageBackground
          source={Images.IM_LOGO}
          style={styles.image}
          onLoad={() => setImageLoaded(true)}
        />
      </Animated.View>
    </LinearGradient>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
});




// import React, {useCallback, useEffect, useRef, useState} from 'react';
// import {View, ActivityIndicator, Animated, ImageBackground, StyleSheet} from 'react-native';
// import EncryptedStorage from 'react-native-encrypted-storage';
// import LinearGradient from 'react-native-linear-gradient';
// import {useAppDispatch, useAppSelector} from '../../Components/hooks';
// import NavigationString from '../../Navigations/NavigationString';
// import {loadAuthState} from '../../api/store/slice/authSlice';
// import {getSelectedDomain, loadDomain} from '../../api/store/slice/domainSlice';
// import {loadThemeFromStorage} from '../../api/store/slice/themeSlice';
// import {Images} from '../../Utils/ImagePath';

// const STORAGE_KEYS = {
//   SPLASH_VISITED: '@splashScreenVisited',
// };

// const ANIMATION_CONFIG = {
//   FADE_DURATION: 800,
//   SPRING_FRICTION: 5,
//   INITIAL_DELAY: 3000,
//   NAVIGATION_DELAY: 2000,
//   INITIAL_SCALE: 0.85,
// };

// const useAnimatedValues = () => {
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(
//     new Animated.Value(ANIMATION_CONFIG.INITIAL_SCALE),
//   ).current;

//   const animate = () => {
//     return Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: ANIMATION_CONFIG.FADE_DURATION,
//         useNativeDriver: true,
//       }),
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         friction: ANIMATION_CONFIG.SPRING_FRICTION,
//         useNativeDriver: true,
//       }),
//     ]);
//   };

//   return {
//     fadeAnim,
//     scaleAnim,
//     animate,
//   };
// };

// const SplashScreen = ({navigation}) => {
//   const dispatch = useAppDispatch();
//   const {fadeAnim, scaleAnim, animate} = useAnimatedValues();
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const {isAuthenticated} = useAppSelector(state => state.auth);

//   useEffect(() => {
//     const initializeApp = async () => {
//       await dispatch(loadAuthState());
//       await dispatch(getSelectedDomain());
//       await dispatch(loadDomain());
//       await dispatch(loadThemeFromStorage());

//       if (imageLoaded) {
//         animate().start(() => {
//           setTimeout(() => {
//             navigation.replace(
//               isAuthenticated ? NavigationString.MainStack : NavigationString.AuthStack,
//             );
//           }, ANIMATION_CONFIG.NAVIGATION_DELAY);
//         });
//       }
//     };

//     initializeApp();
//   }, [dispatch, imageLoaded, isAuthenticated, navigation, animate]);

//   return (
//     <LinearGradient
//       colors={['#FFA726', '#FFCC80', '#FFFFFF', '#FF5722']}
//       start={{x: 0.5, y: 0}}
//       end={{x: 0.5, y: 1}}
//       style={styles.container}>
//       <Animated.View
//         style={[
//           styles.content,
//           {
//             opacity: fadeAnim,
//             transform: [{scale: scaleAnim}],
//           },
//         ]}>
//         <ImageBackground
//           source={Images.IM_LOGO}
//           style={styles.image}
//           onLoad={() => setImageLoaded(true)}
//         />
//       </Animated.View>
//     </LinearGradient>
//   );
// };

// export default SplashScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   content: {
//     flex: 1,
//   },
//   image: {
//     flex: 1,
//   },
// });
