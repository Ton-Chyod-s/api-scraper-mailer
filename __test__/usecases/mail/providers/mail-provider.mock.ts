import { vi } from 'vitest';
import { IMailProvider } from '../../../../src/domain/providers/mail/mail-provider';

export const mailProviderMock: IMailProvider = {
  sendMail: vi.fn().mockResolvedValue(undefined), // Simula sucesso
};
