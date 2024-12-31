import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import CommoneHeader from '../../Components/Common/CommoneHeader';
import {openDrawer} from '../../Utils/helperFunctions';
import * as SvgIcon from '../../assets/index';
import ContainerComponent from '../../Components/Common/ContainerComponent';

const AnniversaryScreen = () => {
  return (
    <ContainerComponent noPadding useScrollView={false}>
      <CommoneHeader
        title="Anniversary"
        showLeftIcon={true}
        onLeftIconPress={() => openDrawer()}
        leftIcon={SvgIcon.MenuIcon}
      />
    </ContainerComponent>
  );
};

export default AnniversaryScreen;

const styles = StyleSheet.create({});
