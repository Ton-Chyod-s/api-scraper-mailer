import { SourceDTO } from "@domain/dtos/source/source-DTO";
import { ISourceRepository } from "@domain/interfaces/repositories/source-repository";

export class GetAllSourcesUseCase {
  constructor(private sourceRepository: ISourceRepository) {}

  async execute(): Promise<SourceDTO[]> {
    const sources = await this.sourceRepository.getAllSources();

    return sources.map(source => ({
      id: source.id,
      nome: source.nome,
    }));
  }
}
