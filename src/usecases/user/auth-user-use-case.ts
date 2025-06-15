import { AuthUser } from '@domain/entities/auth-user';
import { AuthUserRepository } from '@domain/interfaces/repositories/auth-user-repository';


export class AuthUserUseCase {
  constructor(private authUserRepo: AuthUserRepository) {}

  async execute(name: string, email: string, password: string, role: string = 'user'): Promise<AuthUser> {
    const existing = await this.authUserRepo.findByEmail(email);
    if (existing) throw new Error('Usuário já existe');

    const user = new AuthUser(name, email, password, role);
    return await this.authUserRepo.createUser(user);

 
  }
}
