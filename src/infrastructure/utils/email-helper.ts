import { readFile } from 'fs/promises';
import { DiarioOficialMunicipioWeb } from '../providers/scrapers/diario-oficial/diario-oficial-municipio-web';
import { ConsultarDiarioOficialMunicipioUseCase } from '../../usecases/diario-oficial/consultar-diario-oficial-municipio';
import { formatarLista } from './html-formatter-helper';
import { DiarioOficialEstadoWeb } from '../providers/scrapers/diario-oficial/diario-oficial-estado-web';
import { ConsultarDiarioOficialEstadoUseCase } from '../../usecases/diario-oficial/consultar-diario-oficial-estado';
import { ExercitoWebScraper } from '../providers/scrapers/exercito-work/exercito-web-scraper';
import { ExercitoUseCase } from '../../usecases/exercito-work/exercito-use-case';

export async function carregarArquivo(path: string): Promise<string> {
  return await readFile(path, 'utf-8');
}

export function montarHtmlFinal(base: string, header: string, corpo: string): string {
    const conteudo = header + corpo;
    return base.replace("<main></main>", `<main>${conteudo}</main>`);
  }

export function preencherTemplate(template: string, marcador: string, valor: string): string {
    return template.replace(new RegExp(`\\\${${marcador}}`, 'g'), valor);
  }

export async function carregarTemplateExercito(ano: string): Promise<string> {
    let template = await carregarArquivo("./src/static/emails/exercito.html");
    return template.replace(/\${ano}/g, ano);
  }

export async function montarCorpoEmail(userName: string, templates: { doe: string; diogrande: string }, datas: { inicio: string; fim: string }) {
    const listaDoe = await gerarListaFormatadaDoe(userName, datas.inicio, datas.fim);
    const listaDiogrande = await gerarListaFormatadaDiogrande(userName, datas.inicio, datas.fim);
    
    return preencherTemplate(templates.doe, 'listaDOE', listaDoe) +
           preencherTemplate(templates.diogrande, 'listaDioGrande', listaDiogrande);
  }

  
export async function gerarListaFormatadaExercito(): Promise<string> {
    const scraper = new ExercitoWebScraper();
    const useCase = new ExercitoUseCase(scraper);
    const resultado = await useCase.execute();
    const listaExercito = formatarLista(Object.values(resultado));
    return listaExercito;
  }

export async function gerarListaFormatadaDoe(name: string, dateInit: string, dateFinish: string): Promise<string> {
    const scraper = new DiarioOficialEstadoWeb();
    const useCase = new ConsultarDiarioOficialEstadoUseCase(scraper);
    const resultado = await useCase.execute(name, dateInit, dateFinish);
    return formatarLista(Object.values(resultado));
  }

export async function gerarListaFormatadaDiogrande(name: string, dateInit: string, dateFinish: string): Promise<string> {
  const scraper = new DiarioOficialMunicipioWeb();
  const useCase = new ConsultarDiarioOficialMunicipioUseCase(scraper);
  const resultado = await useCase.execute(name, dateInit, dateFinish);
  return formatarLista(Object.values(resultado));
}