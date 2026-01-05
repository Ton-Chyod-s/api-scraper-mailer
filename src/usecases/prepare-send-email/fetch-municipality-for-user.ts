import {
  UserListItem,
  FetchedDiaryItem,
  MunicipalityFetchResult,
} from '@domain/dtos/prepare-send-email/prepare-send-email';
import { IOfficialJournalMunicipalityRepository } from '@domain/repositories/official-journal-municipality-repository';
import { OfficialJournalsMunicipalityUseCase } from '@usecases/official-journals/official-journals-municipality.use-case';
import { isSameUtcDay, parseIsoDateToUTC } from '@utils/date/date-time';
import { OfficialJournalMunicipality } from '@prisma/client';

export async function fetchMunicipalityForUser(args: {
  user: UserListItem;
  targetDayStr: string;
  targetDayDate: Date;
  yearStartDate: Date;
  yearEndDate: Date;
  municipalityRepository: IOfficialJournalMunicipalityRepository;
  municipalityUseCase: OfficialJournalsMunicipalityUseCase;
}): Promise<MunicipalityFetchResult> {
  const {
    user,
    targetDayStr,
    targetDayDate,
    yearStartDate,
    yearEndDate,
    municipalityRepository,
    municipalityUseCase,
  } = args;

  let fetched: FetchedDiaryItem[] = [];
  let inserted = 0;

  const alreadyInDb = await municipalityRepository.existsForUserOnDay(user.id, targetDayDate);

  if (!alreadyInDb) {
    const result = await municipalityUseCase.execute({
      nome: user.name,
      dataInicio: targetDayStr,
      dataFim: targetDayStr,
      retries: 2,
      delayMs: 150,
    });

    const contents = result?.conteudos ?? [];

    if (contents.length > 0) {
      fetched = contents.map((item) => ({
        numero: item.numero,
        dia: parseIsoDateToUTC(item.dia),
        arquivo: item.arquivo,
        descricao: item.descricao ?? null,
        codigoDia: item.codigoDia,
      }));

      const rows = fetched.map((item) => ({
        user_id: user.id,
        numero: item.numero,
        dia: item.dia,
        arquivo: item.arquivo,
        descricao: item.descricao,
        codigo_dia: item.codigoDia,
        source_site: 'diogrande',
        fetched_at: new Date(),
      }));

      inserted = await municipalityRepository.createMany(rows);
      console.log('User:', user.email, 'Inserted new:', inserted, 'Day:', targetDayStr);
    } else {
      console.log('User:', user.email, 'No content on day', targetDayStr);
    }
  } else {
    console.log('User:', user.email, 'Already in DB for day', targetDayStr, '(skipping fetch)');
  }

  const fromDbYear = (await municipalityRepository.findAllByUserIdInRange(
    user.id,
    yearStartDate,
    yearEndDate,
  )) as OfficialJournalMunicipality[];

  if (alreadyInDb) {
    fetched = (fromDbYear ?? [])
      .filter((row) => row.dia && isSameUtcDay(row.dia, targetDayDate))
      .map((row) => ({
        numero: row.numero,
        dia: row.dia,
        arquivo: row.arquivo,
        descricao: row.descricao ?? null,
        codigoDia: row.codigoDia ?? '',
      }));
  }

  return { fetched, inserted, fromDbYear };
}
