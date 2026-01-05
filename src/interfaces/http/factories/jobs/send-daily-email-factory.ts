import { env } from '@config/env';

import { DiograndeHttpClient } from '@infrastructure/http/diogrande/diogrande.client';
import { NodemailerService } from '@infrastructure/services/node-mailer-service';
import { ConsoleMailerService } from '@infrastructure/services/console-mailer-service';

import { PrismaUserRepository } from '@infrastructure/repositories/user-repositories';
import { PrismaITaskLogRepository } from '@infrastructure/repositories/task-log-repository';
import { PrismaOfficialJournalMunicipalityRepository } from '@infrastructure/repositories/official-journal-municipality-repository';

import { OfficialJournalsMunicipalityUseCase } from '@usecases/official-journals/official-journals-municipality.use-case';
import { OfficialJournalsStateUseCase } from '@usecases/official-journals/official-journals-state.use-case';

import { PrepareSendEmailUseCase } from '@usecases/prepare-send-email/prepare-send-email.use-case';
import { SendDailyEmailUseCase } from '@usecases/task-scheduler/send-daily-email-use-case';

export function makeSendDailyEmailUseCase() {
  const hasSmtp = Boolean(env.SMTP_HOST);
  const mailer = hasSmtp ? new NodemailerService() : new ConsoleMailerService();

  const userRepository = new PrismaUserRepository();
  const taskLogRepository = new PrismaITaskLogRepository();
  const officialJournalMunicipalityRepository = new PrismaOfficialJournalMunicipalityRepository();

  const diograndeClient = new DiograndeHttpClient();

  const officialJournalsMunicipalityUseCase = new OfficialJournalsMunicipalityUseCase(
    diograndeClient,
  );

  const officialJournalsStateUseCase = new OfficialJournalsStateUseCase();

  const prepareSendEmailUseCase = new PrepareSendEmailUseCase(
    officialJournalsMunicipalityUseCase,
    officialJournalsStateUseCase,
    userRepository,
    officialJournalMunicipalityRepository,
  );

  return new SendDailyEmailUseCase(
    mailer,
    userRepository,
    taskLogRepository,
    prepareSendEmailUseCase,
  );
}
