export interface TaskLogRepository {
  getLastExecution(taskName: string): Promise<Date | null>;

  create(taskName: string, executedAt?: Date): Promise<void>;
}
