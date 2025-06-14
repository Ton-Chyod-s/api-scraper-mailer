import { DiarioOficialMunicipioWeb } from "@infra/providers/gateways/diario-oficial/diario-oficial-municipio-web";
import { ConsultarDiarioOficialMunicipioUseCase } from "@usecases/diario-oficial/consultar-diario-oficial-municipio";
import { DiarioOficialMunicipioController } from "@interfaces/controllers/diario-oficial/diario-oficial-municipio-controller";

export function makeDiarioOficialMunicipioController(): DiarioOficialMunicipioController {
   const diarioOficialMunicipioWeb = new DiarioOficialMunicipioWeb();
   const consultarMunicipioUseCase = new ConsultarDiarioOficialMunicipioUseCase(diarioOficialMunicipioWeb);
   return new DiarioOficialMunicipioController(consultarMunicipioUseCase);
}