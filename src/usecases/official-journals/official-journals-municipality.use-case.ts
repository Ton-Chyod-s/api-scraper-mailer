import { AppError } from '@utils/app-error';
import { FetchWithRetryOptions } from '@utils/fetch-with-retry';
import {
  FetchPublicationsInputDTO,
  SiteDataDTO,
} from '@domain/dtos/official-journals/search-official-journals.dto';
import { diograndeConfig } from '@infrastructure/http/diogrande/diogrande.config';
import { DiograndeHttpClient } from '@infrastructure/http/diogrande/diogrande.client';

type OfficialJournalsMunicipalityItem = {
  numero: string;
  dia: string;
  arquivo: string;
  desctpd: string;
  codigodia: string;
};

type AjaxPayload = {
  success?: boolean;
  data?: OfficialJournalsMunicipalityItem[];
};

export class OfficialJournalsMunicipalityUseCase {
  constructor(private readonly client = new DiograndeHttpClient()) {}

  async execute(input: FetchPublicationsInputDTO): Promise<SiteDataDTO> {
    validateInput(input);

    const url = buildUrl(input);
    const init = buildFetchInit(input);

    const res = await this.client.get(url, init);

    const text = await res.text();
    const payload = parseJsonOrThrow<AjaxPayload>(text, url);

    const items = Array.isArray(payload.data) ? payload.data : [];
    return toSiteDataDTO(items);
  }
}



function buildUrl(input: FetchPublicationsInputDTO): string {
  const params = new URLSearchParams({
    action: 'edicoes_json',
    palavra: input.nome,
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

function toSiteDataDTO(items: OfficialJournalsMunicipalityItem[]): SiteDataDTO {
  if (!items.length) {
    return {
      site: 'https://diogrande.campogrande.ms.gov.br/',
      mensagem: 'Nenhuma publicação encontrada.',
      conteudos: {},
    };
  }

  const conteudos: Record<string, string> = {};
  items.forEach((item, index) => {
    conteudos[String(index)] = `${item.desctpd} - ${item.dia} - ${item.arquivo}`;
  });

  return {
    site: 'https://diogrande.campogrande.ms.gov.br/',
    mensagem: 'Diários oficiais encontrados.',
    conteudos,
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
