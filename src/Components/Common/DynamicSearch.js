import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import THEME_COLOR, {
  CacheStrategy,
  DataMode,
  PAGE_SIZE,
  SearchMode,
} from '../../Utils/Constant';
import {goBack} from '../../Utils/helperFunctions';
import * as SvgIcon from '../../assets';
import {textScale} from '../../styles/responsiveStyles';
import {spacing} from '../../styles/spacing';
import {fontNames} from '../../styles/typography';
import Colors from '../../theme/colors';
import {useTheme} from '../hooks';
import useSearch from '../hooks/useSearch';
import TextComponent from './TextComponent';

const DynamicSearch = forwardRef(
  (
    {
      defaultDataPage,
      defaultDataLimit,
      data,
      // Memoize array props to keep their reference stable
      searchKeys = ['title'],
      dataMode = DataMode.HYBRID_REMOTE,
      fetchSearchResults,
      fetchDefaultData,
      transformResult,
      nestedSearchKeys = false,
      uniqueKey = 'id',
      searchMode = SearchMode.CONTAINS,
      caseSensitive = false,
      minCharacters = 1,
      maxResults = null,
      debounceTime = 300,
      enableCache = false,
      cacheStrategy = CacheStrategy.NONE,
      placeholder = 'Search...',
      // Memoize customStyles if they are defined as objects
      customStyles = {},
      accentColor,
      backgroundColor,
      textColor,
      sortResults = true,
      filterFunction,
      autoFocus = false,
      optimizeRendering = true,
      isgoBackArrowShow = false,
      isFilterShow = false,
      showsVerticalScrollIndicator = false,
      searchInputProps = {},
      initialNumToRender = PAGE_SIZE,
      maxToRenderPerBatch = 10,
      windowSize = 5,
      renderCustomItem,
      renderEmptyState,
      emptyResultsText = 'No results found',
      loadingText = 'Searching...',
      networkErrorText = 'Network error',
      onResultPress,
      onSearchChange,
      onFocus,
      onBlur,
      onError,
      onClear,
      onInitialLoad,
      onClickFilter,
      goBackArrowPress = () => goBack(),
      selectedFilter,
      accessibilityLabel = 'Search input',
      accessibilityHint = 'Enter text to search',
      timeout = 10000,
      retryCount = 3,
      retryDelay = 1000,
    },
    ref,
  ) => {
    const {theme: appTheme} = useTheme();
    const isDarkMode = appTheme === THEME_COLOR;

    const searchInputRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);

    // Memoize the searchKeys and customStyles props to avoid re-creation on every render
    const memoizedSearchKeys = useMemo(() => searchKeys, [searchKeys]);
    const memoizedCustomStyles = useMemo(() => customStyles, [customStyles]);

    const {
      searchQuery,
      setSearchQuery,
      searchResults,
      isLoading,
      isLoadingMore,
      error,
      performSearch,
      loadMoreResults,
      isConnected,
    } = useSearch({
      initialData: data,
      searchKeys: memoizedSearchKeys,
      searchMode,
      caseSensitive,
      filterFunction,
      sortResults,
      maxResults,
      dataMode,
      fetchDefaultData,
      fetchSearchResults,
      transformResult,
      nestedSearchKeys,
      enableCache,
      cacheStrategy,
      timeout,
      retryCount,
      retryDelay,
      onSearchChange,
      onError,
      onInitialLoad,
      defaultDataPage,
      defaultDataLimit,
    });

    // Expose imperative methods via ref
    useImperativeHandle(ref, () => ({
      focus: () => searchInputRef.current?.focus(),
      blur: () => searchInputRef.current?.blur(),
      clear: handleClearSearch,
      getSearchQuery: () => searchQuery,
      getSearchResults: () => searchResults,
    }));

    const handleSearch = useCallback(
      text => {
        setSearchQuery(text);
        if (text.length >= minCharacters) {
          performSearch(text);
        } else if (text.length === 0) {
          performSearch('');
        }
      },
      [performSearch, minCharacters, setSearchQuery],
    );

    const handleFocus = useCallback(() => {
      setIsFocused(true);
      onFocus?.();
    }, [onFocus]);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      onBlur?.();
    }, [onBlur]);

    const handleClearSearch = useCallback(() => {
      setSearchQuery('');
      performSearch('');
      searchInputRef.current?.clear();
      onClear?.();
    }, [setSearchQuery, onClear, performSearch]);

    const handleResultPress = useCallback(
      item => {
        Keyboard.dismiss();
        onResultPress?.(item);
      },
      [onResultPress],
    );

    const defaultRenderItem = useCallback(
      ({item}) => (
        <TouchableOpacity
          style={[styles.resultItem, memoizedCustomStyles.resultItem]}
          onPress={() => handleResultPress(item)}
          activeOpacity={0.7}>
          {memoizedSearchKeys.map((key, index) => {
            let value = item[key];
            if (nestedSearchKeys) {
              value = key.split('.').reduce((obj, k) => obj?.[k], item);
            }
            return (
              <View
                key={`${item[uniqueKey] || index}-${key}`}
                style={styles.resultTextContainer}>
                <TextComponent
                  text={String(value || '')}
                  color={textColor || Colors.default.black}
                  size={textScale(16)}
                  font={fontNames.ROBOTO_FONT_FAMILY_REGULAR}
                  style={styles.resultText}
                />
              </View>
            );
          })}
        </TouchableOpacity>
      ),
      [
        memoizedSearchKeys,
        memoizedCustomStyles,
        handleResultPress,
        nestedSearchKeys,
        uniqueKey,
        textColor,
      ],
    );

    const EmptyState = useCallback(() => {
      if (renderEmptyState) {
        return renderEmptyState({error, searchQuery, minCharacters});
      }
      return (
        <View style={styles.emptyContainer}>
          {error ? (
            <TextComponent
              text={error}
              style={[styles.errorText, memoizedCustomStyles.errorText]}
              color={Colors.default.error}
              size={textScale(14)}
              font={fontNames.ROBOTO_FONT_FAMILY_REGULAR}
              textAlign={'center'}
            />
          ) : !isConnected ? (
            <TextComponent
              text={networkErrorText}
              style={[styles.errorText, memoizedCustomStyles.errorText]}
              color={Colors.default.error}
              size={textScale(14)}
              font={fontNames.ROBOTO_FONT_FAMILY_REGULAR}
              textAlign={'center'}
            />
          ) : (
            <TextComponent
              text={
                searchQuery.length < minCharacters
                  ? `Enter at least ${minCharacters} characters to search`
                  : emptyResultsText
              }
              style={[styles.emptyText, memoizedCustomStyles.emptyText]}
              color={Colors.default.grey}
              size={textScale(14)}
              font={fontNames.ROBOTO_FONT_FAMILY_REGULAR}
              textAlign={'center'}
            />
          )}
        </View>
      );
    }, [
      error,
      searchQuery,
      minCharacters,
      isConnected,
      renderEmptyState,
      memoizedCustomStyles,
      emptyResultsText,
      networkErrorText,
    ]);

    const ListFooter = useCallback(() => {
      return isLoadingMore ? (
        <View style={styles.footerContainer}>
          <ActivityIndicator size="large" color={Colors.dark.accent} />
        </View>
      ) : null;
    }, [isLoadingMore]);

    return (
      <KeyboardAvoidingView
        style={[
          styles.container,
          memoizedCustomStyles.container,
          {backgroundColor},
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <View style={styles.headerContainer}>
          {isgoBackArrowShow && (
            <TouchableOpacity
              onPress={goBackArrowPress}
              style={styles.backButton}
              accessibilityLabel="Go back">
              <SvgIcon.BackIcon
                width={spacing.WIDTH_24}
                height={spacing.HEIGHT_24}
                color={isDarkMode ? Colors.dark.black : Colors.light.white}
              />
            </TouchableOpacity>
          )}

          <View style={styles.searchWrapper}>
            <TouchableOpacity
              activeOpacity={1}
              style={[
                styles.searchContainer,
                memoizedCustomStyles.searchContainer,
                isFocused && styles.searchContainerFocused,
                {
                  backgroundColor: isDarkMode
                    ? Colors.light.white
                    : Colors.dark.black,
                },
              ]}
              onPress={() => searchInputRef.current?.focus()}>
              <TextInput
                {...searchInputProps}
                ref={searchInputRef}
                style={[
                  styles.searchInput,
                  memoizedCustomStyles.searchInput,
                  {color: isDarkMode ? Colors.dark.black : Colors.light.white},
                ]}
                placeholder={placeholder}
                placeholderTextColor={Colors.default.grey}
                value={searchQuery}
                onChangeText={handleSearch}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoCapitalize="none"
                autoCorrect={false}
                clearButtonMode="while-editing"
                allowFontScaling={false}
                autoFocus={autoFocus}
                returnKeyType="search"
                enablesReturnKeyAutomatically={true}
                accessibilityLabel={accessibilityLabel}
                accessibilityHint={accessibilityHint}
              />
              {searchQuery.length > 0 && !isLoading && (
                <TouchableOpacity
                  onPress={handleClearSearch}
                  hitSlop={{top: 10, right: 10, bottom: 10, left: 10}}
                  accessibilityLabel="Clear search">
                  <SvgIcon.Wrong
                    color={!isDarkMode ? Colors.light.white : Colors.dark.black}
                  />
                </TouchableOpacity>
              )}
              {isLoading && (
                <ActivityIndicator
                  style={styles.loader}
                  size="small"
                  color={accentColor || Colors.default.accent}
                />
              )}
            </TouchableOpacity>
          </View>

          {isFilterShow && (
            <TouchableOpacity
              onPress={() => {
                onClickFilter && onClickFilter();
              }}
              style={styles.filterButton}
              accessibilityLabel="Filter results">
              <SvgIcon.Filter
                width={spacing.WIDTH_24}
                height={spacing.HEIGHT_24}
                color={
                  selectedFilter
                    ? accentColor || Colors.default.accent
                    : isDarkMode
                    ? Colors.dark.black
                    : Colors.light.white
                }
              />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={searchResults}
          renderItem={renderCustomItem || defaultRenderItem}
          keyExtractor={(item, index) => String(item[uniqueKey] || index)}
          style={[styles.resultsList, memoizedCustomStyles.resultsList]}
          contentContainerStyle={[
            styles.resultsContent,
            !searchResults.length && styles.emptyResultsContent,
          ]}
          ListEmptyComponent={EmptyState}
          ListFooterComponent={isLoadingMore ? ListFooter : null}
          onEndReached={loadMoreResults}
          onEndReachedThreshold={0.5}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={Keyboard.dismiss}
          initialNumToRender={initialNumToRender}
          maxToRenderPerBatch={maxToRenderPerBatch}
          windowSize={windowSize}
          removeClippedSubviews={Platform.OS === 'android' && optimizeRendering}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        />
      </KeyboardAvoidingView>
    );
  },
);

export default DynamicSearch;

const styles = StyleSheet.create({
  container: {flex: 1},
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.PADDING_16,
    paddingVertical: spacing.PADDING_8,
  },
  backButton: {marginRight: spacing.MARGIN_16},
  searchWrapper: {flex: 1},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.PADDING_12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.default.grey,
  },
  searchContainerFocused: {borderColor: Colors.default.accent},
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: textScale(16),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
    paddingRight: spacing.PADDING_8,
  },
  loader: {marginLeft: spacing.MARGIN_8},
  filterButton: {marginLeft: spacing.MARGIN_16},
  resultsList: {flex: 1},
  resultsContent: {padding: spacing.PADDING_16},
  emptyResultsContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultItem: {
    paddingVertical: spacing.PADDING_12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.default.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  resultTextContainer: {flex: 1, marginRight: spacing.MARGIN_8},
  resultText: {
    fontSize: textScale(16),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
    flexWrap: 'wrap',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.PADDING_16,
  },
  errorText: {
    fontSize: textScale(14),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
    color: Colors.default.error,
    marginBottom: spacing.MARGIN_8,
  },
  emptyText: {
    fontSize: textScale(14),
    fontFamily: fontNames.ROBOTO_FONT_FAMILY_REGULAR,
    color: Colors.default.grey,
  },
  footerContainer: {
    paddingVertical: spacing.PADDING_16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
