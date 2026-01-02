import { TaskLogRepository } from '@domain/repositories/task-log-repository';
import { isSameZonedDay } from '@utils/date/date-time';

type TaskRunner = () => Promise<void> | void;

const TZ = 'America/Campo_Grande';

export class ExecuteScheduledTaskUseCase {
  constructor(
    private readonly taskLogRepository: TaskLogRepository,
    private readonly taskRunner: TaskRunner,
  ) {}

  async execute(taskName: string): Promise<void> {
    const now = new Date();

    const lastExecutedAt = await this.taskLogRepository.getLastExecution(taskName);

    if (lastExecutedAt && isSameZonedDay(lastExecutedAt, now, TZ)) {
      console.log('[Cron] Tarefa já executada hoje. Próxima execução: 08:00 de amanhã.');
      return;
    }

    if (!lastExecutedAt) {
      console.warn('[Cron] Primeira execução desta tarefa.');
    }

    await this.runTask(taskName, now);
  }

  private async runTask(taskName: string, executedAt: Date) {
    console.log('[Cron] Executando tarefa agendada...');
    await Promise.resolve(this.taskRunner());
    await this.taskLogRepository.create(taskName, executedAt);
  }
}
