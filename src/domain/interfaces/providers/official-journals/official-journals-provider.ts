export interface OfficialJournalsProvider {
    buscarPublicacoes(nome: string, dataInicio: string, dataFim: string): Promise<any>; 
  }