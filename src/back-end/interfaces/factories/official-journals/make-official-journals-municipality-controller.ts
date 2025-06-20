import { OfficialJournalsMunicipalityGateway } from "@infra/providers/gateways/official-journals/official-journals-municipality-gateway";
import { OfficialJournalsMunicipalityUseCase } from "@usecases/official-journals/official-journals-municipality-use-case";
import { OfficialJournalsMunicipalityController } from "@interfaces/controllers/official-journals/official-journals-municipality-controller";

export function makeOfficialJournalsMunicipalityController(): OfficialJournalsMunicipalityController {
   const diarioOficialMunicipioWeb = new OfficialJournalsMunicipalityGateway();
   const consultarMunicipioUseCase = new OfficialJournalsMunicipalityUseCase(diarioOficialMunicipioWeb);
   return new OfficialJournalsMunicipalityController(consultarMunicipioUseCase);
}