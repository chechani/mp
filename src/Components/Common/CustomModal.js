import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Modal from 'react-native-modal';
import THEMR_COLRO from '../../Utils/Constant';
import {useTheme} from '../hooks';

const CustomModal = ({visible, onClose, title, children}) => {
  const {theme} = useTheme();
  const isDarkMode = theme === THEMR_COLRO;

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
      useNativeDriver={true}
      style={styles.modal}>
      <View
        style={[
          styles.modalContainer,
          {backgroundColor: !isDarkMode ? '#121212' : 'white'},
        ]}>
        {/* Modal Header */}
        {title && (
          <View
            style={[
              styles.headerContainer,
              {borderBottomColor: !isDarkMode ? '#333' : '#E5E5E5'},
            ]}>
            <Text
              style={[styles.title, {color: !isDarkMode ? '#FFF' : '#000'}]}>
              {title}
            </Text>
          </View>
        )}

        {/* Modal Content */}
        <View style={styles.contentContainer}>{children}</View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    width: '100%',
    paddingBottom: 20,
  },
  headerContainer: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});

export default CustomModal;
