import React, {useEffect, useState} from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View, Platform} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import THEME_COLOR from '../../Utils/Constant';
import {useTheme} from '../hooks';
import colors from '../../Utils/colors';

const CommonPopupModal = ({
  isVisible,
  message,
  messageText,
  buttons = [],
  onCancel,
}) => {
  const {theme} = useTheme();
  const [modalVisible, setModalVisible] = useState(isVisible);

  // Shared values for animations
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const isLightTheme = theme === THEME_COLOR;
  const textColor = isLightTheme ? colors.grey900 : colors.grey200;
  const modalBackground = isLightTheme ? colors.white : colors.grey900;

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => setModalVisible(true), 50); // Delay to prevent render glitches
      opacity.value = withTiming(1, {duration: 200});
      scale.value = withSpring(1);
    } else {
      opacity.value = withTiming(0, {duration: 200}, finished => {
        if (finished) runOnJS(setModalVisible)(false);
      });
      scale.value = withTiming(0.8);
    }
  }, [isVisible]);

  // Animated styles
  const animatedOverlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  return (
    <Modal
      transparent
      visible={modalVisible}
      animationType="none"
      onRequestClose={onCancel}
      accessibilityViewIsModal
      accessibilityLabel="Popup Modal">
      <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
        <Animated.View
          style={[
            styles.modalContainer,
            animatedModalStyle,
            {backgroundColor: modalBackground},
          ]}>
          <Text
            style={[styles.messageText, messageText, {color: textColor}]}
            accessibilityRole="text">
            {message}
          </Text>
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.button, {backgroundColor: button.color || '#28a745'}]}
                onPress={button.onPress}
                accessibilityRole="button"
                accessibilityLabel={button.text}>
                <Text style={styles.buttonText}>{button.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default CommonPopupModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: '80%',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    elevation: Platform.OS === 'android' ? 10 : 0,
    backgroundColor: 'white', // Default background
  },
  messageText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    marginVertical: 5,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
