import {FlashList} from '@shopify/flash-list';
import React, {memo, useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useLazyGetAllMessageListQuery} from '../../api/store/slice/messageSlice';
import * as SvgIcon from '../../assets';
import NavigationString from '../../Navigations/NavigationString';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import colors from '../../Utils/colors';
import THEME_COLOR from '../../Utils/Constant';
import {navigate, openDrawer} from '../../Utils/helperFunctions';
import AllGetMessageListColum from '../Colums/AllGetMessageListColum';
import CommoneHeader from '../Common/CommoneHeader';
import RegularText from '../Common/RegularText';
import {useTheme} from '../hooks';
import LoadingScreen from '../Common/Loader';

const GetAllMessageComponent = () => {
  const {theme} = useTheme();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState('initial');

  const [triggerGetMessages] = useLazyGetAllMessageListQuery();

  const fetchMessages = useCallback(
    async (currentPage, reset = false, loadingState = 'none') => {
      setIsLoading(loadingState);
      try {
        const response = await triggerGetMessages({
          page: currentPage,
          page_size: 20,
        }).unwrap();

        const chats = response?.message?.chats || [];
        const apiTotalPages = response?.message?.total_pages || 0;

        setHasMore(currentPage < apiTotalPages);

        setMessages(prevMessages =>
          reset ? chats : [...prevMessages, ...chats],
        );
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setHasMore(false);
      } finally {
        setIsLoading('none');
      }
    },
    [triggerGetMessages],
  );

  useEffect(() => {
    fetchMessages(1, true, 'initial');
  }, []);

  const handleFilterChange = useCallback(
    filter => {
      setSelectedFilter(filter);
      setPage(1);
      setHasMore(true);
      fetchMessages(1, true, 'initial');
    },
    [fetchMessages],
  );

  const handleRefresh = useCallback(() => {
    if (isLoading !== 'none') return;
    setPage(1);
    setHasMore(true);
    fetchMessages(1, true, 'refreshing');
  }, [fetchMessages, isLoading]);

  const loadMoreMessages = useCallback(() => {
    if (!hasMore || isLoading !== 'none') return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMessages(nextPage, false, 'loadingMore');
  }, [hasMore, page, fetchMessages, isLoading]);

  const filteredData = messages.filter(message => {
    switch (selectedFilter) {
      case 'Unread':
        return message.unread_messages > 0;
      case 'All':
        return true; 
      case 'Favourites': 
        return message.is_favourite; 
      case 'Archived':
        return message.is_archived; 
      default:
        return false;
    }
  });

  const handleCommonBarRightIconPress = index => {
    const actions = {
      0: () => navigate(NavigationString.searchMessage),
      1: () => handleRefresh(),
    };

    if (actions[index]) {
      actions[index]();
    }
  };

  const FilterButton = memo(({filter, selectedFilter, onPress}) => (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} // Reduced hitSlop
      style={[
        styles.filterButton,
        selectedFilter === filter ? styles.selectedButton : null,
      ]}>
      <RegularText
        style={{
          color: selectedFilter === filter ? colors.white : colors.black,
        }}>
        {filter}
      </RegularText>
    </TouchableOpacity>
  ));

  const renderFooter = () => {
    if (isLoading === 'loadingMore') {
      return (
        <View style={styles.footerLoadingContainer}>
          <ActivityIndicator size="large" color={colors.green600} />
        </View>
      );
    }
    return null;
  };

  const renderListEmptyComponent = () => (
    <View style={styles.emptyListContainer}>
      <RegularText style={styles.emptyListText}>No messages found</RegularText>
    </View>
  );

  return (
    <>
      <CommoneHeader
        title="Messages"
        showLeftIcon
        leftIcon={SvgIcon.MenuIcon}
        onLeftIconPress={openDrawer}
        showRightIcons
        rightIcons={[SvgIcon.Search, SvgIcon.ReloadIcon]}
        onRightIconPress={handleCommonBarRightIconPress}
      />
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              theme === THEME_COLOR ? colors.white : colors.black,
          },
        ]}>
        {isLoading === 'initial' ? (
          <LoadingScreen color={colors.green800} />
        ) : (
          <FlashList
            data={filteredData}
            estimatedItemSize={72}
            keyExtractor={item => item?.message_id?.toString()}
            renderItem={({item}) => <AllGetMessageListColum item={item} />}
            onEndReached={loadMoreMessages}
            onEndReachedThreshold={0.5} // Increased threshold slightly
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderListEmptyComponent}
            contentContainerStyle={styles.listContentContainer} // Added content container style
            refreshing={isLoading === 'refreshing'}
            onRefresh={handleRefresh}
            ListHeaderComponent={
              <View style={styles.listContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContainer}>
                  <View
                    style={[
                      styles.filterContainer,
                      {
                        backgroundColor:
                          theme === THEME_COLOR ? colors.white : colors.black,
                      },
                    ]}>
                    {['All', 'Unread', 'Favourites', 'Archived'].map(filter => (
                      <FilterButton
                        key={filter}
                        filter={filter}
                        selectedFilter={selectedFilter}
                        onPress={() => handleFilterChange(filter)}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>
            }
          />
        )}
      </View>
    </>
  );
};

export default GetAllMessageComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.PADDING_8,
    paddingVertical: spacing.PADDING_4,
  },
  filterButton: {
    paddingVertical: spacing.PADDING_6,
    paddingHorizontal: spacing.PADDING_12,
    borderRadius: spacing.RADIUS_20,
    backgroundColor: colors.grey100,
    marginRight: spacing.MARGIN_8,
  },
  selectedButton: {
    backgroundColor: '#4caf50',
  },
  footerLoadingContainer: {
    paddingVertical: spacing.PADDING_20,
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  listContentContainer: {
    paddingBottom: spacing.PADDING_16,
    paddingHorizontal: spacing.PADDING_8,
  },
  listContainer: {
    flexGrow: 1,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.MARGIN_20,
  },
  emptyListText: {
    fontSize: textScale(16),
    color: colors.grey500,
  },
});
