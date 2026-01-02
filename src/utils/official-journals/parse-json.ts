import { AppError } from '@utils/app-error';

export function parseJsonOrThrow<T>(text: string, url: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new AppError({
      statusCode: 502,
      code: 'UPSTREAM_INVALID_JSON',
      message: 'Resposta inválida do upstream (JSON)',
      data: { url, snippet: text.slice(0, 200) },
    });
  }
}
