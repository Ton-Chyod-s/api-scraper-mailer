import { MilitaryOttGateway } from "@infra/providers/gateways/military/military-ott-gateway";
import { MilitaryOttUseCase } from "@usecases/military/military-ott-use-case";
import { MilitaryOttController } from "@interfaces/controllers/military/military-ott-controller";

export function makeMilitaryOttController(): MilitaryOttController {
  const scraper = new MilitaryOttGateway();
  const useCase = new MilitaryOttUseCase(scraper);
  return new MilitaryOttController(useCase);
}