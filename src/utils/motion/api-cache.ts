/**
 * Global API cache and rate limiting for Motion API
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  loading: boolean;
}

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

class MotionApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly CACHE_DURATION = 60000; // 1 minute cache
  private readonly CLEANUP_INTERVAL = 300000; // 5 minutes cleanup
  
  constructor() {
    // Cleanup expired cache entries periodically
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
    
    // Cleanup old pending requests
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > 30000) { // 30 seconds timeout
        this.pendingRequests.delete(key);
      }
    }
  }

  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const now = Date.now();
    
    // Check if we have a valid cache entry
    const cached = this.cache.get(key);
    if (cached && !cached.loading && (now - cached.timestamp < this.CACHE_DURATION)) {
      console.log(`Cache hit for ${key}`);
      return cached.data;
    }

    // Check if there's already a pending request for this key
    const pending = this.pendingRequests.get(key);
    if (pending) {
      console.log(`Waiting for pending request for ${key}`);
      try {
        return await pending.promise;
      } catch (error) {
        // If pending request failed, remove it and try again
        this.pendingRequests.delete(key);
      }
    }

    // Mark as loading
    this.cache.set(key, {
      data: cached?.data || null,
      timestamp: cached?.timestamp || 0,
      loading: true
    });

    // Create new request
    const promise = fetcher();
    this.pendingRequests.set(key, {
      promise,
      timestamp: now
    });

    try {
      console.log(`Cache miss, fetching ${key}`);
      const data = await promise;
      
      // Update cache with successful result
      this.cache.set(key, {
        data,
        timestamp: now,
        loading: false
      });
      
      this.pendingRequests.delete(key);
      return data;
    } catch (error) {
      // On error, mark as not loading but keep old data if available
      this.cache.set(key, {
        data: cached?.data || null,
        timestamp: cached?.timestamp || 0,
        loading: false
      });
      
      this.pendingRequests.delete(key);
      throw error;
    }
  }

  invalidate(key?: string) {
    if (key) {
      this.cache.delete(key);
      this.pendingRequests.delete(key);
    } else {
      this.cache.clear();
      this.pendingRequests.clear();
    }
  }

  isLoading(key: string): boolean {
    const cached = this.cache.get(key);
    return cached?.loading || this.pendingRequests.has(key) || false;
  }
}

// Global singleton instance
export const motionApiCache = new MotionApiCache();
