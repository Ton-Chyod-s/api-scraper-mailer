import { PrismaUserRepository } from "../../infrastructure/repositories/user/user-repository";
import { CreateUser } from "./create-user";

const userData = JSON.parse(process.env.USER_DATA || '{}');

const userRepo = new PrismaUserRepository();
const createUser = new CreateUser(userRepo);

createUser.execute(userData.nome, userData.email)
    .then(() => {
        console.log("Usuário criado com sucesso");
    });
   