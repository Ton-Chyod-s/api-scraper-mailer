import { GetEmails } from '@usecases/user/get-emails';
import { GetUserNameByEmail } from '@usecases/user/get-user-name-by-email';
import { PrismaUserRepository } from '@infra/repositories/user/user-repository';
import { sendEmailController } from '@interfaces/controllers/email/send-email-controller';

import {
  montarCorpoEmail,
  carregarArquivo,
  montarHtmlFinal
} from '../../utils/email/email-helper';

import { formatarData } from '../../utils/date/date-helper';
import { buildMilitaryOttEmail } from '../../utils/military/build-military-ott-email';
import { buildMilitarySttEmail } from '../../utils/military/build-military-stt-email';
import { GetSourcesByUserIdUseCase } from '@usecases/user/source/get-source-by-user-id-use-case';
import { UserSourceRepository } from '@infra/repositories/user/user-source-repository';
import { error } from 'console';

export const sendEmailJobUseCase = async (): Promise<void> => {

  const userSourceRepo = new UserSourceRepository();
  const userRepo = new PrismaUserRepository();
  const getEmails = new GetEmails(userRepo);
  const getUserNameByEmail = new GetUserNameByEmail(userRepo);
  const userSources = new GetSourcesByUserIdUseCase(userSourceRepo);

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

  const exercitoOtt = await buildMilitaryOttEmail(ano.toString());
  const exercitoStt = await buildMilitarySttEmail(ano.toString());
  
  const exercitoFinal = exercitoOtt + exercitoStt;

  for (const email of emails) {
    
    const user = await getUserNameByEmail.execute(email);

    if (!user.id || !user?.name) {
      console.warn(`[myTaskRunner] Usuário não encontrado para o e-mail: ${email}`);
      continue;
    }

    const checkSources = await userSources.execute(user.id); 

    if (!checkSources.length) {
      console.warn(`[myTaskRunner] Usuário ${email} sem fontes vinculadas. Pulando envio.`);
      continue;
    }

    try {

      const checkSources = await userSources.execute(user.id);

      const exercitoFinalParts = [];

      if (checkSources.some(source => source.nome === 'exercitoOtt')) {
        exercitoFinalParts.push(exercitoOtt);
      }

      if (checkSources.some(source => source.nome === 'exercitoStt')) {
        exercitoFinalParts.push(exercitoStt);
      }

      const exercitoFinal = exercitoFinalParts.join('');

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
