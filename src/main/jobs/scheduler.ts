import cron from 'node-cron';
import { ExecuteScheduledTaskUseCase } from '@usecases/task-scheduler/execute-scheduled-task-use-case';
import { PrismaTaskLogRepository } from '@infrastructure/repositories/task-log-repository';
import { hasPassedLocalTime } from '@utils/date/date-time';
import { makeSendDailyEmailUseCase } from '@interfaces/http/factories/jobs/send-daily-email-factory';

const timeZone = 'America/Campo_Grande';
const TASK_NAME = 'my-task';

const sendDailyEmailUseCase = makeSendDailyEmailUseCase();

async function runDailyTask(): Promise<void> {
  await sendDailyEmailUseCase.execute();
}

const taskLogRepo = new PrismaTaskLogRepository();
const executeTaskUseCase = new ExecuteScheduledTaskUseCase(taskLogRepo, runDailyTask);

export function scheduleDailyTask(): void {
  cron.schedule(
    '0 0 8 * * *',
    async () => {
      console.log('[Cron] Rodando tarefa agendada (08:00 MS)');
      try {
        await executeTaskUseCase.execute(TASK_NAME);
      } catch (err: unknown) {
        console.error('[Cron] Erro ao executar a tarefa:', err);
      }
    },
    { name: TASK_NAME, timezone: timeZone, noOverlap: true },
  );

  if (hasPassedLocalTime(timeZone, 8, 0)) {
    console.log('[Cron] App iniciou após 08:00 MS, executando tarefa uma vez');
    void executeTaskUseCase
      .execute(TASK_NAME)
      .catch((err: unknown) => console.error('[Cron] Erro ao executar tarefa no startup:', err));
  }
}
