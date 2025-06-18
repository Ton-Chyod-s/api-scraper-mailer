import { SourceDTO } from "@domain/dtos/source/source-DTO";
import { ISourceRepository } from "@domain/interfaces/repositories/source-repository";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class SourceRepository implements ISourceRepository {
 
  async getAllSources(): Promise<SourceDTO[]> {
    const sources = await prisma.source.findMany({
      select: {
        id: true,
        nome: true
      }
    });

    return sources.map(source => ({
      id: source.id,
      nome: source.nome
    }));

  }

}
