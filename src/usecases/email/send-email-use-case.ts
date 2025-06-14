import { IMailProvider } from "../../domain/interfaces/providers/mail/mail-provider";
import { NodemailerProvider } from "../../infrastructure/providers/nodemailer-provider";

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

if (require.main === module) {
  const mailProvider = new NodemailerProvider();
  const sendEmailUseCase = new SendEmailUseCase(mailProvider);
  
  sendEmailUseCase.execute({
    to: "hix_x@hotmail.com",
    subject: "Test Email",
    html: "<h1>Hello World</h1>"  
  })}
