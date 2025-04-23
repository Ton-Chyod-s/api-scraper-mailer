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
Object.defineProperty(exports, "__esModule", { value: true });
exports.carregarArquivo = carregarArquivo;
exports.montarHtmlFinal = montarHtmlFinal;
exports.preencherTemplate = preencherTemplate;
exports.carregarTemplateExercito = carregarTemplateExercito;
exports.montarCorpoEmail = montarCorpoEmail;
exports.gerarListaFormatadaExercito = gerarListaFormatadaExercito;
exports.gerarListaFormatadaDoe = gerarListaFormatadaDoe;
exports.gerarListaFormatadaDiogrande = gerarListaFormatadaDiogrande;
const promises_1 = require("fs/promises");
const diario_oficial_municipio_web_1 = require("../../providers/gateways/diario-oficial/diario-oficial-municipio-web");
const consultar_diario_oficial_municipio_1 = require("../../../usecases/diario-oficial/consultar-diario-oficial-municipio");
const html_formatter_helper_1 = require("../../utils/email/html-formatter-helper");
const diario_oficial_estado_web_1 = require("../../providers/gateways/diario-oficial/diario-oficial-estado-web");
const consultar_diario_oficial_estado_1 = require("../../../usecases/diario-oficial/consultar-diario-oficial-estado");
const exercito_web_scraper_1 = require("../../providers/gateways/exercito-work/exercito-web-scraper");
const exercito_use_case_1 = require("../../../usecases/exercito-work/exercito-use-case");
function carregarArquivo(path) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, promises_1.readFile)(path, 'utf-8');
    });
}
function montarHtmlFinal(base, header, corpo) {
    const conteudo = header + corpo;
    return base.replace("<main></main>", `<main>${conteudo}</main>`);
}
function preencherTemplate(template, marcador, valor) {
    return template.replace(new RegExp(`\\\${${marcador}}`, 'g'), valor);
}
function carregarTemplateExercito(ano) {
    return __awaiter(this, void 0, void 0, function* () {
        let template = yield carregarArquivo("./src/static/emails/exercito.html");
        return template.replace(/\${ano}/g, ano);
    });
}
function montarCorpoEmail(userName, templates, datas) {
    return __awaiter(this, void 0, void 0, function* () {
        const listaDoe = yield gerarListaFormatadaDoe(userName, datas.inicio, datas.fim);
        const listaDiogrande = yield gerarListaFormatadaDiogrande(userName, datas.inicio, datas.fim);
        return preencherTemplate(templates.doe, 'listaDOE', listaDoe) +
            preencherTemplate(templates.diogrande, 'listaDioGrande', listaDiogrande);
    });
}
function gerarListaFormatadaExercito() {
    return __awaiter(this, void 0, void 0, function* () {
        const scraper = new exercito_web_scraper_1.ExercitoWebScraper();
        const useCase = new exercito_use_case_1.ExercitoUseCase(scraper);
        const resultado = yield useCase.execute();
        const listaExercito = (0, html_formatter_helper_1.formatarLista)(Object.values(resultado));
        return listaExercito;
    });
}
function gerarListaFormatadaDoe(name, dateInit, dateFinish) {
    return __awaiter(this, void 0, void 0, function* () {
        const scraper = new diario_oficial_estado_web_1.DiarioOficialEstadoWeb();
        const useCase = new consultar_diario_oficial_estado_1.ConsultarDiarioOficialEstadoUseCase(scraper);
        const resultado = yield useCase.execute(name, dateInit, dateFinish);
        return (0, html_formatter_helper_1.formatarLista)(Object.values(resultado));
    });
}
function gerarListaFormatadaDiogrande(name, dateInit, dateFinish) {
    return __awaiter(this, void 0, void 0, function* () {
        const scraper = new diario_oficial_municipio_web_1.DiarioOficialMunicipioWeb();
        const useCase = new consultar_diario_oficial_municipio_1.ConsultarDiarioOficialMunicipioUseCase(scraper);
        const resultado = yield useCase.execute(name, dateInit, dateFinish);
        return (0, html_formatter_helper_1.formatarLista)(Object.values(resultado));
    });
}
