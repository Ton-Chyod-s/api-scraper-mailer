import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function ActionWorkBrasil() {
    const html = 'https://www.trabalhabrasil.com.br/vagas-empregos-em-campo-grande-ms/desenvolvedor?ordenacao=2&pagina=1'

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: null,
    });

    const page = await browser.newPage();

    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );

    await page.goto(html);

    await page.locator('[class="header__dropdown-toggle header__dropdown-toggle--entrar"]').click();

    await page.locator('[title="Logar como candidato"]').click();

    await page.waitForSelector('#txtLoginCPF');
    await page.type('[id="txtLoginCPF"]', '038.431.321-35')

    await page.waitForSelector('#txtLoginNascimento');
    await page.type('[id="txtLoginNascimento"]', '08/01/1993');
    
    // await page.click('[id="txtLoginNascimento"]', { clickCount: 2 });
    
    

    

    await browser.close();
}


if (require.main === module) {
    ActionWorkBrasil()
}