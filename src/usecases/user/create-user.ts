import { User } from '@domain/entities/user';
import { UserRepository } from '@domain/interfaces/repositories/user-repository';

export class CreateUser {
  constructor(private userRepo: UserRepository) {}

  async execute(user: User, role: string): Promise<void> {
    const existing = await this.userRepo.findByEmail(user.email);
    if (existing) throw new Error('Usuário já existe');

    const emails = await this.userRepo.getAllEmails();
    if (emails.includes(user.email)) {
      throw new Error('Email já cadastrado');
    }

    if (role == "user" && emails.length > 0) {
      throw new Error('Limite de emails cadastrados atingido');
    }

    await this.userRepo.save(user);
  }
}
