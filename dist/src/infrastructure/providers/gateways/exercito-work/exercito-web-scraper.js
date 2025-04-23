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
exports.ExercitoWebScraper = void 0;
const axios_1 = __importDefault(require("axios"));
class ExercitoWebScraper {
    buscarConteudo() {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield axios_1.default.get('https://9rm.eb.mil.br/index.php/oficial-tecnico-temporario');
            return data;
        });
    }
    buscarConteudoAno(ano) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `https://9rm.eb.mil.br/index.php/ott-${ano}`;
            const { data } = yield axios_1.default.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
                }
            });
            return data;
        });
    }
}
exports.ExercitoWebScraper = ExercitoWebScraper;
