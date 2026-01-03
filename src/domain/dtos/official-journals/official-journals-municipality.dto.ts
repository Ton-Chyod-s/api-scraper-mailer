export type OfficialJournalsMunicipalityDto = {
  numero: string;
  dia: string;
  arquivo: string;
  desctpd: string;
  codigodia: string;
};

export type AjaxPayloadDto = {
  success?: boolean;
  data?: unknown;
  message?: unknown;
};

export type CreateOfficialJournalMunicipalityInput = {
  id?: string;
  user_id: string;
  numero: string;
  dia: Date | string;
  arquivo: string;
  descricao?: string | null;
  codigo_dia: string;
  source_site?: string;
  fetched_at?: Date;
};
