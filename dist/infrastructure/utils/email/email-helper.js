"use strict";
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
async function carregarArquivo(path) {
    return await (0, promises_1.readFile)(path, 'utf-8');
}
function montarHtmlFinal(base, header, corpo) {
    const conteudo = header + corpo;
    return base.replace("<main></main>", `<main>${conteudo}</main>`);
}
function preencherTemplate(template, marcador, valor) {
    return template.replace(new RegExp(`\\\${${marcador}}`, 'g'), valor);
}
async function carregarTemplateExercito(ano) {
    let template = await carregarArquivo("./src/templates/emails/exercito.html");
    return template.replace(/\${ano}/g, ano);
}
async function montarCorpoEmail(userName, templates, datas) {
    const listaDoe = await gerarListaFormatadaDoe(userName, datas.inicio, datas.fim);
    const listaDiogrande = await gerarListaFormatadaDiogrande(userName, datas.inicio, datas.fim);
    return preencherTemplate(templates.doe, 'listaDOE', listaDoe) +
        preencherTemplate(templates.diogrande, 'listaDioGrande', listaDiogrande);
}
async function gerarListaFormatadaExercito() {
    const scraper = new exercito_web_scraper_1.ExercitoWebScraper();
    const useCase = new exercito_use_case_1.ExercitoUseCase(scraper);
    const resultado = await useCase.execute();
    const listaExercito = (0, html_formatter_helper_1.formatarLista)(Object.values(resultado));
    return listaExercito;
}
async function gerarListaFormatadaDoe(name, dateInit, dateFinish) {
    const scraper = new diario_oficial_estado_web_1.DiarioOficialEstadoWeb();
    const useCase = new consultar_diario_oficial_estado_1.ConsultarDiarioOficialEstadoUseCase(scraper);
    const resultado = await useCase.execute(name, dateInit, dateFinish);
    return (0, html_formatter_helper_1.formatarLista)(Object.values(resultado));
}
async function gerarListaFormatadaDiogrande(name, dateInit, dateFinish) {
    const scraper = new diario_oficial_municipio_web_1.DiarioOficialMunicipioWeb();
    const useCase = new consultar_diario_oficial_municipio_1.ConsultarDiarioOficialMunicipioUseCase(scraper);
    const resultado = await useCase.execute(name, dateInit, dateFinish);
    return (0, html_formatter_helper_1.formatarLista)(Object.values(resultado));
}
