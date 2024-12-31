import React from 'react';
import { StyleSheet } from 'react-native';
import ContainerComponent from '../../Components/Common/ContainerComponent';
import BroadCastGroupListComponent from '../../Components/module/BroadCastGroupListComponent';

const BroadCastGroup = () => {
  return (
    <ContainerComponent noPadding useScrollView={false}>
      <BroadCastGroupListComponent />
    </ContainerComponent>
  );
};

export default BroadCastGroup;

const styles = StyleSheet.create({});
