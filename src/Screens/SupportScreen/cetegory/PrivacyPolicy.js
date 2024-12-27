import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import WebViewComp from '../../../Components/Common/WebView'

const PrivacyPolicy = () => {
  return (
    <View style={{flex: 1}}>
     <WebViewComp uri={'https://smartysoft.in/privacy_policy'} />
    </View>
  )
}

export default PrivacyPolicy

const styles = StyleSheet.create({})