import AsyncStorage from '@react-native-async-storage/async-storage';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {io} from 'socket.io-client';
import {STORAGE_KEYS} from '../slice/authSlice';

const initialState = {
  socket: null,
  connected: false,
  error: null,
};

export const initializeSocket = createAsyncThunk(
  'socket/initialize',
  async ({domainState, token}, {rejectWithValue}) => {
    try {
      const socket = io(domainState, {
        withCredentials: true,
        auth: {token}, // Include the token here
        transports: ['websocket'],
        autoConnect: true,
      });

      return new Promise((resolve, reject) => {
        socket.on('connect', () => {
          console.log('✅ Socket connected with ID:', socket.id);
          resolve(socket);
        });
        socket.on('connect_error', err => {
          console.error('❌ Socket connection error:', err);
          reject(err);
        });
      });
    } catch (error) {
      console.error('❌ Socket initialization error:', error.message);
      return rejectWithValue(error.message);
    }
  },
);

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    disconnectSocket(state) {
      if (state.socket) {
        state.socket.disconnect();
        console.log('⚠️ Socket disconnected');
      }
      state.socket = null;
      state.connected = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(initializeSocket.fulfilled, (state, action) => {
        state.socket = action.payload;
        state.connected = true;
        console.log('✅ Socket state updated, connected:', state.connected);
      })
      .addCase(initializeSocket.rejected, (state, action) => {
        state.socket = null;
        state.connected = false;
        state.error = action.payload;
        console.error('❌ Socket initialization failed:', state.error);
      });
  },
});

// Export the actions and reducer
export const {disconnectSocket} = socketSlice.actions;
export default socketSlice.reducer;
