import { Request, Response } from 'express';
import { ExercitoUseCase } from "@usecases/military/military-ott-use-case";

export class ExercitoController {
    constructor (private readonly exercitoUseCase: ExercitoUseCase) {}

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
