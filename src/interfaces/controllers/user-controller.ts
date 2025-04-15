import { Request, Response } from 'express';
import { CreateUser } from '../../usecases/create-user';

export class UserController {
  constructor(private createUser: CreateUser) {}

  async create(req: Request, res: Response) {
    const { name, email } = req.body;

    try {
      await this.createUser.execute(name, email);
      res.status(201).send('Usuário criado com sucesso!');
    } catch (err: any) {
      res.status(400).send({ error: err.message });
    }
  }
}
