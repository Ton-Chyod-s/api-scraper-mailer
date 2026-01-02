import { AppError } from '@utils/app-error';

jest.mock('@utils/request/fetch-with-retry', () => ({
  fetchWithRetry: jest.fn(),
}));

jest.mock('@infrastructure/http/diogrande/diogrande.tls', () => ({
  createDiograndeDispatcher: jest.fn(),
  findTlsCode: jest.fn(),
}));

jest.mock('@infrastructure/http/diogrande/diogrande.config', () => ({
  diograndeConfig: {
    debug: false,
    allowInsecureTls: false,
    caCachePath: 'certs/diogrande-ca.pem',
    pinnedCaPem: '',
    autoDiscoverCa: true,
  },
}));

import { fetchWithRetry } from '@utils/request/fetch-with-retry';
import { diograndeConfig } from '@infrastructure/http/diogrande/diogrande.config';
import {
  createDiograndeDispatcher,
  findTlsCode,
} from '@infrastructure/http/diogrande/diogrande.tls';
import { DiograndeHttpClient } from '@infrastructure/http/diogrande/diogrande.client';

const fetchMock = fetchWithRetry as unknown as jest.Mock;
const findTlsCodeMock = findTlsCode as unknown as jest.Mock;
const createDispatcherMock = createDiograndeDispatcher as unknown as jest.Mock;

function makeResponse(status: number, body = 'ok'): Response {
  return new Response(body, { status });
}

