import { UserRepository } from '../../domain/repositories/user-repository';

export class GetUserNameByEmail {
    constructor(private userRepository: UserRepository) {}

    async execute(email: string): Promise<string | null> {
        const user = await this.userRepository.findByEmail(email);
        return user ? user.name : null;
    }
}