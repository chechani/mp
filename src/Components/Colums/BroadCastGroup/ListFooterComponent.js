import React from 'react';
import {View} from 'react-native';
import {spacing} from '../../../styles/spacing';
import CustomButton from '../../Common/CustomButton';

const ListFooterComponent = ({
  isDynamicFilters,
  dynamicFilters,
  addFilterRow,
  createGroupHandler,
  isCreatingGroup,
}) => {
  return (
    <View style={{marginBottom: spacing.MARGIN_60,marginHorizontal:spacing.MARGIN_10,

    }}>
      {isDynamicFilters && (
        <CustomButton
          title={dynamicFilters.length > 0 ? 'Add Row' : 'Dynamic Filter'}
          onPress={addFilterRow}
          buttonStyle={{marginVertical:spacing.MARGIN_12}}
        />
      )}
      <CustomButton
        title={'Create Group'}
        onPress={createGroupHandler}
        isLoading={isCreatingGroup}
      />
    </View>
  );
};

export default ListFooterComponent;
