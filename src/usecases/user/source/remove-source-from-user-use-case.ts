import { IUserSourceRepository } from "@domain/interfaces/repositories/user-source-repository";

export class RemoveSourceFromUserUseCase {
  constructor(private userSourceRepository: IUserSourceRepository) {}

  async execute(userId: number, sourceId: number): Promise<void> {
    if (!userId || !sourceId) {
      throw new Error('ID de usuário ou ID de fonte inválido');
    }

    await this.userSourceRepository.removeSourceFromUser(userId, sourceId);
  }
}