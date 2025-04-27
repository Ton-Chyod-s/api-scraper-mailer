"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTaskLogUseCase = void 0;
const task_log_1 = require("../../domain/entities/task-log");
class CreateTaskLogUseCase {
    constructor(taskLogRepo) {
        this.taskLogRepo = taskLogRepo;
    }
    async execute(task_log) {
        const taskLog = new task_log_1.TaskLog(task_log);
        await this.taskLogRepo.save(taskLog);
    }
}
exports.CreateTaskLogUseCase = CreateTaskLogUseCase;
