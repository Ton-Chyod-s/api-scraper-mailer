import { OfficialJournalsStateGateway } from "@infra/providers/gateways/official-journals/official-journals-state-gateway";
import { OfficialJournalsStateUseCase } from "@usecases/official-journals/official-journals-state-use-case";
import { OfficialJournalsStateController } from "@interfaces/controllers/official-journals/official-journals-state-controller";

export function makeOfficialJournalsStateController(): OfficialJournalsStateController {
    const diarioOficialEstadoWeb = new OfficialJournalsStateGateway();
    const consultarEstadoUseCase = new OfficialJournalsStateUseCase(diarioOficialEstadoWeb);
    return new OfficialJournalsStateController(consultarEstadoUseCase);
}