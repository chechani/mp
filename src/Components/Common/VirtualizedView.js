import React from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import {useTheme} from '../hooks';

const VirtualizedView = ({children, style, onRefresh, refreshing}) => {
  const {theme} = useTheme();

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme === THEME_COLOR ? colors.white : colors.black,
        },
      ]}>
      <FlatList
        data={[]}
        ListEmptyComponent={null}
        keyExtractor={(item, index) => 'VirtualizedView' + index.toString()}
        key={'VirtualizedView'}
        renderItem={() => null}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={style}
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={refreshing || false}
          />
        }
        ListHeaderComponent={<>{children}</>}
      />
    </View>
  );
};

export default VirtualizedView;
