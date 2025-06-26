import { SourceRepository } from "@infra/repositories/user/source-repository";
import { GetAllSourcesController } from "@interfaces/controllers/user/source/get-all-source-controller";
import { GetAllSourcesUseCase } from "@usecases/user/source/get-all-source";

export const makeGetAllSourcesController = () => {
  const userSourceRepository = new SourceRepository();
  const getAllSourcesUseCase = new GetAllSourcesUseCase(userSourceRepository);
  return new GetAllSourcesController(getAllSourcesUseCase);
}