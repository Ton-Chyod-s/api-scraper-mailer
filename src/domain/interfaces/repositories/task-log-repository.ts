import { TaskLog } from "@domain/entities/task-log";

export interface TaskLogRepository {
    getAllTaskNames(): Promise<string[]>;
    getLastTaskLog(): Promise<string | null>;
    save(taskLog: TaskLog): Promise<void>;
    create(taskName: string): Promise<void>;
}