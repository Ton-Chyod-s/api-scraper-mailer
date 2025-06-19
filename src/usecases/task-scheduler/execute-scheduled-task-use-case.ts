import { TaskLogRepository } from '@domain/interfaces/repositories/task-log-repository';
import { parseExecutedAt } from '@utils/date/date-helper';

type TaskRunner = () => void;

export class ExecuteScheduledTaskUseCase {
  constructor(
    private readonly taskLogRepository: TaskLogRepository,
    private readonly taskRunner: TaskRunner
  ) {}

  async execute(taskName: string): Promise<void> {
    const now = new Date();
    const taskNames = await this.taskLogRepository.getAllTaskNames();
    const lastTaskLogEntry = taskNames.at(-1) ?? '';

    if (!lastTaskLogEntry) {
      console.warn('[Cron] Primeira execução.');
      this.taskRunner();
      await this.taskLogRepository.create(taskName);
      return;
    }

    const [, executedAtString] = lastTaskLogEntry.split(' - ');
    const lastExecutedAt = parseExecutedAt(executedAtString);

    const sameDay =
      lastExecutedAt.getDate() === now.getDate() &&
      lastExecutedAt.getMonth() === now.getMonth() &&
      lastExecutedAt.getFullYear() === now.getFullYear();

    if (sameDay) {
      console.log(`[Cron] Tarefa executada hoje. Nova execução agendada para as 8h de amanhã.`);
      return;
    }

    console.log('Executando tarefa agendada...');
    this.taskRunner();
    await this.taskLogRepository.create(taskName);
  }
}

