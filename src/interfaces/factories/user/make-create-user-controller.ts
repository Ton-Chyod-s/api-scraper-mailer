import { PrismaUserRepository } from "@infra/repositories/user/user-repository";
import { CreateUser } from "@usecases/user/create-user";
import { UserController } from "@interfaces/controllers/user/create-user-controller";


export function makeUserController(): UserController {
    const userRepository = new PrismaUserRepository();
    const createUser = new CreateUser(userRepository);
    return new UserController(createUser);''
}