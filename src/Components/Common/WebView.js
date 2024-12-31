import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

const WebViewComp = ({uri}) => {
  return (
    <View style={{flex: 1}}>
      <WebView source={{uri:uri}} style={{flex: 1}} />
    </View>
  );
};

export default WebViewComp;

const styles = StyleSheet.create({});
