import { DiarioOficialEstadoWeb } from "@infra/providers/gateways/official-journals/official-journals-state-gateway";
import { ConsultarDiarioOficialEstadoUseCase } from "@usecases/official-journals/official-journals-state-use-case";
import { DiarioOficialEstadoController } from "@interfaces/controllers/official-journals/official-journals-state-controller";

export function makeDiarioOficialEstadoController(): DiarioOficialEstadoController {
    const diarioOficialEstadoWeb = new DiarioOficialEstadoWeb();
    const consultarEstadoUseCase = new ConsultarDiarioOficialEstadoUseCase(diarioOficialEstadoWeb);
    return new DiarioOficialEstadoController(consultarEstadoUseCase);
}