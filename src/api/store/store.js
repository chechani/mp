import {combineReducers, configureStore} from '@reduxjs/toolkit';
import socketReducer from './slice/socketSlice'
import domainReducer from './slice/domainSlice';
import authReducer from './slice/authSlice';
import themeReducer from './slice/themeSlice';
import {BroadCastMessageApiSlices} from './slice/broadCastMessageSlice';
import {BroadCastGroupApiSlices} from './slice/broadCastGroupSlice';
import {MessageApiSlices} from './slice/messageSlice';
import {ChatApiSlices} from './slice/chatSlice';
import {SearchApiSlices} from './slice/searchSlice';
import {contactApiSlices} from './slice/contactSlice';
import {FormApiSlices} from './slice/formSlice';
import {TempleteApiSlices} from './slice/templeteSlice';
import {ProjectSlice} from './slice/ProjectSlice';
import {DateRemindersApiSlices} from './slice/dateReminderSlice';
import {ComplainsApiSlice} from './slice/complainsSlice';
import {feedBackSlice} from './slice/feedBackSlice';

const baseReducer = combineReducers({
  socket: socketReducer,
  domains: domainReducer,
  auth: authReducer,
  theme: themeReducer,

  [ComplainsApiSlice.reducerPath]: ComplainsApiSlice.reducer,
  [feedBackSlice.reducerPath]: feedBackSlice.reducer,
  [BroadCastMessageApiSlices.reducerPath]: BroadCastMessageApiSlices.reducer,
  [BroadCastGroupApiSlices.reducerPath]: BroadCastGroupApiSlices.reducer,
  [MessageApiSlices.reducerPath]: MessageApiSlices.reducer,
  [ChatApiSlices.reducerPath]: ChatApiSlices.reducer,
  [SearchApiSlices.reducerPath]: SearchApiSlices.reducer,
  [contactApiSlices.reducerPath]: contactApiSlices.reducer,
  [FormApiSlices.reducerPath]: FormApiSlices.reducer,
  [TempleteApiSlices.reducerPath]: TempleteApiSlices.reducer,
  [ProjectSlice.reducerPath]: ProjectSlice.reducer,
  [DateRemindersApiSlices.reducerPath]: DateRemindersApiSlices.reducer,
});

const store = configureStore({
  reducer: baseReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: true,
    }).concat(
      BroadCastMessageApiSlices.middleware,
      BroadCastGroupApiSlices.middleware,
      MessageApiSlices.middleware,
      ChatApiSlices.middleware,
      SearchApiSlices.middleware,
      contactApiSlices.middleware,
      FormApiSlices.middleware,
      TempleteApiSlices.middleware,
      ProjectSlice.middleware,
      DateRemindersApiSlices.middleware,
      ComplainsApiSlice.middleware,
      feedBackSlice.middleware,
    ),
});

export default store;
