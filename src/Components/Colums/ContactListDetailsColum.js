import React from 'react'
import { StyleSheet, View } from 'react-native'
import AnimatedComponentToggle from '../Common/AnimatedComponentToggale'
import RegularText from '../Common/RegularText'

const ContactListDetailsColum = ({ item }) => {
  return (
    <>
      <AnimatedComponentToggle tabName={item.key}>
        {item.data.map((detail, index) => (
          <View key={index} style={styles.contentRow}>
            <RegularText>{`${detail.label}: ${detail.value}`}</RegularText>
          </View>
        ))}
      </AnimatedComponentToggle>


    </>
  )
}

export default ContactListDetailsColum

const styles = StyleSheet.create({
})