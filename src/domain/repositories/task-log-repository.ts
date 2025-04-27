import { TaskLog } from "../entities/task-log";

export interface TaskLogRepository {
    getAllTaskNames(): Promise<string[]>;
    save(taskLog: TaskLog): Promise<void>;
}