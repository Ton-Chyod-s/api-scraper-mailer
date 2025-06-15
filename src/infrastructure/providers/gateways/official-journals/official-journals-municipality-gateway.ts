import { OfficialJournalsProvider } from "@domain/interfaces/providers/official-journals/official-journals-provider";
import { SiteData } from '@domain/interfaces/site-data';

import axios from 'axios';

export class DiarioOficialMunicipioWeb implements OfficialJournalsProvider {
  private readonly url = 'https://diogrande.campogrande.ms.gov.br/wp-admin/admin-ajax.php';

  async buscarPublicacoes(nome: string, dataInicio: string, dataFim: string): Promise<SiteData> {
    try {
      const params = {
        action: 'edicoes_json',
        palavra: nome,
        numero: '',
        de: dataInicio,
        ate: dataFim,
        'order[0][dir]': 'desc',
      };

      const response = await axios.get(this.url, { params });
      return DiarioOficialDeserializer.fromRawData(response.data["data"]);

    } catch (error) {
      console.error('Erro ao buscar edições do Diário Oficial:', error);
      throw error;
    }
  }
}

interface DiarioOficialMunicipalItem {
    numero: string;
    dia: string;
    arquivo: string;
    desctpd: string;
    codigodia: string;
  }

class DiarioOficialDeserializer {
    static fromRawData(rawData: DiarioOficialMunicipalItem[]): SiteData {
        const conteudos: Record<string, string> = {};

        if (!rawData || rawData.length === 0) {
            return {
                site: 'https://diogrande.campogrande.ms.gov.br/',
                mensagem: 'Nenhuma publicação encontrada.',
                conteudos: {}
            };
        }

        rawData.forEach((item, index) => {
            conteudos[String(index)] = `${item.desctpd} - ${item.dia} - ${item.arquivo}`;
          });

          const mensagem = Object.keys(conteudos).length > 0
          ? 'Diários oficiais encontrados.'
          : 'Nenhuma publicação encontrada.';

        return {
            site: 'https://diogrande.campogrande.ms.gov.br/',
            mensagem,
            conteudos
          };
    }
}


if (require.main === module) {
  const diarioOficialProvider = new DiarioOficialMunicipioWeb();
  diarioOficialProvider.buscarPublicacoes('Klayton Chrysthian Oliveira Dias', '01/01/2025', '15/11/2025')
    .then(result => console.log(result))
    .catch(error => console.error(error));
}
