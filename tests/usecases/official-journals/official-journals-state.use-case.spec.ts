import type { FetchWithRetryOptions } from '@utils/request/fetch-with-retry';
import * as fetchRetryModule from '@utils/request/fetch-with-retry';
import type { FetchPublicationsInputDTO } from '@domain/dtos/official-journals/search-official-journals.dto';
import { OfficialJournalsStateUseCase } from '@usecases/official-journals/official-journals-state.use-case';

jest.mock('@config/env', () => ({
  env: {
    OFFICIAL_JOURNALS_MAX_RANGE_DAYS: 365,
    OFFICIAL_JOURNALS_DEBUG: false,
    NODE_ENV: 'test',
  },
}));

jest.mock('@utils/timing', () => ({
  createTiming: () => ({
    mark: jest.fn(),
    end: jest.fn(),
  }),
}));

jest.mock('@utils/request/fetch-with-retry', () => ({
  fetchWithRetry: jest.fn(),
}));

type HttpResponseLike = {
  text: () => Promise<string>;
};

function makeHttpResponse(body: unknown): HttpResponseLike {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return { text: async () => text };
}

describe('OfficialJournalsStateUseCase', () => {
  const DOE_REFERER = 'https://www.diariooficial.ms.gov.br/';
  const fetchWithRetry = fetchRetryModule.fetchWithRetry as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lança erro quando nome inválido (<3) e não chama fetchWithRetry', async () => {
    const uc = new OfficialJournalsStateUseCase();

    const input: FetchPublicationsInputDTO = {
      nome: 'ab',
      dataInicio: '01/01/2025',
      dataFim: '02/01/2025',
    };

    await expect(uc.execute(input)).rejects.toMatchObject({
      name: 'AppError',
      code: 'OFFICIAL_JOURNALS_INVALID_NAME',
      statusCode: 400,
    });

    expect(fetchWithRetry).not.toHaveBeenCalled();
  });

  it('chama fetchWithRetry com URL e init esperados e retorna vazio quando não há itens', async () => {
    fetchWithRetry.mockResolvedValueOnce(
      makeHttpResponse({ paginaAtual: 1, totalDePaginas: 1, paginasDiario: [] }),
    );

    const uc = new OfficialJournalsStateUseCase();

    const input: FetchPublicationsInputDTO = {
      nome: 'KLAY',
      dataInicio: '01/01/2025',
      dataFim: '02/01/2025',
      retries: 3,
      delayMs: 1,
    };

    const out = await uc.execute(input);

    expect(fetchWithRetry).toHaveBeenCalledTimes(1);
    const [url, init] = fetchWithRetry.mock.calls[0] as [string, FetchWithRetryOptions];

    expect(url).toContain('busca-diarios');
    expect(url).toContain('tipo=1');
    expect(url).toContain('texto=KLAY');
    expect(url).toContain('pagina=1');
    expect(url).toContain('registrosPorPagina=100');

    expect(init.method).toBe('GET');
    expect(init.retries).toBe(3);
    expect(init.delayMs).toBe(1);

    const headers = init.headers as Record<string, string>;
    expect(headers.accept).toBeTruthy();
    expect(headers['accept-language']).toBeTruthy();
    expect(headers['user-agent']).toBeTruthy();
    expect(headers.referer).toBe(DOE_REFERER);

    expect(out).toEqual({
      site: DOE_REFERER,
      mensagem: 'Nenhuma publicação encontrada.',
      conteudos: [],
    });
  });

  it('lança UPSTREAM_RESPONSE_SHAPE_INVALID quando payload não tem campos esperados', async () => {
    fetchWithRetry.mockResolvedValueOnce(makeHttpResponse({ ok: true }));

    const uc = new OfficialJournalsStateUseCase();

    const input: FetchPublicationsInputDTO = {
      nome: 'KLAY',
      dataInicio: '01/01/2025',
      dataFim: '02/01/2025',
    };

    await expect(uc.execute(input)).rejects.toMatchObject({
      name: 'AppError',
      statusCode: 502,
      code: 'UPSTREAM_RESPONSE_SHAPE_INVALID',
    });
  });

  it('faz short-circuit de paginação quando encontra itens mais antigos que dataInicio', async () => {
    fetchWithRetry
      .mockResolvedValueOnce(
        makeHttpResponse({
          paginaAtual: 1,
          totalDePaginas: 5,
          paginasDiario: [
            { dataPublicacao: '2025-01-10T00:00:00.000Z' },
            { dataPublicacao: '2025-01-05T00:00:00.000Z' },
          ],
        }),
      )
      .mockResolvedValueOnce(
        makeHttpResponse({
          paginaAtual: 2,
          totalDePaginas: 5,
          paginasDiario: [{ dataPublicacao: '2024-12-31T00:00:00.000Z' }],
        }),
      );

    const uc = new OfficialJournalsStateUseCase();

    const input: FetchPublicationsInputDTO = {
      nome: 'KLAY',
      dataInicio: '01/01/2025',
      dataFim: '31/01/2025',
    };

    const out = await uc.execute(input);

    expect(fetchWithRetry).toHaveBeenCalledTimes(2);
    expect(out.site).toBe(DOE_REFERER);
  });

  it('mapeia itens, filtra por range, monta link absoluto e limpa <mark> do highlight', async () => {
    fetchWithRetry.mockResolvedValueOnce(
      makeHttpResponse({
        paginaAtual: 1,
        totalDePaginas: 1,
        paginasDiario: [
          {
            numero: 123,
            dataPublicacao: '2025-01-02T23:00:00.000Z',
            caminhoArquivo: '/diarios/edicao-123.pdf',
            descricao: 'Diário Oficial',
            hiHighlight: { texto: ['<mark>Klay</mark>', 'teste'] },
          },
          {
            numero: 'X',
            dataPublicacao: '2024-12-31T00:00:00.000Z',
            caminhoArquivo: '/diarios/old.pdf',
            descricao: 'Old',
          },
        ],
      }),
    );

    const uc = new OfficialJournalsStateUseCase();

    const input: FetchPublicationsInputDTO = {
      nome: 'KLAY',
      dataInicio: '01/01/2025',
      dataFim: '03/01/2025',
    };

    const out = await uc.execute(input);

    expect(out.mensagem).toBe('Diários oficiais encontrados.');
    expect(out.conteudos).toHaveLength(1);

    expect(out.conteudos[0]).toEqual({
      numero: '123',
      dia: '02/01/2025',
      arquivo: 'https://www.diariooficial.ms.gov.br/diarios/edicao-123.pdf',
      descricao: 'Diário Oficial | Klay teste',
      codigoDia: '',
    });
  });
});
