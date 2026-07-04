
// Cache configuration
const CACHE_DURATION = 60000; // 1 minute
let cache: Record<string, any> = {};
let lastFetch: Record<string, number> = {};

export const fetchWithCache = async (key: string, fetcher: () => Promise<any>) => {
  const now = Date.now();
  if (cache[key] && (now - lastFetch[key]) < CACHE_DURATION) {
    return cache[key];
  }
  
  const data = await fetcher();
  cache[key] = data;
  lastFetch[key] = now;
  return data;
};

export const clearCache = () => {
  cache = {};
  lastFetch = {};
};