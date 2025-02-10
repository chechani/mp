import React from 'react';
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
