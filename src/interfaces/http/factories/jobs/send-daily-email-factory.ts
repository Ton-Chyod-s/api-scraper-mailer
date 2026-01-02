import { env } from '@config/env';
import { NodemailerService } from '@infrastructure/services/node-mailer-service';
import { ConsoleMailerService } from '@infrastructure/services/console-mailer-service';
import { SendDailyEmailUseCase } from '@usecases/task-scheduler/send-daily-email-use-case';

export function makeSendDailyEmailUseCase() {
  const hasSmtp = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);
  const mailer = hasSmtp ? new NodemailerService() : new ConsoleMailerService();

  return new SendDailyEmailUseCase(mailer);
}
