// src/usecases/CreateUser.ts
import { User } from '../domain/entities/User';

export interface UserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}

export class CreateUser {
  constructor(private userRepo: UserRepository) {}

  async execute(name: string, email: string) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new Error('Usuário já existe');

    const user = new User(name, email);
    await this.userRepo.save(user);
  }
}
