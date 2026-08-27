import axios from 'axios';
import { buildMemoryStorage, setupCache } from 'axios-cache-interceptor';

const UPSTREAM_CACHE_TTL_MS = 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

const MAX_CACHE_ENTRIES = 128; // raw-master hot-set cap (count), not a catalog mirror

// Anchor on globalThis so the warmer (instrumentation) and the route share one instance across Next's module scopes.
const globalStore = globalThis as unknown as {
  __imageProxyStorage?: ReturnType<typeof buildMemoryStorage>;
  __imageProxyAxios?: ReturnType<typeof setupCache>;
};

const memoryStorage = (globalStore.__imageProxyStorage ??= buildMemoryStorage(
  false,
  CLEANUP_INTERVAL_MS,
  MAX_CACHE_ENTRIES
));

export const imageProxyAxios = (globalStore.__imageProxyAxios ??= setupCache(axios.create(), {
  storage: memoryStorage,
  ttl: UPSTREAM_CACHE_TTL_MS,
}));

export const clearImageProxyCache = () => {
  memoryStorage.data = new Map();
};
