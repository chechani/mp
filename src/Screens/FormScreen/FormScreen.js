import React from 'react';
import { StyleSheet } from 'react-native';
import ContainerComponent from '../../Components/Common/ContainerComponent';
import FormListComponent from '../../Components/module/FormListComponent';

const FormScreen = () => {
  return (
    <ContainerComponent noPadding useScrollView={false}>
      <FormListComponent />
    </ContainerComponent>
  );
};

export default FormScreen;

const styles = StyleSheet.create({});
