import React from 'react';
import ContainerComponent from '../../Components/Common/ContainerComponent';
import ContactListComponent from '../../Components/module/ContactListComponent';

const ContactScreen = () => {
  return (
    <ContainerComponent noPadding useScrollView={false}>
      <ContactListComponent />
    </ContainerComponent>
  );
};

export default ContactScreen;


