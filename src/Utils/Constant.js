export default THEME_COLOR = 'light'


export const DataMode = {
    LOCAL: 'local',
    REMOTE: 'remote',
    HYBRID_LOCAL: 'hybridLocal',
    HYBRID_REMOTE: 'hybridRemote',
  };
  
  // Different ways to match the user’s typed text
  export const SearchMode = {
    CONTAINS: 'contains',
    STARTS_WITH: 'startsWith',
    EXACT: 'exact',
  };
  
  // Cache strategy: store in memory or in AsyncStorage
  export const CacheStrategy = {
    NONE: 'none',
    MEMORY: 'memory',
    STORAGE: 'storage',
  };
  
  // Some numeric defaults
  export const PAGE_SIZE = 20;           // how many items to load per page
  export const API_TIMEOUT = 10000;      // 10 seconds
  export const MAX_RETRIES = 3;         // how many times to retry a failing request
  export const RETRY_DELAY = 1000;      // 1 second delay before next retry
  export const CACHE_EXPIRY = 1000 * 60 * 5; // 5 minutes
  export const MAX_HISTORY_ITEMS = 10;   // how many past search queries to store in history
  