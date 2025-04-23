"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExercitoWebScraper = void 0;
const axios_1 = __importDefault(require("axios"));
class ExercitoWebScraper {
    async buscarConteudo() {
        const { data } = await axios_1.default.get('https://9rm.eb.mil.br/index.php/oficial-tecnico-temporario', {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 10000
        });
        return data;
    }
    async buscarConteudoAno(ano) {
        const url = `https://9rm.eb.mil.br/index.php/ott-${ano}`;
        const { data } = await axios_1.default.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        });
        return data;
    }
}
exports.ExercitoWebScraper = ExercitoWebScraper;
