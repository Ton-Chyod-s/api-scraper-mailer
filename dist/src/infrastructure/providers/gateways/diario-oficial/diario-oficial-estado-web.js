"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiarioOficialEstadoWeb = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
class DiarioOficialEstadoWeb {
    constructor() {
        this.url = 'https://www.spdo.ms.gov.br/DiarioDOE/Index/Index/1';
    }
    buscarPublicacoes(nome, dataInicio, dataFim) {
        return __awaiter(this, void 0, void 0, function* () {
            const form = new form_data_1.default();
            form.append('Filter.DataInicial', dataInicio);
            form.append('Filter.DataFinal', dataFim);
            form.append('Filter.Texto', nome);
            form.append('Filter.TipoBuscaEnum', '1');
            const headers = form.getHeaders();
            const response = yield axios_1.default.post(this.url, form, { headers });
            return DiarioOficialDeserializer.fromRawData(response.data['dataElastic']);
        });
    }
}
exports.DiarioOficialEstadoWeb = DiarioOficialEstadoWeb;
class DiarioOficialDeserializer {
    static fromRawData(rawData) {
        const conteudos = {};
        rawData.forEach((item, index) => {
            var _a;
            if ((_a = item === null || item === void 0 ? void 0 : item.Source) === null || _a === void 0 ? void 0 : _a.Descricao) {
                conteudos[String(index)] = item.Source.Descricao;
            }
        });
        const mensagem = Object.keys(conteudos).length > 0
            ? 'Diários oficiais encontrados.'
            : 'Nenhuma publicação encontrada.';
        return {
            site: 'https://www.spdo.ms.gov.br/diariodoe',
            mensagem,
            conteudos
        };
    }
}
if (require.main === module) {
    const diarioOficialProvider = new DiarioOficialEstadoWeb();
    diarioOficialProvider.buscarPublicacoes('Klayton Chrysthian Oliveira Dias', '01/01/2023', '15/11/2023')
        .then(result => console.log(result))
        .catch(error => console.error(error));
}
