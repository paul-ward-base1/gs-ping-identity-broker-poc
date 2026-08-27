import axios from 'axios';
import https from 'https';
import { buildMemoryStorage, setupCache } from 'axios-cache-interceptor';
import { debugLog } from '@/lib/debug';
import { GRAPHQL_PATH } from '@/lib/aemContext';
import { getAemBase } from '@/lib/aemBase';

const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 30000,
  maxSockets: 50,
  rejectUnauthorized: process.env.DISABLE_TLS_VERIFY !== 'true',
});

export const envUrl = getAemBase();
export const baseURL = `${envUrl}${GRAPHQL_PATH}`;

const AEM_TIMEOUT_MS = 15000;

const authHeader = process.env.AEM_AUTH
  ? { Authorization: `Basic ${Buffer.from(process.env.AEM_AUTH).toString('base64')}` }
  : {};

const baseAxios = axios.create({
  baseURL,
  httpsAgent,
  timeout: AEM_TIMEOUT_MS,
  headers: authHeader,
});

const memoryStorage = buildMemoryStorage();
const api = setupCache(baseAxios, { storage: memoryStorage });

const getAuthorHeaders = async (): Promise<Record<string, string>> => {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const loginToken = cookieStore.get('login-token')?.value;
    return loginToken ? { Cookie: `login-token=${loginToken}` } : {};
  } catch {
    // Fails gracefully outside server request context (e.g. during build or in client bundles)
    return {};
  }
};

export const fetchAemData = async (path: string) => {
  // Resolved per-request so the value tracks the container's runtime env, not module-load time
  const isAuthorMode = process.env.AEM_MODE === 'author';
  const start = Date.now();
  const url = `${baseURL}${path}`;
  debugLog('aem-fetch', 'start', { path, url, timeoutMs: AEM_TIMEOUT_MS });

  const headers = isAuthorMode ? await getAuthorHeaders() : {};

  try {
    const { data } = await api.get(path, {
      cache: isAuthorMode ? false : { ttl: 10 * 60 * 1000 },
      ...(Object.keys(headers).length > 0 && { headers }),
    });

    debugLog('aem-fetch', 'ok', { path, durationMs: Date.now() - start });

    return data;
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (isAuthorMode && status === 401) {
      throw new Error('AEM_AUTHOR_UNAUTHENTICATED');
    }
    console.error('AEM fetch error:', error, { path, url: baseURL + path });
    throw new Error('Failed to fetch data from AEM'); // triggers error.tsx
  }
};

export const clearAemCache = () => {
  memoryStorage.data = new Map();
};

export default api;
