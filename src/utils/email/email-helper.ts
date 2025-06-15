import { readFile } from 'fs/promises';
import { OfficialJournalsMunicipalityGateway } from '@infra/providers/gateways/official-journals/official-journals-municipality-gateway';
import { ConsultarDiarioOficialMunicipioUseCase } from '@usecases/official-journals/official-journals-municipality-use-case';
import { formatarLista } from './html-formatter-helper';
import { OfficialJournalsStateGateway } from '@infra/providers/gateways/official-journals/official-journals-state-gateway';
import { ConsultarDiarioOficialEstadoUseCase } from '@usecases/official-journals/official-journals-state-use-case';
import { MilitaryOttGateway } from '@infra/providers/gateways/military/military-ott-gateway';
import { ExercitoUseCase } from '@usecases/military/military-ott-use-case';
import path from 'path';

export async function carregarArquivo(relativePath: string): Promise<string> {
  const absolutePath = path.resolve(process.cwd(), 'src/main/web/templates', relativePath);
  return await readFile(absolutePath, 'utf-8');
}

export function montarHtmlFinal(base: string, header: string, corpo: string): string {
    const conteudo = header + corpo;
    return base.replace("<main></main>", `<main>${conteudo}</main>`);
  }

export function preencherTemplate(template: string, marcador: string, valor: string): string {
    return template.replace(new RegExp(`\\\${${marcador}}`, 'g'), valor);
  }

export async function carregarTemplateExercito(ano: string): Promise<string> {
    let template = await carregarArquivo("emails/exercito.html");
    return template.replace(/\${ano}/g, ano);
  }

export async function montarCorpoEmail(userName: string, templates: { doe: string; diogrande: string }, datas: { inicio: string; fim: string }) {
    const listaDoe = await gerarListaFormatadaDoe(userName, datas.inicio, datas.fim);
    const listaDiogrande = await gerarListaFormatadaDiogrande(userName, datas.inicio, datas.fim);
    
    return preencherTemplate(templates.doe, 'listaDOE', listaDoe) +
           preencherTemplate(templates.diogrande, 'listaDioGrande', listaDiogrande);
  }

  
export async function gerarListaFormatadaExercito(): Promise<string> {
    const scraper = new MilitaryOttGateway();
    const useCase = new ExercitoUseCase(scraper);
    const resultado = await useCase.execute();
    const listaExercito = formatarLista(Object.values(resultado));
    return listaExercito;
  }

export async function gerarListaFormatadaDoe(name: string, dateInit: string, dateFinish: string): Promise<string> {
    const scraper = new OfficialJournalsStateGateway();
    const useCase = new ConsultarDiarioOficialEstadoUseCase(scraper);
    const resultado = await useCase.execute(name, dateInit, dateFinish);
    return formatarLista(Object.values(resultado));
  }

export async function gerarListaFormatadaDiogrande(name: string, dateInit: string, dateFinish: string): Promise<string> {
  const scraper = new OfficialJournalsMunicipalityGateway();
  const useCase = new ConsultarDiarioOficialMunicipioUseCase(scraper);
  const resultado = await useCase.execute(name, dateInit, dateFinish);
  return formatarLista(Object.values(resultado));
}