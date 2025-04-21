import { DiarioOficialProvider } from '../../domain/providers/diario-oficial-provider';

export class ConsultarDiarioOficialUseCase {
  constructor(private readonly diarioOficialProvider: DiarioOficialProvider) {}

  async execute(nome: string, dataInicio: string, dataFim: string): Promise<any> {
    return await this.diarioOficialProvider.buscarPublicacoes(nome, dataInicio, dataFim);
  }
}
