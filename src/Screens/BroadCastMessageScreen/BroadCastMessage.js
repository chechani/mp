import React from 'react';
import ContainerComponent from '../../Components/Common/ContainerComponent';
import BroadCastMessageListComponent from '../../Components/module/BroadCastMessageListComponent';

const BroadCastMessage = () => {
  return (
    <ContainerComponent noPadding useScrollView={false}>
      <BroadCastMessageListComponent />
    </ContainerComponent>
  );
};

export default BroadCastMessage;


