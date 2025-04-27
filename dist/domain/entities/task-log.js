"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskLog = void 0;
class TaskLog {
    constructor(task_name) {
        this.task_name = task_name;
        if (!task_name)
            throw new Error('nome da task inválido');
    }
}
exports.TaskLog = TaskLog;
