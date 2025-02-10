import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {useLazyGetAllRemindersQuery} from '../../api/store/slice/dateReminderSlice';
import * as SvgIcon from '../../assets';
import NavigationString from '../../Navigations/NavigationString';
import {navigate, openDrawer} from '../../Utils/helperFunctions';
import DateReminderListColum from '../Colums/DateReminderListColum';
import CommoneHeader from '../Common/CommoneHeader';
import LoadingScreen from '../Common/Loader';

const DateRemindersComponent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [dateReminders, setDateReminders] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMoreData, setHasMoreData] = useState(true);

  const [triggerAllReminder, {isFetching}] = useLazyGetAllRemindersQuery();

  useEffect(() => {
    fetchInitialReminders();
  }, []);

  const fetchInitialReminders = async () => {
    setIsInitialLoading(true);
    try {
      const response = await triggerAllReminder({page: 1, limit: 20}).unwrap();
      setDateReminders(response?.data?.alerts || []);
      setCurrentPage(1);
      setHasMoreData(response?.data?.alerts?.length === 20);
    } catch (error) {
      console.error('Error fetching initial reminders:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const refreshedData = await triggerAllReminder({
        page: 1,
        limit: 20,
      }).unwrap();
      setDateReminders(refreshedData?.data?.alerts || []);
      setCurrentPage(1);
      setHasMoreData(refreshedData?.data?.alerts?.length === 20);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchMoreReminders = async () => {
    if (isLoadingMore || !hasMoreData) return;
    setIsLoadingMore(true);
    try {
      const response = await triggerAllReminder({
        page: currentPage + 1,
        limit: 20,
      }).unwrap();
      if (response?.data?.alerts?.length > 0) {
        setDateReminders(prev => [...prev, ...response.data?.alerts]);
        setCurrentPage(prevPage => prevPage + 1);
      }
      setHasMoreData(response?.data?.alerts?.length === 20);
    } catch (error) {
      console.error('Error fetching more reminders:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <View style={styles.container}>
      <CommoneHeader
        title="Date Reminder"
        leftIcon={SvgIcon.MenuIcon}
        onLeftIconPress={openDrawer}
        showLeftIcon
        showRightIcons
        rightIcons={[SvgIcon.AddICon]}
        onRightIconPress={() => navigate(NavigationString.CreateReminder)}
      />
      {isInitialLoading ? (
        <LoadingScreen />
      ) : (
        <FlatList
          data={dateReminders}
          keyExtractor={item => item?.name}
          renderItem={({item}) => <DateReminderListColum item={item} />}
          onEndReached={fetchMoreReminders}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          ListFooterComponent={
            isLoadingMore && hasMoreData ? (
              <ActivityIndicator size="small" />
            ) : null
          }
        />
      )}
    </View>
  );
};

export default DateRemindersComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
