import { AppError } from '@utils/app-error';
import { env } from '@config/env';
import { FetchWithRetryOptions, fetchWithRetry } from '@utils/fetch-with-retry';
import {
  FetchPublicationsInputDTO,
  OfficialJournalItemDTO,
  SiteDataDTO,
} from '@domain/dtos/official-journals/search-official-journals.dto';
import { createTiming } from '@utils/timing';

type OfficialJournalsStateItem = {
  numero?: number | string;
  descricao?: string;
  pagina?: number;
  caminhoArquivo?: string;
  nomeArquivo?: string;
  dataPublicacao?: string;
  hiHighlight?: { texto?: string[] } | null;
};

const MAX_RANGE_DAYS = env.OFFICIAL_JOURNALS_MAX_RANGE_DAYS;

type StateResponse = {
  paginaAtual: number;
  totalDePaginas: number;
  totalDeRegistros?: number;
  paginasDiario: unknown[];
};

export class OfficialJournalsStateUseCase {
  private readonly site = 'https://www.diariooficial.ms.gov.br';
  private readonly url = 'https://www.diariooficial.ms.gov.br/api/diarios/busca-diarios';

  async execute(input: FetchPublicationsInputDTO): Promise<SiteDataDTO> {
    const t = createTiming('official-journals', {
      debug: env.OFFICIAL_JOURNALS_DEBUG,
      round: true,
    });

    validateInput(input);
    t.mark('validate');

    const init = buildFetchInit(input);
    t.mark('buildInit');

    const allRawItems = await fetchAllPages(this.url, input, init, t);
    t.mark('fetchAllPages');

    const items = normalizeItems(allRawItems, input.dataInicio, input.dataFim, this.site);
    t.mark('normalize');

    const out = toSiteDataDTO(this.site, items);
    t.mark('buildOutput');

    t.end({ items: items.length });
    return out;
  }
}

async function fetchAllPages(
  baseUrl: string,
  input: FetchPublicationsInputDTO,
  init: FetchWithRetryOptions,
  t: ReturnType<typeof createTiming>,
): Promise<unknown[]> {
  const perPage = 100; 
  let page = 1;
  let totalPages = 1;

  const start = parseBrDateToUTC(input.dataInicio);
  const end = parseBrDateToUTC(input.dataFim);
  const endMs = end ? end.getTime() + (24 * 60 * 60 * 1000 - 1) : null;

  const out: unknown[] = [];

  while (page <= totalPages) {
    const url = buildUrl(baseUrl, input, page, perPage);

    const res = await fetchWithRetry(url, init);
    const text = await res.text();

    const payload = parseJsonOrThrow<unknown>(text, url);
    const parsed = parseStateResponse(payload, url);

    // acumula
    for (const it of parsed.paginasDiario) out.push(it);

    totalPages = parsed.totalDePaginas || 1;
    t.mark(`page_${page}`);

    if (start && endMs !== null) {
      const lastDateMs = findOldestDateMsInPage(parsed.paginasDiario);
      if (lastDateMs !== null && lastDateMs < start.getTime()) break;
    }

    page += 1;
  }

  return out;
}

