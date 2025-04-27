import { PrismaClient } from "@prisma/client";
import { TaskLogRepository } from "../../../domain/repositories/task-log-repository";

const prisma = new PrismaClient();

export class PrismaTaskLogRepository implements TaskLogRepository  {
    async getAllTaskNames(): Promise<string[]> {
        const taskLogs = await prisma.task_log.findMany({
            select: { task_name: true,
                executed_at: true }
        });

        return taskLogs.map((taskLog: { task_name: string, executed_at: Date }) => 
            `${taskLog.task_name} - ${taskLog.executed_at.toISOString()}`
          );
          
    }

    async save(taskLog: { task_name: string }): Promise<void> {
        await prisma.task_log.create({
            data: {
                task_name: taskLog.task_name
            }
        });
    }

    async disconnect(): Promise<void> {
        await prisma.$disconnect();
      }
}