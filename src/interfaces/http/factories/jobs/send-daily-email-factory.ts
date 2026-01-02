import { env } from '@config/env';
import { NodemailerService } from '@infrastructure/services/node-mailer-service';
import { ConsoleMailerService } from '@infrastructure/services/console-mailer-service';
import { PrismaUserRepository } from '@infrastructure/repositories/user-repositories';
import { PrismaTaskLogRepository } from '@infrastructure/repositories/task-log-repository';
import { SendDailyEmailUseCase } from '@usecases/task-scheduler/send-daily-email-use-case';

export function makeSendDailyEmailUseCase() {
  const hasSmtp = Boolean(env.SMTP_HOST);
  const mailer = hasSmtp ? new NodemailerService() : new ConsoleMailerService();

  const userRepo = new PrismaUserRepository();
  const taskLogRepo = new PrismaTaskLogRepository();

  return new SendDailyEmailUseCase(mailer, userRepo, taskLogRepo);
}
