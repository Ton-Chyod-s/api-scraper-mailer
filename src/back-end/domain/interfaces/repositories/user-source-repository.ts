export interface IUserSourceRepository {
  getSourcesByUserId(userId: number): Promise<{ id: number; nome: string }[]>;
  addSourceToUser(userId: number, sourceId: number): Promise<void>;
  removeSourceFromUser(userId: number, sourceId: number): Promise<void>;
}