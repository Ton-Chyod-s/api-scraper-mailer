  import { AuthUserUseCase } from '@usecases/auth-user/register-user-use-case';
  import { Request, Response } from 'express';
  import { hashPassword } from "@utils/password/password-generator";
  import { RegisterRequestDTO } from '@domain/dtos/auth-user/register-request-dto';
  import { AuthService } from '@infra/jwt/auth-service';

  export class RegisterCreateUserController {
    constructor(private authUserUseCase: AuthUserUseCase) {}

    async create(req: Request, res: Response): Promise<Response> {
      const dados: RegisterRequestDTO = req.body;
      if (!dados.name || !dados.email || !dados.password || !dados.confirmPassword) {
        return res.status(400).send({ error: 'Todos os campos são obrigatórios.' });
        
      }

      if (dados.password !== dados.confirmPassword) {
        return res.status(400).send({ error: 'As senhas não coincidem.' });
      }

      const hashedPassword = await hashPassword(dados.password);

      try {
        const user = await this.authUserUseCase.execute(dados.name, dados.email, hashedPassword);

        const authService = new AuthService();
        const token = authService.generateToken(user.id?.toString() || "");

        return res.status(201).json({
                message: "User registered successfully",
                user: { nome: user.name, email: user.email },
                token: token
            });

      } catch (err: any) {
        return res.status(400).send({ error: err.message });
      }
    }
  }
