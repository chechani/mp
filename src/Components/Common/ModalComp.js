import React from "react";
import { Modal, StyleSheet } from "react-native";

const ModalComp = ({
  children,
  isVisible = false,
  onBackdropPress = () => {},
  style,
  ...props
}) => {
  return (
    <Modal
      visible={isVisible}
      onRequestClose={onBackdropPress}
      style={[styles.modalStyle ,style]}
      {...props}
    >
      {children}
    </Modal>
  );
};

export default ModalComp;

const styles = StyleSheet.create({
  modalStyle: {
  },
});
