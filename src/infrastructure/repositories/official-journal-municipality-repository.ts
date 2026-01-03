import { prisma } from '../prisma/client';
import { randomUUID } from 'node:crypto';
import type { OfficialJournalMunicipality } from '@prisma/client';
import { parseBrDateToUTC } from '@utils/date/date-time';
import { CreateOfficialJournalMunicipalityInput } from '@domain/dtos/official-journals/official-journals-municipality.dto';

export class PrismaOfficialJournalMunicipalityRepository {
  async create(
    input: CreateOfficialJournalMunicipalityInput,
  ): Promise<OfficialJournalMunicipality> {
    const dia = typeof input.dia === 'string' ? parseBrDateToUTC(input.dia) : input.dia;

    if (!dia) {
      throw new Error(`Data inválida: ${input.dia}`);
    }

    return prisma.officialJournalMunicipality.create({
      data: {
        id: input.id ?? randomUUID(),
        userId: input.user_id,
        numero: input.numero,
        dia,
        arquivo: input.arquivo,
        descricao: input.descricao ?? null,
        codigoDia: input.codigo_dia,
        sourceSite: input.source_site ?? 'diogrande',
        fetchedAt: input.fetched_at ?? new Date(),
      },
    });
  }
}
