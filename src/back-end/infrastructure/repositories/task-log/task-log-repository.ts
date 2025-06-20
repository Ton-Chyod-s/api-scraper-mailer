import { PrismaClient } from "@prisma/client";
import { TaskLogRepository } from "@domain/interfaces/repositories/task-log-repository";

const prisma = new PrismaClient();

export class PrismaTaskLogRepository implements TaskLogRepository  {
    async getAllTaskNames(): Promise<string[]> {
        const taskLogs = await prisma.taskLog.findMany({
            select: { task_name: true,
                executed_at: true }
        });

        return taskLogs.map((taskLog: { task_name: string, executed_at: Date }) => 
            `${taskLog.task_name} - ${taskLog.executed_at.toISOString()}`
          );
          
    }

    async save(taskLog: { task_name: string }): Promise<void> {
        await prisma.taskLog.create({
            data: {
                task_name: taskLog.task_name
            }
        });
    }

    async disconnect(): Promise<void> {
        await prisma.$disconnect();
    }

    async getLastTaskLog(): Promise<string | null> {
        const lastTaskLog = await prisma.taskLog.findFirst({
            orderBy: { executed_at: 'desc' },
            select: { task_name: true, executed_at: true }
        });

        if (!lastTaskLog) return null;

        return `${lastTaskLog.task_name} - ${lastTaskLog.executed_at.toISOString()}`;   
    }  

    async create(taskName: string): Promise<void> {
        await this.save({ task_name: taskName });
    }
}