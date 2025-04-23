"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionWorkBrasil = ActionWorkBrasil;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
async function ActionWorkBrasil() {
    const html = 'https://www.trabalhabrasil.com.br/vagas-empregos-em-campo-grande-ms/desenvolvedor?ordenacao=2&pagina=1';
    const browser = await puppeteer_extra_1.default.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: null,
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    await page.goto(html);
    await page.locator('[class="header__dropdown-toggle header__dropdown-toggle--entrar"]').click();
    await page.locator('[title="Logar como candidato"]').click();
    await page.waitForSelector('#txtLoginCPF');
    await page.type('[id="txtLoginCPF"]', '038.431.321-35');
    await page.waitForSelector('#txtLoginNascimento');
    await page.type('[id="txtLoginNascimento"]', '08/01/1993');
    // await page.click('[id="txtLoginNascimento"]', { clickCount: 2 });
    await browser.close();
}
if (require.main === module) {
    ActionWorkBrasil();
}
