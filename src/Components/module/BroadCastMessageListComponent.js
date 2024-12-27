import React from 'react';
import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useGetBroadCastGroupQuery} from '../../api/store/slice/broadCastGroupSlice';
import * as SvgIcon from '../../assets/index';
import NavigationString from '../../Navigations/NavigationString';
import {useTheme} from '../hooks';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import {navigate, openDrawer} from '../../Utils/helperFunctions';
import CommonHeader from '../Common/CommoneHeader';
import LoadingScreen from '../Common/Loader';
import RegularText from '../Common/RegularText';

const BroadCastMessageListComponent = () => {
  const {theme} = useTheme();
  const {data, isLoading, error, isError, refetch} =
    useGetBroadCastGroupQuery();

  const renderMessageItem = ({item}) => {
    return (
      <>
        <TouchableOpacity
          style={[
            styles.messageCard,
            {
              backgroundColor:
                theme === THEME_COLOR ? colors.white : colors.black,
            },
          ]}
          onPress={() =>
            navigate(NavigationString.BroadCastGroupMessageListColumScreen, {
              groupName: item?.name,
            })
          }>
          <RegularText
            style={[
              styles.messageTitle,
              {color: theme === THEME_COLOR ? colors.black : colors.white},
            ]}>
            {item.group_name}
          </RegularText>
        </TouchableOpacity>
        <View
          style={[
            styles.divider,
            {
              backgroundColor:
                theme === THEME_COLOR ? colors.grey300 : colors.grey600,
            },
          ]}
        />
      </>
    );
  };
  return (
    <>
      <CommonHeader
        title={'Broadcast Message'}
        showLeftIcon={true}
        leftIcon={SvgIcon.MenuIcon}
        onLeftIconPress={openDrawer}
        showRightIcons={true}
        rightIcons={[SvgIcon.ReloadIcon]}
        onRightIconPress={() => refetch()}
      />
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          },
        ]}>
        {isLoading ? (
          <LoadingScreen color={colors.green} />
        ) : isError ? (
          <RegularText style={styles.errorText}>
            {error?.data?.message || error?.error || 'Something went wrong'}
          </RegularText>
        ) : (
          <FlatList
            data={data?.data}
            keyExtractor={item => item?.name?.toString()}
            renderItem={renderMessageItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <RegularText
                style={[
                  styles.emptyContainer,
                  {color: theme === THEME_COLOR ? colors.white : colors.black},
                ]}>
                {data?.message || 'No data found'}
              </RegularText>
            }
          />
        )}
      </View>
    </>
  );
};

export default BroadCastMessageListComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  loader: {
    marginTop: spacing.MARGIN_20,
  },
  errorText: {
    color: colors.red600,
    fontSize: textScale(16),
    textAlign: 'center',
    marginTop: spacing.MARGIN_10,
  },
  listContent: {
    paddingBottom: spacing.PADDING_20,
  },
  messageCard: {
    backgroundColor: colors.white,
    padding: spacing.PADDING_12,
  },
  messageTitle: {
    fontSize: textScale(18),
    marginBottom: spacing.MARGIN_4,
    color: '#040303',
  },
  divider: {
    height: 0.5,
    backgroundColor: colors.grey300,
  },
  emptyContainer: {
    textAlign: 'center',
    marginTop: spacing.MARGIN_20,
  },
});
