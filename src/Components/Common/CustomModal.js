// CustomModal.js
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import Modal from 'react-native-modal';

const CustomModal = ({ visible, onClose, title, children }) => {
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
      <View style={styles.modalContainer}>
        {/* Modal Header */}
        {title && (
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{title}</Text>
          </View>
        )}

        {/* Modal Content */}
        <View style={styles.contentContainer}>
          {children}
        </View>
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
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    width: '100%',
    paddingBottom: 20,
  },
  headerContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});

export default CustomModal;