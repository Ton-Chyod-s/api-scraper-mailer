import { Request, Response } from 'express';
import { FindAllUserUseCase } from '@usecases/user/find-all-user-use-case';
import { AuthService } from '@infra/jwt/auth-service';


export class FindAllUserController {
  constructor(
    private findAllUsers: FindAllUserUseCase
  ) {}

  async findAll(req: Request, res: Response): Promise<Response> {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).send({ error: 'Token não fornecido' });
    }
    
    const userId = new AuthService().getUserIdFromToken(token);

    if (!userId) {
      return res.status(401).send({ error: 'Usuário não autenticado' });
    }

    try {
      const users = await this.findAllUsers.execute(userId);
      return res.status(200).json(users);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      return res.status(400).send({ error: 'Erro ao buscar usuários' });
    }
  }
}
