import { UserSourceRepository } from "@infra/repositories/user/user-source-repository";
import { AddSourceToUserController } from "@interfaces/controllers/user/source/add-source-to-user-controller";
import { AddSourceToUserUseCase } from "@usecases/user/source/add-source-to-user-use-case";


export const makeAddSourceToUserController = () => {
  const userSourceRepository = new UserSourceRepository();
  const addSourceToUserUseCase = new AddSourceToUserUseCase(userSourceRepository);
  return new AddSourceToUserController(addSourceToUserUseCase);
}