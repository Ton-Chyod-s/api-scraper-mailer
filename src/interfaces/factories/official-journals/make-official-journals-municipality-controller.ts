import { OfficialJournalsMunicipalityGateway } from "@infra/providers/gateways/official-journals/official-journals-municipality-gateway";
import { ConsultarDiarioOficialMunicipioUseCase } from "@usecases/official-journals/official-journals-municipality-use-case";
import { DiarioOficialMunicipioController } from "@interfaces/controllers/official-journals/official-journals-municipality-controller";

export function makeDiarioOficialMunicipioController(): DiarioOficialMunicipioController {
   const diarioOficialMunicipioWeb = new OfficialJournalsMunicipalityGateway();
   const consultarMunicipioUseCase = new ConsultarDiarioOficialMunicipioUseCase(diarioOficialMunicipioWeb);
   return new DiarioOficialMunicipioController(consultarMunicipioUseCase);
}