"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiarioOficialMunicipioController = void 0;
class DiarioOficialMunicipioController {
    constructor(consultarUseCase) {
        this.consultarUseCase = consultarUseCase;
        this.consultar = async (req, res) => {
            try {
                const { name, dateInit, dateEnd } = req.body;
                if (!name || !dateInit || !dateEnd) {
                    res.status(400).send('Missing required fields: name, dateInit or dateEnd');
                    return;
                }
                const result = await this.consultarUseCase.execute(name, dateInit, dateEnd);
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Erro ao consultar o Diário Oficial:', error);
                res.status(500).send('Error fetching content from Diário Oficial');
            }
        };
    }
}
exports.DiarioOficialMunicipioController = DiarioOficialMunicipioController;
