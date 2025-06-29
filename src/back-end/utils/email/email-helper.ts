import { readFile } from 'fs/promises';
import { OfficialJournalsMunicipalityGateway } from '@infra/providers/gateways/official-journals/official-journals-municipality-gateway';
import { OfficialJournalsMunicipalityUseCase } from '@usecases/official-journals/official-journals-municipality-use-case';
import { formatarLista } from './html-formatter-helper';
import { OfficialJournalsStateGateway } from '@infra/providers/gateways/official-journals/official-journals-state-gateway';
import { OfficialJournalsStateUseCase } from '@usecases/official-journals/official-journals-state-use-case';
import { MilitaryOttGateway } from '@infra/providers/gateways/military/military-ott-gateway';
import { MilitaryOttUseCase } from '@usecases/military/military-ott-use-case';
import path from 'path';
import { MilitarySttGateway } from '@infra/providers/gateways/military/military-stt-gateway';
import { MilitarySttUseCase } from '@usecases/military/military-stt-use-case';

export async function carregarArquivo(relativePath: string): Promise<string> {
  const absolutePath = path.resolve(__dirname, '../../main/web/templates', relativePath);
  return await readFile(absolutePath, 'utf-8');
}

export function montarHtmlFinal(base: string, header: string, corpo: string): string {
    const conteudo = header + corpo;
    return base.replace("<main></main>", `<main>${conteudo}</main>`);
  }

export function preencherTemplate(template: string, marcador: string, valor: string): string {
    return template.replace(new RegExp(`\\\${${marcador}}`, 'g'), valor);
  }

export async function carregarTemplateExercitoOtt(ano: string): Promise<string> {
    let template = await carregarArquivo("emails/exercitoOtt.html");
    return template.replace(/\${ano}/g, ano);
  }

export async function carregarTemplateExercitoStt(ano: string): Promise<string> {
  let template = await carregarArquivo("emails/exercitoStt.html");
  return template.replace(/\${ano}/g, ano);
}

export async function montarCorpoEmail(userName: string, templates: { doe: string; diogrande: string }, datas: { inicio: string; fim: string }) {
    const listaDoe = await gerarListaFormatadaDoe(userName, datas.inicio, datas.fim);
    const listaDiogrande = await gerarListaFormatadaDiogrande(userName, datas.inicio, datas.fim);
    
    return preencherTemplate(templates.doe, 'listaDOE', listaDoe) +
           preencherTemplate(templates.diogrande, 'listaDioGrande', listaDiogrande);
  }

  
export async function gearListaFormatadaExercictoOtt(): Promise<string> {
    const scraper = new MilitaryOttGateway();
    const useCase = new MilitaryOttUseCase(scraper);
    const resultado = await useCase.execute();
    const listaExercito = formatarLista(Object.values(resultado));
    return listaExercito;
  }

export async function gearListaFormatadaExercictoStt(): Promise<string> {
    const scraper = new MilitarySttGateway();
    const useCase = new MilitarySttUseCase(scraper);
    const resultado = await useCase.execute();
    const listaExercito = formatarLista(Object.values(resultado));
    return listaExercito;
  }

export async function gerarListaFormatadaDoe(name: string, dateInit: string, dateFinish: string): Promise<string> {
    const scraper = new OfficialJournalsStateGateway();
    const useCase = new OfficialJournalsStateUseCase(scraper);
    const resultado = await useCase.execute(name, dateInit, dateFinish);
    return formatarLista(Object.values(resultado));
  }

export async function gerarListaFormatadaDiogrande(name: string, dateInit: string, dateFinish: string): Promise<string> {
  const scraper = new OfficialJournalsMunicipalityGateway();
  const useCase = new OfficialJournalsMunicipalityUseCase(scraper);
  const resultado = await useCase.execute(name, dateInit, dateFinish);
  return formatarLista(Object.values(resultado));
}