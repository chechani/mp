import React from 'react';
import ContainerComponent from '../../Components/Common/ContainerComponent';
import GetAllMessageComponent from '../../Components/module/GetAllMessageComponent';

const MessageScreen = () => {
  return (
    <ContainerComponent noPadding useScrollView={false}>
      <GetAllMessageComponent />
    </ContainerComponent>
  );
};

export default MessageScreen;
