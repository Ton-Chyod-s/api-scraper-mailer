import { SendEmailUseCase } from "../../usecases/send-email-use-case";
import { NodemailerProvider } from "../providers/nodemailer-provider";

export async function enviarEmail(html: string, ano: string): Promise<void> {
  const mailProvider = new NodemailerProvider();
  const sendMail = new SendEmailUseCase(mailProvider);

  await sendMail.execute({
    to: 'hix_x@hotmail.com',
    subject: `Atualizações - ${ano}`,
    html: html,
  });
}