import { TaskLogRepository } from '@domain/repositories/task-log-repository';

type TaskRunner = () => Promise<void> | void;

const TZ = 'America/Campo_Grande';

export class ExecuteScheduledTaskUseCase {
  constructor(
    private readonly taskLogRepository: TaskLogRepository,
    private readonly taskRunner: TaskRunner,
  ) {}

  async execute(taskName: string): Promise<void> {
    await this.taskLogRepository.runOncePerDay(taskName, TZ, this.taskRunner);
  }
}
