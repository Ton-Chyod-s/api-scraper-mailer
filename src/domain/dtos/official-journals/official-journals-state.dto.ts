export type OfficialJournalsStateItem = {
  numero?: number | string;
  descricao?: string;
  pagina?: number;
  caminhoArquivo?: string;
  nomeArquivo?: string;
  dataPublicacao?: string;
  hiHighlight?: { texto?: string[] } | null;
};

export type StateResponse = {
  paginaAtual: number;
  totalDePaginas: number;
  totalDeRegistros?: number;
  paginasDiario: unknown[];
};
