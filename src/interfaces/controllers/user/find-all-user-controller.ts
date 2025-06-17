import { Request, Response } from 'express';
import { FindAllUserUseCase } from '@usecases/user/find-all-user-use-case';

export class FindAllUserController {
  constructor(
    private findAllUsers: FindAllUserUseCase
  ) {}

  async findAll(req: Request, res: Response): Promise<Response> {
    const authUserId = req.user?.id;

    if (!authUserId) {
      return res.status(401).send({ error: 'Usuário não autenticado' });
    }

    try {
      const users = await this.findAllUsers.execute(authUserId);
      return res.status(200).json(users);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      return res.status(400).send({ error: 'Erro ao buscar usuários' });
    }
  }
}
