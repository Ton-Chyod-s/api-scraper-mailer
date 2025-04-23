import axios from 'axios';

export class ExercitoWebScraper {
  async buscarConteudo(): Promise<string> {
    const { data } = await axios.get('https://9rm.eb.mil.br/index.php/oficial-tecnico-temporario', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Connection': 'keep-alive'
      }
    });
    return data;
  }

  async buscarConteudoAno(ano: string): Promise<string> {
    const url = `https://9rm.eb.mil.br/index.php/ott-${ano}`;
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Connection': 'keep-alive'
      }
    });
    return data;
  }
}
