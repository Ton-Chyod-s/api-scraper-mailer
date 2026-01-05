import { UserListItem, FetchedDiaryItem } from '@domain/dtos/prepare-send-email/prepare-send-email';
import { OfficialJournalsStateUseCase } from '@usecases/official-journals/official-journals-state.use-case';
import { parseBrDateToUTC } from '@utils/date/date-time';

function isNotNull<T>(v: T | null): v is T {
  return v !== null;
}

export async function fetchStateForUser(args: {
  user: UserListItem;
  year: string;
  stateUseCase: OfficialJournalsStateUseCase;
}): Promise<FetchedDiaryItem[]> {
  const { user, year, stateUseCase } = args;

  const start = `01/01/${year}`;
  const end = `31/12/${year}`;

  const result = await stateUseCase.execute({
    nome: user.name,
    dataInicio: start,
    dataFim: end,
    retries: 2,
    delayMs: 150,
  });

  const contents = result?.conteudos ?? [];

  return contents
    .map((item): FetchedDiaryItem | null => {
      const dia = parseBrDateToUTC(item.dia);
      if (!dia) return null;

      return {
        numero: item.numero,
        dia,
        arquivo: item.arquivo,
        descricao: item.descricao ?? null,
        codigoDia: item.codigoDia ?? '',
      };
    })
    .filter(isNotNull);
}
