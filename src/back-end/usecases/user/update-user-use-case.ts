import { User } from '@domain/entities/user';
import { UserRepository } from "@domain/interfaces/repositories/user-repository";

export class UpdateUserUseCase {
  constructor(private userRepo: UserRepository) {}

  async execute(user: User): Promise<void> {
    const existing = await this.userRepo.findByEmail(user.email);
    if (existing && existing.id !== user.id) {
      throw new Error('Email já cadastrado por outro usuário');
    }

    const emails = await this.userRepo.getAllEmails();
    if (emails.includes(user.email)) {
      throw new Error('Email já cadastrado');
    }

    await this.userRepo.updateUser(user);
  }
}