"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExercitoWebScraper = void 0;
const axios_1 = __importDefault(require("axios"));
class ExercitoWebScraper {
    async buscarConteudo() {
        const { data } = await axios_1.default.get(`http://api.scraperapi.com`, {
            params: {
                api_key: process.env.SCRAPER_API_KEY,
                url: 'https://9rm.eb.mil.br/index.php/oficial-tecnico-temporario'
            }
        });
        return data;
    }
    async buscarConteudoAno(ano) {
        const url = `https://9rm.eb.mil.br/index.php/ott-${ano}`;
        const { data } = await axios_1.default.get(`http://api.scraperapi.com`, {
            params: {
                api_key: process.env.SCRAPER_API_KEY,
                url: url
            }
        });
        return data;
    }
}
exports.ExercitoWebScraper = ExercitoWebScraper;
