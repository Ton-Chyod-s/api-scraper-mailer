import { IUserSourceRepository } from "@domain/interfaces/repositories/user-source-repository";

export class GetSourcesByUserIdUseCase {
  constructor(private userSourceRepository: IUserSourceRepository) {}

  async execute(userId: number): Promise<{ id: number; nome: string }[]> {
    if (!userId) {
      throw new Error('ID de usuário inválido');
    }

    const sources = await this.userSourceRepository.getSourcesByUserId(userId);
    return sources;
  }
}