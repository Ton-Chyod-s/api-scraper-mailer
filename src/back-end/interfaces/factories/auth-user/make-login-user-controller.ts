import { PrismaAuthUserRepository } from '@infra/repositories/auth-user/auth-user-repository';
import { LoginUserUseCase } from '@usecases/auth-user/login-user-use-case';
import { LoginCreateUserController } from '@interfaces/controllers/auth-user/login-user-controller';

export function makeLoginController(): LoginCreateUserController {
  const userRepo = new PrismaAuthUserRepository();
  const useCase = new LoginUserUseCase(userRepo);
  return new LoginCreateUserController(useCase);
}
