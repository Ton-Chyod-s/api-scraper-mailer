export interface ExercitoRepository {
    buscarConteudo(): Promise<string>;
    buscarConteudoAno(ano: string): Promise<string>;
  }
  