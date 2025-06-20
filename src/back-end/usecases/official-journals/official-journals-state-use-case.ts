import { OfficialJournalsProvider } from '@domain/interfaces/providers/official-journals/official-journals-provider';

export class OfficialJournalsStateUseCase {
  constructor(private readonly diarioOficialProvider: OfficialJournalsProvider) {}

  async execute(nome: string, dataInicio: string, dataFim: string): Promise<any> {
    return await this.diarioOficialProvider.buscarPublicacoes(nome, dataInicio, dataFim);
  }
}
