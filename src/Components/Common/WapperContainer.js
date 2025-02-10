import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet, View} from 'react-native';
import colors from '../../Utils/colors';

const WapperContainer = ({style = {}, children}) => {
  return (
    <SafeAreaView style={{flex: 1}}>
      <StatusBar backgroundColor={'gray'} />
      <View
        style={{
          ...styles.container,
          ...style,
        }}>
        {children}
      </View>
    </SafeAreaView>
    //
  );
};

export default WapperContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
});
