import { PrismaClient } from '@prisma/client';
import { IUserSourceRepository } from '@domain/interfaces/repositories/user-source-repository';
import { UserSource } from '@domain/entities/user-source';
import { Source } from '@domain/entities/source';

const prisma = new PrismaClient();

export class UserSourceRepository implements IUserSourceRepository {
  async getSourcesByUserId(userId: number): Promise<{ id: number; nome: string }[]> {
    const userIdNumber = Number(userId);
    
    const userSources = await prisma.userSource.findMany({
      where: { userId: userIdNumber },
      include: { source: true }
    });

    const fontes = userSources.map((us: UserSource & { source: Source }) => ({
      id: us.source.id!,
      nome: us.source.nome
    }));
    return fontes; 
      
  }
}
