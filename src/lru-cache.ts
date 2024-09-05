/**
 * A Least Recently Used (LRU) cache with Time-to-Live (TTL) support. Items are kept in the cache until they either
 * reach their TTL or the cache reaches its size and/or item limit. When the limit is exceeded, the cache evicts the
 * item that was least recently accessed (based on the timestamp of access). Items are also automatically evicted if they
 * are expired, as determined by the TTL.
 * An item is considered accessed, and its last accessed timestamp is updated, whenever `has`, `get`, or `set` is called with its key.
 *
 * Implement the LRU cache provider here and use the lru-cache.test.ts to check your implementation.
 * You're encouraged to add additional functions that make working with the cache easier for consumers.
 */

type LRUCacheProviderOptions = {
  ttl: number // Time to live in milliseconds
  itemLimit: number
}

type CacheEntry<T> = {
  value: T;
  expiration: number;
};

 
export class LRUCacheProvider<T> {
  private cache: Map<string, CacheEntry<T>>;
  private options: LRUCacheProviderOptions;

  constructor(options: LRUCacheProviderOptions) {
    this.options = options;
    this.cache = new Map();
  }

  set(key: string, value: T): void {
    // simple set a new key
    const expiration = Date.now() + this.options.ttl;
    this.cache.set(key, { value, expiration });
    //check if limit is reach delete the least recently used
    if (this.cache.size > this.options.itemLimit) {
      this.evictLRU();
    }
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (entry) {
      if (entry.expiration >= Date.now()) {
       //if not then delete the previous key and set the new one
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry.value;
      } else {
        // delete the key incase expiry is passed
        this.cache.delete(key);
      }
    }
    //return undefined if not found
    return undefined;
  }

  // this is simple has function to return boolean
  has(key: string): boolean {
    // simply get key
    const entry = this.cache.get(key);
    // return false if not exist or date is greater then expiry
    return entry !== undefined && entry.expiration >= Date.now();
  }

  // this function just evict the least used
  private evictLRU(): void {
    let oldestKey: string | undefined;
    let oldestExpiration = Number.MAX_SAFE_INTEGER;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiration < oldestExpiration) {
        oldestKey = key;
        oldestExpiration = entry.expiration;
      }
    }

    if (oldestKey !== undefined) {
      this.cache.delete(oldestKey);
    }
  }
}



// TODO: Implement LRU cache provider
export function createLRUCacheProvider<T>({
  ttl,
  itemLimit,
}: LRUCacheProviderOptions): LRUCacheProvider<T> {
  const cache = new LRUCacheProvider<T>({ ttl, itemLimit });
  return {
    has: (key: string) => {
      return cache.has(key);
    },
    get: (key: string) => {
      return cache.get(key);
    },
    set: (key: string, value: T) => {
      cache.set(key, value);
    },
}
}

