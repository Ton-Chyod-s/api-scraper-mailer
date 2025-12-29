import { AppError } from '@utils/app-error';

export type FetchWithRetryOptions = RequestInit & {
  retries?: number;
  delayMs?: number;
};

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

function getUrl(input: RequestInfo | URL): string {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.toString();
  if (input instanceof Request) return input.url;
  return String(input);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStatusFromAppError(err: AppError): number | undefined {
  const maybeData = (err as unknown as { data?: unknown }).data;
  if (!maybeData || typeof maybeData !== 'object') return undefined;

  const status = (maybeData as Record<string, unknown>).status;
  return typeof status === 'number' ? status : undefined;
}

export async function fetchWithRetry(
  input: RequestInfo | URL,
  options: FetchWithRetryOptions = {},
): Promise<Response> {
  const { retries = 1, delayMs = 500, ...init } = options;

  if (!Number.isInteger(retries) || retries < 1) {
    throw AppError.badRequest('Invalid retries value', 'FETCH_INVALID_RETRIES', { retries });
  }
  if (!Number.isFinite(delayMs) || delayMs < 0) {
    throw AppError.badRequest('Invalid delayMs value', 'FETCH_INVALID_DELAY', { delayMs });
  }

  const url = getUrl(input);
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const isLast = attempt === retries;

    try {
      const res = await fetch(input, init);

      if (res.ok) return res;

      const retryable = RETRYABLE_STATUS.has(res.status);

      if (!retryable || isLast) {
        throw new AppError({
          statusCode: 502,
          code: 'UPSTREAM_HTTP_ERROR',
          message: 'Upstream request failed',
          data: { url, status: res.status, statusText: res.statusText, attempt, retries },
        });
      }

      await res.body?.cancel().catch(() => undefined);
      await sleep(delayMs);
    } catch (err: unknown) {
      if (err instanceof AppError && err.code === 'UPSTREAM_HTTP_ERROR') {
        const status = getStatusFromAppError(err);
        if (typeof status === 'number' && !RETRYABLE_STATUS.has(status)) {
          throw err;
        }
      }

      lastError = err;

      if (isLast) {
        throw new AppError({
          statusCode: 502,
          code: 'UPSTREAM_REQUEST_FAILED',
          message: 'Upstream request failed',
          data: { url, attempt, retries },
          cause: lastError,
        });
      }

      await sleep(delayMs);
    }
  }

  throw new AppError({
    statusCode: 502,
    code: 'UPSTREAM_REQUEST_FAILED',
    message: 'Upstream request failed',
    data: { url, retries },
    cause: lastError,
  });
}

if (require.main === module) {
  (async () => {
    try {
      const res = await fetchWithRetry('https://httpbin.org/json', { retries: 3, delayMs: 1000 });

      console.log('Response status:', res.status);
      console.log('Content-Type:', res.headers.get('content-type'));

      const text = await res.text();
      console.log('Body:', text);
    } catch (err) {
      console.error('Fetch failed:', err);
    }
  })();
}
