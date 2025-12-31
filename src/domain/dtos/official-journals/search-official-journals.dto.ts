export interface SiteData {
  site: string;
  mensagem: string;
  conteudos: Record<string, string>;
}

export type BuscarPublicacoesInput = {
  nome: string;
  dataInicio: string; // "DD/MM/YYYY"
  dataFim: string; // "DD/MM/YYYY"
  retries?: number;
  delayMs?: number;
};
