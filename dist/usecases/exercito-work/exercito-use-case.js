"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExercitoUseCase = void 0;
const cheerio_1 = require("cheerio");
const exercito_web_scraper_1 = require("../../infrastructure/providers/gateways/exercito-work/exercito-web-scraper");
const html_formatter_helper_1 = require("../../infrastructure/utils/email/html-formatter-helper");
class ExercitoUseCase {
    constructor(scraper) {
        this.scraper = scraper;
    }
    async execute() {
        const html = await this.scraper.buscarConteudo();
        const $ = (0, cheerio_1.load)(html);
        const paragraphs = $('p').map((_, el) => $(el).text().trim()).get();
        let anoAtual = new Date().getFullYear().toString();
        if (!paragraphs.includes(anoAtual)) {
            anoAtual = (new Date().getFullYear() - 1).toString();
        }
        const data = { site: 'https://9rm.eb.mil.br/index.php/oficial-tecnico-temporario' };
        for (const paragrafo of paragraphs) {
            if (paragrafo.includes(anoAtual)) {
                data.mensagem = 'Prepare-se e leia atentamente o edital da convocação. Boa sorte, guerreiro!';
                const corpoHtml = await this.scraper.buscarConteudoAno(anoAtual);
                const $corpo = (0, cheerio_1.load)(corpoHtml);
                const conteudos = {};
                $corpo('td').each((i, el) => {
                    const text = $corpo(el).text().trim();
                    if (!text.includes(' MB')) {
                        conteudos[i] = text;
                    }
                });
                $corpo('span').each((_, el) => {
                    const text = $corpo(el).text().trim();
                    if (text.includes('Última atualização')) {
                        conteudos['Atualizacao'] = text.replace('Última atualização em', '').trim();
                    }
                });
                const ultimasInfo = Object.entries(conteudos)
                    .slice(-5)
                    .reduce((acc, [k, v]) => {
                    acc[k] = v;
                    return acc;
                }, {});
                data.conteudos = ultimasInfo;
                break;
            }
        }
        return data;
    }
}
exports.ExercitoUseCase = ExercitoUseCase;
if (require.main === module) {
    const scraper = new exercito_web_scraper_1.ExercitoWebScraper();
    const useCase = new ExercitoUseCase(scraper);
    const resultado = useCase.execute().then((data) => {
        const value = Object.values(data);
        const listaExercito = (0, html_formatter_helper_1.formatarLista)(value);
        console.log(listaExercito);
    });
    console.log(resultado);
}
