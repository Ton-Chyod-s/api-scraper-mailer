import { User } from '@domain/entities/user';
import { UpdateUserUseCase } from '@usecases/user/update-user-use-case';

export class UpdateUserController {
  constructor(
    private updateUserUseCase: UpdateUserUseCase
) {}

  async execute(user: User): Promise<void> {
    try {
      await this.updateUserUseCase.execute(user);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw new Error('Erro ao atualizar usuário');
    }
  }
}