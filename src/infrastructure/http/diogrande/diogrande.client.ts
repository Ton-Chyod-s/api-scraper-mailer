import { AppError } from '@utils/app-error';
import { fetchWithRetry, FetchWithRetryOptions } from '@utils/fetch-with-retry';
import { Agent } from 'undici';
import { diograndeConfig } from './diogrande.config';
import { createDiograndeDispatcher, findTlsCode } from './diogrande.tls';

function debugLog(...args: unknown[]) {
  if (!diograndeConfig.debug) return;
  console.debug('[diogrande:http]', ...args);
}

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

      if (
        (tlsCode === 'ERR_TLS_CERT_ALTNAME_INVALID' || tlsCode === 'CERT_HAS_EXPIRED') &&
        !diograndeConfig.allowInsecureTls
      ) {
        throw new AppError({
          statusCode: 502,
          code: 'UPSTREAM_TLS_ERROR',
          message:
            tlsCode === 'ERR_TLS_CERT_ALTNAME_INVALID'
              ? 'TLS falhou por hostname inválido (ALTNAME). CA customizada não resolve isso.'
              : 'TLS falhou por certificado expirado. CA customizada não resolve isso.',
          data: { url, tlsCode },
          cause: err,
        });
      }

      debugLog('TLS falhou, acionando fallback', { url, tlsCode });

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
        debugLog('Retry com dispatcher customizado', {
          url,
          retries: 1,
          cachePath: diograndeConfig.caCachePath,
          hasPinned: Boolean(diograndeConfig.pinnedCaPem),
          autoDiscover: diograndeConfig.autoDiscoverCa,
        });
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
