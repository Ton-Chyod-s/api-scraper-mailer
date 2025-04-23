import axios from 'axios';

export class ExercitoWebScraper {
  async buscarConteudo(): Promise<string> {
    const { data } = await axios.get(
      `http://api.scraperapi.com`, {
        params: {
          api_key: process.env.SCRAPER_API_KEY,
          url: 'https://9rm.eb.mil.br/index.php/oficial-tecnico-temporario'
        }
    });
    return data;
  }

  async buscarConteudoAno(ano: string): Promise<string> {
    const url = `https://9rm.eb.mil.br/index.php/ott-${ano}`;
    const { data } = await axios.get(
      `http://api.scraperapi.com`, {
        params: {
          api_key: process.env.SCRAPER_API_KEY,
          url: url
        }
    });
    return data;
  }
}
