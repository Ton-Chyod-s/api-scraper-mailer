import { AppError } from '@utils/app-error';
import { env } from '@config/env';
import { FetchWithRetryOptions, fetchWithRetry } from '@utils/request/fetch-with-retry';
import {
  FetchPublicationsInputDTO,
  OfficialJournalItemDTO,
  SiteDataDTO,
} from '@domain/dtos/official-journals/search-official-journals.dto';
import { createTiming } from '@utils/timing';
import { StateResponse } from '@domain/dtos/official-journals/official-journals-state.dto';
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
  const startMs = start ? start.getTime() : null;
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

    // short-circuit: se a página já tem itens mais antigos que o início do range, para de paginar
    if (startMs !== null && endMs !== null) {
      let oldest: number | null = null;

      for (const raw of parsed.paginasDiario) {
        if (!raw || typeof raw !== 'object') continue;

        const s = (raw as Record<string, unknown>).dataPublicacao;
        if (typeof s !== 'string') continue;

        const ms = new Date(s).getTime();
        if (Number.isNaN(ms)) continue;

        if (oldest === null || ms < oldest) oldest = ms;
      }

      if (oldest !== null && oldest < startMs) break;
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

function parseStateResponse(payload: unknown, url: string): StateResponse {
  if (!payload || typeof payload !== 'object') {
    throw new AppError({
      statusCode: 502,
      code: 'UPSTREAM_RESPONSE_SHAPE_INVALID',
      message: 'Resposta inesperada do upstream (shape)',
      data: { url, payloadType: typeof payload },
    });
  }

  const p = payload as Record<string, unknown>;

  const paginaAtual = p.paginaAtual;
  const totalDePaginas = p.totalDePaginas;
  const paginasDiario = p.paginasDiario;

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

  const totalDeRegistros = typeof p.totalDeRegistros === 'number' ? p.totalDeRegistros : undefined;

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
  const startMs = start ? start.getTime() : null;
  const endMs = end ? end.getTime() + (24 * 60 * 60 * 1000 - 1) : null;

  const toAbs = (base: string, maybeLink: string): string => {
    const link = (maybeLink ?? '').trim();
    if (!link) return '';
    try {
      return new URL(link, base).toString();
    } catch {
      return '';
    }
  };

  const stripMark = (v: string): string =>
    v.replace(/<\/?mark>/gi, '').replace(/\s+/g, ' ').trim();

  const out: OfficialJournalItemDTO[] = [];

  for (const raw of data) {
    if (!raw || typeof raw !== 'object') continue;
    const o = raw as Record<string, unknown>;

    const dataPublicacao = typeof o.dataPublicacao === 'string' ? o.dataPublicacao : undefined;
    const caminhoArquivo = typeof o.caminhoArquivo === 'string' ? o.caminhoArquivo : '';
    const descricao = typeof o.descricao === 'string' ? o.descricao : undefined;
    const nomeArquivo = typeof o.nomeArquivo === 'string' ? o.nomeArquivo : undefined;
    const numeroRaw = o.numero;

    if (startMs !== null && endMs !== null && dataPublicacao) {
      const ms = new Date(dataPublicacao).getTime();
      if (!Number.isNaN(ms)) {
        if (ms < startMs) continue;
        if (ms > endMs) continue;
      }
    }

    let highlight = '';
    const hi = o.hiHighlight;
    if (hi && typeof hi === 'object') {
      const texto = (hi as Record<string, unknown>).texto;
      if (Array.isArray(texto)) {
        highlight = stripMark(texto.filter((x): x is string => typeof x === 'string').join(' '));
      }
    }

    const numero =
      typeof numeroRaw === 'string' || typeof numeroRaw === 'number' ? String(numeroRaw) : '';

    const descricaoBase = (descricao ?? nomeArquivo ?? '').trim();

    const dia = dataPublicacao ? new Date(dataPublicacao).toLocaleDateString('pt-BR') : '';

    const arquivo = toAbs(siteBase, caminhoArquivo);

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
