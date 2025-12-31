import { AppError } from '@utils/app-error';
import { fetchWithRetry, FetchWithRetryOptions } from '@utils/fetch-with-retry';
import { Agent } from 'undici';
import { createDiograndeDispatcher, findTlsCode } from './diogrande.tls';

export class DiograndeHttpClient {
  private dispatcherPromise?: Promise<Agent | undefined>;

  private getDispatcher(): Promise<Agent | undefined> {
    if (this.dispatcherPromise) return this.dispatcherPromise;
    this.dispatcherPromise = createDiograndeDispatcher();
    return this.dispatcherPromise;
  }

  async get(
    url: string,
    init: FetchWithRetryOptions,
  ): Promise<Awaited<ReturnType<typeof fetchWithRetry>>> {
    try {
      return await fetchWithRetry(url, init);
    } catch (err: unknown) {
      const tlsCode = findTlsCode(err);

      if (!tlsCode) throw err;

      const dispatcher = await this.getDispatcher();

      if (!dispatcher) {
        throw new AppError({
          statusCode: 502,
          code: 'UPSTREAM_TLS_ERROR',
          message:
            'TLS certificate chain não pôde ser verificada no diogrande. Ative auto-discover, defina DIOGRANDE_CA_PEM, ou (último recurso) DIOGRANDE_ALLOW_INSECURE_TLS.',
          data: { url, tlsCode },
          cause: err,
        });
      }

      try {
        return await fetchWithRetry(url, { ...init, dispatcher, retries: 1 });
      } catch (err2: unknown) {
        const tlsCode2 = findTlsCode(err2);

        if (!tlsCode2) throw err2;

        throw new AppError({
          statusCode: 502,
          code: 'UPSTREAM_TLS_ERROR',
          message:
            'TLS falhou mesmo após aplicar CA customizada (pin/cache/auto-discover). Verifique o PEM e a cadeia.',
          data: { url, tlsCode: tlsCode2 },
          cause: err2,
        });
      }
    }
  }
}
