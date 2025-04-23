"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultarDiarioOficialEstadoUseCase = void 0;
class ConsultarDiarioOficialEstadoUseCase {
    constructor(diarioOficialProvider) {
        this.diarioOficialProvider = diarioOficialProvider;
    }
    async execute(nome, dataInicio, dataFim) {
        return await this.diarioOficialProvider.buscarPublicacoes(nome, dataInicio, dataFim);
    }
}
exports.ConsultarDiarioOficialEstadoUseCase = ConsultarDiarioOficialEstadoUseCase;
