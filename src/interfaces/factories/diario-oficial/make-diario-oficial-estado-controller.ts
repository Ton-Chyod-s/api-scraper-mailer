import { DiarioOficialEstadoWeb } from "../../../infrastructure/providers/gateways/diario-oficial/diario-oficial-estado-web";
import { ConsultarDiarioOficialEstadoUseCase } from "../../../usecases/diario-oficial/consultar-diario-oficial-estado";
import { DiarioOficialEstadoController } from "../../controllers/diario-oficial/diario-oficial-estado-controller";

export function makeDiarioOficialEstadoController(): DiarioOficialEstadoController {
    const diarioOficialEstadoWeb = new DiarioOficialEstadoWeb();
    const consultarEstadoUseCase = new ConsultarDiarioOficialEstadoUseCase(diarioOficialEstadoWeb);
    return new DiarioOficialEstadoController(consultarEstadoUseCase);
}