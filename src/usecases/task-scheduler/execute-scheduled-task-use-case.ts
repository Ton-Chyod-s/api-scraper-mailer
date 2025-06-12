import { TaskLogRepository } from '../../domain/repositories/task-log-repository';
import { parseExecutedAt } from '../../infrastructure/utils/date/date-helper';

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
      console.warn('Primeira execução.');
      await this.taskLogRepository.create(taskName);
      this.taskRunner();
      return;
    }

    const [, executedAtString] = lastTaskLogEntry.split(' - ');
    const lastExecutedAt = parseExecutedAt(executedAtString);

    const sameDay =
      lastExecutedAt.getDate() === now.getDate() &&
      lastExecutedAt.getMonth() === now.getMonth() &&
      lastExecutedAt.getFullYear() === now.getFullYear();

    if (sameDay) {
      console.log('Tarefa já executada hoje.');
      return;
    }

    console.log('Executando tarefa agendada...');
    await this.taskLogRepository.create(taskName);
    this.taskRunner();
  }
}

