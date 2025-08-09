// Simple request memoization for the same request cycle
const requestCache = new Map<string, Promise<any>>();
const resultCache = new Map<string, { data: any; timestamp: number }>();

const CACHE_TTL = 60000; // 1 minute

export function memoizeRequest<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // Check if we have a recent cached result
  const cached = resultCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return Promise.resolve(cached.data);
  }

  // Check if request is already in progress
  if (requestCache.has(key)) {
    return requestCache.get(key)!;
  }
  
  // Create new request
  const promise = fetcher()
    .then(data => {
      // Cache successful result
      resultCache.set(key, { data, timestamp: Date.now() });
      return data;
    })
    .finally(() => {
      // Clear request cache after completion
      requestCache.delete(key);
    });
  
  requestCache.set(key, promise);
  return promise;
}

// Clear cache function for logout or manual refresh
export function clearRequestCache() {
  requestCache.clear();
  resultCache.clear();
}

// Clear specific cache entries
export function clearCacheByPattern(pattern: string) {
  for (const key of requestCache.keys()) {
    if (key.includes(pattern)) {
      requestCache.delete(key);
    }
  }
  for (const key of resultCache.keys()) {
    if (key.includes(pattern)) {
      resultCache.delete(key);
    }
  }
}
