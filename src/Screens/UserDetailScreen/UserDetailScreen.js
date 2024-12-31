import React from 'react';
import { StyleSheet, View } from 'react-native';
import * as SvgIcon from '../../assets';
import CommoneHeader from '../../Components/Common/CommoneHeader';
import RegularText from '../../Components/Common/RegularText';
import { openDrawer } from '../../Utils/helperFunctions';

const UserDetailScreen = () => {
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <CommoneHeader
        title={'User Details'}
        isLeftHeaderIconTrue={true}
        headerLeftIconSource={SvgIcon.MenuIcon}
        onPressLeftIcon={() => openDrawer()}
      />
      <RegularText>UserDetailScreen</RegularText>
    </View>
  );
};

export default UserDetailScreen;

const styles = StyleSheet.create({});
