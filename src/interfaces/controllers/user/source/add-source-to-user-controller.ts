import { AddSourceToUserUseCase } from "@usecases/user/source/add-source-to-user-use-case";

export class AddSourceToUserController {
    constructor(
        private addSourceToUserUseCase: AddSourceToUserUseCase
    ) {}

    async execute(req: any, res: any): Promise<any> {
    const { userId, sourceId } = req.body;

    if (!userId || !sourceId) {
        return res.status(400).send({ error: 'Parâmetros userId e sourceId são obrigatórios.' });
    }

    try {
        await this.addSourceToUserUseCase.execute(userId, sourceId);
        return res.status(200).send({ message: 'Fonte adicionada com sucesso ao usuário.' });
    } catch (err) {
        console.error('[AddSourceToUserController] Erro:', err);
        return res.status(500).send({ error: 'Erro interno ao adicionar fonte.' });
    }
    }
}

        
