import { MilitarySttUseCase } from '@usecases/military/military-stt-use-case';
import { Request, Response } from 'express';


export class MilitarySttController {
    constructor (private readonly exercitoUseCase: MilitarySttUseCase) {}

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
