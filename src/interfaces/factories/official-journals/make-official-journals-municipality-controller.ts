import { DiarioOficialMunicipioWeb } from "@infra/providers/gateways/diario-oficial/diario-oficial-municipio-web";
import { ConsultarDiarioOficialMunicipioUseCase } from "@usecases/official-journals/official-journals-municipality-use-case";
import { DiarioOficialMunicipioController } from "@interfaces/controllers/official-journals/official-journals-municipality-controller";

export function makeDiarioOficialMunicipioController(): DiarioOficialMunicipioController {
   const diarioOficialMunicipioWeb = new DiarioOficialMunicipioWeb();
   const consultarMunicipioUseCase = new ConsultarDiarioOficialMunicipioUseCase(diarioOficialMunicipioWeb);
   return new DiarioOficialMunicipioController(consultarMunicipioUseCase);
}