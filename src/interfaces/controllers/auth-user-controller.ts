import { AuthUserUseCase } from '@usecases/user/auth-user-use-case';
import { Request, Response } from 'express';


export class AuthUserController {
  constructor(private authUserUseCase: AuthUserUseCase) {}

  async create(req: Request, res: Response): Promise<void> {
    const { name, email, password } = req.body;

    try {
      await this.authUserUseCase.execute(name, email, password);
      res.status(201).send('Usuário criado com sucesso!');
    } catch (err: any) {
      res.status(400).send({ error: err.message });
    }
  }
}