import axios from 'axios';
import FormData from 'form-data';
import { OfficialJournalsProvider } from '@domain/interfaces/providers/official-journals/official-journals-provider';
import { SiteData } from '@domain/interfaces/site-data';

export class OfficialJournalsStateGateway implements OfficialJournalsProvider {
  private url = 'https://www.spdo.ms.gov.br/DiarioDOE/Index/Index/1';

  async buscarPublicacoes(nome: string, dataInicio: string, dataFim: string): Promise<SiteData> {
    const form = new FormData();
    form.append('Filter.DataInicial', dataInicio);
    form.append('Filter.DataFinal', dataFim);
    form.append('Filter.Texto', nome);
    form.append('Filter.TipoBuscaEnum', '1');

    const headers = form.getHeaders();

    const response = await axios.post(this.url, form, { headers });

    return OfficialJournalsDeserializer.fromRawData(response.data['dataElastic']);
  }
}

class OfficialJournalsDeserializer {
  static fromRawData(rawData: any[]): SiteData {
    const conteudos: Record<string, string> = {};

    rawData.forEach((item, index) => {
      if (item?.Source?.Descricao) {
        conteudos[String(index)] = item.Source.Descricao;
      }
    });

    const mensagem = Object.keys(conteudos).length > 0
      ? 'Diários oficiais encontrados.'
      : 'Nenhuma publicação encontrada.';

    return {
      site: 'https://www.spdo.ms.gov.br/diariodoe',
      mensagem,
      conteudos
    };
  }
}

if (require.main === module) {
  const diarioOficialProvider = new OfficialJournalsStateGateway();
  diarioOficialProvider.buscarPublicacoes('Klayton Chrysthian Oliveira Dias', '01/01/2023', '15/11/2023')
    .then(result => console.log(result))
    .catch(error => console.error(error));
}