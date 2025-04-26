"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const my_task_1 = require("../../main/jobs/my-task");
node_cron_1.default.schedule('0 8 * * 1-7', () => {
    (0, my_task_1.myTask)();
}, {
    scheduled: true,
    timezone: 'America/Sao_Paulo'
});
