import { env } from '@config/env';

const isProd = env.NODE_ENV === 'production';

export const diograndeConfig = {
  host: env.DIOGRANDE_HOST,
  port: env.DIOGRANDE_PORT,

  baseUrl: env.DIOGRANDE_BASE_URL,

  debug: env.DIOGRANDE_DEBUG,

  allowInsecureTls: env.DIOGRANDE_ALLOW_INSECURE_TLS,

  autoDiscoverCa: env.DIOGRANDE_AUTO_DISCOVER_CA ?? !isProd,

  cacheDiscoveredCa: env.DIOGRANDE_CACHE_DISCOVERED_CA ?? !isProd,

  pinnedCaPem: env.DIOGRANDE_CA_PEM ?? '',

  caCachePath: env.DIOGRANDE_CA_CACHE_PATH,

  discoverTimeoutMs: env.DIOGRANDE_DISCOVER_TIMEOUT_MS,
  aiaFetchTimeoutMs: env.DIOGRANDE_AIA_FETCH_TIMEOUT_MS,
  aiaAllowedHosts: env.DIOGRANDE_AIA_ALLOWED_HOSTS,
};
