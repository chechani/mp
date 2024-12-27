import React, {useEffect, useState} from 'react';
import {Modal, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
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

  useEffect(() => {
    if (isVisible) {
      setModalVisible(true);
      // Animate opacity and scale in
      opacity.value = withTiming(1, {duration: 200});
      scale.value = withSpring(1, {damping: 20, stiffness: 100});
    } else {
      // Animate opacity and scale out
      opacity.value = withTiming(0, {duration: 200}, finished => {
        if (finished) {
          runOnJS(setModalVisible)(false);
        }
      });
      scale.value = withTiming(0.8, {duration: 200});
    }
  }, [isVisible]);

  // Animated styles
  const animatedOverlayStyle = useAnimatedStyle(() => ({
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
      onRequestClose={onCancel}>
      <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
        <Animated.View
          style={[
            styles.modalContainer,
            animatedModalStyle,
            {
              backgroundColor:
                theme === THEME_COLOR ? colors.white : colors.grey900,
            },
          ]}>
          <Text style={[styles.messageText, messageText,{color: theme === THEME_COLOR ? colors.white : colors.grey200,}]}>
            {message}
          </Text>
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  {backgroundColor: button.color || '#28a745'},
                ]}
                onPress={() => {
                  if (typeof button.onPress === 'function') {
                    button.onPress();
                  }
                }}>
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
    // The background color and opacity are handled by Animated styles
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
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
