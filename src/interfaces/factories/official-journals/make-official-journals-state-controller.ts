import { OfficialJournalsStateGateway } from "@infra/providers/gateways/official-journals/official-journals-state-gateway";
import { ConsultarDiarioOficialEstadoUseCase } from "@usecases/official-journals/official-journals-state-use-case";
import { OfficialJournalsStateController } from "@interfaces/controllers/official-journals/official-journals-state-controller";

export function makeOfficialJournalsStateController(): OfficialJournalsStateController {
    const diarioOficialEstadoWeb = new OfficialJournalsStateGateway();
    const consultarEstadoUseCase = new ConsultarDiarioOficialEstadoUseCase(diarioOficialEstadoWeb);
    return new OfficialJournalsStateController(consultarEstadoUseCase);
}