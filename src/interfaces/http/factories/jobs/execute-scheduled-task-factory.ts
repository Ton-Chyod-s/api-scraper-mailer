import { PrismaTaskLogRepository } from '@infrastructure/repositories/task-log-repository';
import { ExecuteScheduledTaskUseCase } from '@usecases/task-scheduler/execute-scheduled-task-use-case';

export function buildExecuteScheduledTask(taskRunner: () => Promise<void> | void) {
  const taskLogRepo = new PrismaTaskLogRepository();
  const executeTaskUseCase = new ExecuteScheduledTaskUseCase(taskLogRepo, taskRunner);

  return (taskName: string): Promise<void> => executeTaskUseCase.execute(taskName);
}
