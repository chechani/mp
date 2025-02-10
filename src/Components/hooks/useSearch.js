import {useCallback, useEffect, useRef, useState} from 'react';
import {useNetworkStatus} from '../../Provider/NetworkStatusProvider';
import CacheManager from '../../Utils/cacheManager';
import {
  API_TIMEOUT,
  CACHE_EXPIRY,
  DataMode,
  MAX_HISTORY_ITEMS,
  MAX_RETRIES,
  PAGE_SIZE,
  RETRY_DELAY,
  SearchMode,
} from '../../Utils/Constant';

// Note: This hook assumes that the parent either memoizes or keeps stable
// values for any array/function props such as searchKeys, fetchDefaultData, etc.
export const useSearch = ({
  initialData,
  searchKeys,
  searchMode,
  caseSensitive,
  filterFunction,
  sortResults,
  dataMode,
  fetchDefaultData,
  fetchSearchResults,
  onSearchChange,
  enableCache,
  cacheStrategy,
  transformResult,
  timeout = API_TIMEOUT,
  retryCount = MAX_RETRIES,
  retryDelay = RETRY_DELAY,
  onError,
  onInitialLoad,
  nestedSearchKeys,
  defaultDataPage = 1,
  defaultDataLimit = PAGE_SIZE,
  minCharacters = 1,
}) => {
  // ---------------------------
  // State Declarations
  // ---------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [defaultData, setDefaultData] = useState([]);
  const [hasLoadedDefaultData, setHasLoadedDefaultData] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [defaultDataCurrentPage, setDefaultDataCurrentPage] =
    useState(defaultDataPage);
  const [hasMoreDefaultData, setHasMoreDefaultData] = useState(true);
  const [isLoadingMoreDefaultData, setIsLoadingMoreDefaultData] =
    useState(false);

  // ---------------------------
  // Other Refs and Network Status
  // ---------------------------
  const isConnected = useNetworkStatus();
  // Keep a stable copy of initialData
  const initialDataRef = useRef(initialData);
  const abortControllerRef = useRef(null);
  const retryAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);
  const searchTimeoutRef = useRef(null);
  const totalDefaultDataRef = useRef(0);

  useEffect(() => {
    // Update the ref with the latest initialData
    initialDataRef.current = initialData;
    // If in LOCAL mode and no query is entered, show all local data by default.
    if (dataMode === DataMode.LOCAL && searchQuery === '') {
      setSearchResults(initialData || []);
    }
  }, [initialData, dataMode, searchQuery]);

  // ---------------------------
  // Cache Helpers
  // ---------------------------
  const getCachedResults = useCallback(
    async (query, page) => {
      if (!enableCache || !cacheStrategy) return null;
      const cacheKey = `${query}_${page}`;
      const cachedItem = await CacheManager.get(cacheKey, cacheStrategy);
      if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_EXPIRY) {
        return cachedItem.data;
      }
      return null;
    },
    [enableCache, cacheStrategy],
  );

  const setCachedResults = useCallback(
    async (query, page, data) => {
      if (!enableCache || !cacheStrategy) return;
      const cacheKey = `${query}_${page}`;
      await CacheManager.set(cacheKey, data, cacheStrategy);
    },
    [enableCache, cacheStrategy],
  );

  // ---------------------------
  // Search History Update
  // ---------------------------
  const updateSearchHistory = useCallback(query => {
    if (!query) return;
    setSearchHistory(prev => {
      const newHistory = [
        {query, timestamp: Date.now()},
        ...prev.filter(item => item.query !== query),
      ].slice(0, MAX_HISTORY_ITEMS);
      return newHistory;
    });
  }, []);

  // ---------------------------
  // Local Search Implementation
  // ---------------------------
  const localSearch = useCallback(
    (text, sourceData, page = 1) => {
      if (!sourceData?.length) return {results: [], hasMore: false};

      const compareText = caseSensitive ? text : text.toLowerCase();

      let filteredResults = sourceData.filter(item => {
        return searchKeys?.some(key => {
          let itemValue = nestedSearchKeys
            ? key.split('.').reduce((obj, k) => obj?.[k], item)
            : item[key];
          // Convert to string (and lower-case if needed)
          itemValue = caseSensitive
            ? String(itemValue || '')
            : String(itemValue || '').toLowerCase();
          switch (searchMode) {
            case SearchMode.STARTS_WITH:
              return itemValue.startsWith(compareText);
            case SearchMode.EXACT:
              return itemValue === compareText;
            case SearchMode.CONTAINS:
            default:
              return itemValue.includes(compareText);
          }
        });
      });

      if (filterFunction) {
        filteredResults = filterFunction(filteredResults);
      }

      if (sortResults) {
        filteredResults.sort((a, b) => {
          const aVal = nestedSearchKeys
            ? searchKeys[0].split('.').reduce((obj, k) => obj?.[k], a)
            : a[searchKeys[0]] || '';
          const bVal = nestedSearchKeys
            ? searchKeys[0].split('.').reduce((obj, k) => obj?.[k], b)
            : b[searchKeys[0]] || '';
          return String(aVal).localeCompare(String(bVal));
        });
      }

      const startIndex = (page - 1) * PAGE_SIZE;
      const endIndex = startIndex + PAGE_SIZE;
      const paginatedResults = filteredResults.slice(startIndex, endIndex);
      const hasMore = endIndex < filteredResults.length;

      return {results: paginatedResults, hasMore};
    },
    [
      searchKeys,
      searchMode,
      caseSensitive,
      filterFunction,
      sortResults,
      nestedSearchKeys,
    ],
  );

  // Add useCallback to parseResponse
  const parseResponse = useCallback(response => {
    // If the response is an array, assume it contains all data.
    if (Array.isArray(response)) {
      return {results: response, hasMore: false};
    }

    // If the response is an object, try to extract results and pagination info.
    const results = response.results || response.data || [];
    // If the response provides a "hasMore" property, use it.
    // Otherwise, if there's a total count, determine hasMore based on that.
    let hasMore = false;
    if (typeof response.hasMore !== 'undefined') {
      hasMore = response.hasMore;
    } else if (response.total !== undefined) {
      hasMore = results.length < response.total;
    }

    return {results, hasMore};
  }, []); // Empty dependency array ensures stability

  // ---------------------------
  // Helper: makeRequest (with retry)
  // ---------------------------
  const makeRequest = useCallback(
    async (requestFn, ...args) => {
      let lastError;
      for (let i = 0; i <= retryCount; i++) {
        try {
          const response = await Promise.race([
            requestFn(...args),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Request timeout')), timeout),
            ),
          ]);
          retryAttemptsRef.current = 0;
          return parseResponse ? parseResponse(response) : response;
        } catch (err) {
          lastError = err;
          if (i < retryCount) {
            await new Promise(resolve =>
              setTimeout(resolve, retryDelay * (i + 1)),
            );
          }
        }
      }
      throw lastError;
    },
    [retryCount, retryDelay, timeout, parseResponse],
  );

  // ---------------------------
  // Load Default Data (with Pagination)
  // ---------------------------
  const loadDefaultData = useCallback(
    async (page = defaultDataCurrentPage, loadingMore = false) => {
      if (
        !isConnected &&
        (dataMode === DataMode.REMOTE || dataMode === DataMode.HYBRID_REMOTE)
      ) {
        setError('No internet connection');
        return;
      }

      abortControllerRef.current = new AbortController();
      if (!loadingMore) setIsLoading(true);
      else setIsLoadingMoreDefaultData(true);

      try {
        let results, hasMore, total;
        if (typeof fetchDefaultData === 'function') {
          const response = await makeRequest(
            fetchDefaultData,
            page,
            defaultDataLimit,
            abortControllerRef.current.signal,
          );
          results = response.results || [];
          if (
            response.hasOwnProperty('hasMore') ||
            response.total !== undefined
          ) {
            hasMore = response.hasMore ?? results.length === defaultDataLimit;
            total = response.total;
          } else {
            // If the API response does not include pagination info, assume all data is returned.
            hasMore = false;
            total = results.length;
          }
        } else {
          // Client-side pagination using the stable initialDataRef
          if (page === 1) {
            const response = await makeRequest(
              () => initialDataRef.current || [],
              abortControllerRef.current.signal,
            );
            totalDefaultDataRef.current = response.length;
            // Option: Show all data if no pagination is implemented.
            results = response;
            hasMore = false;
            total = response.length;
          } else {
            const startIndex = (page - 1) * defaultDataLimit;
            const endIndex = startIndex + defaultDataLimit;
            results = initialDataRef.current.slice(startIndex, endIndex);
            hasMore = endIndex < totalDefaultDataRef.current;
            total = totalDefaultDataRef.current;
          }
        }

        if (!isMountedRef.current) return;
        if (transformResult) {
          results = results.map(transformResult);
        }
        setDefaultData(prev => (page === 1 ? results : [...prev, ...results]));
        setHasMoreDefaultData(hasMore);
        setHasLoadedDefaultData(true);
        onInitialLoad?.(results, total);
      } catch (err) {
        if (!isMountedRef.current) return;
        const errorMessage = err.message || 'Failed to load default data';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        if (!isMountedRef.current) return;
        loadingMore ? setIsLoadingMoreDefaultData(false) : setIsLoading(false);
      }
    },
    [
      dataMode,
      defaultDataLimit,
      fetchDefaultData,
      isConnected,
      makeRequest,
      onError,
      onInitialLoad,
      transformResult,
      defaultDataCurrentPage,
    ],
  );

  const loadMoreDefaultData = useCallback(() => {
    if (!isLoadingMoreDefaultData && hasMoreDefaultData) {
      const nextPage = defaultDataCurrentPage + 1;
      setDefaultDataCurrentPage(nextPage);
      loadDefaultData(nextPage, true);
    }
  }, [
    defaultDataCurrentPage,
    hasMoreDefaultData,
    isLoadingMoreDefaultData,
    loadDefaultData,
  ]);

  // Automatically load default data on mount if in hybrid mode
  useEffect(() => {
    if (
      !hasLoadedDefaultData &&
      (dataMode === DataMode.HYBRID_LOCAL ||
        dataMode === DataMode.HYBRID_REMOTE)
    ) {
      loadDefaultData();
    }
  }, [dataMode, hasLoadedDefaultData, loadDefaultData]);

  // ---------------------------
  // Main Search Function
  // ---------------------------
  const performSearch = useCallback(
    async (text, page = 1, loadingMore = false) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Handle empty query:
      if (text.length === 0) {
        switch (dataMode) {
          case DataMode.LOCAL:
            setSearchResults(initialDataRef.current || []);
            setHasMoreData(false);
            return;
          case DataMode.REMOTE:
            setSearchResults([]);
            setHasMoreData(false);
            return;
          case DataMode.HYBRID_LOCAL:
            setSearchResults(defaultData);
            setHasMoreData(false);
            return;
          case DataMode.HYBRID_REMOTE:
            if (!loadingMore) {
              setIsLoading(true);
              try {
                abortControllerRef.current = new AbortController();
                const response = await makeRequest(
                  fetchDefaultData,
                  1,
                  defaultDataLimit,
                  abortControllerRef.current.signal,
                );
                setSearchResults(response.results || []);
                setHasMoreData(response.hasMore ?? false);
              } catch (err) {
                setError(err.message);
                onError?.(err.message);
              } finally {
                setIsLoading(false);
              }
            }
            return;
          default:
            break;
        }
      }

      if (text.length < minCharacters) {
        setSearchResults([]);
        setHasMoreData(false);
        return;
      }

      if (
        !isConnected &&
        (dataMode === DataMode.REMOTE || dataMode === DataMode.HYBRID_REMOTE)
      ) {
        setError('No internet connection');
        return;
      }

      abortControllerRef.current = new AbortController();
      if (!loadingMore) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      try {
        const cachedResults = await getCachedResults(text, page);
        if (cachedResults) {
          setSearchResults(prev =>
            page === 1
              ? cachedResults.results
              : [...prev, ...cachedResults.results],
          );
          setHasMoreData(cachedResults.hasMore);
          return;
        }

        let results, hasMore;
        switch (dataMode) {
          case DataMode.LOCAL: {
            const localResp = localSearch(text, initialDataRef.current, page);
            results = localResp.results;
            hasMore = localResp.hasMore;
            break;
          }
          case DataMode.REMOTE: {
            const response = await makeRequest(
              fetchSearchResults,
              text,
              page,
              PAGE_SIZE,
              abortControllerRef.current.signal,
            );
            results = response.results || [];
            hasMore = response.hasMore ?? results.length === PAGE_SIZE;
            break;
          }
          case DataMode.HYBRID_LOCAL: {
            const hybridLocalResp = localSearch(text, defaultData, page);
            results = hybridLocalResp.results;
            hasMore = hybridLocalResp.hasMore;
            break;
          }
          case DataMode.HYBRID_REMOTE: {
            const hybridRemoteResp = await makeRequest(
              fetchSearchResults,
              text,
              page,
              PAGE_SIZE,
              abortControllerRef.current.signal,
            );
            results = hybridRemoteResp.results || [];
            hasMore = hybridRemoteResp.hasMore ?? results.length === PAGE_SIZE;
            break;
          }
          default:
            results = [];
            hasMore = false;
            break;
        }

        if (!isMountedRef.current) return;
        if (transformResult) {
          results = results.map(transformResult);
        }
        await setCachedResults(text, page, {results, hasMore});
        setSearchResults(prev =>
          page === 1 ? results : [...prev, ...results],
        );
        setHasMoreData(hasMore);
        onSearchChange?.(results, text);
        updateSearchHistory(text);
      } catch (err) {
        if (!isMountedRef.current) return;
        if (err.name === 'AbortError') return;
        const errorMessage = err.message || 'Search failed';
        setError(errorMessage);
        onError?.(errorMessage);
        setSearchResults([]);
        setHasMoreData(false);
      } finally {
        if (!isMountedRef.current) return;
        loadingMore ? setIsLoadingMore(false) : setIsLoading(false);
      }
    },
    [
      dataMode,
      makeRequest,
      fetchSearchResults,
      fetchDefaultData,
      localSearch,
      transformResult,
      onSearchChange,
      onError,
      isConnected,
      minCharacters,
      getCachedResults,
      setCachedResults,
      updateSearchHistory,
    ],
  );

  const loadMoreResults = useCallback(() => {
    if (!isLoadingMore && hasMoreData) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      performSearch(searchQuery, nextPage, true);
    }
  }, [currentPage, hasMoreData, isLoadingMore, searchQuery, performSearch]);

  // ---------------------------
  // Cleanup on Unmount
  // ---------------------------
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    isLoadingMore,
    error,
    searchHistory,
    performSearch,
    loadMoreResults,
    hasMoreData,
    isConnected,
    defaultData,
    hasLoadedDefaultData,
    isLoadingMoreDefaultData,
    hasMoreDefaultData,
    loadMoreDefaultData,
    defaultDataCurrentPage,
  };
};

export default useSearch;
