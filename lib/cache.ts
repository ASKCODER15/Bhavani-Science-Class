/**
 * Bhavani Science Classes - Client Cache Manager
 * Provides offline-first caching for Firestore data, schedules, test scores, and video metadata.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

class CacheManager {
  private memoryCache = new Map<string, CacheEntry<unknown>>();

  /**
   * Set cached data with a time-to-live (default 1 hour)
   */
  set<T>(key: string, data: T, ttlMs = 60 * 60 * 1000): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttlMs,
    };
    this.memoryCache.set(key, entry as CacheEntry<unknown>);

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`bsc_cache_${key}`, JSON.stringify(entry));
      }
    } catch (e) {
      console.warn('Cache write failed:', e);
    }
  }

  /**
   * Get cached data if valid and not expired
   */
  get<T>(key: string): T | null {
    // 1. Check in-memory cache
    const memEntry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    if (memEntry && Date.now() - memEntry.timestamp < memEntry.ttlMs) {
      return memEntry.data;
    }

    // 2. Check localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = localStorage.getItem(`bsc_cache_${key}`);
        if (item) {
          const entry = JSON.parse(item) as CacheEntry<T>;
          if (Date.now() - entry.timestamp < entry.ttlMs) {
            this.memoryCache.set(key, entry as CacheEntry<unknown>);
            return entry.data;
          }
          // Expired
          localStorage.removeItem(`bsc_cache_${key}`);
        }
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }

    return null;
  }

  /**
   * Invalidate a specific cache key
   */
  remove(key: string): void {
    this.memoryCache.delete(key);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(`bsc_cache_${key}`);
      }
    } catch (e) {}
  }

  /**
   * Clear all Bhavani Science Classes caches
   */
  clear(): void {
    this.memoryCache.clear();
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        Object.keys(localStorage)
          .filter((k) => k.startsWith('bsc_cache_'))
          .forEach((k) => localStorage.removeItem(k));
      }
    } catch (e) {}
  }
}

export const appCache = new CacheManager();
