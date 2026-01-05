import { BuildOfficialJournalContext, FetchedDiaryItem, PerUserResult, PrepareResult, UserListItem } from '@domain/dtos/task-scheduler/prepare-send-email';
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

  async execute(): Promise<PrepareResult> {
    const ctx = await this.buildOfficialJournalContext();

    if (!ctx.ok) {
      return { diaAlvoStr: ctx.diaAlvoStr, anoVigente: ctx.anoVigente, results: [] };
    }

    const { users, diaAlvoStr, diaAlvoDate, inicioAnoDate, fimAnoDate, anoVigente } = ctx;

    const results = await this.dateOfficialJournalMunicipality(
      users,
      diaAlvoStr,
      diaAlvoDate,
      inicioAnoDate,
      fimAnoDate,
    );

    return { diaAlvoStr, anoVigente, results };


    
  }

  private async buildOfficialJournalContext(): Promise<BuildOfficialJournalContext> {
    const users = (await this.userRepository.findAll()) as UserListItem[];
    if (users.length === 0) {
      const reason = 'Nenhum usuário encontrado para enviar email.';
      console.log(reason);
      return { ok: false, reason, users: [], diaAlvoStr: '', anoVigente: '' };
    }

    const diaAlvoStr = new Date().toLocaleDateString('pt-BR', {
      timeZone: 'America/Campo_Grande',
    });

    const diaAlvoDate = parseBrDateToUTC(diaAlvoStr);
    if (!diaAlvoDate) {
      const reason = 'Dia alvo inválido';
      console.log(reason + ':', diaAlvoStr);
      return { ok: false, reason, users, diaAlvoStr, anoVigente: '' };
    }

    const anoVigente = diaAlvoStr.split('/')[2] ?? '';
    if (!anoVigente) {
      const reason = 'Ano vigente inválido a partir de diaAlvoStr';
      console.log(reason + ':', diaAlvoStr);
      return { ok: false, reason, users, diaAlvoStr, anoVigente: '' };
    }

    const inicioAnoStr = `01/01/${anoVigente}`;
    const fimAnoStr = `31/12/${anoVigente}`;

    const inicioAnoDate = parseBrDateToUTC(inicioAnoStr);
    const fimAnoDate = parseBrDateToUTC(fimAnoStr);

    if (!inicioAnoDate || !fimAnoDate) {
      const reason = 'Intervalo do ano inválido';
      console.log(reason + ':', { inicioAnoStr, fimAnoStr });
      return { ok: false, reason, users, diaAlvoStr, anoVigente };
    }

    return {
      ok: true,
      users,
      diaAlvoStr,
      diaAlvoDate,
      anoVigente,
      inicioAnoDate,
      fimAnoDate,
    };
  }

  private async dateOfficialJournalMunicipality(
    users: UserListItem[],
    diaAlvoStr: string,
    diaAlvoDate: Date,
    inicioAnoDate: Date,
    fimAnoDate: Date,
  ): Promise<PerUserResult[]> {
    const out: PerUserResult[] = [];

    for (const user of users) {
      try {
        let fetched: FetchedDiaryItem[] = [];
        let inserted = 0;

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
            fetched = conteudos.map((item) => ({
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

            inserted = await this.officialJournalMunicipalityRepository.createMany(rows);

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

        const fromDbYear = await this.officialJournalMunicipalityRepository.findAllByUserIdInRange(
          user.id,
          inicioAnoDate,
          fimAnoDate,
        );

        out.push({ user, fetched, inserted, fromDbYear });
      } catch (e) {
        console.error('Erro ao processar user:', user.email, e);
        out.push({ user, fetched: [], inserted: 0, fromDbYear: [] });
      }
    }

    return out;
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
