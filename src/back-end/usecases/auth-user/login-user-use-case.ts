import { AuthUserRepository } from '@domain/interfaces/repositories/auth-user-repository';
import { AuthService } from '@infra/jwt/auth-service';
import bcrypt from "bcrypt";
import { LoginRequestDTO } from '@domain/dtos/auth-user/login-request-dto';

export class LoginUserUseCase {
    constructor(
        private authUserRepo: AuthUserRepository,
        private readonly authService: AuthService = new AuthService()
    ) {}

  async execute(email: string, password: string): Promise<LoginRequestDTO | null> {
    const user = await this.authUserRepo.findByEmail(email);
    if (!user) throw new Error('Usuário não encontrado');

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) throw new Error('Credenciais inválidas');

    if (!user.id) throw new Error('ID do usuário inválido');

    const token = this.authService.generateToken(user.id.toString(), user.role);

    return {
            name: user.name,
            email: user.email,
            token
        };
  }
}
