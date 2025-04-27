"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const my_task_1 = require("../../main/jobs/my-task");
function scheduleTask() {
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(8, 0, 0, 0);
    if (now > scheduledTime) {
        console.log('Executando tarefa perdida...');
        (0, my_task_1.myTask)();
    }
}
node_cron_1.default.schedule('0 8 * * 1-7', () => {
    console.log('Tarefa executada no horário!');
    (0, my_task_1.myTask)();
}, {
    scheduled: true,
    timezone: 'America/Campo_Grande'
});
scheduleTask();
