"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultarDiarioOficialMunicipioUseCase = void 0;
class ConsultarDiarioOficialMunicipioUseCase {
    constructor(diarioOficialProvider) {
        this.diarioOficialProvider = diarioOficialProvider;
    }
    async execute(nome, dataInicio, dataFim) {
        return await this.diarioOficialProvider.buscarPublicacoes(nome, dataInicio, dataFim);
    }
}
exports.ConsultarDiarioOficialMunicipioUseCase = ConsultarDiarioOficialMunicipioUseCase;
