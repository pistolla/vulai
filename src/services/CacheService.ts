/**
 * CacheService provides a simple wrapper around localStorage with TTL support.
 */
const CACHE_PREFIX = 'vulai_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds (reduced for faster updates)

interface CacheEntry<T> {
    value: T;
    expiry: number;
}

export const CacheService = {
    /**
     * Set a value in the cache with a specific TTL.
     */
    set<T>(key: string, value: T, ttl: number = DEFAULT_TTL): void {
        if (typeof window === 'undefined') return;

        const entry: CacheEntry<T> = {
            value,
            expiry: Date.now() + ttl,
        };

        try {
            localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
        } catch (e) {
            console.warn('CacheService: Failed to write to localStorage', e);
        }
    },

    /**
     * Get a value from the cache. Returns null if missing or expired.
     */
    get<T>(key: string): T | null {
        if (typeof window === 'undefined') return null;

        const raw = localStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return null;

        try {
            const entry: CacheEntry<T> = JSON.parse(raw);
            if (Date.now() > entry.expiry) {
                localStorage.removeItem(CACHE_PREFIX + key);
                return null;
            }
            return entry.value;
        } catch (e) {
            console.warn('CacheService: Failed to parse cache entry', e);
            localStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }
    },

    /**
     * Remove a specific key from the cache.
     */
    remove(key: string): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(CACHE_PREFIX + key);
    },

    /**
     * Clear all cache entries with the vulai prefix.
     */
    clear(): void {
        if (typeof window === 'undefined') return;

        Object.keys(localStorage)
            .filter(key => key.startsWith(CACHE_PREFIX))
            .forEach(key => localStorage.removeItem(key));
    }
};
