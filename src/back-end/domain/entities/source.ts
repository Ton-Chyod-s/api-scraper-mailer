export class Source {
  constructor(
    public nome: string,
    public id?: number
  ) {
    if (!nome || nome.trim() === '') {
      throw new Error('Nome da fonte inválido');
    }
  }
}
