import { PrismaUserRepository } from "../../../infrastructure/repositories/user/user-repository";
import { CreateUser } from "../../../usecases/user/create-user";
import { UserController } from "../../controllers/user-controller";


export function makeUserUseCase(): UserController {
    const userRepository = new PrismaUserRepository();
    const createUser = new CreateUser(userRepository);
    return new UserController(createUser);''
}