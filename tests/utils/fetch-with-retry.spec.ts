import { AppError } from '@utils/app-error';
import { fetchWithRetry } from '@utils/fetch-with-retry';

jest.mock('undici', () => {
  const actual = jest.requireActual('undici');
  return { ...actual, fetch: jest.fn() };
});

import { fetch as undiciFetch, Request as UndiciRequest } from 'undici';

function makeResponse(status: number, body = 'x'): Response {
  return new Response(body, { status });
}

describe('fetchWithRetry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (undiciFetch as unknown as jest.Mock).mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('lança AppError quando retries é inválido', async () => {
    await expect(fetchWithRetry('https://example.com', { retries: 0 })).rejects.toMatchObject({
      name: 'AppError',
      statusCode: 400,
      code: 'FETCH_INVALID_RETRIES',
    });

    expect(undiciFetch).not.toHaveBeenCalled();
  });

  it('lança AppError quando delayMs é inválido', async () => {
    await expect(fetchWithRetry('https://example.com', { delayMs: -1 })).rejects.toMatchObject({
      name: 'AppError',
      statusCode: 400,
      code: 'FETCH_INVALID_DELAY',
    });

    expect(undiciFetch).not.toHaveBeenCalled();
  });

  it('retorna Response quando ok na primeira tentativa', async () => {
    const fetchMock = undiciFetch as unknown as jest.Mock;
    fetchMock.mockResolvedValueOnce(makeResponse(200, 'ok'));

    const res = await fetchWithRetry('https://example.com', { retries: 3, delayMs: 1000 });

    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('faz retry em status retryable (500) e depois sucesso', async () => {
    const fetchMock = undiciFetch as unknown as jest.Mock;
    fetchMock
      .mockResolvedValueOnce(makeResponse(500))
      .mockResolvedValueOnce(makeResponse(200, 'ok'));

    const p = fetchWithRetry('https://example.com', { retries: 2, delayMs: 1000 });

    await Promise.resolve();
    await jest.advanceTimersByTimeAsync(1000);

    const res = await p;
    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('não faz retry em status não-retryable (400) e lança UPSTREAM_HTTP_ERROR direto', async () => {
    const fetchMock = undiciFetch as unknown as jest.Mock;
    fetchMock.mockResolvedValueOnce(makeResponse(400, 'bad'));

    await expect(
      fetchWithRetry('https://example.com', { retries: 3, delayMs: 1000 }),
    ).rejects.toMatchObject({
      name: 'AppError',
      statusCode: 502,
      code: 'UPSTREAM_HTTP_ERROR',
      data: expect.objectContaining({ status: 400, attempt: 1, retries: 3 }),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('faz retry quando fetch rejeita (erro de rede) e depois sucesso', async () => {
    const fetchMock = undiciFetch as unknown as jest.Mock;
    fetchMock
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(makeResponse(200, 'ok'));

    const p = fetchWithRetry('https://example.com', { retries: 2, delayMs: 500 });

    await Promise.resolve();
    await jest.advanceTimersByTimeAsync(500);

    const res = await p;
    expect(res.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('no último retry, lança UPSTREAM_REQUEST_FAILED contendo cause', async () => {
    const fetchMock = undiciFetch as unknown as jest.Mock;
    fetchMock
      .mockResolvedValueOnce(makeResponse(500))
      .mockResolvedValueOnce(makeResponse(500))
      .mockResolvedValueOnce(makeResponse(500));

    const p = fetchWithRetry(new URL('https://example.com/path'), { retries: 3, delayMs: 1000 });
    const handled = p.catch((e) => e as unknown);

    await Promise.resolve();
    await jest.advanceTimersByTimeAsync(1000);

    await Promise.resolve();
    await jest.advanceTimersByTimeAsync(1000);

    const err = await handled;

    expect(err).toBeInstanceOf(AppError);

    const appErr = err as AppError & { cause?: unknown };
    expect(appErr.statusCode).toBe(502);
    expect(appErr.code).toBe('UPSTREAM_REQUEST_FAILED');

    expect(appErr.cause).toBeInstanceOf(AppError);
    const cause = appErr.cause as AppError;
    expect(cause.code).toBe('UPSTREAM_HTTP_ERROR');

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('data.url é resolvida corretamente quando input for Request', async () => {
    const fetchMock = undiciFetch as unknown as jest.Mock;
    fetchMock.mockResolvedValueOnce(makeResponse(500));

    const req = new UndiciRequest('https://example.com/abc');

    await expect(fetchWithRetry(req, { retries: 1, delayMs: 0 })).rejects.toMatchObject({
      name: 'AppError',
      code: 'UPSTREAM_REQUEST_FAILED',
      data: expect.objectContaining({ url: 'https://example.com/abc' }),
    });
  });
});
