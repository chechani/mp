import {combineReducers, configureStore} from '@reduxjs/toolkit';
import socketReducer from '../store/slice/socketSlice'
import domainReducer from './slice/domainSlice';
import authReducer from './slice/authSlice';
import themeReducer from './slice/themeSlice';
import {BroadCastMessageApiSlices} from './slice/broadCastMessageSlice';
import {BroadCastGroupApiSlices} from './slice/broadCastGroupSlice';
import {ComplainsSlice} from './slice/complainsSlice';
import {feedBackSlice} from './slice/feedBackSlice';
import {ProjectSlice} from './slice/ProjectSlice';
import {MessageApiSlices} from './slice/messageSlice';
import {ChatApiSlices} from './slice/chatSlice';
import {SearchApiSlices} from './slice/searchSlice';
import {contactApiSlices} from './slice/contactSlice';
import {FormApiSlices} from './slice/formSlice';
import {TempleteApiSlices} from './slice/templeteSlice';

const baseReducer = combineReducers({
  socket: socketReducer,
  domains: domainReducer,
  auth: authReducer,
  theme: themeReducer,

  [BroadCastMessageApiSlices.reducerPath]: BroadCastMessageApiSlices.reducer,
  [BroadCastGroupApiSlices.reducerPath]: BroadCastGroupApiSlices.reducer,
  [ComplainsSlice.reducerPath]: ComplainsSlice.reducer,
  [feedBackSlice.reducerPath]: feedBackSlice.reducer,
  [ProjectSlice.reducerPath]: ProjectSlice.reducer,
  [MessageApiSlices.reducerPath]: MessageApiSlices.reducer,
  [ChatApiSlices.reducerPath]: ChatApiSlices.reducer,
  [SearchApiSlices.reducerPath]: SearchApiSlices.reducer,
  [contactApiSlices.reducerPath]: contactApiSlices.reducer,
  [FormApiSlices.reducerPath]: FormApiSlices.reducer,
  [TempleteApiSlices.reducerPath]: TempleteApiSlices.reducer,
});

const store = configureStore({
  reducer: baseReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      BroadCastMessageApiSlices.middleware,
      BroadCastGroupApiSlices.middleware,
      ComplainsSlice.middleware,
      feedBackSlice.middleware,
      ProjectSlice.middleware,
      MessageApiSlices.middleware,
      ChatApiSlices.middleware,
      SearchApiSlices.middleware,
      contactApiSlices.middleware,
      FormApiSlices.middleware,
      TempleteApiSlices.middleware,
    ),
});

export default store;
