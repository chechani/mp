import { FlashList } from '@shopify/flash-list';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

const PaginatedList = ({
  fetchData,
  renderItem,
  keyExtractor,
  ListHeaderComponent = null,
  ListFooterComponent = null,
  initialPageSize = 15,
  incrementSize = 10,
  filters = {},
  enablePagination = true,
  enableRefresh = true,
}) => {

  // State for pagination and data
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const loadData = useCallback(async (currentPage = 1, refreshing = false) => {
    if (isFetching) return;
    if (refreshing) setIsRefreshing(true);
    setIsFetching(true);

    try {
      const response = await fetchData(currentPage, enablePagination ? (currentPage === 1 ? initialPageSize : incrementSize) : undefined, filters);
      const newData = response.data.tickets;
      setHasMoreData(newData.length > 0);
      setData(prevData => (currentPage === 1 ? newData : [...prevData, ...newData]));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsFetching(false);
      setIsRefreshing(false);
    }
  }, [fetchData, initialPageSize, incrementSize, filters, enablePagination, isFetching]);

  useEffect(() => {
    loadData(1);
  }, [filters, loadData]);

  const handleEndReached = () => {
    if (enablePagination && hasMoreData && !isFetching) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadData(nextPage);
    }
  };

  const handleRefresh = () => {
    if (enableRefresh) {
      setPage(1);
      loadData(1, true);
    }
  };

  return (
    <View style={styles.container}>
      {data.length === 0 && !isFetching ? (
        <Text style={styles.noDataText}>No data available</Text>
      ) : (
        <FlashList
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={() => (
            isFetching && !isRefreshing ? <ActivityIndicator style={styles.loadingIndicator} /> : ListFooterComponent
          )}
          onEndReached={enablePagination ? handleEndReached : null}
          onEndReachedThreshold={0.5}
          estimatedItemSize={100}
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingIndicator: {
    padding: 20,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
});

export default PaginatedList;
