import React from 'react';
import { StyleSheet } from 'react-native';
import ContainerComponent from '../../Components/Common/ContainerComponent';
import TemplateListComponent from '../../Components/module/TemplateListComponent';
import { textScale } from '../../styles/responsiveStyles';

const TemplateScreen = () => {
  return (
    <ContainerComponent noPadding useScrollView={false}>
      <TemplateListComponent />
    </ContainerComponent>
  );
};

export default TemplateScreen;

const styles = StyleSheet.create({
  textStyle: {
    fontSize: textScale(16),
    color: '#000',
  },
});
