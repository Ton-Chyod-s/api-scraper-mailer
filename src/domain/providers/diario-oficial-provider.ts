export interface DiarioOficialProvider {
    buscarPublicacoes(nome: string, dataInicio: string, dataFim: string): Promise<any>; 
  }