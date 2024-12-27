// ThemeContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { retrieveItem, storeItem } from '../Utils/CustomAsyncStorage';

const ThemeContext = createContext();
let globalTheme = 'light';

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState(globalTheme || systemTheme || 'light');

  // Persist theme preference using AsyncStorage
  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await retrieveItem('app-theme');
      if (savedTheme) {
        setTheme(savedTheme);
        globalTheme = savedTheme;
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    globalTheme = newTheme;
    await storeItem('app-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);


