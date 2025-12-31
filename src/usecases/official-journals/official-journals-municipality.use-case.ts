import { AppError } from '@utils/app-error';
import { FetchWithRetryOptions } from '@utils/fetch-with-retry';
import {
  FetchPublicationsInputDTO,
  OfficialJournalItemDTO,
  SiteDataDTO,
} from '@domain/dtos/official-journals/search-official-journals.dto';
import { diograndeConfig } from '@infrastructure/http/diogrande/diogrande.config';
import { DiograndeHttpClient } from '@infrastructure/http/diogrande/diogrande.client';
import { createTiming } from '@utils/timing';

type OfficialJournalsMunicipalityItem = {
  numero: string;
  dia: string;
  arquivo: string;
  desctpd: string;
  codigodia: string;
};

type AjaxPayload = {
  success?: boolean;
  data?: unknown;
  message?: unknown;
};

const MAX_RANGE_DAYS = (() => {
  const raw = process.env.OFFICIAL_JOURNALS_MAX_RANGE_DAYS;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 365;
})();

const DIOGRANDE_REFERER = (() => {
  try {
    const u = new URL(diograndeConfig.baseUrl);
    return `${u.origin}/`;
  } catch {
    return 'https://diogrande.campogrande.ms.gov.br/';
  }
})();

export class OfficialJournalsMunicipalityUseCase {
  constructor(private readonly client = new DiograndeHttpClient()) {}

  async execute(input: FetchPublicationsInputDTO): Promise<SiteDataDTO> {
    const t = createTiming('official-journals', {
      debug: { envVar: 'OFFICIAL_JOURNALS_DEBUG' },
      round: true,
    });

    validateInput(input);
    t.mark('validate');

    const url = buildUrl(input);
    const init = buildFetchInit(input);
    t.mark('build');

    const res = await this.client.get(url, init);
    t.mark('fetch');

    const text = await res.text();
    t.mark('readText');

    const payload = parseJsonOrThrow<AjaxPayload>(text, url);
    t.mark('parseJson');

    if (payload.success === false) {
      t.mark('upstreamCheck');

      if (Array.isArray(payload.data) && payload.data.length === 0) {
        const out = toSiteDataDTO([]);
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

    const items = normalizeItems(payload.data);
    t.mark('normalize');

    const out = toSiteDataDTO(items);
    t.mark('buildOutput');

    t.end({ url, items: items.length });
    return out;
  }
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

function isMunicipalityItem(v: unknown): v is OfficialJournalsMunicipalityItem {
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

function buildFetchInit(input: FetchPublicationsInputDTO): FetchWithRetryOptions {
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
      referer: DIOGRANDE_REFERER,
    },
  };
}

function validateInput(input: FetchPublicationsInputDTO) {
  const nome = (input.nome ?? '').trim();
  if (nome.length < 3) {
    throw AppError.badRequest('Nome inválido', 'OFFICIAL_JOURNALS_INVALID_NAME', {
      nome: input.nome,
    });
  }

  if (!isBrDate(input.dataInicio)) {
    throw AppError.badRequest(
      'dataInicio inválida (DD/MM/AAAA)',
      'OFFICIAL_JOURNALS_INVALID_START_DATE',
      { dataInicio: input.dataInicio },
    );
  }

  if (!isBrDate(input.dataFim)) {
    throw AppError.badRequest(
      'dataFim inválida (DD/MM/AAAA)',
      'OFFICIAL_JOURNALS_INVALID_END_DATE',
      { dataFim: input.dataFim },
    );
  }

  const start = parseBrDateToUTC(input.dataInicio);
  const end = parseBrDateToUTC(input.dataFim);

  if (!start || !end) {
    throw AppError.badRequest('Datas inválidas', 'OFFICIAL_JOURNALS_INVALID_DATES', {
      dataInicio: input.dataInicio,
      dataFim: input.dataFim,
    });
  }

  if (start.getTime() > end.getTime()) {
    throw AppError.badRequest(
      'dataInicio não pode ser maior que dataFim',
      'OFFICIAL_JOURNALS_DATE_RANGE_INVALID',
      { dataInicio: input.dataInicio, dataFim: input.dataFim },
    );
  }

  const rangeDays = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
  if (rangeDays > MAX_RANGE_DAYS) {
    throw AppError.badRequest(
      `Intervalo de datas muito grande (máx ${MAX_RANGE_DAYS} dias)`,
      'OFFICIAL_JOURNALS_DATE_RANGE_TOO_LARGE',
      {
        dataInicio: input.dataInicio,
        dataFim: input.dataFim,
        rangeDays,
        maxRangeDays: MAX_RANGE_DAYS,
      },
    );
  }
}

function isBrDate(v: string) {
  return typeof v === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(v.trim());
}

function parseBrDateToUTC(v: string) {
  const [dd, mm, yyyy] = v.split('/').map((x) => Number(x));
  if (!dd || !mm || !yyyy) return null;

  const d = new Date(Date.UTC(yyyy, mm - 1, dd));
  if (d.getUTCFullYear() !== yyyy || d.getUTCMonth() !== mm - 1 || d.getUTCDate() !== dd) {
    return null;
  }
  return d;
}

function parseJsonOrThrow<T>(text: string, url: string): T {
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

function toSiteDataDTO(items: OfficialJournalItemDTO[]): SiteDataDTO {
  if (!items.length) {
    return {
      site: 'https://diogrande.campogrande.ms.gov.br/',
      mensagem: 'Nenhuma publicação encontrada.',
      conteudos: [],
    };
  }

  return {
    site: 'https://diogrande.campogrande.ms.gov.br/',
    mensagem: 'Diários oficiais encontrados.',
    conteudos: items,
  };
}

if (require.main === module) {
  (async () => {
    const client = new DiograndeHttpClient();
    const uc = new OfficialJournalsMunicipalityUseCase(client);
    const result = await uc.execute({
      nome: 'KLAYTON CHRYSTHIAN OLIVEIRA DIAS',
      dataInicio: '01/01/2023',
      dataFim: '31/03/2023',
      retries: 1,
      delayMs: 50,
    });

    console.log(result);
  })().catch((e) => console.error(e));
}
