import { ExercitoWebScraper } from "../infrastructure/web/exercito-web-scraper";
import { ExercitoUseCase } from "../usecases/exercito-use-case";
import { formatarLista } from "../infrastructure/utils/html-formatter";
import { carregarArquivo } from "../infrastructure/utils/file";
import { enviarEmail } from "../interfaces/controllers/send-email-controller";
import { DiarioOficialWeb } from "../infrastructure/web/diario-oficial-web";
import { ConsultarDiarioOficialUseCase } from "../usecases/consultar-diario-oficial-estado";

export async function myTask() {
    const ano = new Date().getFullYear().toString();
  
    const htmlBase = await carregarArquivo('./src/static/main.html');
    const header = await carregarArquivo('./src/static/emails/header.html');

    const doeTemplate =  await carregarArquivo('./src/static/emails/doe.html');
    const listaFormatadaDoe = await gerarListaFormatadaDoe();
    const doeFinal = preencherTemplate(doeTemplate, 'listaDOE', listaFormatadaDoe);

    const exercitoTemplate = await carregarTemplateExercito(ano);
    const listaFormatada = await gerarListaFormatadaExercito();
    const exercitoFinal = preencherTemplate(exercitoTemplate, 'listaExercito', listaFormatada);

    const corpoCompleto = exercitoFinal + doeFinal;
    const htmlFinal = montarHtmlFinal(htmlBase, header, corpoCompleto);

    await enviarEmail('hix_x@hotmail.com', htmlFinal, ano);
    console.log("Email sent successfully!");
}

async function carregarTemplateExercito(ano: string): Promise<string> {
  let template = await carregarArquivo("./src/static/emails/exercito.html");
  return template.replace(/\${ano}/g, ano);
}

async function gerarListaFormatadaExercito(): Promise<string> {
  const scraper = new ExercitoWebScraper();
  const useCase = new ExercitoUseCase(scraper);
  const resultado = await useCase.execute();
  const listaExercito = formatarLista(Object.values(resultado));
  return listaExercito;
}

async function gerarListaFormatadaDoe(): Promise<string> {
  const scraper = new DiarioOficialWeb();
  const useCase = new ConsultarDiarioOficialUseCase(scraper);
  const resultado = await useCase.execute('Klayton Chrysthian Oliveira Dias', '01/01/2023', '15/11/2023');
  const listaDoe = formatarLista(Object.values(resultado));
  return listaDoe;
}

function preencherTemplate(template: string, marcador: string, valor: string): string {
  return template.replace(new RegExp(`\\\${${marcador}}`, 'g'), valor);
}

function montarHtmlFinal(base: string, header: string, corpo: string): string {
  const conteudo = header + corpo;
  return base.replace("<main></main>", `<main>${conteudo}</main>`);
}
