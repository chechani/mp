// cacheManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_EXPIRY = 1000 * 60 * 5; // e.g. 5 minutes

const CacheManager = {
  // In-memory cache: Map of key => { data, timestamp }
  inMemoryCache: new Map(),

  async set(key, data, strategy = 'memory') {
    const cacheItem = {
      data,
      timestamp: Date.now(),
    };

    if (strategy === 'memory') {
      this.inMemoryCache.set(key, cacheItem);
    } else if (strategy === 'storage') {
      try {
        await AsyncStorage.setItem(`search_cache_${key}`, JSON.stringify(cacheItem));
      } catch (error) {
        console.error('Cache storage error:', error);
      }
    }
  },

  async get(key, strategy = 'memory') {
    if (strategy === 'memory') {
      const cachedItem = this.inMemoryCache.get(key);
      if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_EXPIRY) {
        return cachedItem;
      }
      return null;
    } else if (strategy === 'storage') {
      try {
        const raw = await AsyncStorage.getItem(`search_cache_${key}`);
        if (!raw) return null;
        const cachedItem = JSON.parse(raw);
        if (cachedItem && Date.now() - cachedItem.timestamp < CACHE_EXPIRY) {
          return cachedItem;
        }
        return null;
      } catch (error) {
        console.error('Cache retrieval error:', error);
        return null;
      }
    }
    return null;
  },

  async clear(strategy = 'memory') {
    if (strategy === 'memory') {
      this.inMemoryCache.clear();
    } else if (strategy === 'storage') {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter(k => k.startsWith('search_cache_'));
        await AsyncStorage.multiRemove(cacheKeys);
      } catch (error) {
        console.error('Cache clear error:', error);
      }
    }
  },
};

export default CacheManager;
