import { AuthUserController } from '@interfaces/controllers/auth-user-controller';
import { AuthUserUseCase } from '@usecases/user/auth-user-use-case';
import { PrismaAuthUserRepository } from '@infra/repositories/auth-user/auth-user-repository';

export function makeAuthUserController(): AuthUserController {
    const authUserRepo = new PrismaAuthUserRepository();
    const authUserUseCase = new AuthUserUseCase(authUserRepo);   
    return new AuthUserController(authUserUseCase);
}