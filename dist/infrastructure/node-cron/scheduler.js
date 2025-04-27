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
async function executeTask() {
    const now = new Date();
    const taskNames = await taskLogRepository.getAllTaskNames();
    const lastTaskLogEntry = taskNames.at(-1);
    if (!lastTaskLogEntry) {
        throw new Error('No task logs available.');
    }
    const [taskName, executedAtString] = lastTaskLogEntry.split(' - ');
    const executedAtUTC = new Date(executedAtString);
    const campoGrandeTimestamp = executedAtUTC.getTime() - (4 * 60 * 60 * 1000);
    const campoGrandeDate = new Date(campoGrandeTimestamp);
    if (taskNames.includes('my-task') && campoGrandeDate.getTime() === now.getTime()) {
        console.log('Tarefa já executada hoje, no mesmo horário!');
        console.log('Data da tarefa (Campo Grande):', campoGrandeDate.toISOString());
        return;
    }
    try {
        console.log('Executando tarefa agendada...');
        await createTaskLogUseCase.execute('my-task');
        (0, my_task_1.myTask)();
    }
    catch (error) {
        console.error('Erro ao executar tarefa:', error);
    }
}
node_cron_1.default.schedule('0 8 * * 1-7', async () => {
    console.log('Tarefa executada no horário!');
    await executeTask();
}, {
    scheduled: true,
    timezone: 'America/Campo_Grande'
});
const now = new Date();
const scheduledTime = new Date();
scheduledTime.setHours(8, 0, 0, 0);
if (now > scheduledTime) {
    console.log('Executando tarefa perdida...');
    executeTask();
}
if (require.main === module) {
    console.log('Scheduler is running...');
    executeTask();
}
