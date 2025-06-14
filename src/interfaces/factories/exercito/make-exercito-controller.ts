import { ExercitoWebScraper } from "@infra/providers/gateways/exercito-work/exercito-web-scraper";
import { ExercitoUseCase } from "@usecases/exercito-work/exercito-use-case";
import { ExercitoController } from "@interfaces/controllers/exercito/exercito-controller";

export function makeExercitoController(): ExercitoController {
  const scraper = new ExercitoWebScraper();
  const useCase = new ExercitoUseCase(scraper);
  return new ExercitoController(useCase);
}