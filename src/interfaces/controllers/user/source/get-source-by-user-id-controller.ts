import { AuthService } from "@infra/jwt/auth-service";
import { GetSourcesByUserIdUseCase } from "@usecases/user/source/get-source-by-user-id-use-case";
import { Request, Response } from 'express';

export class GetSourcesByUserIdController {
  constructor(
    private getSourcesByUserIdUseCase: GetSourcesByUserIdUseCase
) {}

  async execute(req: Request, res: Response): Promise<Response> {
    
    const userId = parseInt(req.query.userId as string, 10);

    if (!userId) {
        return res.status(400).send({ error: 'ID de usuário inválido' });
    }

    try {
      const sources = await this.getSourcesByUserIdUseCase.execute(userId);
      return res.status(200).send(sources);
    } catch (err: any) {
        return res.status(400).send({ error: err.message });     
    }
  }
}