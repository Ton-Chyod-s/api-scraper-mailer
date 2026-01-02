import { IMailerService } from '@domain/services/mailer-service';
import type { IUserRepository } from '@domain/repositories/user-repository';
import type { TaskLogRepository } from '@domain/repositories/task-log-repository';
import { isSameZonedDay } from '@utils/date/date-time';

const TZ = 'America/Campo_Grande';

export class SendDailyEmailUseCase {
  constructor(
    private readonly mailer: IMailerService,
    private readonly userRepo: IUserRepository,
    private readonly taskLogRepo: TaskLogRepository,
  ) {}

  async execute(taskName: string): Promise<void> {
    const users = await this.userRepo.findAll();
    const now = new Date();

    if (users.length === 0) {
      console.log('[Cron] Nenhum usuário cadastrado, nada para enviar.');
      return;
    }

    const errors: Array<{ userId: string; email: string; err: unknown }> = [];

    for (const user of users) {
      try {
        const to = String(user.email ?? '').trim();
        if (!to) {
          throw new Error('E-mail do usuário vazio');
        }

        const lastExecutedAt = await this.taskLogRepo.getLastExecution(taskName, user.id);
        if (lastExecutedAt && isSameZonedDay(lastExecutedAt, now, TZ)) {
          continue;
        }

        console.log(`[Cron] Enviando e-mail para ${to} (userId=${user.id})`);
        await this.mailer.sendMail({
          to,
          subject: 'Minha tarefa diária',
          html: `<p>Olá, ${user.name}.</p><p>Rodou às 08:00 MS.</p>`,
        });

        await this.taskLogRepo.create(taskName, user.id, new Date());
        console.log(`[Cron] E-mail enviado e log registrado para ${to} (userId=${user.id})`);
      } catch (err: unknown) {
        errors.push({ userId: user.id, email: user.email, err });
        console.error(`[Cron] Falha ao enviar e-mail para ${user.email} (userId=${user.id})`, err);
      }
    }

    if (errors.length > 0) {
      console.error(`[Cron] ${errors.length} usuário(s) ficaram sem e-mail nesta rodada.`);
    }
  }
}
