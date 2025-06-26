import { MilitarySttGateway } from "@infra/providers/gateways/military/military-stt-gateway";
import { MilitarySttController } from "@interfaces/controllers/military/military-stt-controller";
import { MilitarySttUseCase } from "@usecases/military/military-stt-use-case";

export function makeMilitarySttController(): MilitarySttController {
  const scraper = new MilitarySttGateway();
  const useCase = new MilitarySttUseCase(scraper);
  return new MilitarySttController(useCase);
}

if (require.main === module) {
  const controller = makeMilitarySttController();
  console.log("Military STT Controller created:", controller);
}