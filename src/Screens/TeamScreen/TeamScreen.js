import React from 'react';
import { StyleSheet, View } from 'react-native';
import CommoneHeader from '../../Components/Common/CommoneHeader';
import RegularText from '../../Components/Common/RegularText';
import { openDrawer } from '../../Utils/helperFunctions';
import * as SvgIcon from '../../assets';
import { textScale } from '../../styles/responsiveStyles';

const TeamScreen = () => {
  return (
    <View style={{flex: 1}}>
      <CommoneHeader
        title={'Teams'}
        isLeftHeaderIconTrue={true}
        headerLeftIconSource={SvgIcon.MenuIcon}
        onPressLeftIcon={() => openDrawer()}
      />
      <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
        <RegularText style={styles.textStyle}>TeamScreen</RegularText>
      </View>
    </View>
  );
};

export default TeamScreen;

const styles = StyleSheet.create({
  textStyle: {
    fontSize: textScale(15),
  },
});
