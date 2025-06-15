import { RegisterCreateUserController } from '@interfaces/controllers/auth-user/register-user-controller';
import { AuthUserUseCase } from '@usecases/auth-user/register-user-use-case';
import { PrismaAuthUserRepository } from '@infra/repositories/auth-user/auth-user-repository';

export function makeRegisterCreateUserController(): RegisterCreateUserController {
    const authUserRepo = new PrismaAuthUserRepository();
    const authUserUseCase = new AuthUserUseCase(authUserRepo);   
    return new RegisterCreateUserController(authUserUseCase);
}