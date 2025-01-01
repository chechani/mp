import React, {useRef} from 'react';
import {Button, View, Text, StyleSheet} from 'react-native';
import CustomBottomSheet from '../Common/CustomBottomSheet';

const ExampleScreen = () => {
  const bottomSheetRef = useRef(null); // Create a reference for the bottom sheet

  const handleOpenBottomSheet = () => {
    if (bottomSheetRef.current) {
      bottomSheetRef.current.present(); // Present the bottom sheet when triggered
    } else {
      console.warn('BottomSheet ref is not available');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Open Bottom Sheet" onPress={handleOpenBottomSheet} />
      <CustomBottomSheet ref={bottomSheetRef}>
        <View>
          <Text style={styles.sheetContentText}>
            Hello from Bottom Sheet
          </Text>
          <Button
            title="Close"
            onPress={() => bottomSheetRef.current?.dismiss()}
          />
        </View>
      </CustomBottomSheet>
    </View>
  );
};

export default ExampleScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetContentText: {
    fontSize: 18,
    marginBottom: 10,
  },
});