function buildUrl(baseUrl: string, input: FetchPublicationsInputDTO, pagina: number, registrosPorPagina: number): string {
  const params = new URLSearchParams({
    tipo: '1',
    texto: (input.nome ?? '').trim(),
    pagina: String(pagina),
    registrosPorPagina: String(registrosPorPagina),
  });

  return `${baseUrl}?${params.toString()}`;
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
      referer: 'https://www.diariooficial.ms.gov.br/',
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

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function parseStateResponse(payload: unknown, url: string): StateResponse {
  if (!isRecord(payload)) {
    throw new AppError({
      statusCode: 502,
      code: 'UPSTREAM_RESPONSE_SHAPE_INVALID',
      message: 'Resposta inesperada do upstream (shape)',
      data: { url, payloadType: typeof payload },
    });
  }

  const paginaAtual = payload.paginaAtual;
  const totalDePaginas = payload.totalDePaginas;
  const paginasDiario = payload.paginasDiario;

  if (typeof paginaAtual !== 'number' || typeof totalDePaginas !== 'number' || !Array.isArray(paginasDiario)) {
    throw new AppError({
      statusCode: 502,
      code: 'UPSTREAM_RESPONSE_SHAPE_INVALID',
      message: 'Resposta inesperada do upstream (campos faltando)',
      data: {
        url,
        paginaAtualType: typeof paginaAtual,
        totalDePaginasType: typeof totalDePaginas,
        paginasDiarioIsArray: Array.isArray(paginasDiario),
      },
    });
  }

  const totalDeRegistros = typeof payload.totalDeRegistros === 'number' ? payload.totalDeRegistros : undefined;

  return { paginaAtual, totalDePaginas, totalDeRegistros, paginasDiario };
}

function normalizeItems(
  data: unknown[],
  dataInicio: string,
  dataFim: string,
  siteBase: string,
): OfficialJournalItemDTO[] {
  const start = parseBrDateToUTC(dataInicio);
  const end = parseBrDateToUTC(dataFim);
  const endMs = end ? end.getTime() + (24 * 60 * 60 * 1000 - 1) : null;

  const out: OfficialJournalItemDTO[] = [];

  for (const raw of data) {
    const item = toStateItem(raw);
    if (!item) continue;

    if (start && endMs !== null && item.dataPublicacao) {
      const d = new Date(item.dataPublicacao);
      if (!Number.isNaN(d.getTime())) {
        const ms = d.getTime();
        if (ms < start.getTime()) continue;
        if (ms > endMs) continue;
      }
    }

    const numero = item.numero !== undefined ? String(item.numero) : '';
    const descricaoBase = (item.descricao ?? item.nomeArquivo ?? '').trim();
    const dia = item.dataPublicacao ? new Date(item.dataPublicacao).toLocaleDateString('pt-BR') : '';

    const arquivo = toAbsoluteLink(siteBase, item.caminhoArquivo ?? '');

    const highlight = Array.isArray(item.hiHighlight?.texto)
      ? sanitizeHighlight(item.hiHighlight.texto.filter((x): x is string => typeof x === 'string').join(' '))
      : '';

    out.push({
      numero: numero || dia || 'N/D',
      dia: dia || 'Data não informada',
      arquivo: arquivo || '',
      descricao: highlight ? `${descricaoBase || 'Sem descrição'} | ${highlight}` : (descricaoBase || 'Sem descrição'),
      codigoDia: '',
    });
  }

  return out;
}

function toStateItem(v: unknown): OfficialJournalsStateItem | null {
  if (!isRecord(v)) return null;

  const hi = v.hiHighlight;
  const highlightObj = isRecord(hi) ? hi : null;
  const texto = highlightObj ? highlightObj.texto : undefined;

  return {
    numero: typeof v.numero === 'string' || typeof v.numero === 'number' ? v.numero : undefined,
    descricao: typeof v.descricao === 'string' ? v.descricao : undefined,
    pagina: typeof v.pagina === 'number' ? v.pagina : undefined,
    caminhoArquivo: typeof v.caminhoArquivo === 'string' ? v.caminhoArquivo : undefined,
    nomeArquivo: typeof v.nomeArquivo === 'string' ? v.nomeArquivo : undefined,
    dataPublicacao: typeof v.dataPublicacao === 'string' ? v.dataPublicacao : undefined,
    hiHighlight:
      highlightObj && Array.isArray(texto)
        ? { texto: texto.filter((x): x is string => typeof x === 'string') }
        : null,
  };
}

function sanitizeHighlight(v: string): string {
  return v.replace(/<\/?mark>/gi, '').replace(/\s+/g, ' ').trim();
}

function toAbsoluteLink(baseUrl: string, maybeLink: string): string {
  const link = (maybeLink ?? '').trim();
  if (!link) return '';
  if (/^https?:\/\//i.test(link)) return link;
  if (link.startsWith('/')) return `${baseUrl}${link}`;
  return `${baseUrl}/${link}`;
}

function findOldestDateMsInPage(pageItems: unknown[]): number | null {
  let oldest: number | null = null;

  for (const raw of pageItems) {
    const item = toStateItem(raw);
    if (!item?.dataPublicacao) continue;

    const d = new Date(item.dataPublicacao);
    if (Number.isNaN(d.getTime())) continue;

    const ms = d.getTime();
    if (oldest === null || ms < oldest) oldest = ms;
  }

  return oldest;
}

function toSiteDataDTO(site: string, items: OfficialJournalItemDTO[]): SiteDataDTO {
  if (!items.length) {
    return { site, mensagem: 'Nenhuma publicação encontrada.', conteudos: [] };
  }
  return { site, mensagem: 'Diários oficiais encontrados.', conteudos: items };
}

if (require.main === module) {
  (async () => {
    const uc = new OfficialJournalsStateUseCase();
    const result = await uc.execute({
      nome: 'KLAYTON CHRYSTHIAN OLIVEIRA DIAS',
      dataInicio: '01/01/2025',
      dataFim: '31/12/2025',
      retries: 2,
      delayMs: 150,
    });

    console.log(result);
  })().catch((e) => console.error(e));
}
