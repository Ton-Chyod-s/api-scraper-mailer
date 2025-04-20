import { ExercitoWebScraper } from "../infrastructure/web/exercito-web-scraper";
import { ExercitoUseCase } from "../usecases/exércitoWork/exercito-use-case";
import { formatarLista } from "../infrastructure/utils/html-formatter";
import { carregarArquivo } from "../infrastructure/utils/file";
import { enviarEmail } from "../interfaces/controllers/send-email-controller";
import { DiarioOficialWeb } from "../infrastructure/web/diario-oficial-web";
import { ConsultarDiarioOficialUseCase } from "../usecases/diárioOficial/consultar-diario-oficial-estado";
import { GetEmails } from "../usecases/user/get-emails";
import { GetUserNameByEmail } from "../usecases/user/get-user-name-by-email";

export async function myTask(
  getEmails: GetEmails, 
  getUserNameByEmail: GetUserNameByEmail
): Promise<void> {
  const ano = new Date().getFullYear().toString();
  const [emails, htmlBase, header, doeTemplate] = await Promise.all([
    getEmails.execute(),
    carregarArquivo('./src/static/main.html'),
    carregarArquivo('./src/static/emails/header.html'),
    carregarArquivo('./src/static/emails/doe.html')
  ]);

  const exercitoTemplate = await carregarTemplateExercito(ano);
  const listaFormatadaExercito = await gerarListaFormatadaExercito();
  const exercitoFinal = preencherTemplate(exercitoTemplate, 'listaExercito', listaFormatadaExercito);

  for (const email of emails) {
    try {
      const userName = await getUserNameByEmail.execute(email);

      if (!userName) {
        console.warn(`Usuário não encontrado para o e-mail: ${email}`);
        continue;
      }

      const listaDoe = await gerarListaFormatadaDoe(userName);
      const doeFinal = preencherTemplate(doeTemplate, 'listaDOE', listaDoe);

      const corpoCompleto = exercitoFinal + doeFinal;
      const htmlFinal = montarHtmlFinal(htmlBase, header, corpoCompleto);

      await enviarEmail(email, htmlFinal, ano);
      console.log(`E-mail enviado para: ${email}`);
    } catch (error) {
      console.error(`Falha ao enviar e-mail para ${email}:`, error);
    }
  }
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

async function gerarListaFormatadaDoe(name: string): Promise<string> {
  const scraper = new DiarioOficialWeb();
  const useCase = new ConsultarDiarioOficialUseCase(scraper);
  const resultado = await useCase.execute(name, '01/01/2023', '15/11/2023');
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
