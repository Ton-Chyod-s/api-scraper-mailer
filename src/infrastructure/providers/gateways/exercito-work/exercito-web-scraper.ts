import axios from 'axios';
import https from 'https';

export class ExercitoWebScraper {
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
      'https://9rm.eb.mil.br/index.php/oficial-tecnico-temporario'
    );
  }

  async buscarConteudoAno(ano: string): Promise<string> {
    return await this.acessarPagina(
      `https://9rm.eb.mil.br/index.php/ott-${ano}`
    );
  }
}

if (require.main === module) {
  const scraper = new ExercitoWebScraper();
  scraper.buscarConteudo().then((data) => {
    console.log('Conteúdo obtido com sucesso:');
    console.log(data);
  }).catch((err) => {
    console.error('Erro ao buscar conteúdo:', err);
  });
}
