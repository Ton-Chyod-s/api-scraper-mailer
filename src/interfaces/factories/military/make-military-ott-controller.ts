import { ExercitoWebScraper } from "@infra/providers/gateways/military/military-ott-gateway";
import { ExercitoUseCase } from "@usecases/military/military-ott-use-case";
import { ExercitoController } from "@interfaces/controllers/military/military-ott-controller";

export function makeExercitoController(): ExercitoController {
  const scraper = new ExercitoWebScraper();
  const useCase = new ExercitoUseCase(scraper);
  return new ExercitoController(useCase);
}