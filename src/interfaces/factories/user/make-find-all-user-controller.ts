import { PrismaUserRepository } from "@infra/repositories/user/user-repository";
import { FindAllUserController } from "@interfaces/controllers/user/find-all-user-controller";
import { FindAllUserUseCase } from "@usecases/user/find-all-user-use-case";


export function makeFindAllUserController(): FindAllUserController {
    const userRepository = new PrismaUserRepository();
    const findAllUserUseCase = new FindAllUserUseCase(userRepository);
    return new FindAllUserController(findAllUserUseCase);''
}