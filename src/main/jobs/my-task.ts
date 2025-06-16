import { GetEmails } from '@usecases/user/get-emails';
import { GetUserNameByEmail } from '@usecases/user/get-user-name-by-email';
import { PrismaUserRepository } from '@infra/repositories/user/user-repository';
import { sendEmailController } from '@interfaces/controllers/email/send-email-controller';

import {
  montarCorpoEmail,
  carregarArquivo,
  carregarTemplateExercito,
  gerarListaFormatadaExercito,
  preencherTemplate,
  montarHtmlFinal
} from '../../utils/email/email-helper';

import { formatarData } from '../../utils/date/date-helper';

export const myTaskRunner = async (): Promise<void> => {

  const userRepo = new PrismaUserRepository();
  const getEmails = new GetEmails(userRepo);
  const getUserNameByEmail = new GetUserNameByEmail(userRepo);

  const ano = new Date().getFullYear();
  const datas = {
    inicio: formatarData(new Date(ano, 0, 1)),
    fim: formatarData(new Date(ano, 11, 31))
  };

  const [emails, htmlBase, header, doeTemplate, diograndeTemplate] = await Promise.all([
    getEmails.execute(),
    carregarArquivo("main.html"),
    carregarArquivo("emails/header.html"),
    carregarArquivo("emails/doe.html"),
    carregarArquivo("emails/diogrande.html")
  ]);

  const exercitoTemplate = await carregarTemplateExercito(ano.toString());
  const listaFormatadaExercito = await gerarListaFormatadaExercito();
  const exercitoFinal = preencherTemplate(exercitoTemplate, 'listaExercito', listaFormatadaExercito);

  for (const email of emails) {
    const user = await getUserNameByEmail.execute(email);

    try {
      if (!user?.name) {
        console.warn(`[myTaskRunner] Nome de usuário não encontrado para: ${email}`);
        continue;
      }

      const corpoEmail = await montarCorpoEmail(
        user.name,
        { doe: doeTemplate, diogrande: diograndeTemplate },
        datas
      );

      const corpoCompleto = exercitoFinal + corpoEmail;
      const htmlFinal = montarHtmlFinal(htmlBase, header, corpoCompleto);

      await sendEmailController(email, htmlFinal, `Diário Oficial - ${ano}`);
      console.log(`[myTaskRunner] E-mail enviado para: ${email}`);
    } catch (erro) {
      console.error(`[myTaskRunner] Erro ao enviar para ${email}:`, erro);
    }
  }

};
