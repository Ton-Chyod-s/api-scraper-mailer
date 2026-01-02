import type { FetchWithRetryOptions } from '@utils/request/fetch-with-retry';
import type { FetchPublicationsInputDTO } from '@domain/dtos/official-journals/search-official-journals.dto';
import { OfficialJournalsMunicipalityUseCase } from '@usecases/official-journals/official-journals-municipality.use-case';
import { DiograndeHttpClient } from '@infrastructure/http/diogrande/diogrande.client';

jest.mock('@config/env', () => ({
  env: {
    OFFICIAL_JOURNALS_MAX_RANGE_DAYS: 365,
    OFFICIAL_JOURNALS_DEBUG: false,
    NODE_ENV: 'test',
  },
}));

jest.mock('@infrastructure/http/diogrande/diogrande.config', () => ({
  diograndeConfig: {
    baseUrl: 'https://diogrande.campogrande.ms.gov.br/wp-admin/admin-ajax.php',
  },
}));

jest.mock('@utils/timing', () => ({
  createTiming: () => ({
    mark: jest.fn(),
    end: jest.fn(),
  }),
}));

type HttpResponseLike = {
  text: () => Promise<string>;
};

function makeHttpResponse(body: unknown): HttpResponseLike {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return { text: async () => text };
}

function makeClient(
  getMock: jest.Mock<Promise<HttpResponseLike>, [string, FetchWithRetryOptions]>,
): DiograndeHttpClient {
  return { get: getMock } as unknown as DiograndeHttpClient;
}

