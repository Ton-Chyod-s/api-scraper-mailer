"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const my_task_1 = require("../../main/jobs/my-task");
// cron.schedule('0 8 * * 1-5', () => {
//   console.log('Executando tarefa a cada minuto...');
//   myTask();
// });
node_cron_1.default.schedule('* * * * *', () => {
    console.log('Executando tarefa a cada minuto...');
    (0, my_task_1.myTask)();
});
