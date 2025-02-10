import React from 'react';
import ContainerComponent from '../../Components/Common/ContainerComponent';
import DateRemindersComponent from '../../Components/module/DateRemindersComponent';

const DateReminder = () => {
  return (
    <ContainerComponent noPadding useScrollView={false}>
      <DateRemindersComponent />
    </ContainerComponent>
  );
};

export default DateReminder;
