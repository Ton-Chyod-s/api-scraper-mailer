import { sendEmailController } from "@interfaces/controllers/email/send-email-controller";
import { PrismaUserRepository } from "@infra/repositories/user/user-repository";
import { formatarData } from "@utils/date/date-helper";
import { carregarArquivo, carregarTemplateExercito, gerarListaFormatadaExercito, montarCorpoEmail, montarHtmlFinal, preencherTemplate } from "@utils/email/email-helper";
import { GetEmails } from "@usecases/user/get-emails";
import { GetUserNameByEmail } from "@usecases/user/get-user-name-by-email";

export class SendEmailJobUseCase {
    constructor(
      private readonly getEmails: GetEmails,
      private readonly getUserNameByEmail: GetUserNameByEmail,
      private readonly sendEmailController: (email: string, html: string, subject: string) => Promise<void>
    ) {}
  
    async execute(): Promise<void> {
        const ano = new Date().getFullYear();

        const dataInit = formatarData(new Date(ano, 0, 1));
        const dataFinish = formatarData(new Date(ano, 11, 31));
      
        const [emails, htmlBase, header, doeTemplate, diograndeTemplate] = await Promise.all([
          this.getEmails.execute(),
          carregarArquivo('main.html'),
          carregarArquivo('emails/header.html'),
          carregarArquivo('emails/doe.html'),
          carregarArquivo('emails/diogrande.html')
        ]);
      
        const exercitoTemplate = await carregarTemplateExercito(ano.toString());
        const listaFormatadaExercito = await gerarListaFormatadaExercito();
        const exercitoFinal = preencherTemplate(exercitoTemplate, 'listaExercito', listaFormatadaExercito);
      
        for (const email of emails) {
          try {
            const userName = await this.getUserNameByEmail.execute(email);
      
            if (!userName) {
              console.warn(`Usuário não encontrado para o e-mail: ${email}`);
              continue;
            }
      
            const corpoEmail = await montarCorpoEmail(
              userName.name,
              { doe: doeTemplate, diogrande: diograndeTemplate },
              { inicio: dataInit, fim: dataFinish }
            );
            
            const corpoCompleto = exercitoFinal + corpoEmail;
            
            const htmlFinal = montarHtmlFinal(htmlBase, header, corpoCompleto);
      
            await this.sendEmailController(email, htmlFinal, ano.toString());
            console.log(`E-mail enviado para: ${userName} email: ${email}`);
          } catch (error) {
            console.error(`Falha ao enviar e-mail para ${email}:`, error);
          }
    }
  }
}


if (require.main === module) {
  const userRepo = new PrismaUserRepository();

  const getEmails = new GetEmails(userRepo);
  const getUserNameByEmail = new GetUserNameByEmail(userRepo);

  const sendEmailControllersCompletos = new SendEmailJobUseCase(
    getEmails,
    getUserNameByEmail,
    sendEmailController
  );

  sendEmailControllersCompletos.execute()
}
