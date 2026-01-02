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
