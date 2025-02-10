//import liraries
import React from 'react';
import {StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import {spacing} from '../../styles/spacing';

// create a component
const FastImageComp = ({url = '', imageStyle = {}}) => {
  return (
    <FastImage
      style={{...styles.imageStyle, ...imageStyle}}
      source={{
        uri: url,
        priority: FastImage.priority.normal,
      }}
      resizeMode={FastImage.resizeMode.cover}
    />
  );
};

// define your styles
const styles = StyleSheet.create({
  imageStyle: {
    width: '100%',
    height: spacing.HEIGHT_216,
  },
});

//make this component available to the app
export default FastImageComp;
