// src/infra/repositories/InMemoryUserRepository.ts
import { UserRepository } from '../../usecases/create-user';
import { User } from '../../domain/entities/User';

export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null;
  }

  async save(user: User): Promise<void> {
    this.users.push(user);
  }
}
