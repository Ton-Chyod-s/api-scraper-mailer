/* eslint-disable @typescript-eslint/no-explicit-any */

describe('diogrande.tls', () => {
  async function importFresh(overrides: Partial<any> = {}) {
    jest.resetModules();

    const envMock = {
      NODE_ENV: 'test',
      DIOGRANDE_HOST: 'diogrande.campogrande.ms.gov.br',
      DIOGRANDE_PORT: 443,
      DIOGRANDE_BASE_URL: 'https://diogrande.campogrande.ms.gov.br/wp-admin/admin-ajax.php',
      DIOGRANDE_DEBUG: false,
      DIOGRANDE_ALLOW_INSECURE_TLS: false,
      DIOGRANDE_AUTO_DISCOVER_CA: false,
      DIOGRANDE_CACHE_DISCOVERED_CA: false,
      DIOGRANDE_CA_PEM: undefined,
      DIOGRANDE_CA_CACHE_PATH: 'certs/diogrande-ca.pem',
      DIOGRANDE_DISCOVER_TIMEOUT_MS: 100,
      DIOGRANDE_AIA_FETCH_TIMEOUT_MS: 100,
      DIOGRANDE_AIA_ALLOWED_HOSTS: ['diogrande.campogrande.ms.gov.br'],
      ...overrides,
    };

    jest.doMock('@config/env', () => ({ env: envMock }));

    jest.doMock('node:crypto', () => ({
      X509Certificate: class {
        constructor(_input: any) {}
        toString() {
          return '-----BEGIN CERTIFICATE-----\nMOCK\n-----END CERTIFICATE-----\n';
        }
        get infoAccess() {
          return '';
        }
      },
    }));

    const agentCtor = jest.fn().mockImplementation((opts) => ({ __agent: true, opts }));
    jest.doMock('undici', () => ({
      Agent: agentCtor,
      fetch: jest.fn(),
    }));

    const fsReadFile = jest.fn();
    const fsWriteFile = jest.fn();
    const fsMkdir = jest.fn();

    jest.doMock('node:fs/promises', () => ({
      readFile: fsReadFile,
      writeFile: fsWriteFile,
      mkdir: fsMkdir,
    }));

    const tlsMod: any = await import('node:tls');
    jest.doMock('node:tls', () => ({
      ...tlsMod,
      rootCertificates: ['BASE_CA_1', 'BASE_CA_2'],
      getCACertificates: (type: string) => {
        if (type === 'system') return ['SYS_CA_1'];
        if (type === 'extra') return ['EXTRA_CA_1'];
        return [];
      },
      connect: jest.fn(),
    }));

    const mod = await import('@infrastructure/http/diogrande/diogrande.tls');
    const cfg = await import('@infrastructure/http/diogrande/diogrande.config');
    const undici = await import('undici');
    const fs = await import('node:fs/promises');

    return {
      envMock,
      tlsMod: mod,
      diograndeConfig: cfg.diograndeConfig,
      AgentMock: (undici as any).Agent as jest.Mock,
      fsReadFile: (fs as any).readFile as jest.Mock,
      fsWriteFile: (fs as any).writeFile as jest.Mock,
      fsMkdir: (fs as any).mkdir as jest.Mock,
    };
  }

  describe('findTlsCode', () => {
    it('retorna undefined quando err não é objeto', async () => {
      const { tlsMod } = await importFresh();
      expect(tlsMod.findTlsCode('x')).toBeUndefined();
      expect(tlsMod.findTlsCode(null)).toBeUndefined();
      expect(tlsMod.findTlsCode(undefined)).toBeUndefined();
    });

    it('acha code na cadeia de cause (até 8 níveis)', async () => {
      const { tlsMod } = await importFresh();

      const err = {
        message: 'top',
        cause: {
          message: 'mid',
          cause: {
            code: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
          },
        },
      };

      expect(tlsMod.findTlsCode(err)).toBe('UNABLE_TO_VERIFY_LEAF_SIGNATURE');
    });

    it('não acha code se passar de 8 níveis', async () => {
      const { tlsMod } = await importFresh();

      let cur: any = { message: 'lvl0' };
      const top = cur;

      for (let i = 1; i <= 9; i++) {
        cur.cause = { message: `lvl${i}` };
        cur = cur.cause;
      }

      cur.code = 'UNABLE_TO_VERIFY_LEAF_SIGNATURE';

      expect(tlsMod.findTlsCode(top)).toBeUndefined();
    });

    it('ignora codes fora da lista', async () => {
      const { tlsMod } = await importFresh();
      expect(tlsMod.findTlsCode({ code: 'SOME_OTHER_CODE' })).toBeUndefined();
    });
  });

  describe('createDiograndeDispatcher', () => {
    it('quando allowInsecureTls=true cria Agent com rejectUnauthorized=false', async () => {
      const { tlsMod, AgentMock } = await importFresh({
        DIOGRANDE_ALLOW_INSECURE_TLS: true,
      });

      const agent = await tlsMod.createDiograndeDispatcher();

      expect(agent).toBeTruthy();
      expect(AgentMock).toHaveBeenCalledTimes(1);
      expect(AgentMock.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          connect: expect.objectContaining({
            rejectUnauthorized: false,
          }),
        }),
      );
    });

    it('quando pinnedCaPem inválido retorna undefined', async () => {
      const { tlsMod, AgentMock } = await importFresh({
        DIOGRANDE_ALLOW_INSECURE_TLS: false,
        DIOGRANDE_CA_PEM: 'NAO_EH_PEM',
      });

      const agent = await tlsMod.createDiograndeDispatcher();

      expect(agent).toBeUndefined();
      expect(AgentMock).not.toHaveBeenCalled();
    });

    it('quando pinnedCaPem válido cria Agent com ca base + pinned', async () => {
      const validPem = `
-----BEGIN CERTIFICATE-----
MOCK
-----END CERTIFICATE-----
`.trim();

      const { tlsMod, AgentMock } = await importFresh({
        DIOGRANDE_ALLOW_INSECURE_TLS: false,
        DIOGRANDE_CA_PEM: validPem,
      });

      const agent = await tlsMod.createDiograndeDispatcher();

      expect(agent).toBeTruthy();
      expect(AgentMock).toHaveBeenCalledTimes(1);

      const opts = AgentMock.mock.calls[0][0];
      expect(opts.connect.servername).toBe('diogrande.campogrande.ms.gov.br');
      expect(opts.connect.ca).toEqual(
        expect.arrayContaining(['BASE_CA_1', 'BASE_CA_2', 'SYS_CA_1', 'EXTRA_CA_1']),
      );

      const caJoined = Array.isArray(opts.connect.ca)
        ? opts.connect.ca.join('\n')
        : String(opts.connect.ca);
      expect(caJoined).toContain('BEGIN CERTIFICATE');
    });

    it('quando cache PEM válido existe e não há pinned, usa cache e cria Agent', async () => {
      const validPem = `
-----BEGIN CERTIFICATE-----
MOCK
-----END CERTIFICATE-----
`.trim();

      const { tlsMod, AgentMock, fsReadFile } = await importFresh({
        DIOGRANDE_ALLOW_INSECURE_TLS: false,
        DIOGRANDE_CA_PEM: undefined,
        DIOGRANDE_AUTO_DISCOVER_CA: false,
      });

      fsReadFile.mockResolvedValueOnce(validPem);

      const agent = await tlsMod.createDiograndeDispatcher();

      expect(agent).toBeTruthy();
      expect(AgentMock).toHaveBeenCalledTimes(1);

      const opts = AgentMock.mock.calls[0][0];
      expect(opts.connect.servername).toBe('diogrande.campogrande.ms.gov.br');
      expect(opts.connect.ca).toEqual(
        expect.arrayContaining(['BASE_CA_1', 'BASE_CA_2', 'SYS_CA_1', 'EXTRA_CA_1']),
      );

      const caJoined = Array.isArray(opts.connect.ca)
        ? opts.connect.ca.join('\n')
        : String(opts.connect.ca);
      expect(caJoined).toContain('BEGIN CERTIFICATE');
    });

    it('quando cache PEM é inválido e autoDiscoverCa=false, retorna undefined', async () => {
      const { tlsMod, AgentMock, fsReadFile } = await importFresh({
        DIOGRANDE_ALLOW_INSECURE_TLS: false,
        DIOGRANDE_CA_PEM: undefined,
        DIOGRANDE_AUTO_DISCOVER_CA: false,
      });

      fsReadFile.mockResolvedValueOnce('LIXO_NAO_PEM');

      const agent = await tlsMod.createDiograndeDispatcher();

      expect(agent).toBeUndefined();
      expect(AgentMock).not.toHaveBeenCalled();
    });

    it('quando não tem pinned, cache vazio/ausente e autoDiscoverCa=false, retorna undefined', async () => {
      const { tlsMod, AgentMock, fsReadFile } = await importFresh({
        DIOGRANDE_ALLOW_INSECURE_TLS: false,
        DIOGRANDE_CA_PEM: undefined,
        DIOGRANDE_AUTO_DISCOVER_CA: false,
      });

      fsReadFile.mockRejectedValueOnce(new Error('no file'));

      const agent = await tlsMod.createDiograndeDispatcher();

      expect(agent).toBeUndefined();
      expect(AgentMock).not.toHaveBeenCalled();
    });
  });
});
