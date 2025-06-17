import { UserRepository } from "@domain/interfaces/repositories/user-repository";
import type { User } from "@domain/entities/user";

export class FindAllUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(authUserId: string): Promise<User[]> {
    return this.userRepository.findAllUsers(authUserId);
  }
}
