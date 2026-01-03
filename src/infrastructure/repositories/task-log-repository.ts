import { prisma } from '../prisma/client';
import { env } from '@config/env';
import { ITaskLogRepository } from '@domain/repositories/task-log-repository';
import { isSameZonedDay } from '@utils/date/date-time';
import { Prisma } from '@prisma/client';

function fnv1a64ToBigInt(input: string): bigint {
  let hash = BigInt('0xcbf29ce484222325');
  const prime = BigInt('0x100000001b3');

  for (let i = 0; i < input.length; i++) {
    hash ^= BigInt(input.charCodeAt(i));
    hash = BigInt.asUintN(64, hash * prime);
  }

  return BigInt.asIntN(64, hash);
}

export class PrismaITaskLogRepository implements ITaskLogRepository {
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

  async getLastExecution(taskName: string, userId?: string): Promise<Date | null> {
    const tn = (taskName ?? '').trim();
    if (!tn) return null;

    const resolvedUserId = userId ?? (await this.getSystemUserId());

    const last = await prisma.taskLog.findFirst({
      where: { taskName: tn, userId: resolvedUserId },
      orderBy: { executedAt: 'desc' },
      select: { executedAt: true },
    });

    return last?.executedAt ?? null;
  }

  async create(taskName: string, userId?: string, executedAt?: Date): Promise<void> {
    const tn = (taskName ?? '').trim();
    if (!tn) throw new Error('taskName is required');

    const resolvedUserId = userId ?? (await this.getSystemUserId());

    await prisma.taskLog.create({
      data: {
        taskName: tn,
        executedAt: executedAt ?? new Date(),
        userId: resolvedUserId,
      },
    });
  }

  async runOncePerDay(
    taskName: string,
    timeZone: string,
    taskRunner: () => Promise<void> | void,
    executedAt?: Date,
  ): Promise<boolean> {
    const tn = (taskName ?? '').trim();
    if (!tn) throw new Error('taskName is required');

    const now = executedAt ?? new Date();
    const systemUserId = await this.getSystemUserId();

    const lockKey = fnv1a64ToBigInt(`task:${tn}`);

    let gateLogId: string | null = null;

    const shouldRun = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const lockRows = await tx.$queryRaw<Array<{ locked: boolean }>>`
          SELECT pg_try_advisory_xact_lock(${lockKey}) as locked
        `;

        const locked = Boolean(lockRows?.[0]?.locked);
        if (!locked) {
          console.warn(`[Cron] Lock ocupado para ${tn}. Ignorando execução duplicada.`);
          return false;
        }

        const last = await tx.taskLog.findFirst({
          where: { taskName: tn, userId: systemUserId },
          orderBy: { executedAt: 'desc' },
          select: { executedAt: true },
        });

        if (last?.executedAt && isSameZonedDay(last.executedAt, now, timeZone)) {
          console.log('[Cron] Tarefa já executada hoje. Próxima execução: amanhã.');
          return false;
        }

        const gate = await tx.taskLog.create({
          data: {
            taskName: tn,
            executedAt: now,
            userId: systemUserId,
          },
          select: { id: true },
        });

        gateLogId = gate.id;
        return true;
      },
      { timeout: 10_000 },
    );

    if (!shouldRun) return false;

    try {
      console.log('[Cron] Executando tarefa agendada...');
      await Promise.resolve(taskRunner());
      return true;
    } catch (err) {
      if (gateLogId) {
        await prisma.taskLog.delete({ where: { id: gateLogId } }).catch(() => undefined);
      }
      throw err;
    }
  }
}
