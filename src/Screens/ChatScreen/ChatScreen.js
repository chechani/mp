import React from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import MessageListComponent from '../../Components/module/MessageListComponent';
import {Images} from '../../Utils/ImagePath';
import {useTheme} from '../../Components/hooks';
import THEME_COLOR from '../../Utils/Constant';
import ContainerComponent from '../../Components/Common/ContainerComponent';

const ChatScreen = ({route}) => {
  const {theme} = useTheme();
  const {Mobile_No, title, unreadMessages, contact} = route.params;

  return (
    <ContainerComponent noPadding useScrollView={false}>
      <ImageBackground
        source={
          theme === THEME_COLOR
            ? Images.IM_LIGHT_BACKGROUND_CHAT
            : Images.IM_DARK_BACKGROUND_CHAT
        }
        style={{flex: 1}}>
        <MessageListComponent
          Mobile_No={Mobile_No}
          unreadMessages={unreadMessages}
          title={title}
          contact={contact}
        />
      </ImageBackground>
    </ContainerComponent>
  );
};

export default ChatScreen;

