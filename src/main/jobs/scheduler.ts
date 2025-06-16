import cron from 'node-cron';
import { executeScheduledTask } from '@main/config/usecases/execute-scheduled-task-factory';
import { toZonedTime } from 'date-fns-tz';

const timeZone = 'America/Campo_Grande';

export function scheduleDailyTask(): void {
  cron.schedule(
    '0 8 * * *',
    async () => {
      console.log('[Cron] Rodando tarefa agendada (8h MS)');
      try {
        await executeScheduledTask('my-task');
      } catch (err) {
        console.error('[Cron] Erro ao executar a tarefa:', err);
      }
    },
    {
      scheduled: true,
      timezone: timeZone,
    }
  );

  const now = new Date();
  const nowInCampoGrande = toZonedTime(now, timeZone);
  const scheduledTime = new Date(nowInCampoGrande);
  scheduledTime.setHours(8, 0, 0, 0);

  if (now > scheduledTime) {
    executeScheduledTask('my-task');
  }
}
