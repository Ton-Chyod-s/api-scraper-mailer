import { IOfficialJournalMunicipalityRepository } from '@domain/repositories/official-journal-municipality-repository';
import { IUserRepository } from '@domain/repositories/user-repository';
import { DiograndeHttpClient } from '@infrastructure/http/diogrande/diogrande.client';
import { PrismaOfficialJournalMunicipalityRepository } from '@infrastructure/repositories/official-journal-municipality-repository';
import { PrismaUserRepository } from '@infrastructure/repositories/user-repositories';
import { OfficialJournalsMunicipalityUseCase } from '@usecases/official-journals/official-journals-municipality.use-case';
import { OfficialJournalsStateUseCase } from '@usecases/official-journals/official-journals-state.use-case';
import { parseBrDateToUTC, parseIsoDateToUTC } from '@utils/date/date-time';

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

    const diaAlvoStr = new Date().toLocaleDateString('pt-BR', {
      timeZone: 'America/Campo_Grande',
    });

    const diaAlvoDate = parseBrDateToUTC(diaAlvoStr);
    if (!diaAlvoDate) {
      console.log('Dia alvo inválido:', diaAlvoStr);
      return;
    }

    const anoVigente = diaAlvoStr.split('/')[2];
    const inicioAnoStr = `01/01/${anoVigente}`;
    const fimAnoStr = `31/12/${anoVigente}`;

    const inicioAnoDate = parseBrDateToUTC(inicioAnoStr);
    const fimAnoDate = parseBrDateToUTC(fimAnoStr);

    if (!inicioAnoDate || !fimAnoDate) {
      console.log('Intervalo do ano inválido:', { inicioAnoStr, fimAnoStr });
      return;
    }

    for (const user of users) {
      try {
        const jaTemNoBanco = await this.officialJournalMunicipalityRepository.existsForUserOnDay(
          user.id,
          diaAlvoDate,
        );

        if (!jaTemNoBanco) {
          const resultOjM = await this.officialJournalsMunicipalityUseCase.execute({
            nome: user.name,
            dataInicio: diaAlvoStr,
            dataFim: diaAlvoStr,
            retries: 2,
            delayMs: 150,
          });

          const conteudos = resultOjM?.conteudos ?? [];
          if (conteudos.length > 0) {
            const rows = conteudos.map((item) => ({
              user_id: user.id,
              numero: item.numero,
              dia: parseIsoDateToUTC(item.dia),
              arquivo: item.arquivo,
              descricao: item.descricao ?? null,
              codigo_dia: item.codigoDia,
              source_site: 'diogrande',
              fetched_at: new Date(),
            }));

            const inserted = await this.officialJournalMunicipalityRepository.createMany(rows);
            console.log('User:', user.email, 'Inseridos novos:', inserted, 'Dia:', diaAlvoStr);
          } else {
            console.log('User:', user.email, 'Sem conteúdos no dia', diaAlvoStr);
          }
        } else {
          console.log(
            'User:',
            user.email,
            'Já tem dados no banco para o dia',
            diaAlvoStr,
            '(pulando fetch)',
          );
        }

        const historicoAno =
          await this.officialJournalMunicipalityRepository.findAllByUserIdInRange(
            user.id,
            inicioAnoDate,
            fimAnoDate,
          );

        console.log('User:', user.email, 'Total no banco (ano vigente):', historicoAno.length);
      } catch (e) {
        console.error('Erro ao processar user:', user.email, e);
      }
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
