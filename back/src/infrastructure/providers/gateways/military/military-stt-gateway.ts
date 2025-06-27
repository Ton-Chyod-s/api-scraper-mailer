import { acessPage } from '../../../../utils/access-page-axios';

export class MilitarySttGateway {

  async buscarConteudo(): Promise<string> {
    return await acessPage(
      'https://9rm.eb.mil.br/index.php/servico-militar/sargento-tecnico-temporario'
    );
  }

  async buscarConteudoAno(ano: string): Promise<string> {
    let anoAtual = ano.slice(2);
    let anoSeguinte = (parseInt(anoAtual) + 1).toString().padStart(2, '0');

    const urlInicial = `https://9rm.eb.mil.br/index.php/ott${anoAtual}-${anoSeguinte}`;

    try {
      return await acessPage(urlInicial);
    } catch {
      const anoAtualNum = parseInt(anoAtual) + 1;
      const anoSeguinteNum = anoAtualNum + 1;

      const novoAnoAtual = anoAtualNum.toString().padStart(2, '0');
      const novoAnoSeguinte = anoSeguinteNum.toString().padStart(2, '0');

      const urlAlternativa = `https://9rm.eb.mil.br/index.php/ott${novoAnoAtual}-${novoAnoSeguinte}`;
      
      return await acessPage(urlAlternativa);
    }
  }
}

if (require.main === module) {
  const scraper = new MilitarySttGateway();
  scraper.buscarConteudo().then((data) => {
    console.log('Conteúdo obtido com sucesso:');
    console.log(data);
  }).catch((err) => {
    console.error('Erro ao buscar conteúdo:', err);
  });
}
