import { Request, Response } from 'express';
import { ConsultarDiarioOficialUseCase } from '../../usecases/consultar-diario-oficial-estado';

export class DiarioOficialController {
  constructor(private readonly consultarUseCase: ConsultarDiarioOficialUseCase) {}

  consultar = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, dateInit, dateEnd } = req.body;

      if (!name || !dateInit || !dateEnd) {
        res.status(400).send('Missing required fields: name, dateInit or dateEnd');
        return;
      }

      const result = await this.consultarUseCase.execute(name, dateInit, dateEnd);
      res.status(200).json(result);
    
    } catch (error) {
      console.error('Erro ao consultar o Diário Oficial:', error);
      res.status(500).send('Error fetching content from Diário Oficial');
    }
  }
}
