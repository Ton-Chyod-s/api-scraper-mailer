"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExercitoController = void 0;
class ExercitoController {
    constructor(exercitoUseCase) {
        this.exercitoUseCase = exercitoUseCase;
        this.consultar = async (req, res) => {
            try {
                const data = await this.exercitoUseCase.execute();
                res.status(200).json(data);
            }
            catch (error) {
                console.error('Error in controller:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        };
    }
}
exports.ExercitoController = ExercitoController;
