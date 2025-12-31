const toBool = (v: string | undefined, def: boolean) => {
  if (v == null) return def;
  return ['1', 'true', 'yes', 'on'].includes(String(v).trim().toLowerCase());
};

const toInt = (v: string | undefined, def: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : def;
};

const toList = (v: string | undefined) =>
  (v ?? '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

const normalizePem = (pem: string) => pem.replace(/\\n/g, '\n').trim();

const isProd = (process.env.NODE_ENV || '').trim().toLowerCase() === 'production';

export const diograndeConfig = {
  host: process.env.DIOGRANDE_HOST?.trim() || 'diogrande.campogrande.ms.gov.br',
  port: toInt(process.env.DIOGRANDE_PORT, 443),

  baseUrl:
    process.env.DIOGRANDE_BASE_URL?.trim() ||
    'https://diogrande.campogrande.ms.gov.br/wp-admin/admin-ajax.php',

  debug: toBool(process.env.DIOGRANDE_DEBUG, false),

  allowInsecureTls: toBool(process.env.DIOGRANDE_ALLOW_INSECURE_TLS, false),

  autoDiscoverCa: toBool(process.env.DIOGRANDE_AUTO_DISCOVER_CA, !isProd),

  cacheDiscoveredCa: toBool(process.env.DIOGRANDE_CACHE_DISCOVERED_CA, !isProd),

  pinnedCaPem: process.env.DIOGRANDE_CA_PEM ? normalizePem(process.env.DIOGRANDE_CA_PEM) : '',

  caCachePath: process.env.DIOGRANDE_CA_CACHE_PATH?.trim() || 'certs/diogrande-ca.pem',

  discoverTimeoutMs: toInt(process.env.DIOGRANDE_DISCOVER_TIMEOUT_MS, 6000),
  aiaFetchTimeoutMs: toInt(process.env.DIOGRANDE_AIA_FETCH_TIMEOUT_MS, 6000),
  aiaAllowedHosts: toList(process.env.DIOGRANDE_AIA_ALLOWED_HOSTS),
};
