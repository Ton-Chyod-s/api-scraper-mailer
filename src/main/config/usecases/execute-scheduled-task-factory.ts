import { PrismaTaskLogRepository } from '../../../infrastructure/repositories/task-log/task-log-repository';
import { ExecuteScheduledTaskUseCase } from '../../../usecases/task-scheduler/execute-scheduled-task-use-case';
import { myTaskRunner } from '../../jobs/my-task';

const taskLogRepo = new PrismaTaskLogRepository();
const executeTaskUseCase = new ExecuteScheduledTaskUseCase(taskLogRepo, myTaskRunner);

export function executeScheduledTask(taskName: string): Promise<void> {
  return executeTaskUseCase.execute(taskName);
}
