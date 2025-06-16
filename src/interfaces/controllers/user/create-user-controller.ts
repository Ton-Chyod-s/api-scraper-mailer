import { Request, Response } from 'express';
import { CreateUser } from '@usecases/user/create-user';
import { CreateUserDTO } from '@domain/dtos/user/create-user-dto';
import { User } from '@domain/entities/user';
import { AuthService } from '@infra/jwt/auth-service';

export class CreateUserController {
  constructor(
    private createUser: CreateUser
  ) {}

  async create(req: Request, res: Response): Promise<Response> {
    const createUserDTO: CreateUserDTO = req.body;

    const authUserId = req.user?.id;

    if (!authUserId) {
      return res.status(401).send({ error: 'Usuário não autenticado' });
    }

    const user = new User(
      createUserDTO.name,
      createUserDTO.email,
      authUserId
    );

    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error('Token não fornecido');

    const token = authHeader.split(' ')[1];
    
    const authService = new AuthService();
    const roleFromToken = authService.getRoleFromToken(token);

    try {
      await this.createUser.execute(user, roleFromToken);
      return res.status(201).send('Usuário criado com sucesso!');
    } catch (err: any) {
      return res.status(400).send({ error: err.message });
    }
  }
}
