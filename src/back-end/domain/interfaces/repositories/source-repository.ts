
export interface ISourceRepository {
  getAllSources(): Promise<{ id: number; nome: string }[]>;
}