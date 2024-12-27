import React, {createContext, useEffect, useReducer, useState} from 'react';
import NavigationString from '../Navigations/NavigationString';
import {
  INITIAL_SCREEN_KEY,
  retrieveItem,
  storeItem,
} from '../Utils/CustomAsyncStorage';

const AuthContext = createContext({});

const initialState = {
  domain: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_DOMAIN':
      return {
        ...state,
        domain: action.payload,
      };
    default:
      return state;
  }
};

const AuthProvider = ({children}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [InitialScreen, setInitialScreen] = useState(
    NavigationString.DashBordScreen,
  );

  useEffect(() => {
    (async () => {
      try {
        const [savedInitialScreen] = await Promise.all([
          retrieveItem(INITIAL_SCREEN_KEY),
        ]);
        if (savedInitialScreen) {
          setInitialScreen(savedInitialScreen);
        }
      } catch (error) {
        console.error('Error retrieving data:', error);
      }
    })();
  }, []);

  const saveInitialScreen = async screenName => {
    console.log('screenName', screenName);

    try {
      const currentScreen = await retrieveItem(INITIAL_SCREEN_KEY);
      if (currentScreen !== screenName) {
        await storeItem(INITIAL_SCREEN_KEY, screenName);
        setInitialScreen(screenName);
      }
    } catch (error) {
      console.error('Error saving initial screen:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        dispatch,
        state,
        InitialScreen,
        saveInitialScreen,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export {AuthContext, AuthProvider};
