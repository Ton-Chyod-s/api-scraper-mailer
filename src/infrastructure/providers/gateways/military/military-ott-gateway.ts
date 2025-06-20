import axios from 'axios';
import https from 'https';

export class MilitaryOttGateway {
  private async acessarPagina(url: string, retries = 3, delay = 2000): Promise<string> {
    const agent = new https.Agent({
      rejectUnauthorized: false,  
    });

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const { data } = await axios.get(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept':
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Connection': 'keep-alive',
          },
          timeout: 60000,  
          httpsAgent: agent,
        });
        return data;  
      } catch (err: any) {  
        console.error(`Erro:`, err.message);
      }
    }
    throw new Error('Não foi possível acessar a página após várias tentativas');
  }

  async buscarConteudo(): Promise<string> {
    return await this.acessarPagina(
      'https://9rm.eb.mil.br/index.php/servico-militar/oficial-tecnico-temporario'
    );
  }

  async buscarConteudoAno(ano: string): Promise<string> {
    let anoAtual = ano.slice(2);
    let anoSeguinte = (parseInt(anoAtual) + 1).toString().padStart(2, '0');

    const urlInicial = `https://9rm.eb.mil.br/index.php/ott${anoAtual}-${anoSeguinte}`;

    try {
      return await this.acessarPagina(urlInicial);
    } catch {
      const anoAtualNum = parseInt(anoAtual) + 1;
      const anoSeguinteNum = anoAtualNum + 1;

      const novoAnoAtual = anoAtualNum.toString().padStart(2, '0');
      const novoAnoSeguinte = anoSeguinteNum.toString().padStart(2, '0');

      const urlAlternativa = `https://9rm.eb.mil.br/index.php/ott${novoAnoAtual}-${novoAnoSeguinte}`;
      
      return await this.acessarPagina(urlAlternativa);
    }
  }
}

if (require.main === module) {
  const scraper = new MilitaryOttGateway();
  scraper.buscarConteudo().then((data) => {
    console.log('Conteúdo obtido com sucesso:');
    console.log(data);
  }).catch((err) => {
    console.error('Erro ao buscar conteúdo:', err);
  });
}
