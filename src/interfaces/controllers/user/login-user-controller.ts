import { Request, Response } from 'express';
import { LoginUserUseCase } from '@usecases/user/login-user-use-case';

export class LoginUserController {
  constructor(private readonly loginUseCase: LoginUserUseCase) {}

  async execute(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email e senha são obrigatórios" });
    }

    try {
      const result = await this.loginUseCase.execute(email, password);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(401).json({ message: err.message });
    }
  }
}
