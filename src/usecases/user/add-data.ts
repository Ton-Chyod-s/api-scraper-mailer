import { PrismaUserRepository } from "../../infrastructure/repositories/user/user-repository";
import { CreateUser } from "./create-user";

const NODE_ENV = process.env.NODE_ENV;

if (!NODE_ENV) {
    console.error("Variável de ambiente NODE_ENV não definida.");
    process.exit(1); 
}

let userData: { nome: string; email: string }[] = [];

try {
    userData = JSON.parse(process.env.USER_DATA_PROD || "[]");

    if (NODE_ENV === "development") {
        userData = JSON.parse(process.env.USER_DATA_DEV || "[]");
    }
    
    if (!Array.isArray(userData)) {
        throw new Error("USER_DATA deve ser um array.");
    }
    
} catch (error) {
    console.error("Erro ao carregar ou parsear USER_DATA:", error);
    process.exit(1); 
}

const userRepo = new PrismaUserRepository();
const createUser = new CreateUser(userRepo);

(async () => {
    for (const user of userData) {
        try {
            await createUser.execute(user.nome, user.email);
            console.log(`Usuário ${user.nome} criado com sucesso`);
        } catch (error) {
            console.error(`Erro ao criar usuário ${user.nome}:`, error);
        }
    }
})();
