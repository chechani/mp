import React from 'react';
import { StyleSheet } from 'react-native';
import ContainerComponent from '../../Components/Common/ContainerComponent';
import ComplainsComponent from '../../Components/module/ComplainsComponent';

const ComplainsScreen = () => {
  return (
    <ContainerComponent noPadding useScrollView={false}>
      <ComplainsComponent />
    </ContainerComponent>
  );
};

export default ComplainsScreen;
