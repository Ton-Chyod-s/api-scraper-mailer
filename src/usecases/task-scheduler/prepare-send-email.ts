import { IUserRepository } from '@domain/repositories/user-repository';
import { DiograndeHttpClient } from '@infrastructure/http/diogrande/diogrande.client';
import { PrismaUserRepository } from '@infrastructure/repositories/user-repositories';
import { OfficialJournalsMunicipalityUseCase } from '@usecases/official-journals/official-journals-municipality.use-case';
import { OfficialJournalsStateUseCase } from '@usecases/official-journals/official-journals-state.use-case';

export class PrepareSendEmailUseCase {
  constructor(
    private readonly officialJournalsMunicipalityUseCase: OfficialJournalsMunicipalityUseCase,
    private readonly officialJournalsStateUseCase: OfficialJournalsStateUseCase,
    private readonly userRepository: IUserRepository,
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

    const prepareAndSendEmailUseCase = new PrepareSendEmailUseCase(
      officialJournalsMunicipalityUseCase,
      officialJournalsStateUseCase,
      userRepository,
    );

    await prepareAndSendEmailUseCase.execute();
  })().catch((e) => console.error(e));
}
