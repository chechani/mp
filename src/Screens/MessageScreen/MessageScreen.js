import React from 'react';
import {StyleSheet, View} from 'react-native';
import GetAllMessageComponent from '../../Components/module/GetAllMessageComponent';
import ContainerComponent from '../../Components/Common/ContainerComponent';

const MessageScreen = () => {
  return (
    <ContainerComponent noPadding useScrollView={false}>
      <GetAllMessageComponent />
    </ContainerComponent>
  );
};

export default MessageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
