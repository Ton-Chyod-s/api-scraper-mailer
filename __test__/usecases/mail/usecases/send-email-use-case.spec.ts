import { describe, it, expect } from 'vitest';
import { SendEmailUseCase } from '../../../../src/back-end/usecases/email/send-email-use-case';
import { mailProviderMock } from '../providers/mail-provider.mock';  // Importando o mock

describe('SendEmailUseCase', () => {
  it('deve chamar sendMail com os parâmetros corretos', async () => {
    const sendEmailUseCase = new SendEmailUseCase(mailProviderMock);

    const emailData = {
      to: 'email@example.com',
      subject: 'Assunto do E-mail',
      html: '<p>Conteúdo do e-mail</p>',
    };

    await sendEmailUseCase.execute(emailData);

    expect(mailProviderMock.sendMail).toHaveBeenCalledWith(emailData);
    expect(mailProviderMock.sendMail).toHaveBeenCalledTimes(1);
  });

  
});
