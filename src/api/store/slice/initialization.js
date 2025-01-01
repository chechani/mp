import { createAsyncThunk } from '@reduxjs/toolkit';
import { getSelectedDomain, loadDomain } from './domainSlice';
import { loadAuthState } from './authSlice';
import { loadThemeFromStorage } from './themeSlice';

export const initializeApp = createAsyncThunk(
  'app/initializeApp',
  async (_, { dispatch }) => {
    await dispatch(getSelectedDomain()).unwrap();
    await dispatch(loadDomain()).unwrap();
    await dispatch(loadAuthState()).unwrap();
    await dispatch(loadThemeFromStorage()).unwrap();
  }
);
