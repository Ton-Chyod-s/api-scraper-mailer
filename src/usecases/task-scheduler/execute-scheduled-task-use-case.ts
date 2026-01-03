import { ITaskLogRepository } from '@domain/repositories/task-log-repository';

type TaskRunner = () => Promise<void> | void;

const TZ = 'America/Campo_Grande';

export class ExecuteScheduledTaskUseCase {
  constructor(
    private readonly ITaskLogRepository: ITaskLogRepository,
    private readonly taskRunner: TaskRunner,
  ) {}

  async execute(taskName: string): Promise<void> {
    await this.ITaskLogRepository.runOncePerDay(taskName, TZ, this.taskRunner);
  }
}
