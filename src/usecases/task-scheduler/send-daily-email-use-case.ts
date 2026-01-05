import { IMailerService } from '@domain/services/mailer-service';
import type { IUserRepository } from '@domain/repositories/user-repository';
import type { ITaskLogRepository } from '@domain/repositories/task-log-repository';
import { isSameZonedDay } from '@utils/date/date-time';
import { PrepareSendEmailUseCase } from '@usecases/prepare-send-email/prepare-send-email.use-case';

const TZ = 'America/Campo_Grande';

export class SendDailyEmailUseCase {
  constructor(
    private readonly mailer: IMailerService,
    private readonly userRepo: IUserRepository,
    private readonly taskLogRepo: ITaskLogRepository,
    private readonly prepareSendEmailUseCase: PrepareSendEmailUseCase,
  ) {}

  async execute(taskName: string): Promise<void> {
    const users = await this.userRepo.findAll();
    const now = new Date();

    if (users.length === 0) {
      console.log('[Cron] Nenhum usuário cadastrado, nada para enviar.');
      return;
    }

    const eligibleUserIds = new Set<string>();
    const errors: Array<{ userId: string; email: string; err: unknown }> = [];

    for (const user of users) {
      const to = String(user.email ?? '').trim();
      if (!to) {
        errors.push({
          userId: user.id,
          email: String(user.email ?? ''),
          err: new Error('Empty email'),
        });
        continue;
      }

      const lastExecutedAt = await this.taskLogRepo.getLastExecution(taskName, user.id);
      if (!lastExecutedAt || !isSameZonedDay(lastExecutedAt, now, TZ)) {
        eligibleUserIds.add(user.id);
      }
    }

    if (eligibleUserIds.size === 0) {
      console.log('[Cron] Todos os usuários já receberam hoje. Nada para fazer.');
      return;
    }

    const result = await this.prepareSendEmailUseCase.execute();
    const emails = result.emails ?? [];

    for (const payload of emails) {
      const userId = payload.user.id;
      if (!eligibleUserIds.has(userId)) continue;

      const to = String(payload.user.email ?? '').trim();
      if (!to) {
        errors.push({
          userId,
          email: String(payload.user.email ?? ''),
          err: new Error('Empty email'),
        });
        continue;
      }

      try {
        console.log(`[Cron] Enviando e-mail para ${to} (userId=${userId})`);

        await this.mailer.sendMail({
          to,
          subject: 'Minha tarefa diária',
          html: payload.html,
        });

        await this.taskLogRepo.create(taskName, userId, now);
        console.log(`[Cron] E-mail enviado e log registrado para ${to} (userId=${userId})`);
      } catch (err: unknown) {
        errors.push({ userId, email: to, err });
        console.error(`[Cron] Falha ao enviar e-mail para ${to} (userId=${userId})`, err);
      }
    }

    if (errors.length > 0) {
      console.error(`[Cron] ${errors.length} erro(s) nesta rodada.`);
    }
  }
}
