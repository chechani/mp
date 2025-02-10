import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { CustomBottomSheetFlatList } from '../../../Common/CustomBottomSheetFlatList';
import { BottomComp } from '../../../Common/BottomComp';
import { LoadingScreen } from '../../../Common/LoadingScreen';
import { TextComponent } from '../../../Common/TextComponent';
import { colors, fontNames, spacing } from '../../../theme';
import styles from '../styles';

export const MessageBottomSheet = forwardRef(({
  data,
  loading,
  activeQuery,
  onItemPress,
  onQuerySelect,
}, ref) => {
  const renderItem = ({ item }) => (
    <View style={styles.whatsAppMessageKeyWordListContainer}>
      <TextComponent
        text={formatDocName(item?.name)}
        font={fontNames.ROBOTO_FONT_FAMILY_MEDIUM}
      />

      <BottomComp
        style={styles.sendButtonBottomSheet}
        text="Send"
        textStyle={styles.sendButtonTextBottomSheet}
        onPress={() => onItemPress(item?.name)}
      />
    </View>
  );

  const renderEmptyComponent = () => {
    if (loading) {
      return <LoadingScreen color={colors.green} />;
    }

    return (
      <View style={styles.chatOptionContainer}>
        {QUERY_TYPES.map((docType, index) => (
          <BottomComp
            key={index}
            style={styles.templateBtnStyle}
            text={docType.split('_')[1]}
            textStyle={styles.templateKeyWord}
            onPress={() => onQuerySelect(docType)}
          />
        ))}
      </View>
    );
  };

  return (
    <CustomBottomSheetFlatList
      ref={ref}
      snapPoints={['40%', '80%']}
      data={data}
      keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
      renderItem={renderItem}
      ListEmptyComponent={renderEmptyComponent}
      contentContainerStyle={styles.bottomSheetContent}
    />
  );
});