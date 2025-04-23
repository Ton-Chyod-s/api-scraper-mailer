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
exports.ActionWorkBrasil = ActionWorkBrasil;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
function ActionWorkBrasil() {
    return __awaiter(this, void 0, void 0, function* () {
        const html = 'https://www.trabalhabrasil.com.br/vagas-empregos-em-campo-grande-ms/desenvolvedor?ordenacao=2&pagina=1';
        const browser = yield puppeteer_extra_1.default.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            defaultViewport: null,
        });
        const page = yield browser.newPage();
        yield page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
        yield page.goto(html);
        yield page.locator('[class="header__dropdown-toggle header__dropdown-toggle--entrar"]').click();
        yield page.locator('[title="Logar como candidato"]').click();
        yield page.waitForSelector('#txtLoginCPF');
        yield page.type('[id="txtLoginCPF"]', '038.431.321-35');
        yield page.waitForSelector('#txtLoginNascimento');
        yield page.type('[id="txtLoginNascimento"]', '08/01/1993');
        // await page.click('[id="txtLoginNascimento"]', { clickCount: 2 });
        yield browser.close();
    });
}
if (require.main === module) {
    ActionWorkBrasil();
}
