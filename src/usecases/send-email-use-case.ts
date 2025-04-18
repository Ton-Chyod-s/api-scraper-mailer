import { IMailProvider } from "../domain/providers/mail-provider";

export class SendEmailUseCase {
  constructor(private mailProvider: IMailProvider) {}

  async execute({to, subject, html}: {to: string, subject: string, html: string}): Promise<void> {
    await this.mailProvider.sendMail({
      to,
      subject,
      html,
    });
  }
}
