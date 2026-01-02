import { prisma } from '../prisma/client';
import { env } from '@config/env';
import { TaskLogRepository } from '@domain/repositories/task-log-repository';

export class PrismaTaskLogRepository implements TaskLogRepository {
  private cachedSystemUserId: string | null = null;

  private async getSystemUserId(): Promise<string> {
    if (this.cachedSystemUserId) return this.cachedSystemUserId;

    const email = env.SEED_ADMIN_EMAIL ?? 'admin@local.test';

    const byEmail = await prisma.user.findUnique({ where: { email } });
    if (byEmail) {
      this.cachedSystemUserId = byEmail.id;
      return byEmail.id;
    }

    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    if (!admin) {
      throw new Error(
        'Nenhum usuário ADMIN encontrado para registrar TaskLog. Rode o seed (db:seed) ou crie um ADMIN.',
      );
    }

    this.cachedSystemUserId = admin.id;
    return admin.id;
  }

  async getLastExecution(taskName: string): Promise<Date | null> {
    const tn = (taskName ?? '').trim();
    if (!tn) return null;

    const userId = await this.getSystemUserId();

    const last = await prisma.taskLog.findFirst({
      where: { taskName: tn, userId },
      orderBy: { executedAt: 'desc' },
      select: { executedAt: true },
    });

    return last?.executedAt ?? null;
  }

  async create(taskName: string, executedAt?: Date): Promise<void> {
    const tn = (taskName ?? '').trim();
    if (!tn) throw new Error('taskName is required');

    const userId = await this.getSystemUserId();

    await prisma.taskLog.create({
      data: {
        taskName: tn,
        executedAt: executedAt ?? new Date(),
        userId,
      },
    });
  }
}
