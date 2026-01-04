import type { OfficialJournalMunicipality } from '@prisma/client';
import type { CreateOfficialJournalMunicipalityInput } from '@domain/dtos/official-journals/official-journals-municipality.dto';

export interface IOfficialJournalMunicipalityRepository {
  createMany(inputs: CreateOfficialJournalMunicipalityInput[]): Promise<number>;
  findAllByUserIdInRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<OfficialJournalMunicipality[]>;
  existsForUserOnDay(userId: string, day: Date): Promise<boolean>;
}
