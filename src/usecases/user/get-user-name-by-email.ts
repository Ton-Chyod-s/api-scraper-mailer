
import { User } from '@prisma/client';
import { UserRepository } from '../../domain/interfaces/repositories/user-repository';


export class GetUserNameByEmail {
    constructor(private userRepository: UserRepository) {}

    async execute(email: string){
        const user = await this.userRepository.findByEmail(email);
        if (!user || user.name === null) {
            throw new Error(`Usuário com o e-mail ${email} não encontrado.`);
        }

        return user;
    }

}