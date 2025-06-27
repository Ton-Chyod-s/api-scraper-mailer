import { PrismaTaskLogRepository } from '@infra/repositories/task-log/task-log-repository';
import { ExecuteScheduledTaskUseCase } from '@usecases/task-scheduler/execute-scheduled-task-use-case';
import { sendEmailJobUseCase } from '@usecases/email/send-email-job-use-case';


const taskLogRepo = new PrismaTaskLogRepository();
const executeTaskUseCase = new ExecuteScheduledTaskUseCase(taskLogRepo, sendEmailJobUseCase);

export function executeScheduledTask(taskName: string): Promise<void> {
  return executeTaskUseCase.execute(taskName);
}
