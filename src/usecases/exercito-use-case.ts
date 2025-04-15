import { load } from 'cheerio';
import { ExercitoWebScraper } from '../infrastructure/web/exercito-web-scraper';
import { SiteData } from '../domain/entities/site-data';

export class ExercitoUseCase {
  constructor(private scraper: ExercitoWebScraper) {}

  async execute(): Promise<SiteData> {
    const html = await this.scraper.buscarConteudo();
    const $ = load(html);
    const paragraphs = $('p').map((_, el) => $(el).text().trim()).get();

    const anoAtual = new Date().getFullYear().toString();
    const data: SiteData = { site: 'https://9rm.eb.mil.br/index.php/oficial-tecnico-temporario' };

    for (const paragrafo of paragraphs) {
      if (paragrafo.includes(anoAtual)) {
        data.mensagem = 'Prepare-se e leia atentamente o edital da convocação. Boa sorte, guerreiro!';
        const corpoHtml = await this.scraper.buscarConteudoAno(anoAtual);
        const $corpo = load(corpoHtml);

        const conteudos: Record<string, string> = {};
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

        data.conteudos = conteudos;
        break;
      }
    }

    return data;
  }
}
