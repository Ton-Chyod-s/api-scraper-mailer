import { UserSourceRepository } from "@infra/repositories/user/user-source-repository";
import { RemoveSourceFromUserController } from "@interfaces/controllers/user/source/remove-source-from-user-controller";
import { RemoveSourceFromUserUseCase } from "@usecases/user/source/remove-source-from-user-use-case";

export const makeRemoveSourceFromUserController = () => {
  const userSourceRepository = new UserSourceRepository();
  const removeSourceFromUserUseCase = new RemoveSourceFromUserUseCase(userSourceRepository);
  return new RemoveSourceFromUserController(removeSourceFromUserUseCase);
}