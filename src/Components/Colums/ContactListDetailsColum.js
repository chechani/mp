import React from 'react';
import {View} from 'react-native';
import AnimatedComponentToggle from '../Common/AnimatedComponentToggale';
import TextComponent from '../Common/TextComponent';

const ContactListDetailsColum = ({item}) => {
  return (
    <AnimatedComponentToggle tabName={item.key}>
      {item.data.map((detail, index) => (
        <View key={index} style={styles.contentRow}>
          <TextComponent text={`${detail.label}: ${detail.value}`} />
        </View>
      ))}
    </AnimatedComponentToggle>
  );
};

export default ContactListDetailsColum;
