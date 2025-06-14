import { vi } from 'vitest';
import { IMailProvider } from '../../../../src/domain/interfaces/providers/mail/mail-provider';

export const mailProviderMock: IMailProvider = {
  sendMail: vi.fn().mockResolvedValue(undefined), // Simula sucesso
};
