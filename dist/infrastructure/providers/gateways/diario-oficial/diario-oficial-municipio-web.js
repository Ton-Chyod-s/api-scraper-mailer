"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiarioOficialMunicipioWeb = void 0;
const axios_1 = __importDefault(require("axios"));
class DiarioOficialMunicipioWeb {
    constructor() {
        this.url = 'https://diogrande.campogrande.ms.gov.br/wp-admin/admin-ajax.php';
    }
    async buscarPublicacoes(nome, dataInicio, dataFim) {
        try {
            const params = {
                action: 'edicoes_json',
                palavra: nome,
                numero: '',
                de: dataInicio,
                ate: dataFim,
                'order[0][dir]': 'desc',
            };
            const response = await axios_1.default.get(this.url, { params });
            return DiarioOficialDeserializer.fromRawData(response.data["data"]);
        }
        catch (error) {
            console.error('Erro ao buscar edições do Diário Oficial:', error);
            throw error;
        }
    }
}
exports.DiarioOficialMunicipioWeb = DiarioOficialMunicipioWeb;
class DiarioOficialDeserializer {
    static fromRawData(rawData) {
        const conteudos = {};
        if (!rawData || rawData.length === 0) {
            return {
                site: 'https://diogrande.campogrande.ms.gov.br/',
                mensagem: 'Nenhuma publicação encontrada.',
                conteudos: {}
            };
        }
        rawData.forEach((item, index) => {
            conteudos[String(index)] = `${item.desctpd} - ${item.dia} - ${item.arquivo}`;
        });
        const mensagem = Object.keys(conteudos).length > 0
            ? 'Diários oficiais encontrados.'
            : 'Nenhuma publicação encontrada.';
        return {
            site: 'https://diogrande.campogrande.ms.gov.br/',
            mensagem,
            conteudos
        };
    }
}
if (require.main === module) {
    const diarioOficialProvider = new DiarioOficialMunicipioWeb();
    diarioOficialProvider.buscarPublicacoes('Klayton Chrysthian Oliveira Dias', '01/01/2025', '15/11/2025')
        .then(result => console.log(result))
        .catch(error => console.error(error));
}
