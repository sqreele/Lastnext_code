// Simple request memoization for the same request cycle
const requestCache = new Map<string, Promise<any>>();

export function memoizeRequest<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  if (requestCache.has(key)) {
    return requestCache.get(key)!;
  }
  
  const promise = fetcher();
  requestCache.set(key, promise);
  
  // Clear after request completes
  promise.finally(() => {
    setTimeout(() => requestCache.delete(key), 0);
  });
  
  return promise;
}
