import type { OfficialJournalMunicipality } from '@prisma/client';
import type { CreateOfficialJournalMunicipalityInput } from '@domain/dtos/official-journals/official-journals-municipality.dto';

export interface IOfficialJournalMunicipalityRepository {
  create(input: CreateOfficialJournalMunicipalityInput): Promise<OfficialJournalMunicipality>;

  createMany(inputs: CreateOfficialJournalMunicipalityInput[]): Promise<number>;

  findAllByUserId(userId: string): Promise<OfficialJournalMunicipality[]>;
}
