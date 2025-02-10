import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {boxShadow} from '../../styles/Mixins';
import {
  moderateScale,
  textScale,
  verticalScale,
} from '../../styles/responsiveStyles';

const DropdownModal = ({isVisible, onClose, fetchData, onSelectItem}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      loadData();
    }
  }, [isVisible]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchData();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleSelect = item => {
    onSelectItem(item);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <FlatList
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => handleSelect(item.title1)}>
                <Text style={styles.itemText}>{item.title1}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              loading ? (
                <Text style={styles.loadingText}>Loading...</Text>
              ) : (
                <Text style={styles.loadingText}>No Data Available</Text>
              )
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '80%',
    maxHeight: '60%',
    borderRadius: moderateScale(10),
    paddingVertical: moderateScale(16),
    paddingHorizontal: moderateScale(10),
    ...boxShadow('#000', {height: 4, width: 0}, 4, 0.2),
  },
  itemContainer: {
    padding: moderateScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemText: {
    fontSize: textScale(16),
    color: '#000',
  },
  loadingText: {
    textAlign: 'center',
    marginVertical: verticalScale(10),
    fontSize: textScale(14),
  },
});

export default DropdownModal;
