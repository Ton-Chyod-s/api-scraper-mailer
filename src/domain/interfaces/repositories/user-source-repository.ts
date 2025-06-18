export interface IUserSourceRepository {
  getSourcesByUserId(userId: number): Promise<{ id: number; nome: string }[]>;
}