export interface ITaskLogRepository {
  getLastExecution(taskName: string, userId?: string): Promise<Date | null>;

  create(taskName: string, userId?: string, executedAt?: Date): Promise<void>;

  runOncePerDay(
    taskName: string,
    timeZone: string,
    taskRunner: () => Promise<void> | void,
    executedAt?: Date,
  ): Promise<boolean>;
}
