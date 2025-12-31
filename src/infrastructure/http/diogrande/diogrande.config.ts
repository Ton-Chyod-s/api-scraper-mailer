const toBool = (v: string | undefined, def: boolean) => {
  if (v == null) return def;
  return ['1', 'true', 'yes', 'on'].includes(String(v).trim().toLowerCase());
};

const normalizePem = (pem: string) => pem.replace(/\\n/g, '\n').trim();

export const diograndeConfig = {
  host: process.env.DIOGRANDE_HOST?.trim() || 'diogrande.campogrande.ms.gov.br',
  port: Number(process.env.DIOGRANDE_PORT || 443),

  baseUrl:
    process.env.DIOGRANDE_BASE_URL?.trim() ||
    'https://diogrande.campogrande.ms.gov.br/wp-admin/admin-ajax.php',

  allowInsecureTls: toBool(process.env.DIOGRANDE_ALLOW_INSECURE_TLS, false),
  autoDiscoverCa: toBool(process.env.DIOGRANDE_AUTO_DISCOVER_CA, true),

  pinnedCaPem: process.env.DIOGRANDE_CA_PEM ? normalizePem(process.env.DIOGRANDE_CA_PEM) : '',

  caCachePath: process.env.DIOGRANDE_CA_CACHE_PATH?.trim() || 'certs/diogrande-ca.pem',
};
