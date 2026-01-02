import cron from 'node-cron';
import { hasPassedLocalTime } from '@utils/date/date-time';
import { makeSendDailyEmailUseCase } from '@interfaces/http/factories/jobs/send-daily-email-factory';

const timeZone = 'America/Campo_Grande';
const TASK_NAME = 'my-task';

const sendDailyEmailUseCase = makeSendDailyEmailUseCase();

let isRunning = false;

async function runTaskSafely(label: string): Promise<void> {
  if (isRunning) {
    console.warn('[Cron] Execução anterior ainda em andamento. Pulando esta rodada.');
    return;
  }

  isRunning = true;
  try {
    console.log(`[Cron] Rodando tarefa agendada (${label})`);
    await sendDailyEmailUseCase.execute(TASK_NAME);
  } catch (err: unknown) {
    console.error('[Cron] Erro ao executar a tarefa:', err);
  } finally {
    isRunning = false;
  }
}

let isScheduled = false;

export function scheduleDailyTask(): void {
  if (isScheduled) return;
  isScheduled = true;

  cron.schedule('0 */15 8-23 * * *', async () => runTaskSafely('a cada 15min (08:00-23:00 MS)'), {
    timezone: timeZone,
  });

  if (hasPassedLocalTime(timeZone, 8, 0)) {
    void runTaskSafely('startup (após 08:00 MS)');
  }
}
