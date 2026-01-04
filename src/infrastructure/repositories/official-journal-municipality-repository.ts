import { prisma } from '../prisma/client';
import { randomUUID } from 'node:crypto';
import type { OfficialJournalMunicipality } from '@prisma/client';
import { parseBrDateToUTC } from '@utils/date/date-time';
import { CreateOfficialJournalMunicipalityInput } from '@domain/dtos/official-journals/official-journals-municipality.dto';
import { IOfficialJournalMunicipalityRepository } from '@domain/repositories/official-journal-municipality-repository';

export class PrismaOfficialJournalMunicipalityRepository implements IOfficialJournalMunicipalityRepository {
  async createMany(inputs: CreateOfficialJournalMunicipalityInput[]): Promise<number> {
    if (inputs.length === 0) return 0;

    const data = inputs.map((input) => {
      const dia = typeof input.dia === 'string' ? parseBrDateToUTC(input.dia) : input.dia;
      if (!dia) throw new Error(`Data inválida: ${input.dia}`);

      return {
        id: input.id ?? randomUUID(),
        userId: input.user_id,
        numero: input.numero,
        dia,
        arquivo: input.arquivo,
        descricao: input.descricao ?? null,
        codigoDia: input.codigo_dia,
        sourceSite: input.source_site ?? 'diogrande',
        fetchedAt: input.fetched_at ?? new Date(),
      };
    });

    const result = await prisma.officialJournalMunicipality.createMany({
      data,
      skipDuplicates: true,
    });

    return result.count;
  }

  async findAllByUserIdInRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<OfficialJournalMunicipality[]> {
    const startDay = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate(), 0, 0, 0, 0),
    );

    const endDay = new Date(
      Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate(), 23, 59, 59, 999),
    );

    return prisma.officialJournalMunicipality.findMany({
      where: {
        userId,
        dia: { gte: startDay, lte: endDay },
      },
      orderBy: [{ dia: 'desc' }, { fetchedAt: 'desc' }],
    });
  }

  async existsForUserOnDay(userId: string, day: Date): Promise<boolean> {
    const start = new Date(
      Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0, 0),
    );
    const end = new Date(
      Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 23, 59, 59, 999),
    );

    const count = await prisma.officialJournalMunicipality.count({
      where: {
        userId,
        dia: { gte: start, lte: end },
        sourceSite: 'diogrande',
      },
    });

    return count > 0;
  }
}