describe('DiograndeHttpClient', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    findTlsCodeMock.mockReset();
    createDispatcherMock.mockReset();

    diograndeConfig.debug = false;
    diograndeConfig.allowInsecureTls = false;
    diograndeConfig.caCachePath = 'certs/diogrande-ca.pem';
    diograndeConfig.pinnedCaPem = '';
    diograndeConfig.autoDiscoverCa = true;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('retorna a resposta quando fetchWithRetry resolve na primeira tentativa', async () => {
    fetchMock.mockResolvedValueOnce(makeResponse(200, 'ok'));

    const client = new DiograndeHttpClient();
    const res = await client.get('https://example.com', { retries: 2, delayMs: 10 });

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(createDispatcherMock).not.toHaveBeenCalled();
  });

  it('repropaga erro quando não é TLS (findTlsCode retorna undefined)', async () => {
    const err = new Error('boom');
    fetchMock.mockRejectedValueOnce(err);
    findTlsCodeMock.mockReturnValueOnce(undefined);

    const client = new DiograndeHttpClient();
    await expect(client.get('https://example.com', { retries: 1, delayMs: 0 })).rejects.toBe(err);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(createDispatcherMock).not.toHaveBeenCalled();
  });

  it('para ALTNAME inválido e allowInsecureTls=false, lança UPSTREAM_TLS_ERROR sem tentar dispatcher', async () => {
    const err = new Error('tls');
    fetchMock.mockRejectedValueOnce(err);
    findTlsCodeMock.mockReturnValueOnce('ERR_TLS_CERT_ALTNAME_INVALID');
    diograndeConfig.allowInsecureTls = false;

    const client = new DiograndeHttpClient();
    await expect(
      client.get('https://example.com', { retries: 2, delayMs: 10 }),
    ).rejects.toMatchObject({
      name: 'AppError',
      statusCode: 502,
      code: 'UPSTREAM_TLS_ERROR',
      data: expect.objectContaining({
        url: 'https://example.com',
        tlsCode: 'ERR_TLS_CERT_ALTNAME_INVALID',
      }),
    });

    expect(createDispatcherMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('para certificado expirado e allowInsecureTls=false, lança UPSTREAM_TLS_ERROR sem tentar dispatcher', async () => {
    const err = new Error('tls');
    fetchMock.mockRejectedValueOnce(err);
    findTlsCodeMock.mockReturnValueOnce('CERT_HAS_EXPIRED');
    diograndeConfig.allowInsecureTls = false;

    const client = new DiograndeHttpClient();
    await expect(
      client.get('https://example.com', { retries: 2, delayMs: 10 }),
    ).rejects.toMatchObject({
      name: 'AppError',
      statusCode: 502,
      code: 'UPSTREAM_TLS_ERROR',
      data: expect.objectContaining({
        url: 'https://example.com',
        tlsCode: 'CERT_HAS_EXPIRED',
      }),
    });

    expect(createDispatcherMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('quando TLS falha, cria dispatcher e faz retry com dispatcher e retries=1', async () => {
    const err = new Error('tls');
    const dispatcher = {} as unknown;

    fetchMock.mockRejectedValueOnce(err).mockResolvedValueOnce(makeResponse(200, 'ok'));

    findTlsCodeMock.mockReturnValueOnce('UNABLE_TO_VERIFY_LEAF_SIGNATURE');
    createDispatcherMock.mockResolvedValueOnce(dispatcher);

    const client = new DiograndeHttpClient();
    const res = await client.get('https://example.com', {
      retries: 5,
      delayMs: 10,
      headers: { a: 'b' },
    });

    expect(res.status).toBe(200);
    expect(createDispatcherMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const secondCallArgs = fetchMock.mock.calls[1];
    expect(secondCallArgs[0]).toBe('https://example.com');
    expect(secondCallArgs[1]).toEqual(
      expect.objectContaining({
        dispatcher,
        retries: 1,
        delayMs: 10,
        headers: { a: 'b' },
      }),
    );
  });

  it('quando dispatcher não é criado, lança UPSTREAM_TLS_ERROR com tlsCode', async () => {
    const err = new Error('tls');
    fetchMock.mockRejectedValueOnce(err);
    findTlsCodeMock.mockReturnValueOnce('UNABLE_TO_VERIFY_LEAF_SIGNATURE');
    createDispatcherMock.mockResolvedValueOnce(undefined);

    const client = new DiograndeHttpClient();
    await expect(
      client.get('https://example.com', { retries: 2, delayMs: 10 }),
    ).rejects.toMatchObject({
      name: 'AppError',
      statusCode: 502,
      code: 'UPSTREAM_TLS_ERROR',
      data: expect.objectContaining({
        url: 'https://example.com',
        tlsCode: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
      }),
    });

    expect(createDispatcherMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('se retry falhar com erro não-TLS, repropaga esse erro (não embrulha)', async () => {
    const err1 = new Error('tls');
    const err2 = new Error('boom2');
    const dispatcher = {} as unknown;

    fetchMock.mockRejectedValueOnce(err1).mockRejectedValueOnce(err2);

    findTlsCodeMock
      .mockReturnValueOnce('UNABLE_TO_VERIFY_LEAF_SIGNATURE')
      .mockReturnValueOnce(undefined);

    createDispatcherMock.mockResolvedValueOnce(dispatcher);

    const client = new DiograndeHttpClient();
    await expect(client.get('https://example.com', { retries: 2, delayMs: 10 })).rejects.toBe(err2);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('se retry falhar com erro TLS, embrulha em UPSTREAM_TLS_ERROR preservando cause', async () => {
    const err1 = new Error('tls1');
    const err2 = new Error('tls2');
    const dispatcher = {} as unknown;

    fetchMock.mockRejectedValueOnce(err1).mockRejectedValueOnce(err2);

    findTlsCodeMock
      .mockReturnValueOnce('UNABLE_TO_VERIFY_LEAF_SIGNATURE')
      .mockReturnValueOnce('UNABLE_TO_VERIFY_LEAF_SIGNATURE');

    createDispatcherMock.mockResolvedValueOnce(dispatcher);

    const client = new DiograndeHttpClient();
    const err = await client
      .get('https://example.com', { retries: 2, delayMs: 10 })
      .catch((e) => e);

    expect(err).toBeInstanceOf(AppError);
    expect(err).toMatchObject({
      name: 'AppError',
      statusCode: 502,
      code: 'UPSTREAM_TLS_ERROR',
      data: expect.objectContaining({
        url: 'https://example.com',
        tlsCode: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
      }),
    });

    const appErr = err as AppError & { cause?: unknown };
    expect(appErr.cause).toBe(err2);
  });

  it('cacheia o dispatcherPromise: duas chamadas em fallback criam dispatcher apenas uma vez', async () => {
    const dispatcher = {} as unknown;
    const errA = new Error('tlsA');
    const errB = new Error('tlsB');

    fetchMock
      .mockRejectedValueOnce(errA)
      .mockRejectedValueOnce(errB)
      .mockResolvedValueOnce(makeResponse(200, 'okA'))
      .mockResolvedValueOnce(makeResponse(200, 'okB'));

    findTlsCodeMock
      .mockReturnValueOnce('UNABLE_TO_VERIFY_LEAF_SIGNATURE')
      .mockReturnValueOnce('UNABLE_TO_VERIFY_LEAF_SIGNATURE');

    let resolveDisp: (v: unknown) => void;
    const dispPromise = new Promise((r) => {
      resolveDisp = r;
    });
    createDispatcherMock.mockReturnValueOnce(dispPromise);

    const client = new DiograndeHttpClient();

    const p1 = client.get('https://example.com/a', { retries: 2, delayMs: 0 });
    const p2 = client.get('https://example.com/b', { retries: 2, delayMs: 0 });

    resolveDisp!(dispatcher);

    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);

    expect(createDispatcherMock).toHaveBeenCalledTimes(1);
  });
});
