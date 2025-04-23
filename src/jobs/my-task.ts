import { ExercitoWebScraper } from "../infrastructure/web/exercito-work/exercito-web-scraper";
import { ExercitoUseCase } from "../usecases/exercito-work/exercito-use-case";
import { formatarLista } from "../infrastructure/utils/html-formatter";
import { carregarArquivo } from "../infrastructure/utils/file";
import { enviarEmail } from "../interfaces/controllers/mail/send-email-controller";
import { DiarioOficialEstadoWeb } from "../infrastructure/web/diario-oficial/diario-oficial-estado-web";
import { ConsultarDiarioOficialEstadoUseCase } from "../usecases/diario-oficial/consultar-diario-oficial-estado";
import { GetEmails } from "../usecases/user/get-emails";
import { GetUserNameByEmail } from "../usecases/user/get-user-name-by-email";
import { DiarioOficialMunicipioWeb } from "../infrastructure/web/diario-oficial/diario-oficial-municipio-web";
import { ConsultarDiarioOficialMunicipioUseCase } from "../usecases/diario-oficial/consultar-diario-oficial-municipio";
import { formatarData } from "../infrastructure/utils/date";
import { PrismaUserRepository } from "../infrastructure/repositories/user-repository";

export async function myTask(
  getEmails: GetEmails, 
  getUserNameByEmail: GetUserNameByEmail
): Promise<void> {
  const ano = new Date().getFullYear().toString();
  const [emails, htmlBase, header, doeTemplate, diograndeTemplate] = await Promise.all([
    getEmails.execute(),
    carregarArquivo('./src/static/main.html'),
    carregarArquivo('./src/static/emails/header.html'),
    carregarArquivo('./src/static/emails/doe.html'),
    carregarArquivo('./src/static/emails/diogrande.html')
  ]);

  const exercitoTemplate = await carregarTemplateExercito(ano);
  const listaFormatadaExercito = await gerarListaFormatadaExercito();
  const exercitoFinal = preencherTemplate(exercitoTemplate, 'listaExercito', listaFormatadaExercito);

  const anoAtual = new Date().getFullYear();

  const dataInit = formatarData(new Date(anoAtual, 0, 1));
  const dataFinish = formatarData(new Date(anoAtual, 11, 31));

  for (const email of emails) {
    try {
      const userName = await getUserNameByEmail.execute(email);

      if (!userName) {
        console.warn(`Usuário não encontrado para o e-mail: ${email}`);
        continue;
      }

      const corpoEmail = await montarCorpoEmail(
        userName,
        { doe: doeTemplate, diogrande: diograndeTemplate },
        { inicio: dataInit, fim: dataFinish }
      );
      
      const corpoCompleto = exercitoFinal + corpoEmail;
      
      const htmlFinal = montarHtmlFinal(htmlBase, header, corpoCompleto);

      await enviarEmail(email, htmlFinal, ano);
      console.log(`E-mail enviado para: ${email}`);
    } catch (error) {
      console.error(`Falha ao enviar e-mail para ${email}:`, error);
    }
  }
}


async function montarCorpoEmail(userName: string, templates: { doe: string; diogrande: string }, datas: { inicio: string; fim: string }) {
  const listaDoe = await gerarListaFormatadaDoe(userName, datas.inicio, datas.fim);
  const listaDiogrande = await gerarListaFormatadaDiogrande(userName, datas.inicio, datas.fim);
  
  return preencherTemplate(templates.doe, 'listaDOE', listaDoe) +
         preencherTemplate(templates.diogrande, 'listaDioGrande', listaDiogrande);
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

async function gerarListaFormatadaDoe(name: string, dateInit: string, dateFinish: string): Promise<string> {
  const scraper = new DiarioOficialEstadoWeb();
  const useCase = new ConsultarDiarioOficialEstadoUseCase(scraper);
  const resultado = await useCase.execute(name, dateInit, dateFinish);
  return formatarLista(Object.values(resultado));
}

async function gerarListaFormatadaDiogrande(name: string, dateInit: string, dateFinish: string): Promise<string> {
  const scraper = new DiarioOficialMunicipioWeb();
  const useCase = new ConsultarDiarioOficialMunicipioUseCase(scraper);
  const resultado = await useCase.execute(name, dateInit, dateFinish);
  return formatarLista(Object.values(resultado));
}


function preencherTemplate(template: string, marcador: string, valor: string): string {
  return template.replace(new RegExp(`\\\${${marcador}}`, 'g'), valor);
}

function montarHtmlFinal(base: string, header: string, corpo: string): string {
  const conteudo = header + corpo;
  return base.replace("<main></main>", `<main>${conteudo}</main>`);
}

if (require.main === module) {
  const userRepository = new PrismaUserRepository();
  
  myTask(
    new GetEmails(userRepository), 
    new GetUserNameByEmail(userRepository)
  ).catch((error) => {
    console.error("Erro ao executar a tarefa:", error);
  }
  );
}