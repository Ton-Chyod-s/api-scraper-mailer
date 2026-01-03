import { CreateOfficialJournalMunicipalityInput } from "@domain/dtos/official-journals/official-journals-municipality.dto";
import { OfficialJournalMunicipality } from "@prisma/client";

export interface IOfficialJournalMunicipalityRepository {
  create(input: CreateOfficialJournalMunicipalityInput,): Promise<OfficialJournalMunicipality>
}