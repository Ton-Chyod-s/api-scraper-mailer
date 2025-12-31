export type OfficialJournalItemDTO = {
  numero: string;
  dia: string;
  arquivo: string;
  descricao: string;
  codigoDia: string;
};

export interface SiteDataDTO {
  site: string;
  mensagem: string;
  conteudos: OfficialJournalItemDTO[];
}

export type FetchPublicationsInputDTO = {
  nome: string;
  dataInicio: string; // "DD/MM/YYYY"
  dataFim: string; // "DD/MM/YYYY"
  retries?: number;
  delayMs?: number;
};
