import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connected: false,
  error: null,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnected(state) {
      state.connected = true;
    },
    setDisconnected(state) {
      state.connected = false;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const { setConnected, setDisconnected, setError } = socketSlice.actions;
export default socketSlice.reducer;
