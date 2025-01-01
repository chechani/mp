import {useDispatch, useSelector} from 'react-redux';
import {useColorScheme} from 'react-native';
import {toggleTheme as toggleThemeAction} from '../../api/store/slice/themeSlice';

// Custom hooks for dispatch and selector
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

// Custom hook for theme management
export const useTheme = () => {
  const dispatch = useAppDispatch();
  const systemTheme = useColorScheme();
  const theme = useAppSelector(state => state.theme.theme);

  const toggleTheme = () => {
    dispatch(toggleThemeAction());
  };

  return {theme: theme || systemTheme, toggleTheme};
};
