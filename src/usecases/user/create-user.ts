import { User } from '@domain/entities/User';
import { UserRepository } from '@domain/interfaces/repositories/user-repository';

export class CreateUser {
  constructor(private userRepo: UserRepository) {}

  async execute(name: string, email: string) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new Error('Usuário já existe');

    const user = new User(name, email, 0); 
    await this.userRepo.save(user);
  }
}
