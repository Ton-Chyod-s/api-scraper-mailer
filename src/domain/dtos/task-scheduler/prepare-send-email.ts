import type { OfficialJournalMunicipality } from '@prisma/client';

export type UserListItem = {
  id: string;
  name: string;
  email: string;
};

export type FetchedDiaryItem = {
  numero: string;
  dia: Date;
  arquivo: string;
  descricao: string | null;
  codigoDia: string;
};

export type PerUserResult = {
  user: UserListItem;
  fetched: FetchedDiaryItem[];
  inserted: number;
  fromDbYear: OfficialJournalMunicipality[];
};

export type PrepareResult = {
  diaAlvoStr: string;
  anoVigente: string;
  results: PerUserResult[];
};

export type BuildOfficialJournalContext =
  | {
      ok: true;
      users: UserListItem[];
      diaAlvoStr: string;
      diaAlvoDate: Date;
      anoVigente: string;
      inicioAnoDate: Date;
      fimAnoDate: Date;
    }
  | {
      ok: false;
      users: UserListItem[];
      diaAlvoStr: string;
      anoVigente: string;
      reason: string;
    };
