import axios from "axios";
import https from 'https';

export const acessPage = async function acessarPagina(url: string, retries = 1, delay = 500): Promise<string> {
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
      if (attempt < retries - 1) {
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }
  throw new Error('Não foi possível acessar a página após várias tentativas');
};
