import { IOfficialJournalMunicipalityRepository } from '@domain/repositories/official-journal-municipality-repository';
import { IUserRepository } from '@domain/repositories/user-repository';
import { DiograndeHttpClient } from '@infrastructure/http/diogrande/diogrande.client';
import { PrismaOfficialJournalMunicipalityRepository } from '@infrastructure/repositories/official-journal-municipality-repository';
import { PrismaUserRepository } from '@infrastructure/repositories/user-repositories';
import { OfficialJournalsMunicipalityUseCase } from '@usecases/official-journals/official-journals-municipality.use-case';
import { OfficialJournalsStateUseCase } from '@usecases/official-journals/official-journals-state.use-case';
import { parseIsoDateToUTC } from '@utils/date/date-time';

export class PrepareSendEmailUseCase {
  constructor(
    private readonly officialJournalsMunicipalityUseCase: OfficialJournalsMunicipalityUseCase,
    private readonly officialJournalsStateUseCase: OfficialJournalsStateUseCase,
    private readonly userRepository: IUserRepository,
    private readonly officialJournalMunicipalityRepository: IOfficialJournalMunicipalityRepository,
  ) {}

  async execute(): Promise<void> {
    const users = await this.userRepository.findAll();

    if (users.length === 0) {
      console.log('Nenhum usuário encontrado para enviar email.');
      return;
    }

    for (const user of users) {
      const resultOjM = await this.officialJournalsMunicipalityUseCase.execute({
        nome: user.name,
        dataInicio: '01/01/2021',
        dataFim: '31/12/2021',
        retries: 2,
        delayMs: 150,
      });

      if (!resultOjM?.conteudos?.length) {
        console.log('User:', user.email, 'Sem conteudos para salvar.');
        continue;
      }

      for (const item of resultOjM.conteudos) {
        await this.officialJournalMunicipalityRepository.create({
          user_id: user.id,
          numero: item.numero,
          dia: parseIsoDateToUTC(item.dia),
          arquivo: item.arquivo,
          descricao: item.descricao ?? null,
          codigo_dia: item.codigoDia,
          source_site: 'diogrande',
          fetched_at: new Date(),
        });
      }

      console.log('User:', user.email, 'Result:', resultOjM);
    }
  }
}

if (require.main === module) {
  (async () => {
    const client = new DiograndeHttpClient();

    const officialJournalsMunicipalityUseCase = new OfficialJournalsMunicipalityUseCase(client);

    const officialJournalsStateUseCase = new OfficialJournalsStateUseCase();

    const userRepository: IUserRepository = new PrismaUserRepository();
    const officialJournalMunicipalityRepository: IOfficialJournalMunicipalityRepository =
      new PrismaOfficialJournalMunicipalityRepository();

    const prepareAndSendEmailUseCase = new PrepareSendEmailUseCase(
      officialJournalsMunicipalityUseCase,
      officialJournalsStateUseCase,
      userRepository,
      officialJournalMunicipalityRepository,
    );

    await prepareAndSendEmailUseCase.execute();
  })().catch((e) => console.error(e));
}
