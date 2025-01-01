import * as Screens from '../Screens/index';
import NavigationString from './NavigationString';

export const AuthStack = Stack => {
  return (
    <>
      <Stack.Screen
        name={NavigationString.LoginScreen}
        component={Screens.LoginScreen}
      />
      <Stack.Screen
        name={NavigationString.InitialScreen}
        component={Screens.InitialScreen}
      />
    </>
  );
};
