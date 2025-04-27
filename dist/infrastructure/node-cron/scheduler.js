"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const my_task_1 = require("../../main/jobs/my-task");
const create_use_case_1 = require("../../usecases/task-log/create-use-case");
const task_log_repository_1 = require("../repositories/task-log/task-log-repository");
const taskLogRepository = new task_log_repository_1.PrismaTaskLogRepository();
const createTaskLogUseCase = new create_use_case_1.CreateTaskLogUseCase(taskLogRepository);
function scheduleTask() {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(8, 0, 0, 0);
    taskLogRepository.getAllTaskNames().then((taskNames) => {
        if (taskNames.includes('my-task') && now.getDate() === scheduledTime.getDate()) {
            console.log('Tarefa já executada hoje!');
            return;
        }
        if (now > scheduledTime) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        const timeUntilNextExecution = scheduledTime.getTime() - now.getTime();
        setTimeout(() => {
            console.log('Executando tarefa agendada...');
            createTaskLogUseCase.execute('my-task');
            (0, my_task_1.myTask)();
        }, timeUntilNextExecution);
    });
    if (now > scheduledTime) {
        console.log('Executando tarefa perdida...');
        (0, my_task_1.myTask)();
    }
}
node_cron_1.default.schedule('0 8 * * 1-7', () => {
    console.log('Tarefa executada no horário!');
    createTaskLogUseCase.execute('my-task');
    (0, my_task_1.myTask)();
}, {
    scheduled: true,
    timezone: 'America/Campo_Grande'
});
scheduleTask();
