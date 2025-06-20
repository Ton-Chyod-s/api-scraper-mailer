import { Source } from './source';

export class UserSource {
  constructor(
    public userId: number,
    public sourceId: number,
    public source?: Source,
    public id?: number
  ) {
    if (!sourceId) throw new Error('Fonte inválida');
    if (userId <= 0) throw new Error('ID do usuário inválido');
  }
}
