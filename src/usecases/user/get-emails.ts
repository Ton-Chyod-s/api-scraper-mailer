import { UserRepository } from '../../domain/interfaces/repositories/user-repository';

export class GetEmails {
    constructor(private userRepository: UserRepository) {}

    async execute(): Promise<string[]> {
        return await this.userRepository.getAllEmails();
    }
}
