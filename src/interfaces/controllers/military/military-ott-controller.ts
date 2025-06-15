import { Request, Response } from 'express';
import { MilitaryOttUseCase } from "@usecases/military/military-ott-use-case";

export class MilitaryOttController {
    constructor (private readonly exercitoUseCase: MilitaryOttUseCase) {}

    consultar = async (req: Request, res: Response): Promise<void> => {
        try {
            const data = await this.exercitoUseCase.execute();
            res.status(200).json(data);

        } catch (error) {
            console.error('Error in controller:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
