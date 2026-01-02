import { AppError } from '@utils/app-error';
import { env } from '@config/env';
import { FetchWithRetryOptions, fetchWithRetry } from '@utils/request/fetch-with-retry';
import {
  FetchPublicationsInputDTO,
  OfficialJournalItemDTO,
  SiteDataDTO,
} from '@domain/dtos/official-journals/search-official-journals.dto';
import { createTiming } from '@utils/timing';
import {
  OfficialJournalsStateItem,
  StateResponse,
} from '@domain/dtos/official-journals/official-journals-state.dto';
import { validateInput } from '@utils/official-journals/validate-input';
import { parseBrDateToUTC } from '@utils/official-journals/parse-br-date';
import { parseJsonOrThrow } from '@utils/official-journals/parse-json';
import { siteData } from '@utils/official-journals/site-data';
import { buildFetchInit } from '@utils/official-journals/build-fetchInit';

const DOE_REFERER = 'https://www.diariooficial.ms.gov.br/';

export class OfficialJournalsStateUseCase {
  private readonly url = 'https://www.diariooficial.ms.gov.br/api/diarios/busca-diarios';

  async execute(input: FetchPublicationsInputDTO): Promise<SiteDataDTO> {
    const t = createTiming('official-journals', {
      debug: env.OFFICIAL_JOURNALS_DEBUG,
      round: true,
    });

    validateInput(input);
    t.mark('validate');

    const init = buildFetchInit(input, DOE_REFERER);
    t.mark('buildInit');

    const allRawItems = await fetchAllPages(this.url, input, init, t);
    t.mark('fetchAllPages');

    const items = normalizeItems(allRawItems, input.dataInicio, input.dataFim, DOE_REFERER);
    t.mark('normalize');

    const out = siteData(DOE_REFERER, items);
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

function buildUrl(
  baseUrl: string,
  input: FetchPublicationsInputDTO,
  pagina: number,
  registrosPorPagina: number,
): string {
  const params = new URLSearchParams({
    tipo: '1',
    texto: (input.nome ?? '').trim(),
    pagina: String(pagina),
    registrosPorPagina: String(registrosPorPagina),
  });

  return `${baseUrl}?${params.toString()}`;
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

  if (
    typeof paginaAtual !== 'number' ||
    typeof totalDePaginas !== 'number' ||
    !Array.isArray(paginasDiario)
  ) {
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

  const totalDeRegistros =
    typeof payload.totalDeRegistros === 'number' ? payload.totalDeRegistros : undefined;

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
    const dia = item.dataPublicacao
      ? new Date(item.dataPublicacao).toLocaleDateString('pt-BR')
      : '';

    const arquivo = toAbsoluteLink(siteBase, item.caminhoArquivo ?? '');

    const highlight = Array.isArray(item.hiHighlight?.texto)
      ? sanitizeHighlight(
          item.hiHighlight.texto.filter((x): x is string => typeof x === 'string').join(' '),
        )
      : '';

    out.push({
      numero: numero || dia || 'N/D',
      dia: dia || 'Data não informada',
      arquivo: arquivo || '',
      descricao: highlight
        ? `${descricaoBase || 'Sem descrição'} | ${highlight}`
        : descricaoBase || 'Sem descrição',
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
  return v
    .replace(/<\/?mark>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
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
