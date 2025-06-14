import cron from 'node-cron';
import { executeScheduledTask } from './../config/usecases/execute-scheduled-task-factory';

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
      timezone: 'America/Campo_Grande',
    }
  );

  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(8, 0, 0, 0);

  if (now > scheduledTime) {
    console.log('[Fallback] Executando tarefa perdida...');
    executeScheduledTask('my-task');
  }
}
