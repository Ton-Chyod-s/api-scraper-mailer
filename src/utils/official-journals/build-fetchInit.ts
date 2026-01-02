import { FetchPublicationsInputDTO } from '@domain/dtos/official-journals/search-official-journals.dto';
import { FetchWithRetryOptions } from '@utils/request/fetch-with-retry';

export function buildFetchInit(
  input: FetchPublicationsInputDTO,
  referer: string,
): FetchWithRetryOptions {
  const { retries = 2, delayMs = 350 } = input;

  return {
    method: 'GET',
    retries,
    delayMs,
    headers: {
      accept: 'application/json,text/plain;q=0.9,*/*;q=0.8',
      'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      referer: referer,
    },
  };
}
