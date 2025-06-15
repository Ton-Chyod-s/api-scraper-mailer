import { AuthUserUseCase } from '@usecases/user/auth-user-use-case';
import { Request, Response } from 'express';
import { hashPassword } from "@utils/password/password-generator";
import { RegisterRequestDTO } from '@domain/dtos/user/register-request-dto';

export class AuthUserController {
  constructor(private authUserUseCase: AuthUserUseCase) {}

  async create(req: Request, res: Response): Promise<void> {
    const dados: RegisterRequestDTO = req.body;

    const hashedPassword = await hashPassword(dados.password);

    try {
      await this.authUserUseCase.execute(dados.name, dados.email, hashedPassword);
      res.status(201).send('Usuário criado com sucesso!');
    } catch (err: any) {
      res.status(400).send({ error: err.message });
    }
  }
}