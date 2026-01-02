import {
  OfficialJournalItemDTO,
  SiteDataDTO,
} from '@domain/dtos/official-journals/search-official-journals.dto';

export function siteData(site: string, items: OfficialJournalItemDTO[]): SiteDataDTO {
  if (!items.length) {
    return { site, mensagem: 'Nenhuma publicação encontrada.', conteudos: [] };
  }
  return { site, mensagem: 'Diários oficiais encontrados.', conteudos: items };
}
