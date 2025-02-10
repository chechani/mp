import React from 'react';
import ContainerComponent from '../../Components/Common/ContainerComponent';
import TemplateListComponent from '../../Components/module/TemplateListComponent';

const TemplateScreen = () => {
  return (
    <ContainerComponent noPadding useScrollView={false}>
      <TemplateListComponent />
    </ContainerComponent>
  );
};

export default TemplateScreen;


