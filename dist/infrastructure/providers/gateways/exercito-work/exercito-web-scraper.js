"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExercitoWebScraper = void 0;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
class ExercitoWebScraper {
    async acessarPagina(url, retries = 3, delay = 2000) {
        const agent = new https_1.default.Agent({
            rejectUnauthorized: false,
        });
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const { data } = await axios_1.default.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
                        'Connection': 'keep-alive',
                    },
                    timeout: 60000,
                    httpsAgent: agent,
                });
                return data;
            }
            catch (err) {
                console.error(`Erro:`, err.message);
            }
        }
        throw new Error('Não foi possível acessar a página após várias tentativas');
    }
    async buscarConteudo() {
        return await this.acessarPagina('https://9rm.eb.mil.br/index.php/oficial-tecnico-temporario');
    }
    async buscarConteudoAno(ano) {
        return await this.acessarPagina(`https://9rm.eb.mil.br/index.php/ott-${ano}`);
    }
}
exports.ExercitoWebScraper = ExercitoWebScraper;
if (require.main === module) {
    const scraper = new ExercitoWebScraper();
    scraper.buscarConteudo().then((data) => {
        console.log('Conteúdo obtido com sucesso:');
        console.log(data);
    }).catch((err) => {
        console.error('Erro ao buscar conteúdo:', err);
    });
}
