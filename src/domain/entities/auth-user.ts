export class AuthUser {
  constructor(
    public name: string,
    public email: string,
    public password: string,
    public role: string = 'user',
    public id?: number 
  ) {
    if (!email.includes('@')) throw new Error('Email inválido');
    if (role !== 'admin' && role !== 'user') throw new Error('Role inválido');
    if (password.length < 6) throw new Error('Senha muito curta');
  }
}
