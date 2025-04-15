import axios from 'axios';

export class ExercitoWebScraper {
  async buscarConteudo(): Promise<string> {
    const { data } = await axios.get('https://9rm.eb.mil.br/index.php/oficial-tecnico-temporario');
    return data;
  }

  async buscarConteudoAno(ano: string): Promise<string> {
    const url = `https://9rm.eb.mil.br/index.php/ott-${ano}`;
    const { data } = await axios.get(url);
    return data;
  }
}
