import React from 'react';
import * as Screens from '../Screens/index';
import colors from '../Utils/colors';
import Drawer from './Drawer';
import navigationString from './NavigationString';

export const MainStack = Stack => {
  return (
    <>
      <Stack.Screen
        name={navigationString.DrawerBar}
        component={Drawer}
        options={{animation: 'none'}}
      />
      <Stack.Screen
        name={navigationString.ChatScreen}
        component={Screens.ChatScreen}
      />
      <Stack.Screen
        name={navigationString.FormResponseCompleteScreen}
        component={Screens.FormResponseCompleteScreen}
      />
      <Stack.Screen
        name={navigationString.FormResponseInCompleteScreen}
        component={Screens.FormResponseInCompletedScreen}
      />
      <Stack.Screen
        name={navigationString.TaskResponseScreen}
        component={Screens.TaskResponseScreen}
      />
      <Stack.Screen
        name={navigationString.ContactListDetailsRowScreen}
        component={Screens.ContactListDetailsRow}
      />
      <Stack.Screen
        name={navigationString.LocalContactListScreen}
        component={Screens.LocalContactListColum}
      />
      <Stack.Screen
        name={navigationString.CreateTask}
        component={Screens.CreateTask}
        options={{
          gestureEnabled: true, // Enable drag gesture
          gestureDirection: 'vertical', // Allow vertical gestures
          transitionSpec: {
            open: {animation: 'timing', config: {duration: 2000}}, // Opening duration (500ms)
            close: {animation: 'timing', config: {duration: 3000}}, // Closing duration (300ms)
          },
          cardStyle: {backgroundColor: colors.transparent},
          presentation: 'modal',
          animation: 'slide_from_bottom',
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen
        name={navigationString.RepeatTask}
        component={Screens.ReapeatTask}
        options={{
          presentation: 'modal',
          gestureEnabled: true, // Enable drag gesture
          gestureDirection: 'vertical', // Allow vertical gestures
          transitionSpec: {
            open: {animation: 'timing', config: {duration: 2000}}, // Opening duration (500ms)
            close: {animation: 'timing', config: {duration: 3000}}, // Closing duration (300ms)
          },
          cardStyle: {backgroundColor: colors.transparent},
          animation: 'slide_from_bottom',
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen
        name={navigationString.RepeatTaskComponent}
        component={Screens.RepeatTaskComponent}
        options={{
          presentation: 'modal',
          gestureEnabled: true, // Enable drag gesture
          gestureDirection: 'vertical', // Allow vertical gestures
          transitionSpec: {
            open: {animation: 'timing', config: {duration: 2000}}, // Opening duration (500ms)
            close: {animation: 'timing', config: {duration: 3000}}, // Closing duration (300ms)
          },
          cardStyle: {backgroundColor: colors.transparent},
          animation: 'slide_from_right',
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen
        name={navigationString.CreateTaskComponent}
        component={Screens.CreateTAskComponent}
        options={{
          presentation: 'modal',
          gestureEnabled: true, // Enable drag gesture
          gestureDirection: 'vertical', // Allow vertical gestures
          transitionSpec: {
            open: {animation: 'timing', config: {duration: 2000}},
            close: {animation: 'timing', config: {duration: 3000}},
          },
          cardStyle: {backgroundColor: colors.transparent},
          animation: 'slide_from_right',
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen
        name={navigationString.TaskCommentComponent}
        component={Screens.TaskCommentComponent}
      />
      <Stack.Screen
        name={navigationString.searchContact}
        component={Screens.SearchContact}
      />
      <Stack.Screen
        name={navigationString.searchMessage}
        component={Screens.SearchMessage}
      />
      <Stack.Screen
        name={navigationString.broadCastGroupDetailScreen}
        component={Screens.BroadCastGroupDetails}
      />
      <Stack.Screen
        name={navigationString.BroadCastGroupMessageListColumScreen}
        component={Screens.BroadCastGroupMessageListColum}
      />
      <Stack.Screen
        name={navigationString.BroadCastGroupMessageConatctDetailsScreen}
        component={Screens.BroadCastGroupMessageContactDetails}
      />
      <Stack.Screen
        name={navigationString.BroadCastGroupSearchContactScreen}
        component={Screens.SearchBroadCastContact}
      />
      <Stack.Screen
        name={navigationString.CommonComplaitsAndFeedBack}
        component={Screens.CommonComplaintsAndFeedBack}
      />
      <Stack.Screen
        name={navigationString.webView}
        component={Screens.WebView}
      />
      <Stack.Screen
        name={navigationString.PrivacyPolicy}
        component={Screens.PrivacyPolicy}
      />
    </>
  );
};
