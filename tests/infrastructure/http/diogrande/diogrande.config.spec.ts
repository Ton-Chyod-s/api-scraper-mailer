describe('diograndeConfig', () => {
  function mockEnv(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      NODE_ENV: 'test',

      DIOGRANDE_HOST: 'diogrande.campogrande.ms.gov.br',
      DIOGRANDE_PORT: 443,
      DIOGRANDE_BASE_URL: 'https://diogrande.campogrande.ms.gov.br/wp-admin/admin-ajax.php',

      DIOGRANDE_DEBUG: false,
      DIOGRANDE_ALLOW_INSECURE_TLS: false,

      DIOGRANDE_AUTO_DISCOVER_CA: undefined,
      DIOGRANDE_CACHE_DISCOVERED_CA: undefined,

      DIOGRANDE_CA_PEM: undefined,
      DIOGRANDE_CA_CACHE_PATH: 'certs/diogrande-ca.pem',

      DIOGRANDE_DISCOVER_TIMEOUT_MS: 6000,
      DIOGRANDE_AIA_FETCH_TIMEOUT_MS: 6000,
      DIOGRANDE_AIA_ALLOWED_HOSTS: ['diogrande.campogrande.ms.gov.br'],

      ...overrides,
    };
  }

  async function importFreshConfig(envValue: Record<string, unknown>) {
    jest.resetModules();

    jest.doMock('@config/env', () => ({
      env: envValue,
    }));

    const mod = await import('@infrastructure/http/diogrande/diogrande.config');
    return mod.diograndeConfig as typeof import('@infrastructure/http/diogrande/diogrande.config').diograndeConfig;
  }

  it('mapeia os campos diretamente do env', async () => {
    const envValue = mockEnv({
      NODE_ENV: 'test',
      DIOGRANDE_HOST: 'x-host',
      DIOGRANDE_PORT: 123,
      DIOGRANDE_BASE_URL: 'https://x/base',
      DIOGRANDE_DEBUG: true,
      DIOGRANDE_ALLOW_INSECURE_TLS: true,
      DIOGRANDE_CA_PEM: 'PEM_AQUI',
      DIOGRANDE_CA_CACHE_PATH: 'x/path.pem',
      DIOGRANDE_DISCOVER_TIMEOUT_MS: 111,
      DIOGRANDE_AIA_FETCH_TIMEOUT_MS: 222,
      DIOGRANDE_AIA_ALLOWED_HOSTS: ['a.com', 'b.com'],
      DIOGRANDE_AUTO_DISCOVER_CA: true,
      DIOGRANDE_CACHE_DISCOVERED_CA: false,
    });

    const cfg = await importFreshConfig(envValue);

    expect(cfg).toEqual({
      host: 'x-host',
      port: 123,
      baseUrl: 'https://x/base',
      debug: true,
      allowInsecureTls: true,
      autoDiscoverCa: true,
      cacheDiscoveredCa: false,
      pinnedCaPem: 'PEM_AQUI',
      caCachePath: 'x/path.pem',
      discoverTimeoutMs: 111,
      aiaFetchTimeoutMs: 222,
      aiaAllowedHosts: ['a.com', 'b.com'],
    });
  });

  it('em produção, autoDiscoverCa e cacheDiscoveredCa defaultam para false quando env.* é undefined', async () => {
    const envValue = mockEnv({
      NODE_ENV: 'production',
      DIOGRANDE_AUTO_DISCOVER_CA: undefined,
      DIOGRANDE_CACHE_DISCOVERED_CA: undefined,
    });

    const cfg = await importFreshConfig(envValue);

    expect(cfg.autoDiscoverCa).toBe(false);
    expect(cfg.cacheDiscoveredCa).toBe(false);
  });

  it('fora de produção, autoDiscoverCa e cacheDiscoveredCa defaultam para true quando env.* é undefined', async () => {
    const envValue = mockEnv({
      NODE_ENV: 'development',
      DIOGRANDE_AUTO_DISCOVER_CA: undefined,
      DIOGRANDE_CACHE_DISCOVERED_CA: undefined,
    });

    const cfg = await importFreshConfig(envValue);

    expect(cfg.autoDiscoverCa).toBe(true);
    expect(cfg.cacheDiscoveredCa).toBe(true);
  });

  it('respeita env.DIOGRANDE_AUTO_DISCOVER_CA e env.DIOGRANDE_CACHE_DISCOVERED_CA quando definidos (mesmo em produção)', async () => {
    const envValue = mockEnv({
      NODE_ENV: 'production',
      DIOGRANDE_AUTO_DISCOVER_CA: true,
      DIOGRANDE_CACHE_DISCOVERED_CA: true,
    });

    const cfg = await importFreshConfig(envValue);

    expect(cfg.autoDiscoverCa).toBe(true);
    expect(cfg.cacheDiscoveredCa).toBe(true);
  });

  it('pinnedCaPem vira string vazia quando DIOGRANDE_CA_PEM é undefined', async () => {
    const envValue = mockEnv({
      DIOGRANDE_CA_PEM: undefined,
    });

    const cfg = await importFreshConfig(envValue);

    expect(cfg.pinnedCaPem).toBe('');
  });
});
