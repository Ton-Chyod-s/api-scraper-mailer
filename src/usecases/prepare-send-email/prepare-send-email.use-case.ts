import {
  PrepareResult,
  PerUserEmailPayload,
} from '@domain/dtos/prepare-send-email/prepare-send-email';
import { IOfficialJournalMunicipalityRepository } from '@domain/repositories/official-journal-municipality-repository';
import { IUserRepository } from '@domain/repositories/user-repository';
import { OfficialJournalsMunicipalityUseCase } from '@usecases/official-journals/official-journals-municipality.use-case';
import { OfficialJournalsStateUseCase } from '@usecases/official-journals/official-journals-state.use-case';

import { buildContext } from './build-context';
import { mapWithConcurrency } from './concurrency';
import { fetchMunicipalityForUser } from './fetch-municipality-for-user';
import { fetchStateForUser } from './fetch-state-for-user';
import { formatEmailBodyForUser, buildEmailHtml } from './email-template';
import { DiograndeHttpClient } from '@infrastructure/http/diogrande/diogrande.client';
import { PrismaUserRepository } from '@infrastructure/repositories/user-repositories';
import { PrismaOfficialJournalMunicipalityRepository } from '@infrastructure/repositories/official-journal-municipality-repository';

export class PrepareSendEmailUseCase {
  constructor(
    private readonly municipalityUseCase: OfficialJournalsMunicipalityUseCase,
    private readonly stateUseCase: OfficialJournalsStateUseCase,
    private readonly userRepository: IUserRepository,
    private readonly municipalityRepository: IOfficialJournalMunicipalityRepository,
  ) {}

  async execute(): Promise<PrepareResult & { emails?: PerUserEmailPayload[] }> {
    const ctx = await buildContext(this.userRepository);

    if (!ctx.ok) {
      return { diaAlvoStr: ctx.diaAlvoStr, anoVigente: ctx.anoVigente, results: [], emails: [] };
    }

    const {
      users,
      diaAlvoStr: targetDayStr,
      diaAlvoDate: targetDayDate,
      inicioAnoDate: yearStartDate,
      fimAnoDate: yearEndDate,
      anoVigente: currentYear,
    } = ctx;

    const CONCURRENCY = 5;

    const emails = await mapWithConcurrency(users, CONCURRENCY, async (user) => {
      const [municipal, stateFetched] = await Promise.all([
        fetchMunicipalityForUser({
          user,
          targetDayStr,
          targetDayDate,
          yearStartDate,
          yearEndDate,
          municipalityRepository: this.municipalityRepository,
          municipalityUseCase: this.municipalityUseCase,
        }),
        fetchStateForUser({
          user,
          year: currentYear,
          stateUseCase: this.stateUseCase,
        }),
      ]);

      const mainHtml = formatEmailBodyForUser({
        user,
        municipal: municipal.fetched,
        state: stateFetched,
        targetDayStr,
        year: currentYear,
      });

      const html = buildEmailHtml(mainHtml);

      return {
        user,
        diaAlvoStr: targetDayStr,
        anoVigente: currentYear,
        municipal,
        estadual: { fetched: stateFetched },
        html,
      };
    });

    return { diaAlvoStr: targetDayStr, anoVigente: currentYear, results: [], emails };
  }
}

if (require.main === module) {
  (async () => {
    const client = new DiograndeHttpClient();

    const municipalityUseCase = new OfficialJournalsMunicipalityUseCase(client);
    const stateUseCase = new OfficialJournalsStateUseCase();

    const userRepository: IUserRepository = new PrismaUserRepository();
    const municipalityRepository: IOfficialJournalMunicipalityRepository =
      new PrismaOfficialJournalMunicipalityRepository();

    const useCase = new PrepareSendEmailUseCase(
      municipalityUseCase,
      stateUseCase,
      userRepository,
      municipalityRepository,
    );

    await useCase.execute();
  })().catch((e) => console.error(e));
}
