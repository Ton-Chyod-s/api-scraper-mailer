import cron from 'node-cron';
import { executeScheduledTask } from './../config/usecases/execute-scheduled-task-factory';

export function scheduleDailyTask(): void {
  cron.schedule(
    '0 8 * * 1-7',
    async () => {
      console.log('[Agendado] Iniciando tarefa diária.');
      await executeScheduledTask('my-task');
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
