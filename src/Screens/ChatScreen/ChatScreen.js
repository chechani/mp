import React from 'react';
import { ImageBackground, View } from 'react-native';
import { useTheme } from '../../Components/hooks';
import MessageListComponent from '../../Components/module/MessageListComponent';
import THEME_COLOR from '../../Utils/Constant';
import { Images } from '../../Utils/ImagePath';

const ChatScreen = ({route}) => {
  const {theme} = useTheme();
  const {Mobile_No, title, unreadMessages, contact} = route.params;

  return (
    <View style={{flex:1}}>
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
    </View>
  );
};

export default ChatScreen;

