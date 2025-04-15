import { ExercitoWebScraper } from "../infrastructure/web/exercito-web-scraper";
import { ExercitoUseCase } from "../usecases/exercito-use-case";
import { formatarLista } from "../infrastructure/utils/html-formatter";
import { carregarArquivo } from "../infrastructure/utils/file";
import { enviarEmail } from "../infrastructure/utils/send-email";

export async function myTask() {
    const ano = new Date().getFullYear().toString();
  
    const htmlBase = await carregarArquivo('./src/static/main.html');
    const header = await carregarArquivo('./src/static/emails/header.html');
    const exercitoTemplate = await carregarTemplateExercito(ano);
    const listaFormatada = await gerarListaFormatada();
  
    const exercitoFinal = preencherTemplateExercito(exercitoTemplate, listaFormatada);
    const htmlFinal = montarHtmlFinal(htmlBase, header, exercitoFinal);
  
    await enviarEmail(htmlFinal, ano);
    console.log("Email sent successfully!");
}

async function carregarTemplateExercito(ano: string): Promise<string> {
  let template = await carregarArquivo("./src/static/emails/exercito.html");
  return template.replace(/\${ano}/g, ano);
}

async function gerarListaFormatada(): Promise<string> {
  const scraper = new ExercitoWebScraper();
  const useCase = new ExercitoUseCase(scraper);
  const resultado = await useCase.execute();
  const listaExercito = formatarLista(Object.values(resultado));
  return listaExercito;
}

function preencherTemplateExercito(template: string, lista: string): string {
  return template.replace(/\${listaExercito}/g, lista);
}

function montarHtmlFinal(base: string, header: string, corpo: string): string {
  const conteudo = header + corpo;
  return base.replace("<main></main>", `<main>${conteudo}</main>`);
}
