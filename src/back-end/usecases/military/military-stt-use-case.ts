import { load } from 'cheerio';
import { SiteData } from '@domain/interfaces/site-data';
import { formatarLista } from '../../utils/email/html-formatter-helper';
import { MilitarySttGateway } from '../../infrastructure/providers/gateways/military/military-stt-gateway';

export class MilitarySttUseCase {
  constructor(private scraper: MilitarySttGateway) {}

  async execute(): Promise<SiteData> {
    const html = await this.scraper.buscarConteudo();
    const $ = load(html);
    const paragraphs = $('p').map((_, el) => $(el).text().trim()).get();

    let anoAtual = new Date().getFullYear().toString();
 
    if (!paragraphs.includes(anoAtual)) {
      anoAtual = (new Date().getFullYear() - 1).toString();
    }
    
    const data: SiteData = { site: 'https://9rm.eb.mil.br/index.php/servico-militar/sargento-tecnico-temporario' };

    for (const paragrafo of paragraphs) {
      if (paragrafo.includes(anoAtual)) {
        data.mensagem = '2 a 11 JUL 25(até 16h) Inscrição Eletrônica (IN ELE/1ª Etapa) - Realização por meio do sítio www.9rm.eb.mil.br.';
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

        const ultimasInfo = Object.entries(conteudos)
          .slice(-5)
          .reduce((acc: Record<string, string>, [k, v]) => {
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

if (require.main === module) {
  const scraper = new MilitarySttGateway();
  const useCase = new MilitarySttUseCase(scraper);
  const resultado = useCase.execute().then((data) => {
    const value = Object.values(data);
    const listaExercito = formatarLista(value);
    console.log(listaExercito);
  });
  console.log(resultado);
}
