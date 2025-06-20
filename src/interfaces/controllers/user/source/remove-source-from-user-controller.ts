import { RemoveSourceFromUserUseCase } from "@usecases/user/source/remove-source-from-user-use-case";

export class RemoveSourceFromUserController {
    constructor(
        private removeSourceFromUserUseCase: RemoveSourceFromUserUseCase
    ) {}

    async execute(req: any, res: any): Promise<any> {
        const { userId, sourceId } = req.body;

        if (!userId || !sourceId) {
            return res.status(400).send({ error: 'Parâmetros userId e sourceId são obrigatórios.' });
        }

        try {
            await this.removeSourceFromUserUseCase.execute(userId, sourceId);
            return res.status(200).send({ message: 'Fonte removida com sucesso do usuário.' });
        } catch (err) {
            console.error('[RemoveSourceFromUserController] Erro:', err);
            return res.status(500).send({ error: 'Erro interno ao remover fonte.' });
        }
    }
}