describe('OfficialJournalsMunicipalityUseCase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lança erro quando nome inválido (<3)', async () => {
    const getMock = jest.fn<Promise<HttpResponseLike>, [string, FetchWithRetryOptions]>();
    const client = makeClient(getMock);
    const uc = new OfficialJournalsMunicipalityUseCase(client);

    const input: FetchPublicationsInputDTO = {
      nome: 'ab',
      dataInicio: '01/01/2023',
      dataFim: '02/01/2023',
    };

    await expect(uc.execute(input)).rejects.toMatchObject({
      name: 'AppError',
      code: 'OFFICIAL_JOURNALS_INVALID_NAME',
      statusCode: 400,
    });

    expect(getMock).not.toHaveBeenCalled();
  });

  it('lança erro quando dataInicio inválida', async () => {
    const getMock = jest.fn<Promise<HttpResponseLike>, [string, FetchWithRetryOptions]>();
    const client = makeClient(getMock);
    const uc = new OfficialJournalsMunicipalityUseCase(client);

    const input: FetchPublicationsInputDTO = {
      nome: 'KLAY',
      dataInicio: '2023-01-01',
      dataFim: '02/01/2023',
    };

    await expect(uc.execute(input)).rejects.toMatchObject({
      name: 'AppError',
      code: 'OFFICIAL_JOURNALS_INVALID_START_DATE',
      statusCode: 400,
    });

    expect(getMock).not.toHaveBeenCalled();
  });

  it('lança erro quando dataInicio > dataFim', async () => {
    const getMock = jest.fn<Promise<HttpResponseLike>, [string, FetchWithRetryOptions]>();
    const client = makeClient(getMock);
    const uc = new OfficialJournalsMunicipalityUseCase(client);

    const input: FetchPublicationsInputDTO = {
      nome: 'KLAY',
      dataInicio: '10/01/2023',
      dataFim: '02/01/2023',
    };

    await expect(uc.execute(input)).rejects.toMatchObject({
      name: 'AppError',
      code: 'OFFICIAL_JOURNALS_DATE_RANGE_INVALID',
      statusCode: 400,
    });

    expect(getMock).not.toHaveBeenCalled();
  });

  it('lança erro quando range excede OFFICIAL_JOURNALS_MAX_RANGE_DAYS', async () => {
    const getMock = jest.fn<Promise<HttpResponseLike>, [string, FetchWithRetryOptions]>();
    const client = makeClient(getMock);
    const uc = new OfficialJournalsMunicipalityUseCase(client);

    const input: FetchPublicationsInputDTO = {
      nome: 'KLAY',
      dataInicio: '01/01/2023',
      dataFim: '31/12/2024',
    };

    await expect(uc.execute(input)).rejects.toMatchObject({
      name: 'AppError',
      code: 'OFFICIAL_JOURNALS_DATE_RANGE_TOO_LARGE',
      statusCode: 400,
    });

    expect(getMock).not.toHaveBeenCalled();
  });

  it('chama client.get com URL e init esperados', async () => {
    const getMock = jest
      .fn<Promise<HttpResponseLike>, [string, FetchWithRetryOptions]>()
      .mockResolvedValueOnce(makeHttpResponse({ success: true, data: [] }));

    const client = makeClient(getMock);
    const uc = new OfficialJournalsMunicipalityUseCase(client);

    const input: FetchPublicationsInputDTO = {
      nome: 'KLAY',
      dataInicio: '01/01/2023',
      dataFim: '02/01/2023',
      retries: 3,
      delayMs: 1,
    };

    await uc.execute(input);

    expect(getMock).toHaveBeenCalledTimes(1);

    const [url, init] = getMock.mock.calls[0];

    expect(url).toContain('action=edicoes_json');
    expect(url).toContain('palavra=KLAY');
    expect(url).toContain('de=01%2F01%2F2023');
    expect(url).toContain('ate=02%2F01%2F2023');

    expect(init.method).toBe('GET');
    expect(init.retries).toBe(3);
    expect(init.delayMs).toBe(1);

    const headers = init.headers as Record<string, string>;
    expect(headers.accept).toBeTruthy();
    expect(headers['accept-language']).toBeTruthy();
    expect(headers['user-agent']).toBeTruthy();
    expect(headers.referer).toBeTruthy();
  });

  it('retorna "Nenhuma publicação encontrada" quando success=false e data=[]', async () => {
    const getMock = jest
      .fn<Promise<HttpResponseLike>, [string, FetchWithRetryOptions]>()
      .mockResolvedValueOnce(makeHttpResponse({ success: false, data: [] }));

    const client = makeClient(getMock);
    const uc = new OfficialJournalsMunicipalityUseCase(client);

    const input: FetchPublicationsInputDTO = {
      nome: 'KLAY',
      dataInicio: '01/01/2023',
      dataFim: '02/01/2023',
    };

    const out = await uc.execute(input);

    expect(out).toEqual({
      site: 'https://diogrande.campogrande.ms.gov.br/',
      mensagem: 'Nenhuma publicação encontrada.',
      conteudos: [],
    });
  });

  it('lança UPSTREAM_RESPONSE_ERROR quando success=false e data não é []', async () => {
    const getMock = jest
      .fn<Promise<HttpResponseLike>, [string, FetchWithRetryOptions]>()
      .mockResolvedValueOnce(
        makeHttpResponse({ success: false, data: { any: 'x' }, message: 'falhou' }),
      );

    const client = makeClient(getMock);
    const uc = new OfficialJournalsMunicipalityUseCase(client);

    const input: FetchPublicationsInputDTO = {
      nome: 'KLAY',
      dataInicio: '01/01/2023',
      dataFim: '02/01/2023',
    };

    await expect(uc.execute(input)).rejects.toMatchObject({
      name: 'AppError',
      statusCode: 502,
      code: 'UPSTREAM_RESPONSE_ERROR',
      message: 'falhou',
      data: expect.objectContaining({
        url: expect.any(String) as string,
        success: false,
      }),
    });
  });

  it('lança UPSTREAM_INVALID_JSON quando resposta não é JSON', async () => {
    const getMock = jest
      .fn<Promise<HttpResponseLike>, [string, FetchWithRetryOptions]>()
      .mockResolvedValueOnce(makeHttpResponse('NOT_JSON'));

    const client = makeClient(getMock);
    const uc = new OfficialJournalsMunicipalityUseCase(client);

    const input: FetchPublicationsInputDTO = {
      nome: 'KLAY',
      dataInicio: '01/01/2023',
      dataFim: '02/01/2023',
    };

    await expect(uc.execute(input)).rejects.toMatchObject({
      name: 'AppError',
      statusCode: 502,
      code: 'UPSTREAM_INVALID_JSON',
    });
  });

  it('mapeia itens válidos e ignora inválidos', async () => {
    const payload = {
      success: true,
      data: [
        {
          numero: '123',
          dia: '01/01/2023',
          arquivo: 'https://x.pdf',
          desctpd: 'desc',
          codigodia: 'abc',
        },
        { numero: 1 },
      ],
    };

    const getMock = jest
      .fn<Promise<HttpResponseLike>, [string, FetchWithRetryOptions]>()
      .mockResolvedValueOnce(makeHttpResponse(payload));

    const client = makeClient(getMock);
    const uc = new OfficialJournalsMunicipalityUseCase(client);

    const input: FetchPublicationsInputDTO = {
      nome: 'KLAY',
      dataInicio: '01/01/2023',
      dataFim: '02/01/2023',
    };

    const out = await uc.execute(input);

    expect(out.mensagem).toBe('Diários oficiais encontrados.');
    expect(out.conteudos).toEqual([
      {
        numero: '123',
        dia: '01/01/2023',
        arquivo: 'https://x.pdf',
        descricao: 'desc',
        codigoDia: 'abc',
      },
    ]);
  });
});
