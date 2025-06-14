import { TaskLog } from "../../domain/entities/task-log";
import { TaskLogRepository } from "../../domain/interfaces/repositories/task-log-repository";

export class CreateTaskLogUseCase {
    constructor(private taskLogRepo: TaskLogRepository) {}

    async execute(task_log: string) {
        const taskLog = new TaskLog(task_log);
        
        await this.taskLogRepo.save(taskLog);
    }
}
  
