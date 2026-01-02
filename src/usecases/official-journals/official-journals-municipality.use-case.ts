import { AppError } from '@utils/app-error';
import { env } from '@config/env';
import {
  FetchPublicationsInputDTO,
  OfficialJournalItemDTO,
  SiteDataDTO,
} from '@domain/dtos/official-journals/search-official-journals.dto';
import { diograndeConfig } from '@infrastructure/http/diogrande/diogrande.config';
import { DiograndeHttpClient } from '@infrastructure/http/diogrande/diogrande.client';
import { createTiming } from '@utils/timing';
import { validateInput } from '@utils/official-journals/validate-input';
import { parseJsonOrThrow } from '@utils/official-journals/parse-json';
import {
  AjaxPayloadDto,
  OfficialJournalsMunicipalityDto,
} from '@domain/dtos/official-journals/official-journals-municipality.dto';
import { siteData } from '@utils/official-journals/site-data';
import { buildFetchInit } from '@utils/official-journals/build-fetchInit';

const DIOGRANDE_REFERER = (() => {
  try {
    const u = new URL(diograndeConfig.baseUrl);
    return `${u.origin}/`;
  } catch {
    return 'https://diogrande.campogrande.ms.gov.br/';
  }
})();

export class OfficialJournalsMunicipalityUseCase {
  private readonly site = DIOGRANDE_REFERER;

  constructor(private readonly client = new DiograndeHttpClient()) {}

  async execute(input: FetchPublicationsInputDTO): Promise<SiteDataDTO> {
    const t = createTiming('official-journals', {
      debug: env.OFFICIAL_JOURNALS_DEBUG,
      round: true,
    });

    validateInput(input);
    t.mark('validate');

    const url = buildUrl(input);
    const init = buildFetchInit(input, DIOGRANDE_REFERER);
    t.mark('build');

    const res = await this.client.get(url, init);
    t.mark('fetch');

    const text = await res.text();
    t.mark('readText');

    const payload = parseJsonOrThrow<AjaxPayloadDto>(text, url);
    t.mark('parseJson');

    if (payload.success === false) {
      t.mark('upstreamCheck');

      if (payload.data == null || (Array.isArray(payload.data) && payload.data.length === 0)) {
        const out = siteData(this.site, []);
        t.mark('buildOutput');
        t.end({ url, success: payload.success, empty: true });
        return out;
      }

      const message = typeof payload.message === 'string' ? payload.message : undefined;
      t.end({ url, success: payload.success, empty: false });

      throw new AppError({
        statusCode: 502,
        code: 'UPSTREAM_RESPONSE_ERROR',
        message: message || 'Upstream respondeu success=false',
        data: {
          url,
          success: payload.success,
          dataType: typeof payload.data,
          snippet: String(text || '').slice(0, 300),
        },
      });
    }

    const items = normalizeItemsStrict(payload, url, text);
    t.mark('normalize');

    const out = siteData(this.site, items);
    t.mark('buildOutput');

    t.end({ url, items: items.length });
    return out;
  }
}

function normalizeItemsStrict(
  payload: AjaxPayloadDto,
  url: string,
  rawText: string,
): OfficialJournalItemDTO[] {
  const { success, data } = payload;

  if (success === true) {
    if (!Array.isArray(data)) {
      throw new AppError({
        statusCode: 502,
        code: 'UPSTREAM_RESPONSE_SHAPE_INVALID',
        message: 'Resposta inesperada do upstream (data não é array com success=true)',
        data: {
          url,
          success,
          dataType: typeof data,
          snippet: String(rawText || '').slice(0, 300),
        },
      });
    }
    return normalizeItems(data);
  }

  if (data == null) return [];
  if (Array.isArray(data)) return normalizeItems(data);

  throw new AppError({
    statusCode: 502,
    code: 'UPSTREAM_RESPONSE_SHAPE_INVALID',
    message: 'Resposta inesperada do upstream (data inválida)',
    data: {
      url,
      success,
      dataType: typeof data,
      snippet: String(rawText || '').slice(0, 300),
    },
  });
}

function normalizeItems(data: unknown): OfficialJournalItemDTO[] {
  if (!Array.isArray(data)) return [];

  const out: OfficialJournalItemDTO[] = [];
  for (const raw of data) {
    if (!isMunicipalityItem(raw)) continue;

    out.push({
      numero: raw.numero,
      dia: raw.dia,
      arquivo: raw.arquivo,
      descricao: raw.desctpd,
      codigoDia: raw.codigodia,
    });
  }

  return out;
}

function isMunicipalityItem(v: unknown): v is OfficialJournalsMunicipalityDto {
  if (!v || typeof v !== 'object') return false;
  const r = v as Record<string, unknown>;

  return (
    typeof r.numero === 'string' &&
    typeof r.dia === 'string' &&
    typeof r.arquivo === 'string' &&
    typeof r.desctpd === 'string' &&
    typeof r.codigodia === 'string'
  );
}

function buildUrl(input: FetchPublicationsInputDTO): string {
  const params = new URLSearchParams({
    action: 'edicoes_json',
    palavra: (input.nome ?? '').trim(),
    de: input.dataInicio,
    ate: input.dataFim,
  });

  return `${diograndeConfig.baseUrl}?${params.toString()}`;
}

if (require.main === module) {
  (async () => {
    const client = new DiograndeHttpClient();
    const uc = new OfficialJournalsMunicipalityUseCase(client);
    const result = await uc.execute({
      nome: 'KLAYTON CHRYSTHIAN OLIVEIRA DIAS',
      dataInicio: '01/01/2023',
      dataFim: '30/07/2023',
      retries: 1,
      delayMs: 50,
    });

    console.log(result);
  })().catch((e) => console.error(e));
}
