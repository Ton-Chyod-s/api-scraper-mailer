import { describe, it, expect, vi } from 'vitest';
import { SendEmailUseCase } from '../../../src/usecases/mail/send-email-use-case';
import { IMailProvider } from '../../../src/domain/providers/mail-provider';

describe('SendEmailUseCase', () => {
    it('deve chamar sendMail com os parâmetros corretos', async () => {
      // Mock do método sendMail do IMailProvider
      const mailProviderMock: IMailProvider = {
        sendMail: vi.fn().mockResolvedValue(undefined), // Simula o comportamento do método sendMail
      };
  
      const sendEmailUseCase = new SendEmailUseCase(mailProviderMock);
  
      const emailData = {
        to: 'email@example.com',
        subject: 'Assunto do E-mail',
        html: '<p>Conteúdo do e-mail</p>',
      };
  
      // Executando o caso de uso
      await sendEmailUseCase.execute(emailData);
  
      // Verificando se o método sendMail foi chamado com os parâmetros corretos
      expect(mailProviderMock.sendMail).toHaveBeenCalledWith(emailData);
  
      // Verificando se o método sendMail foi chamado apenas uma vez
      expect(mailProviderMock.sendMail).toHaveBeenCalledTimes(1);
    });
  
    it('deve lidar com erro se sendMail falhar', async () => {
      // Mock do método sendMail do IMailProvider que retorna erro
      const mailProviderMock: IMailProvider = {
        sendMail: vi.fn().mockRejectedValue(new Error('Falha ao enviar o e-mail')), // Simula um erro
      };
  
      const sendEmailUseCase = new SendEmailUseCase(mailProviderMock);
  
      const emailData = {
        to: 'email@example.com',
        subject: 'Assunto do E-mail',
        html: '<p>Conteúdo do e-mail</p>',
      };
  
      // Verificando se a execução do método gera uma exceção
      await expect(sendEmailUseCase.execute(emailData)).rejects.toThrow('Falha ao enviar o e-mail');
  
      // Verificando se o método sendMail foi chamado
      expect(mailProviderMock.sendMail).toHaveBeenCalledWith(emailData);
    });
  });