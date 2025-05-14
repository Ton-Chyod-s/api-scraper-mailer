"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaTaskLogRepository = void 0;
const client_1 = require(".prisma/client");
const prisma = new client_1.PrismaClient();
class PrismaTaskLogRepository {
    async getAllTaskNames() {
        const taskLogs = await prisma.task_log.findMany({
            select: { task_name: true,
                executed_at: true }
        });
        return taskLogs.map((taskLog) => `${taskLog.task_name} - ${taskLog.executed_at.toISOString()}`);
    }
    async save(taskLog) {
        await prisma.task_log.create({
            data: {
                task_name: taskLog.task_name
            }
        });
    }
    async disconnect() {
        await prisma.$disconnect();
    }
}
exports.PrismaTaskLogRepository = PrismaTaskLogRepository;
