import { PrismaUserRepository } from "@infra/repositories/user/user-repository";
import { CreateUser } from "@usecases/user/create-user";
import { CreateUserController } from "@interfaces/controllers/user/create-user-controller";


export function makeCreateUserController(): CreateUserController {
    const userRepository = new PrismaUserRepository();
    const createUser = new CreateUser(userRepository);
    return new CreateUserController(createUser);''
}