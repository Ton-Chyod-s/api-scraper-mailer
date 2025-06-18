import { GetSourcesByUserIdUseCase } from '@usecases/user/source/get-source-by-user-id-use-case';
import { UserSourceRepository } from '@infra/repositories/user/user-source-repository';
import { GetSourcesByUserIdController } from '@interfaces/controllers/user/source/get-source-by-user-id-controller';


export const makeGetSourcesByUserIdController = () => {
  const userSourceRepository = new UserSourceRepository();
  const getSourcesByUserIdUseCase = new GetSourcesByUserIdUseCase(userSourceRepository);
  return new GetSourcesByUserIdController(getSourcesByUserIdUseCase);
}