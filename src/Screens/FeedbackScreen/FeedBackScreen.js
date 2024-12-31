import React from 'react';
import ContainerComponent from '../../Components/Common/ContainerComponent';
import FeedBackComponent from '../../Components/module/FeedBackComponent';

const FeedBackScreen = () => {
  return (
    <ContainerComponent noPadding useScrollView={false}>
      <FeedBackComponent />
    </ContainerComponent>
  );
};

export default FeedBackScreen;

