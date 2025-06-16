import { User } from '@domain/entities/user';
import { UserRepository } from '@domain/interfaces/repositories/user-repository';

export class CreateUser {
  constructor(private userRepo: UserRepository) {}

  async execute(user: User): Promise<void> {
    const existing = await this.userRepo.findByEmail(user.email);
    if (existing) throw new Error('Usuário já existe');

    await this.userRepo.save(user);
  }
}
